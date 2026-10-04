// Preserve the OpenDots computer surface while exposing only verified Hermes capabilities.
import { useEffect, useState } from 'react';
import { Folder, Globe, Terminal } from 'lucide-react';
import type { Dot } from '../shared/types';
import { api } from './api';
interface Status { connected: boolean; lastError?: string }
interface Activity { id: string; name: string; result?: unknown; complete: boolean }
export function ComputerPanel({ dot }: { dot: Dot }) {
  const [tab, setTab] = useState<'Browser' | 'Files' | 'Terminal'>('Browser');
  const [status, setStatus] = useState<Status>({ connected: false });
  const [error, setError] = useState('');
  const [activity, setActivity] = useState<Activity[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = () => void api<Status>('/hermes/status', 'GET', undefined, controller.signal)
      .then((next) => { if (!controller.signal.aborted) { setStatus(next); setError(''); } })
      .catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Runtime unavailable.'); });
    refresh(); const timer = setInterval(refresh, 3000);
    const receive = (raw: Event) => {
      const { dotId, event } = (raw as CustomEvent).detail ?? {};
      if (dotId !== dot.id || !event || !['tool.start', 'tool.complete'].includes(event.type)) return;
      const payload = event.payload ?? {}; const id = payload.tool_id ?? payload.id;
      if (typeof id !== 'string') return;
      setActivity((previous) => {
        const item: Activity = { id, name: typeof payload.name === 'string' ? payload.name : 'Tool',
          result: payload.result ?? payload.result_text, complete: event.type === 'tool.complete' };
        return [...previous.filter((row) => row.id !== id), item].slice(-30);
      });
    };
    window.addEventListener('hermes-runtime-event', receive);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener('hermes-runtime-event', receive); };
  }, [dot.id]);
  const rows = activity.filter((row) => tab === 'Files' ? /file|read|write|directory/i.test(row.name) : /terminal|shell|exec/i.test(row.name));
  return <section className="computer-panel hermes-computer" aria-label={`${dot.name}'s computer`}>
    <div className="computer-tool-tabs" role="tablist" aria-label="Computer tools">
      {(['Browser', 'Files', 'Terminal'] as const).map((name) => <button key={name} role="tab" aria-selected={name === tab} onClick={() => setTab(name)}>{name}</button>)}
    </div>
    <div className="hermes-computer-status"><span className={status.connected ? 'hermes-connected-dot' : ''} />{status.connected ? 'Hermes connected' : 'Disconnected'}</div>
    {error && <p className="computer-error" role="alert">{error}</p>}
    <section className="hermes-computer-placeholder" role="tabpanel" aria-label={tab}>
      {tab === 'Browser' ? <><Globe size={28} /><h3>No live computer view</h3><p>Hermes research and browser tools appear in the conversation when they run. A live browser stream and human takeover are not connected in this version.</p></>
        : tab === 'Files' ? <><Folder size={28} /><h3>Files from real tool activity</h3><p>File tools reported by Hermes will appear below. This panel does not browse or edit your personal folders.</p></>
          : <><Terminal size={28} /><h3>Terminal activity</h3><p>Confirmed terminal tool output appears below. Commands are requested through Hermes; this panel does not run a separate shell.</p></>}
    </section>
    {tab !== 'Browser' && rows.map((row) => <section className="hermes-computer-output" key={row.id}><strong>{row.name}</strong><small>{row.complete ? 'Result received' : 'Tool started'}</small>{row.result != null && <pre>{(typeof row.result === 'string' ? row.result : JSON.stringify(row.result, null, 2))?.slice(0, 12000)}</pre>}</section>)}
    <div className="computer-control-pill"><span>Human takeover unavailable</span><button disabled>Take over</button></div>
    <section className="hermes-permissions"><h3>Permissions</h3><div>{['Browser', 'Files', 'Shell', 'Memory'].map((name) => <span key={name}>{name}</span>)}</div><p>Tool permissions are controlled by Hermes. Per-Dot permission controls are not connected here.</p></section>
  </section>;
}
