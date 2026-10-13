// Preserve the OpenDots computer surface while exposing verified Hermes capabilities and file workspace.
import { useEffect, useState, useRef } from 'react';
import {
  Folder,
  Terminal,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Search,
  Save,
  HardDrive,
  UserCheck,
  Bot,
} from 'lucide-react';
import type { Dot } from '../shared/types';
import type { FileRoot, FileItem, FileReadResult, FileDiffReceipt } from '../shared/file-workspace';
import { api } from './api';
import { NativeBrowserWorkspace } from './NativeBrowserWorkspace';

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
  const fileRequest = useRef<AbortController | null>(null);
  const fileEpoch = useRef(0);
  const editVersion = useRef(0);
  const activeRootId = useRef(selectedRootId); activeRootId.current = selectedRootId;
  const initialOpened = useRef<string | undefined>(undefined);
  const [receipts, setReceipts] = useState<FileDiffReceipt[]>([]);
  const [highlightRange, setHighlightRange] = useState<{ start?: number; end?: number } | undefined>(
    initialFileRef ? { start: initialFileRef.lineStart, end: initialFileRef.lineEnd } : undefined
  );

  // Native Hermes Computer Use receipts (F16-A/B). Browser state above remains F12.
  const [computerTarget, setComputerTarget] = useState<ComputerTargetView | null>(null);
  const [computerCaptures, setComputerCaptures] = useState<CaptureReceiptView[]>([]);
  const [computerActions, setComputerActions] = useState<ComputerActionView[]>([]);

  const loadComputerReceipts = async (signal?: AbortSignal) => {
    try {
      const query = threadId ? `?threadId=${encodeURIComponent(threadId)}` : '';
      const [target, captures, activity] = await Promise.all([
        api<ComputerTargetView>(`/hermes/computer/target${query}`, 'GET', undefined, signal),
        api<{ captures: CaptureReceiptView[] }>(`/hermes/computer/captures${query}`, 'GET', undefined, signal),
        api<{ activity: ComputerActionView[] }>(`/hermes/computer/activity${query}`, 'GET', undefined, signal),
      ]);
      if(signal?.aborted)return;
      setComputerTarget(target);
      setComputerCaptures(captures.captures);
      setComputerActions(activity.activity);
    } catch {
      // Hermes may be disconnected; the existing status/error surface remains authoritative.
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    setComputerTarget(null);setComputerCaptures([]);setComputerActions([]);
    void loadComputerReceipts(controller.signal);
    const timer = window.setInterval(() => void loadComputerReceipts(controller.signal), 2000);
    return () => {controller.abort();window.clearInterval(timer);};
  }, [dot.id, threadId]);

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
        if(active)setError('File roots could not be verified. Grant a real folder in Settings.');
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
    return () => {active = false;};
  }, [tab, selectedRootId, searchQuery]);

  useEffect(() => () => {fileEpoch.current++;fileRequest.current?.abort();}, []);

  const changeRoot = (rootId: string) => {
    if(saving) {setError('Wait for the current file save to finish.');return;}
    if(isDirty && !window.confirm('Discard the current unsaved draft before switching folders?'))return;
    fileEpoch.current++;fileRequest.current?.abort();activeRootId.current=rootId;
    setSelectedRootId(rootId);setSelectedFile(null);setDraftContent('');setIsDirty(false);setFileItems([]);
  };

  const openFile = async (relativePath: string) => {
    if(saving) {setError('Wait for the current file save to finish.');return;}
    if(isDirty && !window.confirm('You have unsaved changes in your current draft. Discard draft and open file?'))return;
    const rootId=selectedRootId, version=editVersion.current, epoch=++fileEpoch.current;
    fileRequest.current?.abort();const controller=new AbortController();fileRequest.current=controller;
    try {
      setConflictError('');setSaveSuccess('');
      const res=await api<FileReadResult>(`/files/read?rootId=${encodeURIComponent(rootId)}&path=${encodeURIComponent(relativePath)}`, 'GET', undefined, controller.signal);
      if(controller.signal.aborted || fileEpoch.current!==epoch || activeRootId.current!==rootId || editVersion.current!==version)return;
      if(res.rootId!==rootId || res.path!==relativePath)throw Error('The file response did not match the requested folder and path.');
      setSelectedFile(res);setDraftContent(res.content);setIsDirty(false);
    }catch(cause){if(!controller.signal.aborted && fileEpoch.current===epoch)setError(cause instanceof Error?cause.message:'Failed to read file.');}
  };

  // Follow a supplied file reference once, in its actual root. Root switching does not reinterpret it.
  useEffect(() => {
    if(tab!=='Files' || !initialFileRef?.path || !selectedRootId || initialFileRef.rootId && initialFileRef.rootId!==selectedRootId)return;
    const key=JSON.stringify([initialFileRef.rootId??null,initialFileRef.path]);
    if(initialOpened.current===key)return;initialOpened.current=key;void openFile(initialFileRef.path);
  }, [tab, initialFileRef?.path, initialFileRef?.rootId, selectedRootId]);

  const handleSaveDraft = async () => {
    if(!selectedFile || selectedFile.rootId!==selectedRootId || saving)return;
    const file=selectedFile, content=draftContent, version=editVersion.current;
    setSaving(true);setConflictError('');setSaveSuccess('');
    try {
      const res=await api<{receipt:FileDiffReceipt;newRevision:string;error?:string}>('/files/write','POST',{
        rootId:file.rootId,relativePath:file.path,content,expectedRevision:file.revision,toolName:'user_editor',
      });
      if(res.error || res.receipt?.outcome!=='applied' || typeof res.newRevision!=='string')throw Error(res.error || 'The file write was not confirmed. Your draft is preserved.');
      setReceipts(previous=>[res.receipt,...previous]);
      setSelectedFile(current=>current?.rootId===file.rootId && current.path===file.path ? {...current,content,revision:res.newRevision} : current);
      if(version===editVersion.current){setIsDirty(false);setSaveSuccess('File saved successfully.');}
      else setSaveSuccess('Previous draft saved. Your newer edits still need saving.');
    }catch(cause){setConflictError(cause instanceof Error?cause.message:'Save failed. Your draft is preserved.');}
    finally{setSaving(false);}
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
                ? `${computerTarget.app ?? 'Application not reported'} / ${computerTarget.window ?? 'Window not reported'} · profile ${computerTarget.profile ?? 'not reported'}`
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
            disabled
            title="Native Bot Screen takeover is not supported by this adapter"
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

      {tab === 'Browser' && <NativeBrowserWorkspace key={`${dot.id}:${threadId ?? 'manual'}`} dotId={dot.id} threadId={threadId} />}

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
                onChange={(e) => changeRoot(e.target.value)}
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
                      editVersion.current++;fileEpoch.current++;fileRequest.current?.abort();
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
