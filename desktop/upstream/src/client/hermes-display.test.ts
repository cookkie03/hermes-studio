import { describe, expect, it } from 'vitest';
import { appendAssistant, delivery, pendingMessage, remainingDraft } from './hermes-display';

describe('Hermes display delivery boundaries', () => {
  it('keeps the optimistic user before a delta that arrives before dispatch acknowledgement', () => {
    const pending = pendingMessage([], 'user', 'A request');
    const streamed = appendAssistant(pending, 'assistant', 'A response');
    const acknowledged = delivery(streamed, 'user', 'acknowledged');
    expect(acknowledged.map((message) => message.role)).toEqual(['user', 'assistant']);
    expect(acknowledged[0].metadata?.hermesDelivery).toBe('acknowledged');
  });
  it('preserves one pending row and marks uncertainty without claiming success', () => {
    const pending = pendingMessage([], 'same-id', 'A request');
    expect(pendingMessage(pending, 'same-id', 'A request')).toBe(pending);
    const uncertain = delivery(pending, 'same-id', 'uncertain');
    expect(uncertain).toHaveLength(1);
    expect(uncertain[0].metadata?.hermesDelivery).toBe('uncertain');
    expect(uncertain[0].content).toBe('A request');
  });
  it('accumulates delta then replaces it with the confirmed complete message once', () => {
    const first = appendAssistant([], 'assistant', 'First ');
    const next = appendAssistant(first, 'assistant', 'chunk');
    const complete = appendAssistant(next, 'assistant', 'Confirmed reply', true);
    expect(complete).toHaveLength(1);
    expect(complete[0].content).toBe('Confirmed reply');
  });
  it('does not clear text typed while an older send waits for its result', () => {
    expect(remainingDraft('New text', 'Sent text')).toBe('New text');
    expect(remainingDraft('Sent text', 'Sent text')).toBe('');
  });
});

import { mergeHistory, projectedText } from './hermes-display';
describe('reconnect history', () => {
  it('reconciles history without duplicating pending rows or dropping a newer live delta', () => {
    const local = appendAssistant(pendingMessage([], 'pending', 'Question'), 'live', 'Answer continued');
    const merged = mergeHistory(local, [
      { id: 'stored-user', role: 'user', content: 'Question' },
      { id: 'stored-answer', role: 'assistant', content: 'Answer' },
    ]);
    expect(merged).toHaveLength(2);
    expect(merged[1].content).toBe('Answer continued');
  });
  it('retains separate occurrences of repeated identical requests', () => {
    const local = pendingMessage(pendingMessage([], 'one', 'Again'), 'two', 'Again');
    const merged = mergeHistory(local, [
      { id: 'saved-one', role: 'user', content: 'Again' },
      { id: 'saved-two', role: 'user', content: 'Again' },
    ]);
    expect(merged).toHaveLength(2);
  });
  it('projects text parts while signalling attachments and rejects an unknown object shape', () => {
    expect(projectedText([{ type: 'text', text: 'A' }, { type: 'image' }])).toBe('A\n[Attachment]');
    expect(() => projectedText({ unexpected: true })).toThrow();
  });
});
import { afterDispatchResponse, removeApproval } from './hermes-display';
describe('dispatch and approval lifecycle', () => {
  it('keeps an accepted send pending until runtime activity, without undoing early completion', () => {
    expect(afterDispatchResponse('dispatching')).toBe('accepted');
    expect(afterDispatchResponse('running')).toBe('running');
    expect(afterDispatchResponse('completed')).toBe('completed');
  });
  it('removes only the approval explicitly cancelled by the runtime', () => {
    const requests = [{ requestId: 1 }, { requestId: '1' }];
    expect(removeApproval(requests, 1)).toEqual([{ requestId: '1' }]);
  });
});
import { restoreDraft } from './hermes-display';
it('retains a same-window newer draft or intentional clear while the older disk save lags', () => {
  expect(restoreDraft('Newest text', 'Old disk text')).toBe('Newest text');
  expect(restoreDraft('', 'Old disk text')).toBe('');
  expect(restoreDraft(null, 'Saved on disk')).toBe('Saved on disk');
});

import { mergeToolEvent } from './hermes-display';
describe('restored owned tool activity', () => {
  it('reconstructs saved start/complete cards without inventing outputs', () => {
    const started = mergeToolEvent([], { type: 'tool.start', payload: { tool_id: 'tool1', name: 'web_search', args: { query: 'Synthetic' } } });
    expect(started[0].complete).toBe(false);
    expect(started[0].result).toBeUndefined();
    const restored = mergeToolEvent(started, { type: 'tool.complete', payload: { tool_id: 'tool1', name: 'web_search', result_text: 'Bounded saved result' } });
    expect(restored[0].result).toBe('Bounded saved result');
    expect(restored[0].complete).toBe(true);
    expect(mergeToolEvent(restored, { type: 'tool.start', payload: { tool_id: 'tool1', name: 'web_search' } })).toEqual(restored);
  });
});
