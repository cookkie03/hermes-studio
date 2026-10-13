import { openPageLink } from './page-navigation';
import { SpaceNav } from './SpaceNav';
import { SpaceWorkspace } from './SpaceWorkspace';
import { useCallback, useEffect, useState, useRef } from 'react';
import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Folder,
  Menu,
  MessageCircle,
  Monitor,
  MoreHorizontal,
  Pause,
  Phone,
  PanelLeft,
  Play,
  Plus,
  Search,
  Settings2,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import type {
  Conversation,
  Detail,
  Dot,
  Result,
  State,
  WorkspaceState,
} from '../shared/types';
import { api, ApiError, setToken } from './api';
import { Mascot } from './Mascot';
import { Chat } from './Chat';
import { ThreadList } from './ThreadList';
import { ResultPane } from './ResultPane';
import { TaskRow } from './TaskPresentation';
import { TaskActions } from './TaskActions';
import { RoutinesView } from './RoutinesView';
import { WorkspaceDialog, type Dialog } from './WorkspaceDialog';
import { RuntimeContextBadge } from './RuntimeContextBadge';
import { CollaborationPanel } from './CollaborationPanel';

export function App() {
  const [state, setState] = useState<State>();
  const [workspace, setWorkspace] = useState<WorkspaceState>();
  const [selectedDot, setSelectedDot] = useState('');
  const [selectedThread, setSelectedThread] = useState<string>();
  const [view, rawSetView] = useState<'chat' | 'tasks' | 'memories' | 'space'>(
    'chat',
  );
  const dirtyPage = useRef(false);
  const [spaceId, setSpaceId] = useState('');
  const [pageId, setPageId] = useState<string>();
  const [collaborationOpen, setCollaborationOpen] = useState(false);
  const setDirtyPage = useCallback((value: boolean) => {
    dirtyPage.current = value;
  }, []);
  const setView = (next: typeof view) => {
    if (dirtyPage.current && !window.confirm('Leave your unsaved page draft?'))
      return false;
    dirtyPage.current = false;
    if (next !== 'space')
      history.replaceState(null, '', location.pathname + location.search);
    if (next !== 'chat') setPane(false);
    rawSetView(next);
    return true;
  };
  useEffect(() => {
    let acceptedHash = location.hash;
    const navigate = () => {
      const match = location.hash.match(
        /^#\/spaces\/([^/]+)(?:\/pages\/([^/]+))?$/,
      );
      if (!match) return;
      if (dirtyPage.current && location.hash === acceptedHash) return;
      if (
        dirtyPage.current &&
        !window.confirm('Leave your unsaved page draft?')
      ) {
        history.replaceState(null, '', acceptedHash || location.pathname);
        return;
      }
      acceptedHash = location.hash;
      dirtyPage.current = false;
      setSpaceId(match[1]);
      setPageId(match[2]);
      setPane(false);
      rawSetView('space');
      setMobile(false);
    };
    navigate();
    window.addEventListener('hashchange', navigate);
    return () => window.removeEventListener('hashchange', navigate);
  }, []);
  const openPage = (space: string, page?: string) => {
    openPageLink(`#/spaces/${space}${page ? `/pages/${page}` : ''}`);
  };

  const [error, setError] = useState('');
  const [auth, setAuth] = useState('');
  const [needsAuth, setNeedsAuth] = useState(false);
  const [dialog, setDialog] = useState<Dialog>();
  const [mobile, setMobile] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [pane, setPane] = useState(true);
  const [capture, setCapture] = useState<Result>();
  const [prompt, setPrompt] = useState('');
  const [pendingPrompt, setPendingPrompt] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [taskDetail, setTaskDetail] = useState<Detail>();
  const refresh = useCallback(async () => {
    try {
      await api('/hermes/bots/sync', 'POST', {}).catch(() => {});
      const [s, w] = await Promise.all([
        api<State>('/state'),
        api<WorkspaceState>('/workspace'),
      ]);
      setState(s);
      setWorkspace(w);
      setNeedsAuth(false);
      setSelectedDot((previous) => previous || w.dots[0]?.id || '');
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setNeedsAuth(true);
      else
        setError(
          e instanceof Error ? e.message : 'Could not connect to the server.',
        );
    }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 3000);
    return () => clearInterval(timer);
  }, [refresh]);
  useEffect(() => {
    setCapture(undefined);
    if (!selectedThread) return;
    let active = true;
    const load = () =>
      void api<Result | null>(`/conversations/${selectedThread}/capture`)
        .then((result) => {
          if (active) setCapture(result ?? undefined);
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    load();
    const timer = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [selectedThread]);
  const mutate = async (path: string, method: string, body?: unknown) => {
    setError('');
    try {
      await api(path, method, body);
      await refresh();
      if (taskDetail)
        setTaskDetail(await api<Detail>(`/tasks/${taskDetail.task.id}`));
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
      return false;
    }
  };
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (dialog) {
          setDialog(undefined);
          return;
        }
        if (mobile) {
          setMobile(false);
          return;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialog, mobile]);

  const dot =
    workspace?.dots.find((item) => item.id === selectedDot) ??
    workspace?.dots[0];
  const thread = workspace?.conversations.find(
    (item) => item.id === selectedThread && item.dotId === dot?.id,
  );
  // Hermes conversations are local records; remote capability is checked by Chat on send.
  const configured = !!workspace;
  const dotSelection = useRef(0);
  const chooseDot = async (next: Dot) => {
    const selection = ++dotSelection.current;
    if (!setView('chat')) return;
    setSelectedDot(next.id);
    setSelectedThread(
      workspace?.conversations.find((item) => item.dotId === next.id)?.id,
    );
    setMobile(false);
    setPendingPrompt(undefined);
    if(next.nativeBinding && !workspace?.conversations.some(item=>item.dotId===next.id)) {
      setBusy(true);setError('');
      try {const opened=await api<Conversation>('/conversations','POST',{dotId:next.id,title:'Bot Chat'});await refresh();if(selection === dotSelection.current)setSelectedThread(opened.id);}
      catch(cause) {setError(cause instanceof Error ? cause.message : 'Native Bot Chat could not be opened.');}
      finally {setBusy(false);}
    }
  };
  const newConversation = async (text?: string) => {
    if (!dot || !configured || busy) return;
    if (!setView('chat')) return;
    setBusy(true);
    setError('');
    try {
      const next = await api<Conversation>('/conversations', 'POST', {
        dotId: dot.id,
        title: text?.slice(0, 80) || 'A new thought',
      });
      await refresh();
      setSelectedThread(next.id);
      setPendingPrompt(text);
      setPrompt('');
      setView('chat');
      setMobile(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Could not create the conversation.',
      );
    } finally {
      setBusy(false);
    }
  };
  if (needsAuth)
    return (
      <main className="unlock">
        <Mascot />
        <h1>Your own little corner.</h1>
        <p>
          Enter the owner access token configured on this template’s server.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setToken(auth);
            try {
              await api('/state');
              setError('');
              await refresh();
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : 'Access token was not accepted.',
              );
            }
          }}
        >
          <input
            type="password"
            aria-label="Owner access token"
            autoComplete="current-password"
            value={auth}
            onChange={(e) => setAuth(e.target.value)}
            required
          />
          <button className="primary">Unlock OpenDots</button>
        </form>
        {error && (
          <p className="chat-error" role="alert">
            {error}
          </p>
        )}
        <p className="muted">The token stays in this tab’s session storage.</p>
      </main>
    );
  if (!state || !workspace || !dot)
    return (
      <main className="unlock">
        <Mascot state="working" />
        <h1>Finding your dots…</h1>
        {error && (
          <>
            <p className="chat-error">{error}</p>
            <button onClick={() => void refresh()}>Retry</button>
          </>
        )}
      </main>
    );
  const content = (
    <div className={`app template-app hermes-client ${navCollapsed ? 'nav-collapsed' : ''}`}>
      <button
        className="mobile-menu icon-button"
        aria-label="Open navigation"
        aria-expanded={mobile}
        aria-controls="workspace-sidebar"
        onClick={() => setMobile(true)}
      >
        <Menu size={21} />
      </button>
      {mobile && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        id="workspace-sidebar"
        className={`sidebar ${mobile ? 'open' : ''}`}
      >
        <button
          className="wordmark"
          onClick={() => {
            if (!setView('chat')) return;
            setSelectedThread(undefined);
          }}
        >
          <span className="dotted-logo">
            <i />
            <i />
            <i />
            <i />
          </span>
          Hermes<span className="wordmark-dot">•</span>
        </button>
        <label className="hermes-sidebar-search"><Search size={17} /><input aria-label="Search Spaces and Dots" placeholder="Search…" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
        <button
          className="new-chat nav-item"
          aria-label="New chat"
          disabled={!configured}
          onClick={() => void newConversation()}
        >
          <Plus size={17} />
          <span>New chat</span>
        </button>
        <div className="spaces-heading nav-label">
          SPACES
          <button
            className="icon-button"
            aria-label="Create Space"
            onClick={() => setDialog({ type: 'space' })}
          >
            <Plus size={14} />
          </button>
        </div>
        <nav className="spaces-nav" aria-label="Spaces">
          {workspace.spaces.filter((space) => space.name.toLowerCase().includes(search.toLowerCase())).map((space) => (
            <SpaceNav
              key={space.id}
              space={space}
              active={view === 'space' && spaceId === space.id}
              pageId={pageId}
              onOpen={(id) => openPage(space.id, id)}
            />
          ))}
        </nav>        <div className="spaces-heading nav-label">
          DOTS
          <button
            className="icon-button"
            aria-label="Create Dot"
            onClick={() =>
              setDialog({ type: 'dot', spaceId: workspace.spaces[0].id })
            }
          >
            <Plus size={14} />
          </button>
        </div>
        <nav className="dots-nav" aria-label="Dots">
          {workspace.dots.filter((item) => item.name.toLowerCase().includes(search.toLowerCase())).map((item) => (
            <div className="dot-nav-row" key={item.id}>
              <button
                className={`dot-nav ${dot.id === item.id && view === 'chat' ? 'active' : ''}`}
                aria-current={
                  dot.id === item.id && view === 'chat' ? 'page' : undefined
                }
                onClick={() => chooseDot(item)}
              >
                <Mascot identity={item.id} avatarId={item.avatarId} name={item.name} small decorative />
                <span className="hermes-dot-summary"><span>{item.name}</span><small>{workspace.conversations.find((conversation) => conversation.dotId === item.id)?.title ?? item.instructions}</small></span>
              </button>
              <button
                className="icon-button dot-settings"
                aria-label={`Edit ${item.name} settings`}
                onClick={() =>
                  setDialog({ type: 'dot', dot: item, spaceId: item.spaceId })
                }
              >
                <MoreHorizontal size={15} />
              </button>
            </div>
          ))}
        </nav>

        {configured ? (
          <ThreadList
            dotId={dot.id}
            dots={workspace.dots}
            local={workspace.conversations}
            selected={view === 'chat' ? selectedThread : undefined}
            onSelect={(id) => {
              if (!setView('chat')) return;
              const conversation = workspace.conversations.find(
                (item) => item.id === id,
              );
              if (conversation) setSelectedDot(conversation.dotId);
              setSelectedThread(id);
              setMobile(false);
            }}
            onNew={() => void newConversation()}
          />
        ) : (
          <div className="sidebar-empty">
            Set up text chat to begin a persistent conversation.
          </div>
        )}
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${view === 'tasks' ? 'active' : ''}`}
            onClick={() => {
              setView('tasks');
              setMobile(false);
            }}
          >
            <Clock3 size={17} />
            <span>Routines</span>
          </button>
          <button
            className={`nav-item ${view === 'memories' ? 'active' : ''}`}
            onClick={() => {
              setView('memories');
              setMobile(false);
            }}
          >
            <BookOpen size={17} />
            <span>Memory</span>
            <small>{state.memories.length}</small>
          </button>
          <button
            className="nav-item"
            onClick={() => setDialog({ type: 'settings' })}
          >
            <Settings2 size={17} />
            <span>Settings</span>
          </button>
          <div className="hermes-local-profile" title="Local workspace; no external account connected"><span>H</span><span>Local workspace</span></div>
          <div className="version">
            OPEN SOURCE TEMPLATE <span>v0.1</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            className="desktop-nav-toggle document-icon"
            aria-label={navCollapsed ? 'Show navigation' : 'Hide navigation'}
            aria-expanded={!navCollapsed}
            onClick={() => setNavCollapsed(!navCollapsed)}
          >
            <PanelLeft size={18} />
          </button>
          <div className="breadcrumbs">
            <span>
              {view === 'space'
                ? workspace.spaces.find((space) => space.id === spaceId)?.name
                : 'Dots'}
            </span>
            <span>/</span>
            <strong>
              {view === 'chat'
                ? dot.name
                : view === 'tasks'
                  ? 'Routines'
                  : view === 'space'
                    ? 'Pages'
                    : 'Memories'}
            </strong>
          </div>
          {view === 'chat' && (
            <RuntimeContextBadge key={selectedThread ?? selectedDot} threadId={selectedThread} />
          )}
          <div className="top-actions">
            <span className="mode-badge">
              {configured ? 'SELF-HOSTED' : 'SETUP REQUIRED'}
            </span>
            <button
              className="pause-button"
              aria-label={
                state.settings.paused ? 'Resume new messages' : 'Pause new messages'
              }
              onClick={() =>
                void mutate('/settings', 'PATCH', {
                  paused: !state.settings.paused,
                })
              }
            >
              {state.settings.paused ? <Play size={14} /> : <Pause size={14} />}
              <span>{state.settings.paused ? 'Resume' : 'Pause'}</span>
            </button>
            <button
              className="icon-button"
              aria-label={pane ? 'Hide computer' : 'Show computer'}
              aria-expanded={pane}
              onClick={() => setPane(!pane)}
            >
              <Monitor size={18} />
            </button>
            <button
              className="icon-button"
              aria-label={collaborationOpen ? 'Hide collaboration panel' : 'Show collaboration panel'}
              aria-expanded={collaborationOpen}
              onClick={() => setCollaborationOpen(!collaborationOpen)}
            >
              <Users size={18} />
            </button>
          </div>
        </header>
        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button
              className="icon-button"
              aria-label="Dismiss error"
              onClick={() => setError('')}
            >
              <X size={16} />
            </button>
          </div>
        )}
        {state.settings.paused && (
          <div className="notice">
            New messages are paused. Active Hermes work may continue.
          </div>
        )}
        {view === 'space' ? (
          <SpaceWorkspace
            key={spaceId}
            space={
              workspace.spaces.find((s) => s.id === spaceId) ??
              workspace.spaces[0]
            }
            pageId={pageId}
            workspace={workspace}
            paused={state.settings.paused}
            onPage={(id) => openPage(spaceId, id)}
            onSettings={() => setDialog({ type: 'settings' })}
            onCreateDot={() => setDialog({ type: 'dot', spaceId })}
            onDirty={setDirtyPage}
            onRefresh={refresh}
            onSchedule={(threadId) => setDialog({ type: 'schedule', threadId })}
            onThread={(id) => {
              const target = workspace.conversations.find((t) => t.id === id);
              if (target) {
                if (!setView('chat')) return;
                setSelectedDot(target.dotId);
                setSelectedThread(id);
              }
            }}
          />
        ) : view === 'chat' ? (
          <div className={`chat-workspace ${pane ? 'split' : ''}`}>
            <div className="chat-column">
              {thread && configured ? (
                <Chat
                  key={thread.id}
                  thread={thread}
                  dot={dot}
                  initialPrompt={pendingPrompt}
                  onConsumed={() => setPendingPrompt(undefined)}
                  voiceReady={workspace.setup.voice}
                  calls={workspace.calls.filter(
                    (call) => call.threadId === thread.id,
                  )}
                  paused={state.settings.paused}
                  onOpenConversation={(id) => {
                    const target = workspace.conversations.find((item) => item.id === id);
                    if (target && setView('chat')) { setSelectedDot(target.dotId); setSelectedThread(id); }
                  }}
                  onSaved={refresh}
                  onComputer={() => setPane(true)}
                  onSchedule={() =>
                    setDialog({ type: 'schedule', threadId: thread.id })
                  }
                />
              ) : (
                <div className="new-conversation">
                  <header className="chat-persona hermes-new-header"><Mascot identity={dot.id} avatarId={dot.avatarId} name={dot.name} small /><div><strong>{dot.name}</strong><span>{state.settings.paused ? 'New messages paused' : workspace.setup.model ? 'Connected to Hermes' : 'Hermes disconnected · local workspace available'}</span></div><div className="chat-persona-actions"><button className="icon-button" disabled aria-label="Calls unavailable" title="Calls are planned for a future version"><Phone size={19} /></button><button className="icon-button" aria-label="Show computer" onClick={() => setPane(!pane)}><Monitor size={21} /></button></div></header>
                  <div className="empty-chat-persona">
                    <Mascot
                      identity={dot.id}
                      avatarId={dot.avatarId}
                      name={dot.name}
                      state={state.settings.paused ? 'paused' : 'idle'}
                    />
                    <h2>{dot.name}</h2>
                    <p>{dot.instructions}</p>
                    <button
                      className="text-button"
                      onClick={() =>
                        setDialog({ type: 'dot', dot, spaceId: dot.spaceId })
                      }
                    >
                      Edit specialist <MoreHorizontal size={14} />
                    </button>
                  </div>
                  {!configured && (
                    <div className="setup-card">
                      <span className="setup-icon">
                        <Settings2 size={20} />
                      </span>
                      <div>
                        <strong>Connect your Dot</strong>
                        <p>
                          Connect your model and conversation service in
                          Settings to start chatting. Your Spaces and Dot
                          preferences are ready to use.
                        </p>
                        <a
                          href="https://github.com/CopilotKit/OpenDots/blob/main/docs/SETUP.md"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open the setup guide <ArrowUpRight size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                  <form
                    className="composer"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void newConversation(prompt);
                    }}
                  >
                    <textarea
                      aria-label="Start a conversation"
                      placeholder={
                        configured
                          ? `Message ${dot.name}…`
                          : 'Your first conversation starts after setup.'
                      }
                      value={prompt}
                      maxLength={4000}
                      onChange={(e) => setPrompt(e.target.value)}
                      disabled={!configured}
                    />
                    <div className="composer-bottom">
                      <span>
                        <MessageCircle size={14} />
                        {workspace.setup.model ? 'Start a Hermes conversation' : 'Create a local draft; connect Hermes to send'}
                      </span>
                      <button
                        className="send-button"
                        aria-label="Start conversation"
                        disabled={!configured || busy || !prompt.trim()}
                      >
                        <ArrowUp size={19} />
                      </button>
                    </div>
                  </form>
                  <div className="starter-suggestions">
                    {[
                      'Help me think this through',
                      'Research a public page',
                      'Make a plan I can follow',
                    ].map((text) => (
                      <button
                        key={text}
                        disabled={!configured}
                        onClick={() => setPrompt(text)}
                      >
                        {text}
                        <ArrowUpRight size={12} />
                      </button>
                    ))}
                  </div>
                  <div className="connection-note">
                    <span
                      className={`online-dot ${workspace.setup.model ? '' : 'off'}`}
                    />
                    Hermes · {workspace.setup.model ? 'connected' : 'disconnected'}
                    <button
                      className="text-button"
                      onClick={() => setDialog({ type: 'settings' })}
                    >
                      Setup details
                    </button>
                  </div>
                </div>
              )}
            </div>
            {pane && (
              <ResultPane
                key={dot.id}
                threadId={thread?.id}
                dots={workspace.dots}
                defaultDotId={dot.id}
                latest={capture}
                dotState="idle"
                onClose={() => setPane(false)}
              />
            )}
          </div>
        ) : (
          <main className="main-content">
            <div className="page-heading">
              <div>
                <span className="eyebrow">YOUR WORKSPACE</span>
                <h1>
                  {view === 'memories'
                    ? 'Memories'
                    : 'A little follow-through.'}
                </h1>
                <p>
                  {view === 'memories'
                    ? 'Studio preferences included in new messages when enabled.'
                    : 'Scheduled turns run on the server in their original conversation.'}
                </p>
              </div>
              {view === 'memories' && (
                <button
                  className="primary"
                  onClick={() => setDialog({ type: 'memory' })}
                >
                  <Plus size={15} />
                  Add memory
                </button>
              )}
            </div>
            {view === 'memories' ? (
              <>
                <div className="memory-grid">
                  {state.memories.map((memory) => (
                    <article className="memory-card" key={memory.id}>
                      <BookOpen size={18} />
                      <p>{memory.text}</p>
                      <div>
                        <small>
                          {state.settings.memoryAllowed
                            ? 'Available as Studio context for enabled Dots'
                            : 'Studio context disabled'}
                        </small>
                        <button
                          className="icon-button"
                          aria-label="Edit memory"
                          onClick={() => setDialog({ type: 'memory', memory })}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label="Delete memory"
                          onClick={() =>
                            void mutate(`/memories/${memory.id}`, 'DELETE', {})
                          }
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
                {!state.memories.length && (
                  <div className="large-empty">
                    <Mascot />
                    <h2>A little context goes a long way.</h2>
                    <p>
                      Add a preference like “Keep my research briefs short.” You
                      can change or remove it anytime.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <RoutinesView spaces={workspace.spaces} dots={workspace.dots} />
            )}
          </main>
        )}
        {pane && view !== 'chat' && (
          <div className="computer-overlay">
            <ResultPane
              key={view === 'space' ? spaceId : dot.id}
              dots={workspace.dots}
              defaultDotId={
                view === 'space'
                  ? (workspace.dots.find((candidate) =>
                      candidate.spaceIds.includes(spaceId),
                    )?.id ?? dot.id)
                  : dot.id
              }
              dotState="idle"
              onClose={() => setPane(false)}
            />
          </div>
        )}
      </div>
      {collaborationOpen && view === 'chat' && thread && (
        <CollaborationPanel key={selectedThread}
          threadId={thread.id}
          dot={dot}
          allDots={workspace.dots}
          spaceId={dot.spaceId}
          onClose={() => setCollaborationOpen(false)}
          onOpenConversation={(id) => {
            const target = workspace.conversations.find((item) => item.id === id);
            if (target && setView('chat')) {
              setSelectedDot(target.dotId);
              setSelectedThread(id);
            }
          }}
        />
      )}
      {dialog && (
        <WorkspaceDialog
          dialog={dialog}
          state={state}
          workspace={workspace}
          onClose={() => setDialog(undefined)}
          mutate={mutate}
        />
      )}
    </div>
  );
  return content;
}
