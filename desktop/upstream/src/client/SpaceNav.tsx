import { useEffect, useState } from 'react';
import { ChevronRight, FileText, Folder, Laptop, Server } from 'lucide-react';
import type { Space, FolderBinding } from '../shared/types';
import type { Page } from '../server/pages';
import { api } from './api';

export function SpaceNav({
  space,
  active,
  pageId,
  onOpen,
}: {
  space: Space;
  active: boolean;
  pageId?: string;
  onOpen: (pageId?: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pages, setPages] = useState<Page[]>([]);
  const [folders, setFolders] = useState<FolderBinding[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!expanded) return;
    let current = true;
    const load = async () => {
      try {
        const [nextPages, nextFolders] = await Promise.all([
          api<Page[]>(`/spaces/${space.id}/pages`),
          api<FolderBinding[]>(`/spaces/${space.id}/folders`).catch(() => []),
        ]);
        if (current) {
          setPages(nextPages);
          setFolders(nextFolders);
          setError('');
        }
      } catch {
        if (current) setError('Could not load pages or folders.');
      }
    };
    void load();
    const timer = setInterval(() => void load(), 3000);
    return () => {
      current = false;
      clearInterval(timer);
    };
  }, [expanded, space.id]);

  const branches = (parentId: string | null, depth = 0): React.ReactNode =>
    pages
      .filter((page) => page.parentId === parentId)
      .map((page) => (
        <div key={page.id}>
          <button
            type="button"
            className={`nav-item space-page-link ${active && pageId === page.id ? 'active' : ''}`}
            style={{ paddingLeft: 28 + depth * 12 }}
            aria-current={active && pageId === page.id ? 'page' : undefined}
            onClick={() => onOpen(page.id)}
          >
            <FileText size={14} />
            <span>{page.title}</span>
          </button>
          {branches(page.id, depth + 1)}
        </div>
      ));

  return (
    <div className="space-nav-group">
      <div className="space-nav-row">
        <button
          type="button"
          className="icon-button space-disclosure"
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${space.name}`}
          aria-expanded={expanded}
          aria-controls={`space-pages-${space.id}`}
          onClick={() => setExpanded(!expanded)}
        >
          <ChevronRight
            size={13}
            style={{ transform: expanded ? 'rotate(90deg)' : undefined }}
          />
        </button>
        <button
          type="button"
          className={`nav-item ${active && !pageId ? 'active' : ''}`}
          aria-current={active && !pageId ? 'page' : undefined}
          onClick={() => onOpen()}
        >
          <Folder size={16} />
          <span>{space.name}</span>
        </button>
      </div>
      {expanded && (
        <div
          id={`space-pages-${space.id}`}
          className="space-subpages"
          role="group"
          aria-label={`${space.name} folders and documents`}
        >
          {folders.map((f) => (
            <div key={f.id} className="space-folder-nav-item">
              <button
                type="button"
                className={`nav-item space-folder-link ${active && !pageId ? 'active' : ''}`}
                style={{ paddingLeft: 28 }}
                onClick={() => onOpen()}
                title={`${f.name} on ${f.host}: ${f.path}`}
              >
                {f.host === 'local' ? <Laptop size={13} /> : <Server size={13} />}
                <span>{f.name}</span>
              </button>
            </div>
          ))}
          {branches(null)}
          {!folders.length && !pages.length && !error && (
            <div className="space-nav-empty">No folders or pages</div>
          )}
          {error && <div className="space-nav-error">{error}</div>}
        </div>
      )}
    </div>
  );
}
