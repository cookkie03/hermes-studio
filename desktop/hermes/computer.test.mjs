import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
  checkStaleSnapshot,
  truncatePayloadIfNeeded,
  ComputerManager,
} from './computer.mjs';

test('ComputerManager records capture/action receipts and rejects actions while human has control', () => {
  const connections = new EventEmitter();
  const computer = new ComputerManager({ connections });
  const capture = computer.recordCapture({
    connectionId: 'synthetic-host',
    threadId: 'thread-1',
    capture: { mode: 'ax', targetApp: 'Synthetic App', targetWindow: 'Main', textSummary: 'Ready' },
  });
  assert.equal(capture.mode, 'ax');
  assert.equal(computer.getCaptures({ connectionId: 'synthetic-host' }).length, 1);

  computer.setHumanControl({ connectionId: 'synthetic-host', humanHasControl: true });
  const denied = computer.recordAction({
    connectionId: 'synthetic-host',
    action: { id: 'action-1', toolId: 'tool-1', action: 'click', args: { x: 1, y: 2 }, status: 'approved' },
  });
  assert.equal(denied.status, 'denied');
  assert.match(denied.error, /Human has control/);
});

test('stale snapshots are detected by age and target window changes', () => {
  assert.equal(checkStaleSnapshot(Date.now() - 31_000, 'Main', 'Main'), true);
  assert.equal(checkStaleSnapshot(Date.now(), 'Other', 'Main'), true);
  assert.equal(checkStaleSnapshot(Date.now(), 'Main', 'Main'), false);
});

test('payloads over 64 KiB are summarized for the archive', () => {
  const small = truncatePayloadIfNeeded({ result_text: 'ok' });
  assert.equal(small.truncated, false);
  const large = truncatePayloadIfNeeded({ result_text: 'x'.repeat(70_000) });
  assert.equal(large.truncated, true);
  assert.equal(large.payload.originalLength > 65_536, true);
});

test('runtime computer tool events become activity and capture receipts', () => {
  const connections = new EventEmitter();
  const computer = new ComputerManager({ connections });
  connections.emit('update', {
    type: 'runtime',
    connectionId: 'local',
    threadId: 'thread-1',
    event: {
      type: 'tool.complete',
      payload: {
        name: 'computer_use',
        tool_id: 'tool-2',
        result: { mode: 'vision', base64: 'AAAA', window: 'Synthetic' },
      },
    },
  });
  // RuntimeConnections emits the wrapped runtime event; the manager also accepts it directly.
  assert.equal(computer.getActivity({ connectionId: 'local' }).length, 1);
  assert.equal(computer.getCaptures({ connectionId: 'local' }).length, 1);

  connections.emit('update', {
    type: 'tool.complete',
    connectionId: 'local',
    threadId: 'thread-1',
    payload: {
      name: 'computer_use',
      tool_id: 'tool-2',
      result: { mode: 'vision', base64: 'AAAA', window: 'Synthetic' },
    },
  });
  assert.equal(computer.getActivity({ connectionId: 'local' }).length, 1);
  assert.equal(computer.getCaptures({ connectionId: 'local' }).length, 2);
});
