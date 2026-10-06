import { useEffect, useRef, useState } from 'react';
import { FileText, ArrowUpRight, X } from 'lucide-react';
import type { Dot, WorkspaceState, FolderBinding } from '../shared/types';
import type { Page } from '../server/pages';
import type { FileDiffReceipt } from '../shared/file-workspace';
import { api } from './api';
import { decidePageReview } from './page-review-decision';
import { openPageLink } from './page-navigation';

/** Human-initiated local document review; saves directly to folder filesystem or legacy page. */
export function SaveToSpaceReview({
  threadId,
  dot,
  initialContent,
  initialTitle,
  onSaved,
  onClose,
}: {
  threadId: string;
  dot: Dot;
  initialContent: string;
  initialTitle: string;
  onSaved: () => void;
  onClose: () => void;
}) {
  const [spaces, setSpaces] = useState<WorkspaceState['spaces']>([]);
  const [folderBindings, setFolderBindings] = useState<FolderBinding[]>([]);
  const [spaceId, setSpaceId] = useState(dot.spaceId);
  const [saveMode, setSaveMode] = useState<'folder' | 'page'>('folder');
  const [selectedRootId, setSelectedRootId] = useState<string>('');
  const [filePath, setFilePath] = useState('');
  const [title, setTitle] = useState(initialTitle.slice(0, 160));
  const [content, setContent] = useState(initialContent);
  const [page, setPage] = useState<Page>();
  const [fileReceipt, setFileReceipt] = useState<FileDiffReceipt>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const receiptId = useRef('manual-review-' + crypto.randomUUID());
  const pending = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    void api<WorkspaceState>('/workspace', 'GET', undefined, controller.signal)
      .then((workspace) => {
        if (controller.signal.aborted) return;
        const allowed = workspace.spaces.filter((space) => dot.spaceIds.includes(space.id));
        setSpaces(allowed);
        if (!allowed.some((space) => space.id === dot.spaceId)) {
          setSpaceId(allowed[0]?.id ?? '');
        }
        if (workspace.folderBindings) {
          setFolderBindings(workspace.folderBindings);
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Destinations unavailable.');
        }
      });
    return () => controller.abort();
  }, [dot]);

  const activeSpaceFolders = folderBindings.filter((f) => f.spaceId === spaceId);

  useEffect(() => {
    if (activeSpaceFolders.length > 0 && !selectedRootId) {
      setSelectedRootId(activeSpaceFolders[0].rootId);
      setSaveMode('folder');
    } else if (activeSpaceFolders.length === 0) {
      setSaveMode('page');
    }
  }, [activeSpaceFolders, selectedRootId]);

  useEffect(() => {
    if (!filePath && title) {
      const sanitized = title
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, '-')
        .replace(/^-|-$/g, '');
      setFilePath(`notes/${sanitized || 'note'}.md`);
    }
  }, [title, filePath]);

  const save = async () => {
    if (pending.current || page || fileReceipt) return;
    pending.current = true;
    setBusy(true);
    setError('');

    try {
      if (saveMode === 'folder' && selectedRootId && filePath) {
        const receipt = await api<FileDiffReceipt>('/files/write', 'POST', {
          rootId: selectedRootId,
          relativePath: filePath.trim(),
          content,
          toolName: 'save_to_space_review',
        });
        if (receipt.outcome === 'conflict') {
          throw new Error('Conflict: File already exists with a different revision on disk.');
        }
        setFileReceipt(receipt);
        setUncertain(false);
        onSaved();
      } else {
        const saved = await decidePageReview(
          threadId,
          receiptId.current,
          { title: title.trim(), content, spaceId },
          true,
        );
        if (!saved) throw new Error('No saved page receipt was returned.');
        setPage(saved);
        setUncertain(false);
        onSaved();
      }
    } catch (cause) {
      setUncertain(true);
      setError(
        (cause instanceof Error ? cause.message : 'Save not confirmed.') +
          ' Check the receipt before changing this draft.',
      );
    } finally {
      pending.current = false;
      setBusy(false);
    }
  };

  const selectedFolderBinding = folderBindings.find((b) => b.rootId === selectedRootId);

  return (
    <section className="page-review-card hermes-manual-review" aria-label="Review draft for Space">
      <header>
        <FileText size={17} />
        <strong>
          {page || fileReceipt ? 'Saved to your Space' : 'Review before saving'}
        </strong>
        <span>{page || fileReceipt ? 'Saved' : 'You decide'}</span>
        <button
          type="button"
          className="icon-button"
          aria-label="Close draft review"
          disabled={busy}
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </header>

      {fileReceipt ? (
        <div className="page-review-body">
          <h3>{filePath}</h3>
          <p role="status">
            Saved to folder <strong>{selectedFolderBinding?.name}</strong> ({fileReceipt.host}) ·
            revision {fileReceipt.revision}
          </p>
        </div>
      ) : page ? (
        <div className="page-review-body">
          <h3>{page.title}</h3>
          <p role="status">
            Saved in {spaces.find((space) => space.id === page.spaceId)?.name ?? 'your Space'} ·
            revision {page.revision}
          </p>
        </div>
      ) : (
        <div className="page-review-body hermes-review-fields">
          <label>
            Destination Space
            <select
              value={spaceId}
              disabled={busy || uncertain}
              onChange={(event) => setSpaceId(event.target.value)}
            >
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.name}
                </option>
              ))}
            </select>
          </label>

          {activeSpaceFolders.length > 0 && (
            <div className="save-mode-selector">
              <label>Save Destination Type</label>
              <div className="save-mode-radios">
                <label>
                  <input
                    type="radio"
                    name="saveMode"
                    value="folder"
                    checked={saveMode === 'folder'}
                    onChange={() => setSaveMode('folder')}
                  />
                  Folder File (Filesystem)
                </label>
                <label>
                  <input
                    type="radio"
                    name="saveMode"
                    value="page"
                    checked={saveMode === 'page'}
                    onChange={() => setSaveMode('page')}
                  />
                  Legacy Metadata Page
                </label>
              </div>
            </div>
          )}

          {saveMode === 'folder' && activeSpaceFolders.length > 0 ? (
            <>
              <label>
                Linked Folder Root
                <select
                  value={selectedRootId}
                  disabled={busy || uncertain}
                  onChange={(e) => setSelectedRootId(e.target.value)}
                >
                  {activeSpaceFolders.map((f) => (
                    <option key={f.rootId} value={f.rootId}>
                      {f.name} ({f.host}) — {f.path}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                File Relative Path
                <input
                  value={filePath}
                  maxLength={250}
                  disabled={busy || uncertain}
                  onChange={(event) => setFilePath(event.target.value)}
                  placeholder="e.g. notes/my-research.md"
                />
              </label>
            </>
          ) : (
            <label>
              Title
              <input
                value={title}
                maxLength={160}
                disabled={busy || uncertain}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>
          )}

          <label>
            Markdown draft
            <textarea
              value={content}
              maxLength={50000}
              disabled={busy || uncertain}
              onChange={(event) => setContent(event.target.value)}
            />
          </label>
          <small>
            {content.length.toLocaleString()} characters. Content will be written directly to the chosen destination.
          </small>
        </div>
      )}

      {error && <p role="alert">{error}</p>}

      <footer>
        {page ? (
          <button
            type="button"
            className="review-primary"
            onClick={() =>
              openPageLink(
                `/#/spaces/${encodeURIComponent(page.spaceId)}/pages/${encodeURIComponent(page.id)}`,
              )
            }
          >
            Open page <ArrowUpRight size={15} />
          </button>
        ) : fileReceipt ? (
          <button type="button" className="review-primary" onClick={onClose}>
            Done
          </button>
        ) : (
          <>
            <button
              type="button"
              className="review-primary"
              onClick={() => void save()}
              disabled={
                busy ||
                !spaces.some((space) => space.id === spaceId) ||
                (saveMode === 'folder' ? !filePath.trim() || !selectedRootId : !title.trim()) ||
                !content.trim() ||
                content.length > 50000
              }
            >
              {busy ? 'Saving…' : uncertain ? 'Check receipt & save' : 'Save'}
            </button>
            <button
              type="button"
              className="review-secondary"
              onClick={onClose}
              disabled={busy}
            >
              Keep editing
            </button>
          </>
        )}
      </footer>
    </section>
  );
}
