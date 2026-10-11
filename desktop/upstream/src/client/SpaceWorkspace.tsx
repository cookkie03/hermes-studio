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
  Bookmark,
  Sparkles,
  X,
} from 'lucide-react';
import type { Page } from '../server/pages';
import type { Space, WorkspaceState, FolderBinding, SpaceMemoryConfig } from '../shared/types';
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
  const [folderBindings, setFolderBindings] = useState<FolderBinding[]>(
    workspace.folderBindings ? workspace.folderBindings.filter((b) => b.spaceId === space.id) : [],
  );
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

  const [activeTab, setActiveTab] = useState<'files' | 'pages' | 'memory'>(
    folderBindings.length > 0 ? 'files' : 'pages',
  );
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [outline, setOutline] = useState(false);

  // Space Markdown Memory state
  const [memoryConfig, setMemoryConfig] = useState<SpaceMemoryConfig | null>(null);
  const [memoryContent, setMemoryContent] = useState('');
  const [memoryRevision, setMemoryRevision] = useState('');
  const [memoryDirty, setMemoryDirty] = useState(false);
  const [memoryStatus, setMemoryStatus] = useState<
    'saved' | 'saving' | 'modified' | 'conflict' | 'error'
  >('saved');
  const [memoryError, setMemoryError] = useState('');
  const [memoryPreview, setMemoryPreview] = useState(false);
  const [showMemoryConfigModal, setShowMemoryConfigModal] = useState(false);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneContent, setMilestoneContent] = useState('');
  const [memoryConfigForm, setMemoryConfigForm] = useState<{
    rootId: string;
    relativePath: string;
    policy: 'manual' | 'milestones';
    createIfNotExists: boolean;
  }>({
    rootId: '',
    relativePath: 'MEMORY.md',
    policy: 'manual',
    createIfNotExists: true,
  });

  const loadSpaceMemory = useCallback(async () => {
    try {
      const res = await api<{
        config: SpaceMemoryConfig | null;
        file: FileReadResult | null;
        error?: string;
      }>(`/spaces/${space.id}/memory`);
      setMemoryConfig(res.config);
      if (res.config && res.file) {
        if (!memoryDirty) {
          setMemoryContent(res.file.content);
          setMemoryRevision(res.file.revision);
          setMemoryStatus(res.config.lastOutcome === 'conflict' ? 'conflict' : 'saved');
        }
      }
      if (res.error) {
        setMemoryError(res.error);
      }
    } catch {
      // Memory not configured or error
    }
  }, [space.id, memoryDirty]);

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
    void loadSpaceMemory();
    const timer = setInterval(() => {
      if (active) {
        void loadPages();
        void loadFolderBindings();
        if (activeTab === 'memory' && !memoryDirty && memoryStatus !== 'saving') {
          void loadSpaceMemory();
        }
      }
    }, 5000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [loadPages, loadFolderBindings, loadSpaceMemory, activeTab, memoryDirty, memoryStatus]);

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

  // Save space memory
  const saveSpaceMemory = async (forceOverwrite = false) => {
    if (!memoryConfig) return;
    setMemoryStatus('saving');
    setMemoryError('');
    try {
      const res = await api<{
        outcome: 'success' | 'conflict';
        receipt?: FileDiffReceipt;
        newRevision?: string;
        config?: SpaceMemoryConfig;
        error?: string;
      }>(`/spaces/${space.id}/memory/write`, 'POST', {
        content: memoryContent,
        expectedRevision: forceOverwrite ? undefined : memoryRevision,
        mode: 'replace',
      });
      if (res.outcome === 'conflict') {
        setMemoryStatus('conflict');
        setMemoryError('Conflict: memory file was modified externally. Please review or reload.');
      } else if (res.newRevision) {
        setMemoryRevision(res.newRevision);
        setMemoryDirty(false);
        setMemoryStatus('saved');
        if (res.config) setMemoryConfig(res.config);
        void loadRootFiles(memoryConfig.rootId);
      }
    } catch (e) {
      setMemoryStatus('error');
      setMemoryError(e instanceof Error ? e.message : 'Failed to save space memory.');
    }
  };

  // Bind or configure space memory
  const handleBindMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryConfigForm.rootId || !memoryConfigForm.relativePath.trim()) return;
    try {
      const res = await api<{
        config: SpaceMemoryConfig | null;
        file: FileReadResult | null;
      }>(`/spaces/${space.id}/memory`, 'POST', {
        rootId: memoryConfigForm.rootId,
        relativePath: memoryConfigForm.relativePath.trim(),
        policy: memoryConfigForm.policy,
        createIfNotExists: memoryConfigForm.createIfNotExists,
      });
      setMemoryConfig(res.config);
      if (res.file) {
        setMemoryContent(res.file.content);
        setMemoryRevision(res.file.revision);
        setMemoryDirty(false);
        setMemoryStatus('saved');
      }
      setShowMemoryConfigModal(false);
      await loadRootFiles(memoryConfigForm.rootId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not configure space memory.');
    }
  };

  // Unbind space memory
  const handleUnbindMemory = async () => {
    if (!window.confirm('Unbind memory file from this Space? The file will remain on disk.'))
      return;
    try {
      await api(`/spaces/${space.id}/memory`, 'DELETE');
      setMemoryConfig(null);
      setMemoryContent('');
      setMemoryRevision('');
      setMemoryDirty(false);
      setMemoryStatus('saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not unbind memory.');
    }
  };

  // Record milestone / decision
  const handleRecordMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!milestoneTitle.trim() || !milestoneContent.trim()) return;
    try {
      const dateStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
      const heading = `${dateStr} — ${milestoneTitle.trim()}`;
      await api<{
        outcome: 'success' | 'conflict';
        receipt?: FileDiffReceipt;
        newRevision?: string;
        config?: SpaceMemoryConfig;
      }>(`/spaces/${space.id}/memory/write`, 'POST', {
        content: milestoneContent.trim(),
        expectedRevision: memoryRevision || undefined,
        mode: 'append',
        appendHeading: heading,
      });
      setShowMilestoneModal(false);
      setMilestoneTitle('');
      setMilestoneContent('');
      await loadSpaceMemory();
    } catch (err) {
      setMemoryError(err instanceof Error ? err.message : 'Failed to record milestone.');
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

          {/* Navigation Tabs for Space Folders, Legacy pages and Space Memory */}
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
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'memory'}
              className={`tab-btn ${activeTab === 'memory' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('memory');
                void loadSpaceMemory();
              }}
            >
              <Bookmark size={14} /> Space Memory {memoryConfig ? '(Active)' : ''}
            </button>
          </div>

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
          ) : activeTab === 'memory' ? (
            <div className="space-memory-container">
              {!memoryConfig ? (
                <div className="space-memory-setup">
                  <div className="empty-icon-circle">
                    <Bookmark size={32} />
                  </div>
                  <h3>Space Markdown Memory</h3>
                  <p>
                    Bind or initialize a dedicated Markdown memory file (e.g. <code>MEMORY.md</code>) in an authorized workspace folder. Space Markdown memory tracks authoritative filesystem revisions, handles external conflicts, and remains cleanly isolated from Hermes runtime profile memory.
                  </p>
                  <button
                    type="button"
                    className="primary-action-btn"
                    disabled={folderBindings.length === 0}
                    onClick={() => {
                      if (folderBindings.length > 0) {
                        setMemoryConfigForm({
                          rootId: folderBindings[0].rootId,
                          relativePath: 'MEMORY.md',
                          policy: 'manual',
                          createIfNotExists: true,
                        });
                      }
                      setShowMemoryConfigModal(true);
                    }}
                  >
                    <Plus size={15} /> Configure Space Memory
                  </button>
                  {folderBindings.length === 0 && (
                    <p className="chat-error" style={{ marginTop: '12px' }}>
                      Link at least one folder to this Space first before configuring memory.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-memory-active-view">
                  <header className="space-memory-header">
                    <div className="memory-meta-badges">
                      <span className="memory-badge" title="Root and relative path">
                        <Bookmark size={12} />{' '}
                        {folderBindings.find((b) => b.rootId === memoryConfig.rootId)?.name ??
                          'Folder'}{' '}
                        / {memoryConfig.relativePath}
                      </span>
                      <span className="memory-policy-badge" title="Memory update policy">
                        Policy: {memoryConfig.policy}
                      </span>
                      <span className={`memory-status-pill ${memoryStatus}`}>
                        {memoryStatus === 'saving' && <LoaderCircle size={13} className="spin" />}
                        {memoryStatus === 'saved' && <Check size={13} />}
                        {memoryStatus === 'conflict' && <AlertTriangle size={13} />}
                        {memoryStatus.toUpperCase()}
                      </span>
                      {memoryRevision && (
                        <span className="memory-badge" title={`Revision Token: ${memoryRevision}`}>
                          Rev: {memoryRevision.substring(0, 8)}
                        </span>
                      )}
                    </div>
                    <div className="memory-header-actions">
                      <button
                        type="button"
                        className="record-milestone-btn"
                        onClick={() => setShowMilestoneModal(true)}
                        title="Record a significant decision or milestone"
                      >
                        <Sparkles size={14} /> Record Milestone
                      </button>
                      <button
                        type="button"
                        className="icon-btn"
                        onClick={() => setMemoryPreview(!memoryPreview)}
                        title={memoryPreview ? 'Edit Markdown' : 'Preview Markdown'}
                      >
                        {memoryPreview ? <Edit3 size={15} /> : <Eye size={15} />}
                        {memoryPreview ? 'Edit' : 'Preview'}
                      </button>
                      <button
                        type="button"
                        className="save-btn"
                        disabled={!memoryDirty || memoryStatus === 'saving'}
                        onClick={() => void saveSpaceMemory()}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        className="icon-action-btn"
                        onClick={() => void handleUnbindMemory()}
                        title="Unbind memory file from Space"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </header>

                  {memoryError && (
                    <div className="file-error-banner" role="alert">
                      <AlertTriangle size={16} />
                      <span>{memoryError}</span>
                      {memoryStatus === 'conflict' && (
                        <button
                          type="button"
                          className="reload-conflict-btn"
                          onClick={() => void loadSpaceMemory()}
                        >
                          Reload from disk
                        </button>
                      )}
                    </div>
                  )}

                  <div className="file-editor-body">
                    {memoryPreview ? (
                      <div className="file-markdown-preview">
                        <pre>{memoryContent}</pre>
                      </div>
                    ) : (
                      <textarea
                        className="file-raw-editor"
                        value={memoryContent}
                        aria-label={`Editing Space Memory ${memoryConfig.relativePath}`}
                        onChange={(e) => {
                          setMemoryContent(e.target.value);
                          setMemoryDirty(true);
                          setMemoryStatus('modified');
                        }}
                        onKeyDown={(e) => {
                          if ((e.metaKey || e.ctrlKey) && e.key === 's') {
                            e.preventDefault();
                            void saveSpaceMemory();
                          }
                        }}
                      />
                    )}
                  </div>
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

          {/* Configure Space Memory Modal */}
          {showMemoryConfigModal && (
            <div className="modal-backdrop" onClick={() => setShowMemoryConfigModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                  <h3>Configure Space Memory</h3>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowMemoryConfigModal(false)}
                  >
                    ×
                  </button>
                </header>
                <form onSubmit={handleBindMemory} className="modal-form">
                  <label>
                    Target Folder Root
                    <select
                      value={memoryConfigForm.rootId}
                      onChange={(e) =>
                        setMemoryConfigForm({ ...memoryConfigForm, rootId: e.target.value })
                      }
                    >
                      {folderBindings.map((b) => (
                        <option key={b.rootId} value={b.rootId}>
                          {b.name} ({b.host}) — {b.path}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Relative File Path
                    <input
                      type="text"
                      required
                      placeholder="e.g. MEMORY.md or docs/MEMORY.md"
                      value={memoryConfigForm.relativePath}
                      onChange={(e) =>
                        setMemoryConfigForm({ ...memoryConfigForm, relativePath: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Update Policy
                    <select
                      value={memoryConfigForm.policy}
                      onChange={(e) =>
                        setMemoryConfigForm({
                          ...memoryConfigForm,
                          policy: e.target.value as 'manual' | 'milestones',
                        })
                      }
                    >
                      <option value="manual">Manual (Explicit Save & Review)</option>
                      <option value="milestones">Milestones (Save on significant events)</option>
                    </select>
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={memoryConfigForm.createIfNotExists}
                      onChange={(e) =>
                        setMemoryConfigForm({
                          ...memoryConfigForm,
                          createIfNotExists: e.target.checked,
                        })
                      }
                    />
                    Create with standard Space Memory template if file does not exist
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowMemoryConfigModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Bind Memory File
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Record Milestone Modal */}
          {showMilestoneModal && (
            <div className="modal-backdrop" onClick={() => setShowMilestoneModal(false)}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <header className="modal-header">
                  <h3>Record Milestone or Decision</h3>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => setShowMilestoneModal(false)}
                  >
                    ×
                  </button>
                </header>
                <form onSubmit={handleRecordMilestone} className="modal-form">
                  <label>
                    Milestone / Decision Summary
                    <input
                      type="text"
                      required
                      placeholder="e.g. Completed integration tests for feature F9"
                      value={milestoneTitle}
                      onChange={(e) => setMilestoneTitle(e.target.value)}
                    />
                  </label>
                  <label>
                    Details / Evidence / Notes
                    <textarea
                      rows={4}
                      required
                      placeholder="e.g. All test cases passed with zero regressions. Preserved manual sections and confirmed revision tokens."
                      value={milestoneContent}
                      onChange={(e) => setMilestoneContent(e.target.value)}
                    />
                  </label>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => setShowMilestoneModal(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="submit-btn">
                      Append to Space Memory
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
