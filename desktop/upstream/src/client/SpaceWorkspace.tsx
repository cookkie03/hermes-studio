import { mergePageSnapshot } from './page-snapshots';
import { useCallback, useEffect, useState } from 'react';
import {
  Folder,
  FolderPlus,
  FileText,
  Search,
  Plus,
  Trash2,
  Check,
  LoaderCircle,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Eye,
  Edit3,
  Server,
  Laptop,
} from 'lucide-react';
import type { Page } from '../server/pages';
import type { Space, WorkspaceState, FolderBinding } from '../shared/types';
import type { FileItem, FileReadResult, FileDiffReceipt } from '../shared/file-workspace';
import { api } from './api';
import { SpaceLibrary } from './SpaceLibrary';
import { PageDocument } from './PageDocument';
import { PageOutline } from './PageOutline';

export function SpaceWorkspace({
  space,
  pageId,
  workspace,
  paused,
  onPage,
  onDirty,
  onRefresh,
  onSchedule,
  onThread,
  onSettings,
  onCreateDot,
}: {
  space: Space;
  pageId?: string;
  workspace: WorkspaceState;
  paused: boolean;
  onPage: (id?: string) => void;
  onDirty: (value: boolean) => void;
  onRefresh: () => void;
  onSchedule: (threadId: string) => void;
  onThread: (threadId: string) => void;
  onSettings: () => void;
  onCreateDot: () => void;
}) {
  const [pages, setPages] = useState<Page[]>([]);
  const [folderBindings, setFolderBindings] = useState<FolderBinding[]>([]);
  const [filesByRoot, setFilesByRoot] = useState<Record<string, FileItem[]>>({});
  const [selectedFile, setSelectedFile] = useState<{
    rootId: string;
    host: string;
    path: string;
    name: string;
  } | null>(null);

  const [fileContent, setFileContent] = useState('');
  const [fileRevision, setFileRevision] = useState('');
  const [fileDirty, setFileDirty] = useState(false);
  const [fileStatus, setFileStatus] = useState<'saved' | 'saving' | 'modified' | 'conflict' | 'error'>('saved');
  const [fileError, setFileError] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [newFileRootId, setNewFileRootId] = useState('');
  const [newFilePath, setNewFilePath] = useState('');

  const [folderForm, setFolderForm] = useState({
    name: '',
    host: 'local',
    path: '',
    isReadOnly: false,
  });

  const [activeTab, setActiveTab] = useState<'files' | 'pages'>('files');
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [outline, setOutline] = useState(false);

  // Load pages
  const loadPages = useCallback(async () => {
    try {
      const next = await api<Page[]>(`/spaces/${space.id}/pages`);
      setPages((previous) => mergePageSnapshot(previous, next));
      setLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load pages.');
    }
  }, [space.id]);

  // Load folder bindings for this space
  const loadFolderBindings = useCallback(async () => {
    try {
      const bindings = await api<FolderBinding[]>(`/spaces/${space.id}/folders`);
      setFolderBindings(bindings);
      if (bindings.length > 0 && !newFileRootId) {
        setNewFileRootId(bindings[0].rootId);
      }
    } catch {
      // Fallback to workspace.folderBindings if present
      if (workspace.folderBindings) {
        const filtered = workspace.folderBindings.filter((b) => b.spaceId === space.id);
        setFolderBindings(filtered);
      }
    }
  }, [space.id, workspace.folderBindings, newFileRootId]);

  // Load file tree for a root
  const loadRootFiles = useCallback(async (rootId: string) => {
    try {
      const items = await api<FileItem[]>(`/files/tree?rootId=${encodeURIComponent(rootId)}`);
      setFilesByRoot((prev) => ({ ...prev, [rootId]: items }));
    } catch (e) {
      setFilesByRoot((prev) => ({ ...prev, [rootId]: [] }));
    }
  }, []);

  useEffect(() => {
    let active = true;
    void loadPages();
    void loadFolderBindings();
    const timer = setInterval(() => {
      if (active) {
        void loadPages();
        void loadFolderBindings();
      }
    }, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [loadPages, loadFolderBindings]);

  // Load files for each folder binding
  useEffect(() => {
    for (const binding of folderBindings) {
      void loadRootFiles(binding.rootId);
    }
  }, [folderBindings, loadRootFiles]);

  // Open a file
  const openFile = async (rootId: string, host: string, path: string, name: string) => {
    if (fileDirty) {
      const confirmLeave = window.confirm('You have unsaved changes in the current file. Discard and switch?');
      if (!confirmLeave) return;
    }
    try {
      setFileStatus('saving');
      setFileError('');
      const res = await api<FileReadResult>(`/files/read?rootId=${encodeURIComponent(rootId)}&path=${encodeURIComponent(path)}`);
      setSelectedFile({ rootId, host, path, name });
      setFileContent(res.content);
      setFileRevision(res.revision);
      setFileDirty(false);
      setFileStatus('saved');
      onDirty(false);
    } catch (e) {
      setFileError(e instanceof Error ? e.message : 'Could not read file.');
      setFileStatus('error');
    }
  };

  // Save current file
  const saveFile = async () => {
    if (!selectedFile) return;
    setFileStatus('saving');
    setFileError('');
    try {
      const res = await api<FileDiffReceipt>('/files/write', 'POST', {
        rootId: selectedFile.rootId,
        relativePath: selectedFile.path,
        content: fileContent,
        expectedRevision: fileRevision,
        toolName: 'studio_editor',
      });
      if (res.outcome === 'conflict') {
        setFileStatus('conflict');
        setFileError('Conflict: file was modified externally. Please review.');
      } else {
        setFileRevision(res.revision);
        setFileDirty(false);
        setFileStatus('saved');
        onDirty(false);
        void loadRootFiles(selectedFile.rootId);
      }
    } catch (e) {
      setFileStatus('error');
      setFileError(e instanceof Error ? e.message : 'Failed to save file.');
    }
  };

  // Link a folder
  const handleLinkFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderForm.name.trim() || !folderForm.path.trim()) return;
    try {
      await api<FolderBinding>(`/spaces/${space.id}/folders`, 'POST', {
        host: folderForm.host.trim(),
        name: folderForm.name.trim(),
        path: folderForm.path.trim(),
        isReadOnly: folderForm.isReadOnly,
      });
      setShowAddFolderModal(false);
      setFolderForm({ name: '', host: 'local', path: '', isReadOnly: false });
      void loadFolderBindings();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not link folder.');
    }
  };

  // Unlink a folder
  const handleUnlinkFolder = async (bindingId: string, rootId: string) => {
    const confirmUnlink = window.confirm(
      'Unlink this folder from the Space? Files on disk will NOT be deleted.',
    );
    if (!confirmUnlink) return;
    try {
      await api(`/spaces/${space.id}/folders/${bindingId}`, 'DELETE');
      if (selectedFile?.rootId === rootId) {
        setSelectedFile(null);
        setFileContent('');
        setFileDirty(false);
        onDirty(false);
      }
      void loadFolderBindings();
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not unlink folder.');
    }
  };

  // Create new file
  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileRootId || !newFilePath.trim()) return;
    try {
      await api<FileDiffReceipt>('/files/write', 'POST', {
        rootId: newFileRootId,
        relativePath: newFilePath.trim(),
        content: '',
        toolName: 'studio_new_file',
      });
      const rootBinding = folderBindings.find((b) => b.rootId === newFileRootId);
      const host = rootBinding?.host ?? 'local';
      setShowNewFileModal(false);
      const pathCreated = newFilePath.trim();
      const nameCreated = pathCreated.split('/').pop() || pathCreated;
      setNewFilePath('');
      await loadRootFiles(newFileRootId);
      await openFile(newFileRootId, host, pathCreated, nameCreated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create file.');
    }
  };

  const page = pages.find((item) => item.id === pageId);

  const saved = useCallback(
    (next: Page) =>
      setPages((previous) =>
        previous.map((item) =>
          item.id === next.id && item.revision < next.revision ? next : item,
        ),
      ),
    [],
  );

  const createLegacyPage = async (parentId: string | null) => {
    try {
      const next = await api<Page>(`/spaces/${space.id}/pages`, 'POST', {
        title: 'Untitled page',
        content: '',
        parentId,
      });
      setPages((previous) => [...previous, next]);
      onPage(next.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create page.');
    }
  };

  return (
    <main
      aria-label="Space documents and folders"
      className={`spaces-surface ${pageId || selectedFile ? 'writing' : 'library'}`}
    >
      {error && (
        <div className="document-load-error" role="alert">
          {error}
        </div>
      )}

      {/* When a legacy page is open */}
      {pageId && page ? (
        <div className="space-writing-layout">
          {outline && (
            <PageOutline
              pages={pages}
              selected={page.id}
              onPage={(id) => {
                onPage(id);
                if (window.innerWidth < 760) setOutline(false);
              }}
              onNew={() => void createLegacyPage(null)}
              onClose={() => setOutline(false)}
            />
          )}
          <PageDocument
            key={page.id}
            page={page}
            pages={pages}
            workspace={workspace}
            paused={paused}
            onHome={() => onPage(undefined)}
            onOutline={() => setOutline((prev) => !prev)}
            onSubpage={() => void createLegacyPage(page.id)}
            onDirty={onDirty}
            onSaved={saved}
            onRefresh={onRefresh}
            onSchedule={onSchedule}
            onThread={onThread}
            onSettings={onSettings}
            onCreateDot={onCreateDot}
          />
        </div>
      ) : selectedFile ? (
        /* File Document / Editor View */
        <div className="space-file-editor-layout">
          <header className="file-editor-header">
            <button
              type="button"
              className="back-btn"
              onClick={() => setSelectedFile(null)}
              aria-label="Back to space files"
            >
              <ArrowLeft size={16} /> Back
            </button>

            <div className="file-meta">
              <span className="file-host-badge" title={`Host: ${selectedFile.host}`}>
                {selectedFile.host === 'local' ? <Laptop size={12} /> : <Server size={12} />}
                {selectedFile.host}
              </span>
              <span className="file-path-display">
                {folderBindings.find((b) => b.rootId === selectedFile.rootId)?.name ?? 'Root'} / {selectedFile.path}
              </span>
            </div>

            <div className="file-actions">
              <span className={`file-status-indicator status-${fileStatus}`}>
                {fileStatus === 'saving' && <LoaderCircle size={14} className="spin" />}
                {fileStatus === 'saved' && <Check size={14} />}
                {fileStatus === 'modified' && 'Modified'}
                {fileStatus === 'conflict' && <AlertTriangle size={14} />}
                {fileStatus.toUpperCase()}
              </span>

              <button
                type="button"
                className="icon-btn"
                title={previewMode ? 'Edit raw text' : 'Markdown preview'}
                onClick={() => setPreviewMode(!previewMode)}
              >
                {previewMode ? <Edit3 size={15} /> : <Eye size={15} />}
                {previewMode ? 'Edit' : 'Preview'}
              </button>

              <button
                type="button"
                className="save-btn"
                disabled={!fileDirty || fileStatus === 'saving'}
                onClick={() => void saveFile()}
              >
                Save
              </button>
            </div>
          </header>

          {fileError && (
            <div className="file-error-banner" role="alert">
              <AlertTriangle size={16} />
              <span>{fileError}</span>
              {fileStatus === 'conflict' && (
                <button
                  type="button"
                  className="reload-conflict-btn"
                  onClick={() => void openFile(selectedFile.rootId, selectedFile.host, selectedFile.path, selectedFile.name)}
                >
                  Reload from disk
                </button>
              )}
            </div>
          )}

          <div className="file-editor-body">
            {previewMode ? (
              <div className="file-markdown-preview">
                <pre>{fileContent}</pre>
              </div>
            ) : (
              <textarea
                className="file-raw-editor"
                value={fileContent}
                aria-label={`Editing ${selectedFile.name}`}
                onChange={(e) => {
                  setFileContent(e.target.value);
                  setFileDirty(true);
                  setFileStatus('modified');
                  onDirty(true);
                }}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                    e.preventDefault();
                    void saveFile();
                  }
                }}
              />
            )}
          </div>
        </div>
      ) : (
        /* Space Main Explorer & Library */
        <div className="space-main-view">
          <header className="space-header-banner">
            <div className="space-title-area">
              <span className="space-eyebrow">SPACE</span>
              <h1>{space.name}</h1>
              {space.description && <p className="space-desc">{space.description}</p>}
            </div>

            <div className="space-header-actions">
              <button
                type="button"
                className="link-folder-btn"
                onClick={() => setShowAddFolderModal(true)}
              >
                <FolderPlus size={15} /> Link Folder
              </button>
              {folderBindings.length > 0 && (
                <button
                  type="button"
                  className="new-file-btn"
                  onClick={() => setShowNewFileModal(true)}
                >
                  <Plus size={15} /> New File
                </button>
              )}
            </div>
          </header>

          {/* Navigation Tabs if Space has both Folder bindings and legacy pages */}
          {(folderBindings.length > 0 || pages.length > 0) && (
            <div className="space-view-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'files'}
                className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
                onClick={() => setActiveTab('files')}
              >
                <Folder size={14} /> Linked Folders ({folderBindings.length})
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'pages'}
                className={`tab-btn ${activeTab === 'pages' ? 'active' : ''}`}
                onClick={() => setActiveTab('pages')}
              >
                <FileText size={14} /> Legacy Pages ({pages.length})
              </button>
            </div>
          )}

          {activeTab === 'files' ? (
            <div className="space-folders-container">
              {folderBindings.length === 0 ? (
                <div className="empty-space-folders">
                  <div className="empty-icon-circle">
                    <Folder size={32} />
                  </div>
                  <h3>No folders linked to this Space yet</h3>
                  <p>
                    Link an Obsidian vault, project repository, or working directory to view and edit files collaboratively.
                  </p>
                  <button
                    type="button"
                    className="primary-action-btn"
                    onClick={() => setShowAddFolderModal(true)}
                  >
                    <FolderPlus size={16} /> Link Your First Folder
                  </button>
                </div>
              ) : (
                <div className="folder-roots-grid">
                  <div className="file-search-bar">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder="Search files in space..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {folderBindings.map((binding) => {
                    const rootItems = (filesByRoot[binding.rootId] || []).filter(
                      (item) =>
                        !searchQuery.trim() ||
                        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.path.toLowerCase().includes(searchQuery.toLowerCase()),
                    );

                    return (
                      <section key={binding.id} className="folder-root-card">
                        <header className="folder-root-card-header">
                          <div className="root-title-group">
                            <Folder size={16} className="root-folder-icon" />
                            <strong>{binding.name}</strong>
                            <span className="host-badge">
                              {binding.host === 'local' ? <Laptop size={11} /> : <Server size={11} />}
                              {binding.host}
                            </span>
                            {binding.isReadOnly && <span className="readonly-badge">Read-only</span>}
                          </div>

                          <div className="root-actions">
                            <button
                              type="button"
                              className="icon-action-btn"
                              title="Refresh root files"
                              onClick={() => void loadRootFiles(binding.rootId)}
                            >
                              <RefreshCw size={13} />
                            </button>
                            <button
                              type="button"
                              className="unlink-folder-btn"
                              title="Unlink folder from space"
                              onClick={() => void handleUnlinkFolder(binding.id, binding.rootId)}
                            >
                              <Trash2 size={13} /> Unlink
                            </button>
                          </div>
                        </header>

                        <div className="root-path-sub">{binding.path}</div>

                        <div className="root-files-list">
                          {rootItems.length === 0 ? (
                            <div className="no-files-note">No matching files found.</div>
                          ) : (
                            rootItems.map((file) => (
                              <button
                                key={file.path}
                                type="button"
                                className="file-entry-row"
                                onClick={() =>
                                  void openFile(binding.rootId, binding.host, file.path, file.name)
                                }
                              >
                                <FileText size={14} className="file-icon" />
                                <span className="file-entry-name">{file.path}</span>
                                <span className="file-entry-size">
                                  {file.size > 1024 ? `${Math.round(file.size / 1024)} KB` : `${file.size} B`}
                                </span>
                              </button>
                            ))
                          )}
                        </div>
                      </section>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <SpaceLibrary
              space={space}
              pages={pages}
              onPage={onPage}
              onNew={() => void createLegacyPage(null)}
            />
          )}

          {/* Add Folder Modal */}
          {showAddFolderModal && (
            <div className="modal-backdrop" onClick={() => setShowAddFolderModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                  <h3>Link Folder to Space</h3>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowAddFolderModal(false)}
                  >
                    ×
                  </button>
                </header>
                <form onSubmit={handleLinkFolder} className="modal-form">
                  <label>
                    Folder Name / Label
                    <input
                      type="text"
                      required
                      placeholder="e.g. Second-Brain or Project"
                      value={folderForm.name}
                      onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                    />
                  </label>
                  <label>
                    Host
                    <select
                      value={folderForm.host}
                      onChange={(e) => setFolderForm({ ...folderForm, host: e.target.value })}
                    >
                      <option value="local">local (MacBook)</option>
                      <option value="debian-mini-pc">debian-mini-pc (Mini PC)</option>
                    </select>
                  </label>
                  <label>
                    Directory Path on Host
                    <input
                      type="text"
                      required
                      placeholder="e.g. /Users/luca/Documents/Vault"
                      value={folderForm.path}
                      onChange={(e) => setFolderForm({ ...folderForm, path: e.target.value })}
                    />
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={folderForm.isReadOnly}
                      onChange={(e) => setFolderForm({ ...folderForm, isReadOnly: e.target.checked })}
                    />
                    Read-only access
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowAddFolderModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Link Folder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* New File Modal */}
          {showNewFileModal && (
            <div className="modal-backdrop" onClick={() => setShowNewFileModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                  <h3>Create New File</h3>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowNewFileModal(false)}
                  >
                    ×
                  </button>
                </header>
                <form onSubmit={handleCreateFile} className="modal-form">
                  <label>
                    Folder Root
                    <select
                      value={newFileRootId}
                      onChange={(e) => setNewFileRootId(e.target.value)}
                    >
                      {folderBindings.map((b) => (
                        <option key={b.rootId} value={b.rootId}>
                          {b.name} ({b.host})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Relative File Path
                    <input
                      type="text"
                      required
                      placeholder="e.g. notes/new-idea.md"
                      value={newFilePath}
                      onChange={(e) => setNewFilePath(e.target.value)}
                    />
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowNewFileModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Create File
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
