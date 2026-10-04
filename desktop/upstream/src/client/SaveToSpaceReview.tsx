import { useEffect, useRef, useState } from 'react';
import { FileText, ArrowUpRight, X } from 'lucide-react';
import type { Dot, WorkspaceState } from '../shared/types';
import type { Page } from '../server/pages';
import { api } from './api';
import { decidePageReview } from './page-review-decision';
import { openPageLink } from './page-navigation';

/** Human-initiated local document review; this is not a runtime tool approval. */
export function SaveToSpaceReview({ threadId, dot, initialContent, initialTitle, onSaved, onClose }: {
  threadId: string; dot: Dot; initialContent: string; initialTitle: string; onSaved: () => void; onClose: () => void;
}) {
  const [spaces, setSpaces] = useState<WorkspaceState['spaces']>([]);
  const [spaceId, setSpaceId] = useState(dot.spaceId);
  const [title, setTitle] = useState(initialTitle.slice(0, 160));
  const [content, setContent] = useState(initialContent);
  const [page, setPage] = useState<Page>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const receiptId = useRef('manual-review-' + crypto.randomUUID());
  const pending = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    void api<WorkspaceState>('/workspace', 'GET', undefined, controller.signal).then((workspace) => {
      if (controller.signal.aborted) return;
      const allowed = workspace.spaces.filter((space) => dot.spaceIds.includes(space.id));
      setSpaces(allowed);
      if (!allowed.some((space) => space.id === dot.spaceId)) setSpaceId(allowed[0]?.id ?? '');
    }).catch((cause) => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Destinations unavailable.'); });
    return () => controller.abort();
  }, [dot]);
  const save = async () => {
    if (pending.current || page) return;
    pending.current = true; setBusy(true); setError('');
    try {
      // Stable receipt identity checks a committed save before a retry; no automatic retry.
      const saved = await decidePageReview(threadId, receiptId.current, { title: title.trim(), content, spaceId }, true);
      if (!saved) throw new Error('No saved page receipt was returned.');
      setPage(saved); setUncertain(false); onSaved();
    } catch (cause) {
      setUncertain(true); setError((cause instanceof Error ? cause.message : 'Save not confirmed.') + ' Check the receipt before changing this draft.');
    } finally { pending.current = false; setBusy(false); }
  };
  return <section className="page-review-card hermes-manual-review" aria-label="Review draft for Space">
    <header><FileText size={17} /><strong>{page ? 'Saved to your Space' : 'Review before saving'}</strong><span>{page ? 'Saved' : 'You decide'}</span>
      <button type="button" className="icon-button" aria-label="Close draft review" disabled={busy} onClick={onClose}><X size={16} /></button></header>
    {page ? <div className="page-review-body"><h3>{page.title}</h3><p role="status">Saved in {spaces.find((space) => space.id === page.spaceId)?.name ?? 'your Space'} · revision {page.revision}</p></div>
      : <div className="page-review-body hermes-review-fields">
        <label>Destination<select value={spaceId} disabled={busy || uncertain} onChange={(event) => setSpaceId(event.target.value)}>{spaces.map((space) => <option key={space.id} value={space.id}>{space.name}</option>)}</select></label>
        <label>Title<input value={title} maxLength={160} disabled={busy || uncertain} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>Markdown draft<textarea value={content} maxLength={20000} disabled={busy || uncertain} onChange={(event) => setContent(event.target.value)} /></label>
        <small>{content.length.toLocaleString()} / 20,000 characters. Review factual claims and sources before saving.</small>
      </div>}
    {error && <p role="alert">{error}</p>}
    <footer>{page ? <button type="button" className="review-primary" onClick={() => openPageLink(`/#/spaces/${encodeURIComponent(page.spaceId)}/pages/${encodeURIComponent(page.id)}`)}>Open page <ArrowUpRight size={15} /></button>
      : <><button type="button" className="review-primary" onClick={() => void save()} disabled={busy || !spaces.some((space) => space.id === spaceId) || !title.trim() || !content.trim() || content.length > 20000}>{busy ? 'Saving…' : uncertain ? 'Check receipt & save' : 'Save reviewed draft'}</button><small>Nothing is saved until you choose Save.</small></>}
    </footer>
  </section>;
}
