// Preserve the OpenDots computer surface while exposing verified Hermes capabilities and file workspace.
import { useEffect, useState, useRef } from 'react';
import {
  Folder,
  Globe,
  Terminal,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Save,
  HardDrive,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Plus,
  X,
  History,
  Trash2,
  UserCheck,
  Bot,
} from 'lucide-react';
import type { Dot } from '../shared/types';
import type { FileRoot, FileItem, FileReadResult, FileDiffReceipt } from '../shared/file-workspace';
import type { BrowserStatus } from '../shared/computer-types';
import { api } from './api';

interface Status { connected: boolean; lastError?: string }
interface Activity { id: string; name: string; result?: unknown; complete: boolean }

interface ComputerTargetView {
  connectionId: string;
  host: string;
  profile?: string;
  app?: string;
  window?: string;
  driverStatus: string;
  modes: string[];
  humanHasControl: boolean;
  botScreenStreamAvailable: boolean;
}
interface CaptureReceiptView {
  id: string;
  timestamp: number;
  mode: string;
  targetApp?: string;
  targetWindow?: string;
  imageUrl?: string | null;
  base64?: string | null;
  textSummary?: string | null;
  elements?: Array<{ id: string; label: string; role?: string; bounds?: [number, number, number, number] }>;
  stale: boolean;
}
interface ComputerActionView {
  id: string;
  toolId?: string;
  action: string;
  args: Record<string, unknown>;
  target: ComputerTargetView;
  status: string;
  createdAt: number;
  resultSummary?: string;
  error?: string;
  payloadTruncated?: boolean;
}


