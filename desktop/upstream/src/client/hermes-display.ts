export interface TextMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: Record<string, unknown>;
}
export function pendingMessage(messages: TextMessage[], id: string, text: string): TextMessage[] {
  if (messages.some((message) => message.id === id)) return messages;
  return [...messages, { id, role: 'user', content: text, metadata: { hermesDelivery: 'pending' } }];
}
export function delivery(messages: TextMessage[], id: string | undefined, state: 'acknowledged' | 'uncertain'): TextMessage[] {
  return messages.map((message) => message.id === id ? { ...message, metadata: { ...message.metadata, hermesDelivery: state } } : message);
}
export function appendAssistant(messages: TextMessage[], id: string, text: string, complete = false): TextMessage[] {
  return messages.some((message) => message.id === id)
    ? messages.map((message) => message.id === id ? { ...message, content: complete ? text : message.content + text } : message)
    : [...messages, { id, role: 'assistant', content: text }];
}
export function remainingDraft(current: string, submitted: string): string {
  return current === submitted ? '' : current;
}

export function projectedText(content: unknown): string {
  if (typeof content === 'string') return content;
  if (content == null) return '';
  if (Array.isArray(content)) return content.map((part: unknown) => {
    if (part && typeof part === 'object' && 'text' in part && typeof part.text === 'string') return part.text;
    return '[Attachment]';
  }).join('\n');
  throw new Error('This saved message format cannot be displayed safely.');
}

/** Match occurrences in order, so repeated identical requests are retained rather than globally deduplicated. */
export function mergeHistory(previous: TextMessage[], history: TextMessage[]): TextMessage[] {
  const consumed = new Set<number>();
  let cursor = 0;
  const merged = history.map((saved) => {
    let found = previous.findIndex((message, index) => !consumed.has(index) && message.id === saved.id);
    if (found < 0) found = previous.findIndex((message, index) => index >= cursor && !consumed.has(index) &&
      message.role === saved.role && (message.content === saved.content ||
        (saved.role === 'assistant' && (message.content.startsWith(saved.content) || saved.content.startsWith(message.content)))));
    if (found < 0) return saved;
    consumed.add(found); cursor = found + 1;
    const live = previous[found];
    return saved.role === 'assistant' && live.content.length > saved.content.length ? live : saved;
  });
  return [...merged, ...previous.filter((_, index) => !consumed.has(index))];
}
export type TurnPhase = 'idle' | 'dispatching' | 'accepted' | 'running' | 'completed' | 'error' | 'interrupted';
export function afterDispatchResponse(phase: TurnPhase): TurnPhase {
  // A slow HTTP response cannot put a completed runtime turn back into a waiting state.
  return phase === 'dispatching' ? 'accepted' : phase;
}
export function removeApproval<T extends { requestId: unknown }>(requests: T[], requestId: unknown): T[] {
  return requests.filter((request) => JSON.stringify(request.requestId) !== JSON.stringify(requestId));
}
export function restoreDraft(local: string | null, saved: string): string {
  // Same-origin local text may be newer than the debounced disk save after a quick chat switch.
  return local ?? saved;
}

export interface ToolActivity { id: string; name: string; args?: unknown; result?: unknown; complete: boolean }
export function mergeToolEvent(previous: ToolActivity[], event: { type?: string; payload?: Record<string, unknown> }): ToolActivity[] {
  if (!['tool.start', 'tool.complete'].includes(event.type ?? '')) return previous;
  const payload = event.payload ?? {};
  const id = typeof payload.tool_id === 'string' ? payload.tool_id : typeof payload.id === 'string' ? payload.id : '';
  if (!id) return previous;
  const current = previous.find((tool) => tool.id === id);
  // A historical start frame cannot overwrite a newer live completion.
  const item: ToolActivity = { id, name: typeof payload.name === 'string' ? payload.name : current?.name ?? 'Tool',
    args: payload.args ?? current?.args, result: current?.complete && event.type !== 'tool.complete' ? current.result : payload.result ?? payload.result_text ?? current?.result,
    complete: current?.complete === true || event.type === 'tool.complete' };
  return current ? previous.map((tool) => tool.id === id ? item : tool) : [...previous, item];
}
