export interface NativeReviewNote {
  id: string;
  text: string;
  connectionId: string;
  profile: string | null;
  storedSessionId: string;
  runtimeSessionId: string;
  identity: 'sequence' | 'text-fallback';
}
export interface ReviewReplay { state: 'available' | 'partial' | 'unavailable' | 'offline'; message: string }
export function mergeReviewNotes(previous: NativeReviewNote[], incoming: NativeReviewNote[]): NativeReviewNote[] {
  const ids = new Set(previous.map(note => note.id));
  return [...previous, ...incoming.filter(note => { if (ids.has(note.id)) return false; ids.add(note.id); return true; })];
}
export function NativeReviewNotes({ notes, replay }: { notes: NativeReviewNote[]; replay?: ReviewReplay }) {
  return <>
    {notes.map(note => <section key={note.id} className="hermes-review-note" aria-label="Self-improvement review">
      <header><strong>Self-improvement review</strong><small>Native Hermes summary · session note</small></header>
      <p className="hermes-review-text">{note.text}</p>
      <details><summary>Origin and proposal review</summary>
        <dl><dt>Runtime connection</dt><dd>{note.connectionId}</dd><dt>Profile</dt><dd>{note.profile ?? 'Not reported by Hermes'}</dd>
          <dt>Stored session</dt><dd>{note.storedSessionId}</dd><dt>Runtime session</dt><dd>{note.runtimeSessionId}</dd></dl>
        <p>This is the original runtime summary. Studio has no structured receipt for memory or skill changes.</p>
        <p>If the summary asks you to review a proposal, follow its <code>/memory pending</code> instruction in Hermes. Proposal review is not connected in Studio.</p>
        {note.identity === 'text-fallback' && <p>This event had no verified sequence identity. Identical summaries in the same session may be shown once.</p>}
      </details>
    </section>)}
    {replay && replay.state !== 'available' && <p className="hermes-review-limit">{replay.message}</p>}
  </>;
}
