type SubmissionResult = { status: 'sent' | 'stale' | 'busy' | 'blocked' } |
  { status: 'error'; stage: 'prepare' | 'dispatch'; cause: unknown };

/** Owns asynchronous submission work for one mounted conversation/host view. */
export class ConversationSubmission {
  private closed = false;
  private pending = false;

  close() { this.closed = true; }

  async send<T>({ prepare, canSend, dispatch }: {
    prepare: () => Promise<T>;
    canSend: () => boolean;
    dispatch: (reference: T) => Promise<unknown>;
  }): Promise<SubmissionResult> {
    if (this.closed) return { status: 'stale' };
    if (this.pending) return { status: 'busy' };
    if (!canSend()) return { status: 'blocked' };
    this.pending = true;
    let stage: 'prepare' | 'dispatch' = 'prepare';
    try {
      const reference = await prepare();
      if (this.closed) return { status: 'stale' };
      if (!canSend()) return { status: 'blocked' };
      stage = 'dispatch';
      await dispatch(reference);
      return { status: this.closed ? 'stale' : 'sent' };
    } catch (cause) {
      return this.closed ? { status: 'stale' } : { status: 'error', stage, cause };
    } finally { this.pending = false; }
  }
}
