import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { CapabilitiesManager } from './capabilities.mjs';

class MockGateway extends EventEmitter {
  constructor() {
    super();
    this.connected = true;
    this.requests = [];
  }

  async request(method, params) {
    this.requests.push({ method, params });
    if (!this.connected) throw new Error('Hermes backend is offline.');
    if (method === 'tools.list') return { toolsets: [{ name: 'browser', description: 'Browser automation', tool_count: 2, enabled: true, tools: ['navigate', 'click'] }] };
    if (method === 'tools.show') return { sections: [{ name: 'browser', tools: [{ name: 'navigate', description: 'Open a URL' }] }], total: 1 };
    if (method === 'plugins.manage') return { plugins: [{ name: 'telegram-bot', key: 'telegram-bot', version: '1.2.0', description: 'Telegram bot', source: 'catalog', status: 'active', portable: true, has_desktop_half: true, servers: [{ name: 'telegram-mcp', state: 'connected', sentence: 'Connected' }] }], user_count: 1, bundled_count: 0 };
    if (method === 'skills.manage') return { skills: { devops: ['disk-cleanup'], productivity: ['pdf'] } };
    throw new Error(`Unexpected gateway RPC call: ${method}`);
  }
}

test('CapabilitiesManager uses only native scoped catalog calls', async () => {
  const gateway = new MockGateway();
  const manager = new CapabilitiesManager({ gateway });
  const snapshot = await manager.snapshot({ connectionId: 'mac', profile: 'default', sessionId: 'owned-session' });

  assert.equal(snapshot.connectionId, 'mac');
  assert.equal(snapshot.tools.total, 1);
  assert.equal(snapshot.plugins.plugins[0].status, 'active');
  assert.deepEqual(snapshot.skills.skills.devops, ['disk-cleanup']);
  const calls = Object.fromEntries(gateway.requests.map(({ method, params }) => [method, params]));
  assert.deepEqual(calls['tools.list'], { session_id: 'owned-session' });
  assert.deepEqual(calls['tools.show'], { session_id: 'owned-session' });
  assert.deepEqual(calls['plugins.manage'], { action: 'list', profile: 'default' });
  assert.deepEqual(calls['skills.manage'], { action: 'list', profile: 'default' });
});

test('CapabilitiesManager keeps standalone profile catalogs separate from session catalogs', async () => {
  const gateway = new MockGateway();
  const manager = new CapabilitiesManager({ gateway });

  const plugins = await manager.listPlugins({ profile: 'profile-a' });
  const skills = await manager.listSkills({ profile: 'profile-a' });
  assert.equal(plugins.plugins.length, 1);
  assert.deepEqual(skills.skills.productivity, ['pdf']);
  assert.deepEqual(gateway.requests[0], { method: 'plugins.manage', params: { action: 'list', profile: 'profile-a' } });
  assert.deepEqual(gateway.requests[1], { method: 'skills.manage', params: { action: 'list', profile: 'profile-a' } });
});

test('CapabilitiesManager reports unavailable hosts rather than fabricating a catalog', async () => {
  const offline = new MockGateway();
  offline.connected = false;
  await assert.rejects(new CapabilitiesManager({ gateway: offline }).snapshot(), /Hermes backend is offline/);

  const unavailable = new CapabilitiesManager({ connections: { slots: new Map() } });
  await assert.rejects(unavailable.listToolsets(), /offline or backend is unreachable/);
});
