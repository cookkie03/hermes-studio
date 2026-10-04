// Hermes transport fork. Original visual components remain owned by OpenDots (see PROVENANCE).
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Monitor, Phone, Plus, Square, FileText } from 'lucide-react';
import type { CallReceipt, Conversation, Dot } from '../shared/types';
import { api, authHeaders } from './api';
import { Mascot } from './Mascot';
import { ChatTranscript } from './ChatTranscript';
import { SaveToSpaceReview } from './SaveToSpaceReview';
import { appendAssistant, delivery, pendingMessage, remainingDraft, mergeHistory, projectedText, afterDispatchResponse, removeApproval, restoreDraft, mergeToolEvent, type ToolActivity, type TurnPhase, type TextMessage } from './hermes-display';

import type { RuntimeStatus } from './runtime-connections';
import { ConversationHost } from './ConversationHost';
interface Approval { requestId: unknown; params: { command?: string; description?: string; choices?: string[] } }
const textOf = (value: unknown) => typeof value === 'string' ? value : '';

export function Chat({ thread, dot, initialPrompt, onConsumed, paused, onComputer, onSaved, beforeSend, onOpenConversation }: {
  thread: Conversation; dot: Dot; initialPrompt?: string; onConsumed: () => void;
  voiceReady: boolean; calls: CallReceipt[]; paused: boolean; onSaved: () => void;
  onSchedule: () => void; onComputer?: () => void;
  beforeSend?: () => Promise<{ id: string; spaceId: string; revision: number }>;
  onOpenConversation?: (threadId: string) => void;
}) {
  const [messages, setMessages] = useState<TextMessage[]>([]);
  const [reviewContent, setReviewContent] = useState<string>();
  const [preparing, setPreparing] = useState(false);
  const preparationPending = useRef(false);
  const draftKey = `hermes-draft:${thread.id}`;
  const [draft, setDraft] = useState(() => { try { return initialPrompt ?? localStorage.getItem(draftKey) ?? ''; } catch { return initialPrompt ?? ''; } });
  const [draftRemoteReady, setDraftRemoteReady] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [status, setStatus] = useState<Partial<RuntimeStatus> & { connected: boolean }>({ connected: false });
  const [hostRevision, setHostRevision] = useState(0);
  const [running, setRunning] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streamConnected, setStreamConnected] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [error, setError] = useState('');
  const [tools, setTools] = useState<ToolActivity[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [decisionPending, setDecisionPending] = useState(false);
  const [backgroundApproval, setBackgroundApproval] = useState<string>();
  const assistantId = useRef<string | undefined>(undefined);
  const timeline = useRef<HTMLDivElement>(null);
  const turnPhase = useRef<TurnPhase>('idle');
  const submittedId = useRef<string | undefined>(undefined);
  const draftChanged = useRef(false);
  const updateDraft = useCallback((value: string) => {
    draftChanged.current = true; setDraft(value);
    try { localStorage.setItem(draftKey, value); } catch { setDraftError('Local draft storage is unavailable.'); }
  }, [draftKey]);
  useEffect(() => {
    let active = true;
    void api<{ draft: string }>(`/conversations/${encodeURIComponent(thread.id)}/draft`).then((value) => {
      if (!active) return;
      if (!draftChanged.current && !initialPrompt) {
        let local: string | null = null;
        try { local = localStorage.getItem(draftKey); } catch { /* use the disk draft */ }
        setDraft(restoreDraft(local, value.draft));
      }
      setDraftRemoteReady(true);
    }).catch(() => { if (active) setDraftError('The saved draft could not be restored. Your local text is retained.'); });
    return () => { active = false; };
  }, [thread.id]);
  useEffect(() => {
    if (!draftRemoteReady) return;
    const timer = setTimeout(() => {
      void api(`/conversations/${encodeURIComponent(thread.id)}/draft`, 'PATCH', { draft })
        .then(() => setDraftError('')).catch(() => setDraftError('The draft was not saved to disk. The local copy is retained.'));
    }, 400);
    return () => clearTimeout(timer);
  }, [draft, thread.id, draftRemoteReady]);

  const loadHistory = useCallback(async (signal?: AbortSignal) => {
    try {
      const history = await api<{ messages: Array<{ role: string; content?: unknown; text?: string; id?: string; row_id?: string; metadata?: Record<string, unknown> }>; running?: boolean; session?: { running?: boolean; hydrating?: boolean; status?: string }; pendingRequests?: Approval[]; toolEvents?: Array<{ type?: string; payload?: Record<string, unknown> }> }>(
        `/hermes/history?threadId=${encodeURIComponent(thread.id)}&refresh=1`, 'GET', undefined, signal);
      if (signal?.aborted) return;
      const rows: TextMessage[] = history.messages.filter((m) => ['user', 'assistant'].includes(m.role)).map((m, i) => ({
        id: m.id ?? m.row_id ?? `history-${i}`, role: m.role as 'user' | 'assistant',
        content: projectedText(m.content ?? m.text), metadata: m.metadata?.delivery ? { ...m.metadata, hermesDelivery: m.metadata.delivery } : m.metadata,
      }));
      setMessages((previous) => mergeHistory(previous, rows));
      setTools((previous) => (history.toolEvents ?? []).reduce((items, event) => mergeToolEvent(items, event), previous));
      setRunning(history.session?.running === true);
      if (history.session?.running === false && !history.session.hydrating && !['resuming', 'hydrating'].includes(history.session.status ?? '')) setUncertain(false);
      else if (history.running && history.session?.running !== true) setUncertain(true);
      else if (!history.running && !history.session) setUncertain(false);
      setApprovals((previous) => [...previous, ...(history.pendingRequests ?? []).filter((request) => !previous.some((p) => p.requestId === request.requestId))]);
    } catch (cause) { if (!signal?.aborted) setError(cause instanceof Error ? cause.message : 'Conversation unavailable.'); }
  }, [thread.id]);
  useEffect(() => { if (initialPrompt) { setDraft(initialPrompt); onConsumed(); } }, [initialPrompt, onConsumed]);
  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let wasConnected = false;
    const load = async () => {
      try {
        const next = await api<RuntimeStatus>(`/hermes/status?threadId=${encodeURIComponent(thread.id)}`, 'GET', undefined, controller.signal);
        if (!controller.signal.aborted) { setStatus(next); if (next.connected && !wasConnected) await loadHistory(controller.signal); wasConnected = next.connected; }
      } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Runtime unavailable.'); }
    };
    void load();
    const poll = setInterval(() => void load(), 3000);
    void loadHistory(controller.signal).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    const receive = (frame: Record<string, unknown>) => {
      if (controller.signal.aborted) return;
      if (frame.type === 'approval-waiting' && typeof frame.threadId === 'string' && frame.threadId !== thread.id) setBackgroundApproval(frame.threadId);
      if (frame.type === 'turn') {
        if (['dispatching', 'accepted', 'running', 'completed', 'error', 'interrupted'].includes(String(frame.status))) turnPhase.current = frame.status as TurnPhase;
        setDispatching(frame.status === 'dispatching'); setWaiting(frame.status === 'accepted');
        setRunning(frame.status === 'running');
        if (frame.uncertain === true) setUncertain(true);
        if (['completed', 'error', 'interrupted'].includes(String(frame.status))) { assistantId.current = undefined; if (frame.uncertain !== true) setUncertain(false); }
        if (frame.status === 'error') setError(textOf(frame.message) || 'The Hermes turn failed.');
      }
      if (frame.type === 'admitted') {
        setUncertain(false);
        if (submittedId.current) setMessages((previous) => delivery(previous, submittedId.current, 'acknowledged'));
      }
      if (frame.type === 'request-resolved' || frame.type === 'cancel') setApprovals((previous) => removeApproval(previous, frame.requestId));
      if (frame.type === 'request' && frame.method === 'approval') {
        setApprovals((previous) => previous.some((a) => a.requestId === frame.requestId) ? previous :
          [...previous, { requestId: frame.requestId, params: (frame.params ?? {}) as Approval['params'] }]);
      }
      if (frame.type !== 'runtime') return;
      window.dispatchEvent(new CustomEvent('hermes-runtime-event', { detail: { dotId: dot.id, threadId: thread.id, connectionId: frame.connectionId, event: frame.event } }));
      const event = frame.event as { type?: string; payload?: Record<string, unknown> } | undefined;
      const payload = event?.payload ?? {};
      if (['message.delta', 'message.interim', 'tool.start'].includes(event?.type ?? '')) {
        turnPhase.current = 'running'; setRunning(true); setDispatching(false); setWaiting(false);
        if (submittedId.current) setMessages((previous) => delivery(previous, submittedId.current, 'acknowledged'));
      }
      if (event?.type === 'message.delta') {
        setRunning(true); setWaiting(false);
        const id = assistantId.current ?? crypto.randomUUID(); assistantId.current = id;
        setMessages((previous) => appendAssistant(previous, id, textOf(payload.text)));
      }
      if (event?.type === 'message.complete') {
        const id = assistantId.current ?? crypto.randomUUID();
        if (textOf(payload.text)) setMessages((previous) => appendAssistant(previous, id, textOf(payload.text), true));
        turnPhase.current = payload.status === 'error' ? 'error' : payload.status === 'interrupted' ? 'interrupted' : 'completed';
        assistantId.current = undefined; setRunning(false); setWaiting(false);
        if (payload.status === 'error') setError(textOf(payload.error) || 'The Hermes turn failed.');
      }
      if (event?.type === 'tool.start' || event?.type === 'tool.complete') {
        setTools((previous) => mergeToolEvent(previous, event));
      }
    };
    const stream = async () => {
      try {
        const response = await fetch(`/api/hermes/events?threadId=${encodeURIComponent(thread.id)}&handlerId=${crypto.randomUUID()}`, {
          headers: authHeaders(), signal: controller.signal,
        });
        if (!response.ok || !response.body) throw new Error('Hermes activity stream unavailable.');
        if (!controller.signal.aborted) setStreamConnected(true);
        const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = '';
        while (!controller.signal.aborted) {
          const chunk = await reader.read(); if (chunk.done) break;
          buffer += decoder.decode(chunk.value, { stream: true }).replace(/\r\n/g, '\n');
          let boundary: number;
          while ((boundary = buffer.indexOf('\n\n')) >= 0) {
            const block = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
            const data = block.split('\n').filter((line) => line.startsWith('data:')).map((line) => line.slice(5).trimStart()).join('\n');
            if (data) receive(JSON.parse(data) as Record<string, unknown>);
          }
          if (buffer.length > 2_000_000) throw new Error('Hermes event exceeds the display limit.');
        }
      } catch (cause) {
        if (!controller.signal.aborted) { setStreamConnected(false); setStatus((previous) => ({ ...previous, connected: false })); setUncertain(true); setError(cause instanceof Error ? cause.message : 'Connection interrupted. The runtime may still be working.'); }
      }
      if (!controller.signal.aborted) { setStreamConnected(false); setUncertain(true); }
      if (!controller.signal.aborted) timer = setTimeout(() => void stream(), 3000);
    };
    void stream();
    return () => { controller.abort(); clearInterval(poll); clearTimeout(timer); };
  }, [thread.id, dot.id, loadHistory, hostRevision]);
  useEffect(() => { timeline.current?.scrollTo({ top: timeline.current.scrollHeight }); }, [messages, tools, approvals]);

  const send = async () => {
    const capturedDraft = draft;
    const text = capturedDraft.trim();
    if (!text || preparationPending.current || ['dispatching', 'accepted', 'running'].includes(turnPhase.current) || running || waiting || dispatching || !status.connected || !streamConnected || paused || uncertain) return;
    let pageReference: { id: string; spaceId: string; revision: number } | undefined;
    preparationPending.current = true; setPreparing(true); setError('');
    try { pageReference = await beforeSend?.(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'The page could not be saved. Your message was not sent.'); return; }
    finally { preparationPending.current = false; setPreparing(false); }
    const id = crypto.randomUUID(); submittedId.current = id;
    setMessages((previous) => pendingMessage(previous, id, text));
    turnPhase.current = 'dispatching'; setDispatching(true); setError('');
    try {
      await api('/hermes/send', 'POST', { threadId: thread.id, text, clientSubmissionId: id, ...(pageReference ? { pageReference } : {}) });
      turnPhase.current = afterDispatchResponse(turnPhase.current);
      setWaiting(turnPhase.current === 'accepted');
      setDraft((current) => {
        const next = remainingDraft(current, capturedDraft);
        try { localStorage.setItem(draftKey, next); } catch { /* disk draft route remains authoritative */ } return next;
      });
      // HTTP dispatch acceptance is distinct from a confirmed runtime acknowledgement.
    } catch (cause) {
      turnPhase.current = 'error'; setUncertain(true);
      setMessages((previous) => delivery(previous, id, 'uncertain'));
      setError(cause instanceof Error ? `${cause.message} Delivery must be checked; your draft is preserved.` : 'Delivery must be checked. Your draft is preserved.');
    }
    finally { setDispatching(false); }
  };
  const connect = async () => {
    try { await api('/hermes/connect', 'POST', { connectionId: status.connectionId ?? 'local' }); setStatus(await api(`/hermes/status?threadId=${encodeURIComponent(thread.id)}`)); await loadHistory(); setError(''); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not connect Hermes.'); }
  };
  const decide = async (approval: Approval, choice: string) => {
    setDecisionPending(true);
    try {
      await api('/hermes/approval', 'POST', { threadId: thread.id, requestId: approval.requestId, result: { choice } });
      setApprovals((previous) => previous.filter((a) => a !== approval));
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Decision was not delivered.'); }
    finally { setDecisionPending(false); }
  };
  return <div className="live-chat hermes-chat">
    <header className="chat-persona">
      <Mascot identity={dot.id} name={dot.name} small state={running ? 'working' : 'idle'} />
      <div><strong>{dot.name}</strong><span>{paused ? 'Paused' : running ? 'Working' : uncertain ? 'Connection needs inspection' : waiting ? 'Waiting for Hermes' : dispatching ? 'Sending…' : status.connected && streamConnected ? `Connected · ${status.name ?? 'Hermes'}` : `${status.name ?? 'Hermes'} disconnected`}</span></div>
      <div className="chat-persona-actions">
        <button className="icon-button" aria-label="Review response for Space" title="Review a response before saving" disabled={loading || preparing || running || waiting || dispatching || uncertain || !messages.some((message) => message.role === 'assistant' && message.content.trim())} onClick={() => setReviewContent([...messages].reverse().find((message) => message.role === 'assistant' && message.content.trim())?.content)}><FileText size={19} /></button>
        <button className="icon-button" disabled title="Calls are planned for a future version" aria-label="Calls unavailable"><Phone size={19} /></button>
        <button className="icon-button" aria-label="Show computer" onClick={onComputer}><Monitor size={21} /></button>
      </div>
    </header>
    <ConversationHost threadId={thread.id} onChanged={() => setHostRevision(value => value + 1)} />
    <div className="hermes-timeline" ref={timeline} role="log" aria-label="Conversation">
      {(!status.connected || uncertain) && <div className="hermes-connection"><strong>Connect your Hermes runtime</strong><p>{uncertain ? 'Delivery or ongoing work needs inspection. Reconnecting does not resend your request or cancel the runtime.' : 'Your documents remain available. A connection enables real conversations and tool activity.'}</p><button onClick={() => void connect()}>Connect Hermes</button></div>}
      {backgroundApproval && <div className="hermes-connection" role="status"><strong>Another conversation needs your decision</strong>{onOpenConversation ? <button onClick={() => onOpenConversation(backgroundApproval)}>Open conversation</button> : <p>Open the waiting conversation from Chats to review the request.</p>}</div>}
      {loading && <p role="status">Loading conversation…</p>}
      {!loading && !messages.length && <div className="hermes-chat-empty"><Mascot identity={dot.id} name={dot.name} /><h2>{dot.name}</h2><p>{dot.instructions}</p></div>}
      <ChatTranscript messages={messages} calls={[]} />
      {tools.map((tool) => <section className="inline-computer hermes-tool" key={tool.id}>
        <header><strong>{tool.name}</strong><span className="tool-state">{tool.complete ? 'Finished' : running ? 'Working' : 'Last activity'}</span></header>
        {tool.args != null && <details><summary>Inputs</summary><pre>{JSON.stringify(tool.args, null, 2)?.slice(0, 8000)}</pre></details>}
        {tool.result != null && <pre>{(typeof tool.result === 'string' ? tool.result : JSON.stringify(tool.result, null, 2))?.slice(0, 12000)}</pre>}
      </section>)}
      {reviewContent !== undefined && <SaveToSpaceReview threadId={thread.id} dot={dot} initialContent={reviewContent} initialTitle={thread.title || 'Research draft'} onSaved={onSaved} onClose={() => setReviewContent(undefined)} />}
      {approvals.map((approval, index) => <section className="hermes-approval" key={index}>
        <header><strong>Review before continuing</strong></header><p>{approval.params.description || approval.params.command || 'Hermes needs your decision.'}</p>
        {approval.params.command && <pre>{approval.params.command}</pre>}
        <footer>{(Array.isArray(approval.params.choices) ? approval.params.choices.filter((choice) => typeof choice === 'string' && ['once', 'session', 'always', 'deny'].includes(choice)) : []).map((choice) => <button key={choice} disabled={decisionPending} onClick={() => void decide(approval, choice)}>{choice}</button>)}</footer>
      </section>)}
    </div>
    {draftError && <div className="chat-error" role="status">{draftError}</div>}
    {error && <div className="chat-error" role="alert">{error}<button onClick={() => setError('')}>Dismiss</button></div>}
    <form className="composer" onSubmit={(e) => { e.preventDefault(); void send(); }}>
      <button type="button" className="icon-button" disabled title="Attachments are not connected yet" aria-label="Attachments unavailable"><Plus size={22} /></button>
      <textarea aria-label="Message Hermes" placeholder="Ask anything" value={draft} onChange={(e) => updateDraft(e.target.value)} maxLength={32000}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(); } }} />
      {running ? <button type="button" className="send-button" aria-label="Interrupt current turn" onClick={() => void api('/hermes/interrupt', 'POST', { threadId: thread.id }).catch((e: Error) => setError(e.message))}><Square size={16} /></button>
        : <button className="send-button" aria-label="Send message" disabled={!draft.trim() || !status.connected || !streamConnected || uncertain || waiting || dispatching || preparing || loading || paused}><ArrowUp size={21} /></button>}
    </form>
  </div>;
}
