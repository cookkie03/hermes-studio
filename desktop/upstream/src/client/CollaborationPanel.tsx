import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Bot,
  Send,
  Square,
  Play,
  RotateCw,
  Search,
  FolderGit2,
  X,
  AlertCircle,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import type {
  Dot,
  SubagentTask,
  BotMessage,
  HostedRoom,
  RoomLogEvent,
  RecallResult,
  SpaceProfileLink,
} from '../shared/types';
import { api } from './api';
import { RecallResults } from './RecallResults';

export interface CollaborationPanelProps {
  threadId: string;
  dot: Dot;
  allDots: Dot[];
  spaceId?: string;
  onClose: () => void;
  onOpenConversation?: (threadId: string) => void;
}

export function CollaborationPanel({
  threadId,
  dot,
  allDots,
  spaceId = 'default',
  onClose,
  onOpenConversation,
}: CollaborationPanelProps) {
  const [tab, setTab] = useState<'subagents' | 'messages' | 'rooms' | 'recall' | 'spaceLink'>('subagents');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Subagent state
  const [subagents, setSubagents] = useState<SubagentTask[]>([]);
  const [selectedSubagentId, setSelectedSubagentId] = useState<string>();
  const [subagentTail, setSubagentTail] = useState<string>('');
  const [newGoal, setNewGoal] = useState('');
  const [newContext, setNewContext] = useState('');
  const [steerText, setSteerText] = useState('');

  // 2. Bot messaging state
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [targetDotId, setTargetDotId] = useState<string>(allDots.find((d) => d.id !== dot.id)?.id || '');
  const [messageDraft, setMessageDraft] = useState('');

  // 3. Rooms state
  const [rooms, setRooms] = useState<HostedRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string>();
  const [roomEvents, setRoomEvents] = useState<RoomLogEvent[]>([]);
  const [roomMsgInput, setRoomMsgInput] = useState('');
  const [newRoomName, setNewRoomName] = useState('');

  // 4. Recall state
  const [recallQuery, setRecallQuery] = useState('');
  const [recallResults, setRecallResults] = useState<RecallResult[]>([]);

  // 5. Space link state
  const [spaceLink, setSpaceLink] = useState<SpaceProfileLink | null>(null);
  const [customProjectId, setCustomProjectId] = useState('');

  // --- Subagents Fetch & Tail ---
  const loadSubagents = useCallback(async () => {
    try {
      const list = await api<SubagentTask[]>(`/hermes/collaboration/subagents?parentId=${encodeURIComponent(threadId)}`);
      setSubagents(list);
      if (!selectedSubagentId && list.length > 0) {
        setSelectedSubagentId(list[0].id);
      }
    } catch (e) {
      // Background poll failure
    }
  }, [threadId, selectedSubagentId]);

  const loadSubagentTail = useCallback(async (id: string) => {
    try {
      const data = await api<{ tail: string }>(`/hermes/collaboration/subagents/${encodeURIComponent(id)}/tail?maxBytes=16384`);
      setSubagentTail(data.tail);
    } catch {
      setSubagentTail('Tail buffer unavailable.');
    }
  }, []);

  useEffect(() => {
    if (tab === 'subagents') {
      void loadSubagents();
      const interval = setInterval(loadSubagents, 3000);
      return () => clearInterval(interval);
    }
  }, [tab, loadSubagents]);

  useEffect(() => {
    if (selectedSubagentId) {
      void loadSubagentTail(selectedSubagentId);
      const interval = setInterval(() => void loadSubagentTail(selectedSubagentId), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedSubagentId, loadSubagentTail]);

  // --- Bot Messages Fetch ---
  const loadMessages = useCallback(async () => {
    try {
      const list = await api<BotMessage[]>(`/hermes/collaboration/messages?threadId=${encodeURIComponent(threadId)}`);
      setMessages(list);
    } catch {}
  }, [threadId]);

  useEffect(() => {
    if (tab === 'messages') {
      void loadMessages();
      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [tab, loadMessages]);

  // --- Rooms Fetch ---
  const loadRooms = useCallback(async () => {
    try {
      const list = await api<HostedRoom[]>('/hermes/collaboration/rooms');
      setRooms(list);
      if (!selectedRoomId && list.length > 0) {
        setSelectedRoomId(list[0].roomId);
      }
    } catch {}
  }, [selectedRoomId]);

  const loadRoomEvents = useCallback(async (roomId: string) => {
    try {
      const events = await api<RoomLogEvent[]>(`/hermes/collaboration/rooms/${encodeURIComponent(roomId)}/events?limit=50`);
      setRoomEvents(events);
    } catch {}
  }, []);

  useEffect(() => {
    if (tab === 'rooms') {
      void loadRooms();
      const interval = setInterval(loadRooms, 3000);
      return () => clearInterval(interval);
    }
  }, [tab, loadRooms]);

  useEffect(() => {
    if (selectedRoomId) {
      void loadRoomEvents(selectedRoomId);
      const interval = setInterval(() => void loadRoomEvents(selectedRoomId), 2000);
      return () => clearInterval(interval);
    }
  }, [selectedRoomId, loadRoomEvents]);

  // --- Space Link Fetch ---
  const loadSpaceLink = useCallback(async () => {
    try {
      const link = await api<SpaceProfileLink>(`/hermes/collaboration/space-link?spaceId=${encodeURIComponent(spaceId)}&profile=${encodeURIComponent(dot.id)}`);
      setSpaceLink(link);
    } catch {}
  }, [spaceId, dot.id]);

  useEffect(() => {
    if (tab === 'spaceLink') {
      void loadSpaceLink();
    }
  }, [tab, loadSpaceLink]);

  // --- Handlers ---
  const handleSpawnSubagent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.trim()) return;
    setLoading(true);
    setError('');
    try {
      const spawned = await api<SubagentTask>('/hermes/collaboration/subagents', 'POST', {
        parentId: threadId,
        goal: newGoal.trim(),
        context: newContext.trim(),
        model: 'auto/fast',
        effort: 'Standard',
        spaceId,
        host: 'This Mac',
      });
      setNewGoal('');
      setNewContext('');
      setSelectedSubagentId(spawned.id);
      await loadSubagents();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not spawn subagent.');
    } finally {
      setLoading(false);
    }
  };

  const handleSteer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubagentId || !steerText.trim()) return;
    try {
      await api(`/hermes/collaboration/subagents/${encodeURIComponent(selectedSubagentId)}/steer`, 'POST', {
        message: steerText.trim(),
      });
      setSteerText('');
      await loadSubagentTail(selectedSubagentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Steer command failed.');
    }
  };

  const handleInterrupt = async (id: string) => {
    try {
      await api(`/hermes/collaboration/subagents/${encodeURIComponent(id)}/interrupt`, 'POST');
      await loadSubagents();
      await loadSubagentTail(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Interrupt failed.');
    }
  };

  const handleSendBotMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageDraft.trim() || !targetDotId) return;
    setLoading(true);
    setError('');
    try {
      const targetDot = allDots.find((d) => d.id === targetDotId);
      await api('/hermes/collaboration/messages', 'POST', {
        fromProfile: dot.id,
        toProfile: targetDot?.id || targetDotId,
        fromDotId: dot.id,
        toDotId: targetDotId,
        threadId,
        content: messageDraft.trim(),
      });
      setMessageDraft('');
      await loadMessages();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Message dispatch failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    try {
      const created = await api<HostedRoom>('/hermes/collaboration/rooms', 'POST', {
        name: newRoomName.trim(),
        members: [dot.id, ...allDots.filter((d) => d.id !== dot.id).map((d) => d.id)],
      });
      setNewRoomName('');
      setSelectedRoomId(created.roomId);
      await loadRooms();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create room.');
    }
  };

  const handleSendRoomEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !roomMsgInput.trim()) return;
    try {
      await api(`/hermes/collaboration/rooms/${encodeURIComponent(selectedRoomId)}/events`, 'POST', {
        fromProfile: dot.id,
        payload: { text: roomMsgInput.trim() },
      });
      setRoomMsgInput('');
      await loadRoomEvents(selectedRoomId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not dispatch room event.');
    }
  };

  const handleSearchRecall = async (q: string) => {
    setRecallQuery(q);
    setLoading(true);
    try {
      const res = await api<RecallResult[]>(`/hermes/collaboration/recall?query=${encodeURIComponent(q)}&limit=15`);
      setRecallResults(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recall search failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSpaceProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const link = await api<SpaceProfileLink>('/hermes/collaboration/space-link', 'POST', {
        spaceId,
        profile: dot.id,
        projectId: customProjectId.trim() || undefined,
        host: 'This Mac',
      });
      setSpaceLink(link);
      setCustomProjectId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not link Space to profile project.');
    } finally {
      setLoading(false);
    }
  };

  const activeSubagent = subagents.find((s) => s.id === selectedSubagentId);

  return (
    <aside className="collaboration-panel" aria-label="Hermes Bot Collaboration and Delegation Panel">
      <header className="collab-header">
        <div className="collab-title-group">
          <Users size={18} aria-hidden="true" />
          <h2>Bot Collaboration & Delegation</h2>
        </div>
        <div className="collab-meta">
          <span className="collab-tag" title="Current specialist">Dot: {dot.name}</span>
          <span className="collab-tag" title="Current space">Space: {spaceId}</span>
        </div>
        <button className="icon-button" onClick={onClose} aria-label="Close collaboration panel">
          <X size={16} />
        </button>
      </header>

      {error && (
        <div className="collab-error-banner" role="alert">
          <AlertCircle size={15} />
          <span>{error}</span>
          <button className="icon-button" onClick={() => setError('')} aria-label="Dismiss error">
            <X size={14} />
          </button>
        </div>
      )}

      <nav className="collab-tabs" aria-label="Collaboration modes">
        <button
          className={`collab-tab ${tab === 'subagents' ? 'active' : ''}`}
          onClick={() => setTab('subagents')}
          aria-current={tab === 'subagents' ? 'page' : undefined}
        >
          <Bot size={15} />
          <span>Subagents</span>
          <small>{subagents.length}</small>
        </button>
        <button
          className={`collab-tab ${tab === 'messages' ? 'active' : ''}`}
          onClick={() => setTab('messages')}
          aria-current={tab === 'messages' ? 'page' : undefined}
        >
          <Send size={15} />
          <span>Bot Messages</span>
        </button>
        <button
          className={`collab-tab ${tab === 'rooms' ? 'active' : ''}`}
          onClick={() => setTab('rooms')}
          aria-current={tab === 'rooms' ? 'page' : undefined}
        >
          <Layers size={15} />
          <span>Rooms</span>
        </button>
        <button
          className={`collab-tab ${tab === 'recall' ? 'active' : ''}`}
          onClick={() => setTab('recall')}
          aria-current={tab === 'recall' ? 'page' : undefined}
        >
          <Search size={15} />
          <span>Recall</span>
        </button>
        <button
          className={`collab-tab ${tab === 'spaceLink' ? 'active' : ''}`}
          onClick={() => setTab('spaceLink')}
          aria-current={tab === 'spaceLink' ? 'page' : undefined}
        >
          <FolderGit2 size={15} />
          <span>Space Link</span>
        </button>
      </nav>

      <div className="collab-content">
        {/* TAB 1: SUBAGENTS (delegate_task) */}
        {tab === 'subagents' && (
          <div className="collab-subagents-view">
            <div className="collab-subagents-split">
              <div className="subagents-list-col">
                <div className="subagents-section-header">
                  <h3>Temporary Children</h3>
                  <small>Bound to this conversation</small>
                </div>
                {subagents.length === 0 ? (
                  <p className="empty-notice">No delegated subagents in this thread.</p>
                ) : (
                  <div className="subagent-cards" role="list">
                    {subagents.map((sub) => (
                      <div
                        key={sub.id}
                        className={`subagent-card ${selectedSubagentId === sub.id ? 'active' : ''}`}
                        role="listitem"
                        tabIndex={0}
                        onClick={() => setSelectedSubagentId(sub.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') setSelectedSubagentId(sub.id);
                        }}
                      >
                        <div className="subagent-card-header">
                          <span className="subagent-id-tag">{sub.subagentId}</span>
                          <span className={`status-pill status-${sub.status}`}>
                            {sub.status === 'working' ? 'Working…' : sub.status}
                          </span>
                        </div>
                        <p className="subagent-goal-preview">{sub.goal}</p>
                        <div className="subagent-card-footer">
                          <span>Model: {sub.model ?? 'auto/fast'}</span>
                          <span>Effort: {sub.effort ?? 'Standard'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <form className="spawn-subagent-form" onSubmit={handleSpawnSubagent}>
                  <h4>Spawn New Subagent</h4>
                  <input
                    type="text"
                    aria-label="Subagent Goal"
                    placeholder="Subagent goal / assignment…"
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    required
                  />
                  <textarea
                    aria-label="Subagent Context"
                    placeholder="Optional background context / constraints…"
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                    rows={2}
                  />
                  <button type="submit" className="primary" disabled={loading || !newGoal.trim()}>
                    {loading ? 'Spawning…' : 'Delegate Task'}
                  </button>
                </form>
              </div>

              <div className="subagent-detail-col">
                {activeSubagent ? (
                  <div className="subagent-inspector">
                    <div className="inspector-header">
                      <div>
                        <h3>{activeSubagent.subagentId}</h3>
                        <p className="inspector-subtitle">ID: {activeSubagent.id}</p>
                      </div>
                      <div className="inspector-actions">
                        {activeSubagent.status === 'working' && (
                          <button
                            type="button"
                            className="danger-button"
                            onClick={() => void handleInterrupt(activeSubagent.id)}
                          >
                            <Square size={13} /> Interrupt
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="inspector-meta-grid">
                      <div><strong>Status:</strong> {activeSubagent.status}</div>
                      <div><strong>Host:</strong> {activeSubagent.host ?? 'This Mac'}</div>
                      <div><strong>Space:</strong> {activeSubagent.spaceId ?? 'default'}</div>
                      <div><strong>Model:</strong> {activeSubagent.model ?? 'auto/fast'}</div>
                    </div>

                    <div className="tail-output-section">
                      <h4>Activity Output (Tail max 16KB)</h4>
                      <pre className="terminal-tail-box" tabIndex={0} aria-label="Subagent execution output">
                        {subagentTail || 'No output recorded yet.'}
                      </pre>
                    </div>

                    {activeSubagent.status === 'working' && (
                      <form className="steer-form" onSubmit={handleSteer}>
                        <input
                          type="text"
                          aria-label="Steer directive"
                          placeholder="Send steering instruction mid-turn…"
                          value={steerText}
                          onChange={(e) => setSteerText(e.target.value)}
                        />
                        <button type="submit" disabled={!steerText.trim()}>
                          Steer
                        </button>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="inspector-empty">Select or spawn a subagent to view execution details.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BOT MESSAGES (message_agent) */}
        {tab === 'messages' && (
          <div className="collab-messages-view">
            <div className="messages-composer-card">
              <h3>Message Persistent Colleague (Dot-to-Dot)</h3>
              <p className="muted-text">
                Direct message via <code>message_agent</code> contract with server-side attribution and queued receipt.
              </p>
              <form onSubmit={handleSendBotMessage}>
                <div className="target-select-row">
                  <label htmlFor="target-bot-select">Target Bot:</label>
                  <select
                    id="target-bot-select"
                    value={targetDotId}
                    onChange={(e) => setTargetDotId(e.target.value)}
                  >
                    {allDots.map((d) => (
                      <option key={d.id} value={d.id} disabled={d.id === dot.id}>
                        {d.name} {d.id === dot.id ? '(Current Bot)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <textarea
                  aria-label="Bot message body"
                  placeholder="Enter message for peer Dot (max 16,000 characters)..."
                  maxLength={16000}
                  value={messageDraft}
                  onChange={(e) => setMessageDraft(e.target.value)}
                  rows={3}
                  required
                />
                <div className="composer-actions">
                  <span className="char-count">{messageDraft.length} / 16,000</span>
                  <button type="submit" className="primary" disabled={loading || !messageDraft.trim()}>
                    {loading ? 'Queueing…' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>

            <div className="messages-history-section">
              <h3>Message Delivery History</h3>
              {messages.length === 0 ? (
                <p className="empty-notice">No bot-to-bot messages recorded in this conversation.</p>
              ) : (
                <div className="messages-timeline" role="list">
                  {messages.map((m) => (
                    <div key={m.id} className="bot-message-item" role="listitem">
                      <div className="bot-msg-meta">
                        <span className="bot-route">
                          {m.fromProfile} <ArrowRight size={12} aria-hidden="true" /> {m.toProfile}
                        </span>
                        <span className={`status-pill status-${m.status}`}>
                          {m.status === 'queued' ? 'Ack Queued' : m.status === 'reply_received' ? 'Reply Received' : m.status}
                        </span>
                        <span className="delivery-id" title="Delivery Receipt">ID: {m.deliveryId}</span>
                      </div>
                      <p className="bot-msg-content">{m.content}</p>
                      {m.reply && (
                        <div className="bot-msg-reply">
                          <strong>Colleague Reply:</strong>
                          <p>{m.reply}</p>
                        </div>
                      )}
                      {m.error && (
                        <div className="bot-msg-error" role="alert">
                          <AlertCircle size={14} /> {m.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ROOMS (groups.*) */}
        {tab === 'rooms' && (
          <div className="collab-rooms-view">
            <div className="rooms-top-bar">
              <form className="create-room-form" onSubmit={handleCreateRoom}>
                <input
                  type="text"
                  aria-label="New Room Name"
                  placeholder="Create hosted group room…"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                />
                <button type="submit" disabled={!newRoomName.trim()}>
                  Create Room
                </button>
              </form>
              <div className="room-selector">
                <label htmlFor="room-select">Active Room:</label>
                <select
                  id="room-select"
                  value={selectedRoomId || ''}
                  onChange={(e) => setSelectedRoomId(e.target.value)}
                >
                  {rooms.map((r) => (
                    <option key={r.roomId} value={r.roomId}>
                      {r.name} ({r.members.length} members)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="room-event-log-section">
              <h3>Room Event Log (Gateway Sequence Authority)</h3>
              <div className="room-events-list" role="log" aria-label="Room log events">
                {roomEvents.length === 0 ? (
                  <p className="empty-notice">No events recorded in this room.</p>
                ) : (
                  roomEvents.map((evt) => (
                    <div key={`${evt.seq}-${evt.eventId}`} className="room-event-row">
                      <span className="seq-badge">#{evt.seq}</span>
                      <span className="evt-sender">{evt.fromProfile}:</span>
                      <span className="evt-payload">
                        {typeof evt.payload === 'string' ? evt.payload : JSON.stringify(evt.payload)}
                      </span>
                      <span className="evt-time">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))
                )}
              </div>

              {selectedRoomId && (
                <form className="room-send-form" onSubmit={handleSendRoomEvent}>
                  <input
                    type="text"
                    aria-label="Send to room"
                    placeholder="Broadcast message to room members…"
                    value={roomMsgInput}
                    onChange={(e) => setRoomMsgInput(e.target.value)}
                  />
                  <button type="submit" disabled={!roomMsgInput.trim()}>
                    Broadcast
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: RECALL (session_search) */}
        {tab === 'recall' && (
          <div className="collab-recall-view">
            <RecallResults
              results={recallResults}
              query={recallQuery}
              onSearch={handleSearchRecall}
              loading={loading}
              onSelectResult={(res) => {
                if (onOpenConversation && res.threadId) {
                  onOpenConversation(res.threadId);
                }
              }}
            />
          </div>
        )}

        {/* TAB 5: SPACE LINK (D38) */}
        {tab === 'spaceLink' && (
          <div className="collab-spacelink-view">
            <div className="spacelink-card">
              <h3>D38 Specialist Space Association</h3>
              <p className="muted-text">
                In Hermes, projects are profile-scoped (<code>HERMES_HOME/projects.db</code>). Studio Space associates
                with native projects without merging profiles or copying files.
              </p>

              <div className="spacelink-status-row">
                <div>
                  <strong>Space:</strong> {spaceId}
                </div>
                <div>
                  <strong>Specialist Profile:</strong> {dot.name} ({dot.id})
                </div>
                <div>
                  <strong>Status:</strong>{' '}
                  <span className={`status-pill status-${spaceLink?.status || 'missing'}`}>
                    {spaceLink?.status === 'linked' ? 'Linked' : 'Missing Link'}
                  </span>
                </div>
                <div>
                  <strong>Resolved Project ID:</strong> {spaceLink?.projectId ?? 'None'}
                </div>
              </div>

              {spaceLink?.status === 'missing' && (
                <div className="spacelink-warning" role="alert">
                  <ShieldAlert size={16} />
                  <span>
                    No native project is associated with this specialist profile in this Space. You can explicitly link
                    it below.
                  </span>
                </div>
              )}

              <form className="spacelink-form" onSubmit={handleLinkSpaceProject}>
                <h4>Explicit Project Link Confirmation</h4>
                <label htmlFor="custom-proj-id">Hermes Project ID / Slug:</label>
                <input
                  id="custom-proj-id"
                  type="text"
                  placeholder={`proj-${dot.id}-${spaceId}`}
                  value={customProjectId}
                  onChange={(e) => setCustomProjectId(e.target.value)}
                />
                <button type="submit" className="primary" disabled={loading}>
                  {loading ? 'Linking…' : 'Confirm Space-Project Association'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
