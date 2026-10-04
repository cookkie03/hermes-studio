import { expect, it } from 'vitest';
import { ConversationSubmission } from './conversation-submission';

it('does not dispatch a saved-page prompt after leaving its conversation', async () => {
  const submission = new ConversationSubmission();
  let saved!: () => void;
  const saving = new Promise<void>(resolve => { saved = resolve; });
  const sent: string[] = [];
  const result = submission.send({ prepare: () => saving, canSend: () => true,
    dispatch: async () => { sent.push('Synthetic prompt'); } });
  submission.close();
  saved();
  expect(await result).toEqual({ status: 'stale' });
  expect(sent).toEqual([]);
});

it('blocks a second send while the first dispatch response is delayed', async () => {
  const submission = new ConversationSubmission();
  let accepted!: () => void;
  const response = new Promise<void>(resolve => { accepted = resolve; });
  const sent: string[] = [];
  const options = { prepare: async () => undefined, canSend: () => true,
    dispatch: async () => { sent.push('Synthetic prompt'); await response; } };
  const first = submission.send(options);
  await Promise.resolve();
  expect(await submission.send(options)).toEqual({ status: 'busy' });
  accepted();
  expect(await first).toEqual({ status: 'sent' });
  expect(sent).toEqual(['Synthetic prompt']);
});

it('rechecks runtime availability after saving before dispatch', async () => {
  const submission = new ConversationSubmission();
  let connected = true;
  const sent: string[] = [];
  expect(await submission.send({ canSend: () => connected,
    prepare: async () => { connected = false; }, dispatch: async () => { sent.push('Synthetic'); } }))
    .toEqual({ status: 'blocked' });
  expect(sent).toEqual([]);
});

it('blocks preparation completion when runtime work starts before a render', async () => {
  const submission = new ConversationSubmission();
  let finishSave!: () => void;
  const saving = new Promise<void>(resolve => { finishSave = resolve; });
  let phase = 'idle';
  const sent: string[] = [];
  const result = submission.send({ canSend: () => phase === 'idle', prepare: () => saving,
    dispatch: async () => { sent.push('Synthetic prompt'); } });
  phase = 'running'; finishSave();
  expect(await result).toEqual({ status: 'blocked' });
  expect(sent).toEqual([]);
});

it('reports delivery uncertainty separately from a save failure and allows explicit retry', async () => {
  const submission = new ConversationSubmission();
  const cause = new Error('Synthetic write failure');
  expect(await submission.send({ canSend: () => true, prepare: async () => { throw cause; },
    dispatch: async () => undefined })).toEqual({ status: 'error', stage: 'prepare', cause });
  expect(await submission.send({ canSend: () => true, prepare: async () => undefined,
    dispatch: async () => { throw cause; } })).toEqual({ status: 'error', stage: 'dispatch', cause });
});

it('ignores a delayed dispatch result after leaving without cancelling runtime work', async () => {
  const submission = new ConversationSubmission();
  let accepted!: () => void;
  const response = new Promise<void>(resolve => { accepted = resolve; });
  const result = submission.send({ prepare: async () => undefined, canSend: () => true, dispatch: () => response });
  await Promise.resolve();
  submission.close(); accepted();
  expect(await result).toEqual({ status: 'stale' });
});
