import test from 'node:test';
import assert from 'node:assert/strict';
import { CollaborationManager } from './collaboration.mjs';

test('Subagents lifecycle: spawn, list, tail, steer, interrupt', async () => {
  const manager = new CollaborationManager();

  // 1. Spawn child subagent
  const task = await manager.spawnSubagent({
    parentId: 'thread-parent-101',
    goal: 'Analyze financial dataset in Space',
    context: 'Use Python pandas and generate report',
    model: 'auto/fast',
    effort: 'High',
  });

  assert.equal(task.parentId, 'thread-parent-101');
  assert.equal(task.status, 'working');
  assert.ok(task.id.startsWith('subagent-'));
  assert.ok(task.subagentId.startsWith('child-'));

  // 2. List subagents
  const list = await manager.listSubagents('thread-parent-101');
  assert.equal(list.length, 1);
  assert.equal(list[0].id, task.id);

  // 3. Tail output
  const tailData = await manager.getSubagentTail(task.id, 100);
  assert.equal(tailData.id, task.id);
  assert.ok(tailData.tail.includes('Goal: Analyze financial dataset'));

  // 4. Steer subagent
  const steered = await manager.steerSubagent(task.id, 'Focus on Q3 revenue charts only.');
  assert.equal(steered.status, 'working');
  assert.ok(steered.output.includes('[STEER DIRECTIVE]: Focus on Q3 revenue charts only.'));

  // 5. Interrupt subagent
  const interrupted = await manager.interruptSubagent(task.id);
  assert.equal(interrupted.status, 'interrupted');
  assert.ok(interrupted.output.includes('[INTERRUPTED]'));

  // Steering an interrupted subagent must throw an error
  await assert.rejects(
    () => manager.steerSubagent(task.id, 'Try again'),
    /is already in state 'interrupted'/
  );
});

test('Bot messaging: DM handoff, delivery receipt, and status lifecycle', async () => {
  const manager = new CollaborationManager();

  // 1. Send bot message (message_agent)
  const msg = await manager.sendBotMessage({
    fromProfile: 'product-manager',
    toProfile: 'cto',
    fromDotId: 'dot-pm',
    toDotId: 'dot-cto',
    threadId: 'finance-thread',
    content: 'Please review the backend database schema for Space Finance.',
  });

  assert.equal(msg.status, 'queued'); // Ack queued is a handoff, not a receipt
  assert.ok(msg.deliveryId.startsWith('deliv-'));
  assert.equal(msg.fromProfile, 'product-manager');
  assert.equal(msg.toProfile, 'cto');

  // List bot messages
  const messages = await manager.listBotMessages({ threadId: 'finance-thread' });
  assert.equal(messages.length, 1);

  // Overlong message validation (>16k chars)
  const hugeText = 'x'.repeat(16001);
  await assert.rejects(
    () => manager.sendBotMessage({ content: hugeText }),
    /exceeds maximum length of 16,000 characters/
  );

  // Test simulated failure
  const failMsg = await manager.sendBotMessage({
    content: 'Test message for failure handling',
    simulateFailure: true,
  });
  assert.equal(failMsg.status, 'queued');

  // Wait briefly for async status updates
  await new Promise((r) => setTimeout(r, 120));
  const updatedFailMsg = (await manager.listBotMessages()).find((m) => m.id === failMsg.id);
  assert.equal(updatedFailMsg.status, 'failed');
  assert.ok(updatedFailMsg.error.includes('Delivery failed'));
});

test('Hosted rooms and event log sequence numbers', async () => {
  const manager = new CollaborationManager();

  // 1. Create hosted room
  const room = await manager.createRoom({
    roomId: 'room-architecture',
    name: 'Architecture Alignment',
    members: ['pm', 'cto', 'lead-dev'],
  });

  assert.equal(room.roomId, 'room-architecture');
  assert.equal(room.state, 'active');

  // 2. Send room events
  const evt1 = await manager.sendRoomEvent('room-architecture', {
    fromProfile: 'pm',
    payload: { action: 'propose_spec', title: 'F14 Collaboration' },
  });
  const evt2 = await manager.sendRoomEvent('room-architecture', {
    fromProfile: 'cto',
    payload: { action: 'approve_spec', title: 'F14 Collaboration' },
  });

  assert.equal(evt1.seq, 1);
  assert.equal(evt2.seq, 2);

  // 3. Get room log
  const log = await manager.getRoomLog('room-architecture');
  assert.equal(log.length, 2);
  assert.equal(log[0].seq, 1);
  assert.equal(log[1].seq, 2);

  // 4. Test sinceSeq filter
  const partialLog = await manager.getRoomLog('room-architecture', { sinceSeq: 1 });
  assert.equal(partialLog.length, 1);
  assert.equal(partialLog[0].seq, 2);
});

test('Session search recall across profiles', async () => {
  const manager = new CollaborationManager();

  await manager.sendBotMessage({
    fromProfile: 'researcher',
    toProfile: 'analyst',
    threadId: 'research-thread-01',
    content: 'The macro economics study note synthesizes lab code and lecture slides.',
  });

  await manager.createRoom({ roomId: 'room-study', name: 'Study Group' });
  await manager.sendRoomEvent('room-study', {
    fromProfile: 'researcher',
    payload: 'Discussion on lecture synthesis notes.',
  });

  // Search recall with query
  const results = await manager.searchRecall({ query: 'synthesizes' });
  assert.ok(results.length > 0);
  assert.equal(results[0].profile, 'researcher');
  assert.ok(results[0].snippet.includes('synthesizes'));

  // Search recall with profile filter
  const profileResults = await manager.searchRecall({ profile: 'researcher' });
  assert.ok(profileResults.length >= 2);
});

test('D38 Space profile project link resolution', async () => {
  const manager = new CollaborationManager();

  // Missing link default
  const link1 = await manager.getSpaceLink({ spaceId: 'space-finance', profile: 'cto' });
  assert.equal(link1.status, 'missing');
  assert.equal(link1.projectId, null);

  // Create explicit link
  const created = await manager.createSpaceLink({
    spaceId: 'space-finance',
    profile: 'cto',
    projectId: 'proj-cto-finance',
    host: 'Debian Mini PC',
  });

  assert.equal(created.status, 'linked');
  assert.equal(created.projectId, 'proj-cto-finance');

  // Verify retrieval
  const link2 = await manager.getSpaceLink({ spaceId: 'space-finance', profile: 'cto' });
  assert.equal(link2.status, 'linked');
  assert.equal(link2.projectId, 'proj-cto-finance');
});
