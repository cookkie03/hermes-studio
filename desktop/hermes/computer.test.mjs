import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import {
  checkStaleSnapshot,
  truncatePayloadIfNeeded,
  ComputerManager,
} from './computer.mjs';

test('ComputerManager rejects unsupported takeover and preserves native completed outcomes', () => {
  const connections = new EventEmitter();
  const computer = new ComputerManager({ connections });
  const capture = computer.recordCapture({
    connectionId: 'synthetic-host',
    threadId: 'thread-1',
    capture: { mode: 'ax', targetApp: 'Synthetic App', targetWindow: 'Main', textSummary: 'Ready' },
  });
  assert.equal(capture.mode, 'ax');
  assert.equal(computer.getCaptures({ connectionId: 'synthetic-host' }).length, 1);

  assert.throws(() => computer.setHumanControl({ connectionId: 'synthetic-host', humanHasControl: true }), /not supported/i);
  assert.equal(computer.getLease({ connectionId: 'synthetic-host' }).humanHasControl, false);
  const completed = computer.recordAction({
    connectionId: 'synthetic-host',
    action: { id: 'action-1', toolId: 'tool-1', action: 'click', args: { x: 1, y: 2 }, status: 'succeeded', result: { done: true } },
  });
  assert.equal(completed.status, 'succeeded');
  assert.equal(completed.error, undefined);
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
  assert.equal(computer.getCaptures({ connectionId: 'local' }).length, 1);
});

test('native receipts retain action identity, recognize failure, and isolate conversations', () => {
  const connections = new EventEmitter();
  connections.threadHost = id => ({connectionId:'remote',name:'QA host'});
  connections.forThread = () => ({sessions:new Map([['a',{info:{profile_name:'qa'}}]])});
  connections.statusFor = () => ({connected:true,name:'QA host'});
  const computer = new ComputerManager({connections});
  const emit = (type,result) => connections.emit('update',{type:'runtime',connectionId:'remote',threadId:'a',event:{type,payload:{name:'computer_use',tool_id:'native-tool',args:{action:'click',coordinate:[5,6]},result}}});
  emit('tool.start'); const start = computer.getActivity({threadId:'a'})[0];
  emit('tool.complete',{ok:false,error:'paused'}); const end = computer.getActivity({threadId:'a'})[0];
  assert.equal(end.id,start.id); assert.equal(end.createdAt,start.createdAt); assert.equal(end.action,'click'); assert.deepEqual(end.args.coordinate,[5,6]); assert.equal(end.status,'failed'); assert.equal(end.error,'paused');
  emit('tool.complete',{mode:'ax',app:'QA app',window_title:'QA window',elements:[{id:1}],summary:'Actual snapshot',screenshot_path:'/remote/capture.png'});
  const capture = computer.getCaptures({threadId:'a'})[0]; assert.equal(capture.targetWindow,'QA window'); assert.equal(capture.textSummary,'Actual snapshot'); assert.equal(capture.imageUrl,null);
  assert.equal(computer.getTarget({threadId:'a'}).profile,'qa'); assert.deepEqual(computer.getTarget({threadId:'a'}).modes,['ax']);
  assert.equal(computer.getCaptures({threadId:'b'}).length,0); assert.equal(computer.getActivity({threadId:'b'}).length,0);
  emit('tool.complete',{_multimodal:true,meta:{mode:'vision'},content:[{type:'image_url',image_url:{url:'data:image/png;base64,AAAA'}},{type:'text',text:'Vision snapshot'}],text_summary:'Native vision'});
  assert.equal(computer.getCaptures({threadId:'a'})[0].imageUrl,'data:image/png;base64,AAAA');
});