export function ComputerPanel({
  dot,
  threadId,
  initialFileRef,
}: {
  dot: Dot;
  threadId?: string;
  initialFileRef?: { host?: string; rootId?: string; path: string; lineStart?: number; lineEnd?: number };
}) {
  const [tab, setTab] = useState<'Browser' | 'Files' | 'Terminal'>(initialFileRef ? 'Files' : 'Browser');
  const [status, setStatus] = useState<Status>({ connected: false });
  const [error, setError] = useState('');
  const [activity, setActivity] = useState<Activity[]>([]);

  // File workspace state
  const [roots, setRoots] = useState<FileRoot[]>([]);
  const [selectedRootId, setSelectedRootId] = useState<string>('');
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileReadResult | null>(null);
  const [draftContent, setDraftContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [conflictError, setConflictError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [receipts, setReceipts] = useState<FileDiffReceipt[]>([]);
  const [highlightRange, setHighlightRange] = useState<{ start?: number; end?: number } | undefined>(
    initialFileRef ? { start: initialFileRef.lineStart, end: initialFileRef.lineEnd } : undefined
  );

  // Browser state (F12)
  const [browserStatus, setBrowserStatus] = useState<BrowserStatus | null>(null);
  const [urlInput, setUrlInput] = useState('https://hermes.local/start');
  const [browserLoading, setBrowserLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [browserHistoryFilter, setBrowserHistoryFilter] = useState('');

  // Native Hermes Computer Use receipts (F16-A/B). Browser state above remains F12.
  const [computerTarget, setComputerTarget] = useState<ComputerTargetView | null>(null);
  const [computerCaptures, setComputerCaptures] = useState<CaptureReceiptView[]>([]);
  const [computerActions, setComputerActions] = useState<ComputerActionView[]>([]);
  const [computerLeaseBusy, setComputerLeaseBusy] = useState(false);

  const loadComputerReceipts = async () => {
    try {
      const query = threadId ? `?threadId=${encodeURIComponent(threadId)}` : '';
      const [target, captures, activity] = await Promise.all([
        api<ComputerTargetView>(`/hermes/computer/target${query}`),
        api<{ captures: CaptureReceiptView[] }>(`/hermes/computer/captures${query}`),
        api<{ activity: ComputerActionView[] }>(`/hermes/computer/activity${query}`),
      ]);
      setComputerTarget(target);
      setComputerCaptures(captures.captures);
      setComputerActions(activity.activity);
    } catch {
      // Hermes may be disconnected; the existing status/error surface remains authoritative.
    }
  };

  useEffect(() => {
    void loadComputerReceipts();
    const timer = window.setInterval(() => void loadComputerReceipts(), 2000);
    return () => window.clearInterval(timer);
  }, [dot.id, threadId]);

  const setHumanControl = async (humanHasControl: boolean) => {
    setComputerLeaseBusy(true);
    try {
      const lease = await api<{ humanHasControl: boolean }>(
        '/hermes/computer/lease',
        'POST',
        { connectionId: computerTarget?.connectionId ?? 'local', threadId, humanHasControl },
      );
      setComputerTarget(previous => previous ? { ...previous, humanHasControl: lease.humanHasControl } : previous);
      await loadComputerReceipts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not change computer control.');
    } finally {
      setComputerLeaseBusy(false);
    }
  };

  const loadBrowserStatus = async () => {
    try {
      const res = await api<BrowserStatus>(`/dots/${encodeURIComponent(dot.id)}/computer`);
      setBrowserStatus(res);
      if (res.activeUrl) setUrlInput(res.activeUrl);
    } catch {
      // Offline or error
    }
  };

  useEffect(() => {
    void loadBrowserStatus();
  }, [dot.id]);

  const handleNavigateUrl = async (targetUrl: string) => {
    if (!targetUrl.trim()) return;
    setBrowserLoading(true);
    setError('');
    try {
      const res = await api<BrowserStatus>(
        `/computers/${encodeURIComponent(dot.id)}/navigate`,
        'POST',
        { url: targetUrl, actor: 'owner' }
      );
      setBrowserStatus(res);
      if (res.activeUrl) setUrlInput(res.activeUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Navigation failed.');
    } finally {
      setBrowserLoading(false);
    }
  };

  const handleNavigateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void handleNavigateUrl(urlInput);
  };

  const handleNewTab = async () => {
    try {
      const res = await api<BrowserStatus>(
        `/computers/${encodeURIComponent(dot.id)}/tabs`,
        'POST',
        { action: 'create', url: 'https://hermes.local/start', actor: 'owner' }
      );
      setBrowserStatus(res);
      if (res.activeUrl) setUrlInput(res.activeUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create tab.');
    }
  };

  const handleSwitchTab = async (tabId: string) => {
    try {
      const res = await api<BrowserStatus>(
        `/computers/${encodeURIComponent(dot.id)}/tabs`,
        'POST',
        { action: 'switch', tabId }
      );
      setBrowserStatus(res);
      if (res.activeUrl) setUrlInput(res.activeUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to switch tab.');
    }
  };

  const handleCloseTab = async (tabId: string) => {
    try {
      const res = await api<BrowserStatus>(
        `/computers/${encodeURIComponent(dot.id)}/tabs`,
        'POST',
        { action: 'close', tabId, actor: 'owner' }
      );
      setBrowserStatus(res);
      if (res.activeUrl) setUrlInput(res.activeUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to close tab.');
    }
  };

  const handleTakeControl = async () => {
    try {
      const res = await api<BrowserStatus>(
        `/dots/${encodeURIComponent(dot.id)}/computer/take`,
        'POST'
      );
      setBrowserStatus(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to take over browser.');
    }
  };

  const handleReleaseControl = async () => {
    try {
      const res = await api<BrowserStatus>(
        `/dots/${encodeURIComponent(dot.id)}/computer/release`,
        'POST'
      );
      setBrowserStatus(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resume agent.');
    }
  };

  const handleClearStorage = async () => {
    if (!window.confirm('Reset browser profile, cookies and history?')) return;
    try {
      const res = await api<BrowserStatus>(
        `/computers/${encodeURIComponent(dot.id)}/clear`,
        'POST'
      );
      setBrowserStatus(res);
      if (res.activeUrl) setUrlInput(res.activeUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to clear browser storage.');
    }
  };

  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Sync initialFileRef if provided
  useEffect(() => {
    if (initialFileRef) {
      setTab('Files');
      if (initialFileRef.rootId) setSelectedRootId(initialFileRef.rootId);
      setHighlightRange({ start: initialFileRef.lineStart, end: initialFileRef.lineEnd });
    }
  }, [initialFileRef]);

  useEffect(() => {
    const controller = new AbortController();
    setActivity([]);
    setStatus({ connected: false });

    const refresh = () => {
      if (!threadId) return;
      void api<Status>(`/hermes/status?threadId=${encodeURIComponent(threadId)}`, 'GET', undefined, controller.signal)
        .then((next) => {
          if (!controller.signal.aborted) {
            setStatus(next);
            setError('');
          }
        })
        .catch((cause) => {
          if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Runtime unavailable.');
        });
    };

    refresh();
    const timer = setInterval(refresh, 3000);

    const receive = (raw: Event) => {
      const { dotId, threadId: eventThreadId, event } = (raw as CustomEvent).detail ?? {};
      if (!threadId || eventThreadId !== threadId || dotId !== dot.id || !event || !['tool.start', 'tool.complete'].includes(event.type)) return;
      const payload = event.payload ?? {};
      const id = payload.tool_id ?? payload.id;
      if (typeof id !== 'string') return;

      setActivity((previous) => {
        const item: Activity = {
          id,
          name: typeof payload.name === 'string' ? payload.name : 'Tool',
          result: payload.result ?? payload.result_text,
          complete: event.type === 'tool.complete',
        };
        return [...previous.filter((row) => row.id !== id), item].slice(-30);
      });
    };

    window.addEventListener('hermes-runtime-event', receive);
    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener('hermes-runtime-event', receive);
    };
  }, [dot.id, threadId]);

  // Load roots and receipts for Files tab
  useEffect(() => {
    if (tab !== 'Files') return;
    let active = true;

    const loadRoots = async () => {
      try {
        const fetchedRoots = await api<FileRoot[]>('/files/roots');
        if (active && fetchedRoots.length > 0) {
          setRoots(fetchedRoots);
          if (!selectedRootId) {
            setSelectedRootId(fetchedRoots[0].id);
          }
        }
      } catch {
        // Fallback synthetic root if offline/test
        if (active && roots.length === 0) {
          const fallback: FileRoot = { id: 'default-workspace', host: 'local', name: 'Workspace', path: '/workspace' };
          setRoots([fallback]);
          setSelectedRootId(fallback.id);
        }
      }
    };

    const loadReceipts = async () => {
      try {
        const fetchedReceipts = await api<FileDiffReceipt[]>('/files/receipts');
        if (active) setReceipts(fetchedReceipts);
      } catch {
        // Ignore receipt fetch errors
      }
    };

    void loadRoots();
    void loadReceipts();

    return () => { active = false; };
  }, [tab]);

  // Load tree items when root or search query changes
  useEffect(() => {
    if (tab !== 'Files' || !selectedRootId) return;
    let active = true;

    const loadTree = async () => {
      try {
        const url = searchQuery
          ? `/files/search?rootId=${encodeURIComponent(selectedRootId)}&query=${encodeURIComponent(searchQuery)}`
          : `/files/tree?rootId=${encodeURIComponent(selectedRootId)}`;
        const items = await api<FileItem[]>(url);
        if (active) setFileItems(items);
      } catch {
        if (active) setFileItems([]);
      }
    };

    void loadTree();
  }, [tab, selectedRootId, searchQuery]);

  // Read initial file if specified
  useEffect(() => {
    if (tab === 'Files' && initialFileRef?.path && selectedRootId) {
      void openFile(initialFileRef.path);
    }
  }, [tab, initialFileRef?.path, selectedRootId]);

  const openFile = async (relativePath: string) => {
    if (isDirty) {
      const confirmDiscard = window.confirm('You have unsaved changes in your current draft. Discard draft and open file?');
      if (!confirmDiscard) return;
    }

    try {
      setConflictError('');
      setSaveSuccess('');
      const res = await api<FileReadResult>(
        `/files/read?rootId=${encodeURIComponent(selectedRootId)}&path=${encodeURIComponent(relativePath)}`
      );
      setSelectedFile(res);
      setDraftContent(res.content);
      setIsDirty(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to read file.');
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedFile || !selectedRootId || saving) return;
    setSaving(true);
    setConflictError('');
    setSaveSuccess('');

    try {
      const res = await api<{ receipt: FileDiffReceipt; newRevision: string; error?: string }>(
        '/files/write',
        'POST',
        {
          rootId: selectedRootId,
          relativePath: selectedFile.path,
          content: draftContent,
          expectedRevision: selectedFile.revision,
          toolName: 'user_editor',
        }
      );

      if (res.error || res.receipt?.outcome === 'conflict') {
        setConflictError(res.error || 'External conflict: File was modified on disk since opened.');
      } else {
        setSelectedFile({
          ...selectedFile,
          content: draftContent,
          revision: res.newRevision,
        });
        setIsDirty(false);
        setSaveSuccess('File saved successfully.');
        setReceipts((prev) => [res.receipt, ...prev]);
      }
    } catch (e) {
      setConflictError(e instanceof Error ? e.message : 'Save failed due to conflict or error.');
    } finally {
      setSaving(false);
    }
  };

  const rows = activity.filter((row) =>
    tab === 'Files' ? /file|read|write|directory|patch/i.test(row.name) : /terminal|shell|exec/i.test(row.name)
  );

  const activeRoot = roots.find((r) => r.id === selectedRootId);

  return (
    <section className="computer-panel hermes-computer" aria-label={`${dot.name}'s computer`}>
      <div className="computer-tool-tabs" role="tablist" aria-label="Computer tools">
        {(['Browser', 'Files', 'Terminal'] as const).map((name) => (
          <button key={name} role="tab" aria-selected={name === tab} onClick={() => setTab(name)}>
            {name}
          </button>
        ))}
      </div>

      <div className="hermes-computer-status">
        <span className={status.connected ? 'hermes-connected-dot' : ''} />
        {status.connected ? 'Hermes connected' : 'Disconnected'}
      </div>

      {error && <p className="computer-error" role="alert">{error}</p>}

      <section className="hermes-native-computer" aria-label="Native Hermes Computer Use">
        <header className="native-computer-header">
          <div>
            <span className="eyebrow">NATIVE HERMES COMPUTER USE</span>
            <h3>{computerTarget?.host ?? 'Target unavailable'}</h3>
            <p>
              {computerTarget
                ? `${computerTarget.app ?? 'Application'} / ${computerTarget.window ?? 'Window'} · ${computerTarget.profile ?? 'default'} profile`
                : 'Waiting for a verified Hermes target.'}
            </p>
          </div>
          <span className={`status-pill ${computerTarget?.driverStatus === 'available' ? 'pill-agent' : 'pill-human'}`}>
            {computerTarget?.driverStatus ?? 'unavailable'}
          </span>
        </header>
        <div className="native-computer-meta">
          <span>Modes: {computerTarget?.modes.join(', ') ?? '—'}</span>
          <span>Captures: {computerCaptures.length}</span>
          <span>Actions: {computerActions.length}</span>
          <button
            className="lease-btn takeover-btn"
            disabled={!computerTarget?.botScreenStreamAvailable || computerLeaseBusy}
            onClick={() => void setHumanControl(!computerTarget?.humanHasControl)}
            aria-label={computerTarget?.humanHasControl ? 'Return computer control to Hermes' : 'Take control of computer'}
          >
            {computerTarget?.humanHasControl ? <Bot size={14} /> : <UserCheck size={14} />}
            <span>{computerTarget?.humanHasControl ? 'Return to Hermes' : 'Take control'}</span>
          </button>
        </div>
        {computerTarget?.humanHasControl && (
          <p className="computer-warning" role="status">Human has control. Hermes mutations are denied until control is returned.</p>
        )}
        {computerCaptures.length === 0 ? (
          <p className="hermes-computer-placeholder">No native capture received yet. Capture output stays on the bot host.</p>
        ) : (
          <div className="native-computer-captures">
            {computerCaptures.slice(0, 3).map(capture => (
              <article key={capture.id} className={`computer-capture ${capture.stale ? 'stale' : ''}`}>
                <div className="computer-capture-heading">
                  <strong>{capture.mode.toUpperCase()} capture</strong>
                  <time dateTime={new Date(capture.timestamp).toISOString()}>{new Date(capture.timestamp).toLocaleTimeString()}</time>
                  {capture.stale && <span className="status-pill pill-human">Stale</span>}
                </div>
                {capture.imageUrl || capture.base64 ? (
                  <img
                    src={capture.imageUrl ?? `data:image/png;base64,${capture.base64}`}
                    alt={`${capture.mode} capture from ${capture.targetApp ?? 'target application'}`}
                  />
                ) : <p>{capture.textSummary ?? 'Capture contains no visual preview.'}</p>}
                <small>{capture.targetApp ?? 'Unknown app'} / {capture.targetWindow ?? 'Unknown window'}</small>
              </article>
            ))}
          </div>
        )}
        <div className="native-computer-activity" aria-label="Computer action outcomes">
          {computerActions.slice(0, 6).map(action => (
            <div key={action.id} className="computer-action-row">
              <span>{action.action}</span>
              <span className={`status-pill action-${action.status}`}>{action.status}</span>
              {action.payloadTruncated && <small>payload archived as summary (&gt;64 KiB)</small>}
              {action.error && <small>{action.error}</small>}
            </div>
          ))}
        </div>
      </section>

      {tab === 'Browser' && (
        <section className="hermes-browser-workspace" role="tabpanel" aria-label="Browser Surface">
          {/* Top Bar: Tabs Bar */}
          <div className="browser-tabs-bar" role="tablist" aria-label="Browser Tabs">
            <div className="browser-tabs-scroll">
              {(browserStatus?.tabs ?? [
                {
                  id: 'tab-default',
                  url: 'https://hermes.local/start',
                  title: 'Hermes Start Page',
                  content: '<h1>Start Page</h1>',
                  createdAt: Date.now(),
                },
              ]).map((t) => (
                <div
                  key={t.id}
                  className={`browser-tab-item ${t.id === (browserStatus?.activeTabId || 'tab-default') ? 'active' : ''}`}
                  role="tab"
                  aria-selected={t.id === (browserStatus?.activeTabId || 'tab-default')}
                  onClick={() => void handleSwitchTab(t.id)}
                >
                  <Globe size={13} className="browser-tab-icon" />
                  <span className="browser-tab-title" title={t.title || t.url}>{t.title || 'New Tab'}</span>
                  <button
                    className="browser-tab-close"
                    aria-label={`Close tab ${t.title || t.url}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleCloseTab(t.id);
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <button
              className="browser-new-tab-button icon-button"
              aria-label="Open new browser tab"
              onClick={() => void handleNewTab()}
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Navigation & Address Bar */}
          <div className="browser-nav-bar">
            <div className="browser-nav-actions">
              <button
                className="icon-button"
                aria-label="Go back"
                onClick={() => void loadBrowserStatus()}
                title="Back"
              >
                <ArrowLeft size={15} />
              </button>
              <button
                className="icon-button"
                aria-label="Go forward"
                title="Forward"
                disabled
              >
                <ArrowRight size={15} />
              </button>
              <button
                className="icon-button"
                aria-label="Reload current page"
                onClick={() => void loadBrowserStatus()}
                title="Reload"
              >
                <RotateCw size={15} />
              </button>
            </div>

            <form className="browser-address-form" onSubmit={handleNavigateSubmit}>
              <div className="browser-address-input-wrapper">
                <Globe size={14} className="address-icon" />
                <input
                  type="text"
                  aria-label="Browser address URL"
                  className="browser-address-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="Enter URL (https://...)"
                />
              </div>
              <button type="submit" className="browser-go-button" disabled={browserLoading}>
                {browserLoading ? 'Loading…' : 'Go'}
              </button>
            </form>

            <div className="browser-bar-actions">
              <button
                className={`browser-action-pill ${showHistory ? 'active' : ''}`}
                onClick={() => setShowHistory(!showHistory)}
                aria-label="Toggle browsing history"
                title="History"
              >
                <History size={14} />
                <span>History</span>
              </button>
              <button
                className="browser-action-pill"
                onClick={() => void handleClearStorage()}
                aria-label="Reset profile and storage"
                title="Clear cookies, storage and history"
              >
                <Trash2 size={14} />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Control Lease & Takeover Banner */}
          <div className={`browser-lease-banner ${browserStatus?.holder === 'human' ? 'human-held' : 'agent-held'}`}>
            <div className="lease-info">
              <span className={`status-pill ${browserStatus?.holder === 'human' ? 'pill-human' : 'pill-agent'}`}>
                {browserStatus?.holder === 'human' ? 'User Control' : 'Agent Control'}
              </span>
              <span className="lease-description">
                {browserStatus?.holder === 'human'
                  ? 'Human user has taken over. Hermes agent browser tools are suspended until resume.'
                  : 'Hermes agent controls the browser. Click Take Over to interact manually.'}
              </span>
            </div>
            <div className="lease-actions">
              {browserStatus?.holder === 'human' ? (
                <button
                  className="lease-btn resume-btn"
                  onClick={() => void handleReleaseControl()}
                  aria-label="Resume agent control"
                >
                  <Bot size={14} />
                  <span>Resume Agent</span>
                </button>
              ) : (
                <button
                  className="lease-btn takeover-btn"
                  onClick={() => void handleTakeControl()}
                  aria-label="Take over browser control"
                >
                  <UserCheck size={14} />
                  <span>Take Over</span>
                </button>
              )}
            </div>
          </div>

          {/* Main View Area: Rendered Page / Content or History drawer */}
          <div className="browser-viewport-container">
            {showHistory ? (
              <div className="browser-history-drawer" role="region" aria-label="Browser History">
                <div className="history-drawer-header">
                  <h4>Persistent Browsing History</h4>
                  <input
                    type="text"
                    placeholder="Search history…"
                    value={browserHistoryFilter}
                    onChange={(e) => setBrowserHistoryFilter(e.target.value)}
                    className="history-search-input"
                    aria-label="Search browsing history"
                  />
                </div>
                <div className="history-list">
                  {(browserStatus?.history ?? [])
                    .filter(h => !browserHistoryFilter || h.title.toLowerCase().includes(browserHistoryFilter.toLowerCase()) || h.url.toLowerCase().includes(browserHistoryFilter.toLowerCase()))
                    .map(item => (
                      <div
                        key={item.id}
                        className="history-item"
                        onClick={() => {
                          setUrlInput(item.url);
                          void handleNavigateUrl(item.url);
                        }}
                      >
                        <div className="history-item-title">{item.title}</div>
                        <div className="history-item-url">{item.url}</div>
                        <div className="history-item-time">{new Date(item.visitedAt).toLocaleTimeString()}</div>
                      </div>
                    ))}
                  {(browserStatus?.history ?? []).length === 0 && (
                    <p className="muted history-empty">No history recorded yet.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="browser-page-display">
                <div className="page-meta-header">
                  <div className="page-title-badge">
                    <span className="dot-profile-tag">Profile: {dot.name}</span>
                    <h3 className="page-title">{browserStatus?.activeTitle || 'Start Page'}</h3>
                  </div>
                  <div className="page-storage-meta">
                    <span title="Stored cookies">{browserStatus?.cookiesCount ?? 3} cookies</span>
                    <span title="Local storage entries">{browserStatus?.localStorageCount ?? 5} keys</span>
                  </div>
                </div>
                <div className="browser-sandboxed-view" role="region" aria-label="Web page content">
                  <div className="browser-mock-page">
                    <div className="mock-address-bar">
                      <span>URL:</span> <code>{browserStatus?.activeUrl || 'https://hermes.local/start'}</code>
                    </div>
                    <div
                      className="mock-dom-body"
                      dangerouslySetInnerHTML={{
                        __html: browserStatus?.activeContent || '<p>Page loaded successfully in sandboxed session.</p>'
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Audit trail / Activity footer */}
          <div className="browser-audit-footer">
            <div className="audit-header">
              <span className="audit-title">Browser Activity Log</span>
              <span className="audit-count">{(browserStatus?.audit ?? []).length} events</span>
            </div>
            <div className="audit-stream">
              {(browserStatus?.audit ?? []).slice(0, 5).map(ev => (
                <div key={ev.id} className="audit-item">
                  <span className={`audit-actor ${ev.actor}`}>{ev.actor}</span>
                  <span className="audit-action">{ev.action}</span>
                  <span className="audit-details">{ev.details || ''}</span>
                  <span className="audit-time">{new Date(ev.createdAt).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {tab === 'Terminal' && (
        <section className="hermes-computer-placeholder" role="tabpanel" aria-label="Terminal">
          <Terminal size={28} />
          <h3>Terminal activity</h3>
          <p>
            Confirmed terminal tool output appears below. Commands are requested through Hermes; this panel does not run a separate shell.
          </p>
        </section>
      )}

      {tab === 'Files' && (
        <section className="hermes-file-workspace" role="tabpanel" aria-label="Files Workspace">
          <header className="file-workspace-header">
            <div className="root-selector">
              <HardDrive size={16} />
              <select
                aria-label="Select file root"
                value={selectedRootId}
                onChange={(e) => {
                  if (isDirty && !window.confirm('Discard unsaved draft changes?')) return;
                  setSelectedRootId(e.target.value);
                  setSelectedFile(null);
                  setIsDirty(false);
                }}
              >
                {roots.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} [{r.host}] ({r.path})
                  </option>
                ))}
              </select>
            </div>

            <div className="file-search-bar">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search progressive @ path or name..."
                aria-label="Filter or search files"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </header>

          <div className="file-workspace-body">
            <aside className="file-tree-sidebar" role="tree" aria-label="Root files">
              <div className="file-tree-header">
                <span>{activeRoot ? `${activeRoot.host}/${activeRoot.name}` : 'Files'}</span>
                <span className="file-count">{fileItems.length} items</span>
              </div>
              <ul className="file-tree-list">
                {fileItems.map((item) => (
                  <li key={item.path} className={`file-tree-item ${item.kind}`}>
                    <button
                      className={`file-item-button ${selectedFile?.path === item.path ? 'active' : ''}`}
                      disabled={item.kind === 'directory'}
                      onClick={() => void openFile(item.path)}
                    >
                      {item.kind === 'directory' ? <Folder size={14} /> : <FileText size={14} />}
                      <span className="file-name">{item.name}</span>
                      {item.isBinary && <span className="badge binary-badge">bin</span>}
                      {item.isSymlink && <span className="badge symlink-badge">link</span>}
                    </button>
                  </li>
                ))}
                {fileItems.length === 0 && <li className="empty-tree-notice">No files match criteria</li>}
              </ul>
            </aside>

            <main className="file-editor-area">
              {selectedFile ? (
                <div className="file-editor-container">
                  <header className="file-editor-toolbar">
                    <div className="file-meta">
                      <strong>{selectedFile.path}</strong>
                      <span className="file-rev">rev:{selectedFile.revision}</span>
                      <span className="file-size">{selectedFile.size} bytes</span>
                      {selectedFile.isBinary && <span className="badge binary-badge">Binary</span>}
                      {selectedFile.largeFile && <span className="badge warning-badge">&gt;2MB Payload</span>}
                    </div>

                    <div className="file-actions">
                      {saveSuccess && <span className="save-success-tag"><CheckCircle size={12} /> {saveSuccess}</span>}
                      <button
                        className="save-button"
                        disabled={!isDirty || saving || selectedFile.isBinary}
                        onClick={() => void handleSaveDraft()}
                      >
                        <Save size={14} />
                        {saving ? 'Saving...' : 'Save Draft'}
                      </button>
                    </div>
                  </header>

                  {conflictError && (
                    <div className="file-conflict-banner" role="alert">
                      <AlertTriangle size={16} />
                      <div>
                        <strong>External Conflict Detected</strong>
                        <p>{conflictError}</p>
                        <button onClick={() => void openFile(selectedFile.path)}>Discard draft &amp; reload from disk</button>
                      </div>
                    </div>
                  )}

                  {highlightRange?.start && (
                    <div className="file-range-banner">
                      Showing lines {highlightRange.start} {highlightRange.end ? `to ${highlightRange.end}` : ''}
                    </div>
                  )}

                  <textarea
                    ref={editorRef}
                    className="file-editor-textarea"
                    aria-label="File content editor"
                    value={draftContent}
                    disabled={selectedFile.isBinary}
                    onChange={(e) => {
                      setDraftContent(e.target.value);
                      setIsDirty(true);
                      setSaveSuccess('');
                    }}
                  />
                </div>
              ) : (
                <div className="file-editor-empty">
                  <Folder size={32} />
                  <p>Select a file from the tree to preview, edit, or view references.</p>
                </div>
              )}
            </main>
          </div>

          {receipts.length > 0 && (
            <section className="file-receipts-section" aria-label="Confirmed Save Receipts">
              <h4>File Save &amp; Tool Receipts</h4>
              <div className="receipts-list">
                {receipts.map((rec) => (
                  <div key={rec.id} className={`receipt-card ${rec.outcome}`}>
                    <div className="receipt-header">
                      <strong>{rec.toolName}</strong>
                      <span className="receipt-path">{rec.host}/{rec.path}</span>
                      <span className={`outcome-pill ${rec.outcome}`}>{rec.outcome}</span>
                    </div>
                    {rec.error && <p className="receipt-error">{rec.error}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}
        </section>
      )}

      {tab !== 'Browser' && rows.length > 0 && (
        <div className="hermes-activity-log">
          <h4>Tool Activity</h4>
          {rows.map((row) => (
            <section className="hermes-computer-output" key={row.id}>
              <strong>{row.name}</strong>
              <small>{row.complete ? 'Result received' : 'Tool started'}</small>
              {row.result != null && (
                <pre>{(typeof row.result === 'string' ? row.result : JSON.stringify(row.result, null, 2))?.slice(0, 12000)}</pre>
              )}
            </section>
          ))}
        </div>
      )}

      <div className="computer-control-pill">
        <span>Human takeover unavailable</span>
        <button disabled>Take over</button>
      </div>

      <section className="hermes-permissions">
        <h3>Permissions</h3>
        <div>
          {['Browser', 'Files', 'Shell', 'Memory'].map((name) => (
            <span key={name}>{name}</span>
          ))}
        </div>
        <p>Tool permissions are controlled by Hermes. Per-Dot permission controls are not connected here.</p>
      </section>
    </section>
  );
}
