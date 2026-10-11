import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStudioApp } from './server.mjs';

class MockGateway extends EventEmitter {
  connected = true;
  calls = [];
  disconnect() {}
  async request(method, params) {
    this.calls.push({ method, params });
    return {};
  }
}

test('Collaboration and delegation API endpoints (F14)', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'hermes-collab-'));
  const ownerToken = 'synthetic-owner-token-with-enough-length';
  const gateway = new MockGateway();
  const service = await createStudioApp({ dataDir, ownerToken, gateway });

  const request = (path, method = 'GET', body) =>
    service.app.request(`http://127.0.0.1${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${ownerToken}`,
        'Content-Type': 'application/json',
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  try {
    // 1. Subagent endpoints
    const spawnRes = await request('/api/hermes/collaboration/subagents', 'POST', {
      parentId: 'thread-test-1',
      goal: 'Audit financial records in space',
      context: 'Read accounts.csv',
      model: 'auto/fast',
    });
    assert.equal(spawnRes.status, 200);
    const subagent = await spawnRes.json();
    assert.ok(subagent.id.startsWith('subagent-'));
    assert.equal(subagent.status, 'working');

    const tailRes = await request(`/api/hermes/collaboration/subagents/${subagent.id}/tail?maxBytes=500`);
    assert.equal(tailRes.status, 200);
    const tailData = await tailRes.json();
    assert.equal(tailData.id, subagent.id);
    assert.ok(tailData.tail.includes('Audit financial records'));

    const steerRes = await request(`/api/hermes/collaboration/subagents/${subagent.id}/steer`, 'POST', {
      message: 'Focus on 2026 data.',
    });
    assert.equal(steerRes.status, 200);
    const steered = await steerRes.json();
    assert.ok(steered.output.includes('Focus on 2026 data.'));

    const interruptRes = await request(`/api/hermes/collaboration/subagents/${subagent.id}/interrupt`, 'POST');
    assert.equal(interruptRes.status, 200);
    const interrupted = await interruptRes.json();
    assert.equal(interrupted.status, 'interrupted');

    // 2. Bot messaging endpoints (F14 D36 Dot-to-Dot)
    const sendMsgRes = await request('/api/hermes/collaboration/messages', 'POST', {
      fromProfile: 'product-manager',
      toProfile: 'cto',
      fromDotId: 'dot-pm',
      toDotId: 'dot-cto',
      threadId: 'thread-test-1',
      content: 'Can you verify the deployment status?',
    });
    assert.equal(sendMsgRes.status, 200);
    const msg = await sendMsgRes.json();
    assert.equal(msg.status, 'queued'); // Ack is queued handoff
    assert.ok(msg.deliveryId.startsWith('deliv-'));

    const listMsgRes = await request('/api/hermes/collaboration/messages?threadId=thread-test-1');
    assert.equal(listMsgRes.status, 200);
    const msgs = await listMsgRes.json();
    assert.equal(msgs.length, 1);
    assert.equal(msgs[0].id, msg.id);

    // 3. Hosted room endpoints
    const roomRes = await request('/api/hermes/collaboration/rooms', 'POST', {
      roomId: 'room-strategy',
      name: 'Strategy Team',
      members: ['pm', 'cto'],
    });
    assert.equal(roomRes.status, 200);
    const room = await roomRes.json();
    assert.equal(room.roomId, 'room-strategy');

    const eventRes = await request('/api/hermes/collaboration/rooms/room-strategy/events', 'POST', {
      fromProfile: 'pm',
      payload: { agenda: 'Review Q4 targets' },
    });
    assert.equal(eventRes.status, 200);
    const evt = await eventRes.json();
    assert.equal(evt.seq, 1);

    const logRes = await request('/api/hermes/collaboration/rooms/room-strategy/events');
    assert.equal(logRes.status, 200);
    const log = await logRes.json();
    assert.equal(log.length, 1);

    // 4. Recall endpoint
    const recallRes = await request('/api/hermes/collaboration/recall?query=deployment');
    assert.equal(recallRes.status, 200);
    const recallResults = await recallRes.json();
    assert.ok(recallResults.length > 0);
    assert.ok(recallResults[0].snippet.includes('deployment'));

    // 5. Space link endpoint (D38)
    const getLinkRes = await request('/api/hermes/collaboration/space-link?spaceId=space-finance&profile=cto');
    assert.equal(getLinkRes.status, 200);
    const missingLink = await getLinkRes.json();
    assert.equal(missingLink.status, 'missing');

    const postLinkRes = await request('/api/hermes/collaboration/space-link', 'POST', {
      spaceId: 'space-finance',
      profile: 'cto',
      projectId: 'proj-cto-finance',
      host: 'This Mac',
    });
    assert.equal(postLinkRes.status, 200);
    const createdLink = await postLinkRes.json();
    assert.equal(createdLink.status, 'linked');
    assert.equal(createdLink.projectId, 'proj-cto-finance');

    const verifiedLinkRes = await request('/api/hermes/collaboration/space-link?spaceId=space-finance&profile=cto');
    const verifiedLink = await verifiedLinkRes.json();
    assert.equal(verifiedLink.status, 'linked');
  } finally {
    service.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});
