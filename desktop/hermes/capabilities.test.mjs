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

    if (method === 'tools.list' || method === 'toolsets.list') {
      return {
        toolsets: [
          { name: 'browser', description: 'Browser automation toolset', tool_count: 5, enabled: true, tools: ['navigate', 'click', 'type'] },
          { name: 'terminal', description: 'Terminal command toolset', tool_count: 3, enabled: false, tools: ['exec'] },
        ],
      };
    }

    if (method === 'tools.show') {
      return {
        sections: [
          {
            name: 'browser',
            tools: [
              { name: 'navigate', description: 'Open URL' },
              { name: 'click', description: 'Click selector' },
            ],
          },
        ],
        total: 2,
      };
    }

    if (method === 'tools.configure') {
      return {
        changed: params.names,
        enabled_toolsets: params.action === 'enable' ? params.names : [],
        missing_servers: [],
        reset: false,
        unknown: [],
      };
    }

    if (method === 'plugins.manage') {
      if (params.action === 'list') {
        return {
          plugins: [
            {
              name: 'telegram-bot',
              key: 'telegram-bot',
              version: '1.2.0',
              description: 'Telegram bot interface',
              source: 'catalog',
              status: 'active',
              portable: true,
              install_dir: '/plugins/telegram-bot',
              has_desktop_half: true,
              servers: [{ name: 'telegram-mcp', state: 'connected', sentence: 'Connected' }],
              update_available: false,
            },
          ],
          user_count: 1,
          bundled_count: 0,
        };
      }
      if (params.action === 'toggle') {
        return {
          ok: true,
          name: params.name || params.key,
          restart_required: false,
        };
      }
      if (params.action === 'update') {
        if (!params.accept_capabilities) {
          return {
            ok: false,
            consent_required: true,
            delta: { permissions: ['network.listen', 'fs.write'] },
            delta_lines: ['Adds network listening capability', 'Adds file system write access'],
          };
        }
        return {
          ok: true,
          sha: 'abcdef1234567890',
        };
      }
      if (params.action === 'settings') {
        return {
          ok: true,
          name: params.name || params.key,
        };
      }
    }

    if (method === 'skills.manage') {
      if (params.action === 'list') {
        return {
          skills: {
            devops: ['git-lfs-operations', 'disk-cleanup'],
            productivity: ['pdf', 'docx'],
          },
        };
      }
    }

    if (method === 'skills.reload') {
      return {
        output: 'Reloaded 4 skills.',
        result: {
          added: [{ name: 'new-skill', description: 'A new skill' }],
          removed: [],
          unchanged: ['git-lfs-operations', 'disk-cleanup'],
          total: 3,
          commands: 3,
        },
      };
    }

    throw new Error(`Unexpected gateway RPC call: ${method}`);
  }
}

test('CapabilitiesManager lists toolsets and show tools', async () => {
  const gateway = new MockGateway();
  const mgr = new CapabilitiesManager({ gateway });

  const toolsets = await mgr.listToolsets({ profile: 'dev' });
  assert.equal(toolsets.toolsets.length, 2);
  assert.equal(toolsets.toolsets[0].name, 'browser');
  assert.equal(gateway.requests[0].method, 'tools.list');
  assert.equal(gateway.requests[0].params.profile, 'dev');

  const tools = await mgr.showTools();
  assert.equal(tools.total, 2);
  assert.equal(gateway.requests[1].method, 'tools.show');
});

test('CapabilitiesManager configures tools with validation', async () => {
  const gateway = new MockGateway();
  const mgr = new CapabilitiesManager({ gateway });

  await assert.rejects(mgr.configureTools({ action: 'invalid', names: ['browser'] }), /Invalid action/);
  await assert.rejects(mgr.configureTools({ action: 'enable', names: [] }), /cannot be empty/);

  const res = await mgr.configureTools({ action: 'enable', names: ['browser'] });
  assert.deepEqual(res.changed, ['browser']);
  assert.equal(gateway.requests[0].method, 'tools.configure');
  assert.equal(gateway.requests[0].params.action, 'enable');
});

test('CapabilitiesManager plugin management and capability delta consent', async () => {
  const gateway = new MockGateway();
  const mgr = new CapabilitiesManager({ gateway });

  const list = await mgr.listPlugins();
  assert.equal(list.plugins.length, 1);
  assert.equal(list.plugins[0].name, 'telegram-bot');

  const toggle = await mgr.managePlugin({ action: 'toggle', name: 'telegram-bot', enable: false });
  assert.equal(toggle.ok, true);

  // Update without accept_capabilities yields consent_required
  const updateReq = await mgr.managePlugin({ action: 'update', name: 'telegram-bot' });
  assert.equal(updateReq.ok, false);
  assert.equal(updateReq.consent_required, true);
  assert.ok(updateReq.delta.permissions.includes('network.listen'));

  // Update with accept_capabilities succeeds
  const updateConsent = await mgr.managePlugin({ action: 'update', name: 'telegram-bot', accept_capabilities: true });
  assert.equal(updateConsent.ok, true);
});

test('CapabilitiesManager skills list and reload', async () => {
  const gateway = new MockGateway();
  const mgr = new CapabilitiesManager({ gateway });

  const skills = await mgr.listSkills();
  assert.ok(skills.skills.devops.includes('git-lfs-operations'));

  const reloaded = await mgr.reloadSkills();
  assert.equal(reloaded.result.total, 3);
  assert.equal(reloaded.result.added[0].name, 'new-skill');
});

test('CapabilitiesManager rejects invalid actions and handles offline gateway', async () => {
  const gateway = new MockGateway();
  gateway.connected = false;
  const mgr = new CapabilitiesManager({ gateway });

  await assert.rejects(mgr.listToolsets(), /Hermes backend is offline/);

  const mgrOfflineConn = new CapabilitiesManager({ connections: { slots: new Map() } });
  await assert.rejects(mgrOfflineConn.listToolsets({ connectionId: 'local' }), /offline or backend is unreachable/);

  const mgrOnline = new CapabilitiesManager({ gateway: new MockGateway() });
  await assert.rejects(mgrOnline.managePlugin({ action: 'unknown_action' }), /Invalid plugin action/);
});
