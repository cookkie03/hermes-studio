import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { HermesMemoryManager, USER_MEMORY_CHAR_LIMIT, ASSISTANT_MEMORY_CHAR_LIMIT } from './memory.mjs';
import { buildCapabilityMatrix, HERMES_CAPABILITY_CATALOG } from './capability-matrix.mjs';

describe('F8 — Hermes Native Capabilities & Memory Observability', () => {
  it('formats profile memory status with correct budgets and character limits', async () => {
    const memoryManager = new HermesMemoryManager();
    const status = await memoryManager.getMemoryStatus({ connectionId: 'local', profile: 'default' });

    assert.equal(status.connectionId, 'local');
    assert.equal(status.profile, 'default');
    assert.equal(status.isOffline, true);
    assert.equal(status.isStale, true);

    const userBudget = status.budgets.find(b => b.category === 'user');
    const memoryBudget = status.budgets.find(b => b.category === 'memory');

    assert.equal(userBudget.charLimit, USER_MEMORY_CHAR_LIMIT);
    assert.equal(memoryBudget.charLimit, ASSISTANT_MEMORY_CHAR_LIMIT);
    assert.ok(status.byteSizeGapExplanation.includes('/api/memory reports on-disk file size in bytes'));
  });

  it('calculates memory usage percentages accurately from text content', () => {
    const memoryManager = new HermesMemoryManager();
    const mockRaw = {
      userContent: 'User prefers concise answers and autonomous updates.',
      memoryContent: 'Multi-node setup: MacBook (primary) and Debian Mini PC.',
      provider: 'builtin',
      curator: { enabled: true, statusText: 'Curator active' },
    };

    const formatted = memoryManager.formatMemoryStatus(mockRaw, { connectionId: 'local', profile: 'worker-1' });

    assert.equal(formatted.profile, 'worker-1');
    assert.equal(formatted.isOffline, false);
    assert.equal(formatted.curatorStatus.enabled, true);

    const userBudget = formatted.budgets.find(b => b.category === 'user');
    assert.ok(userBudget.currentChars > 0);
    assert.ok(userBudget.percentage > 0);

    const userEntry = formatted.entries.find(e => e.category === 'user');
    assert.ok(userEntry.provenance.includes('worker-1'));
  });

  it('builds capability matrix mapping all Hermes cards and surfaces', async () => {
    const matrix = await buildCapabilityMatrix({ connectionId: 'local', profile: 'default' });

    assert.equal(matrix.connectionId, 'local');
    assert.equal(matrix.gatewayVersion, '0.21.5');
    assert.ok(matrix.items.length >= 10);

    const f8Item = matrix.items.find(i => i.owningCard === 'F8');
    assert.ok(f8Item);
    assert.equal(f8Item.status, 'verified_studio');
    assert.equal(f8Item.category, 'memory');
  });

  it('extracts pending review proposals requiring /memory pending native resolution', () => {
    const mockBridge = {
      reviewReplay: new Map([
        ['thread-1', [{ id: 'note-1', text: 'Memory replacement pending. Use /memory pending to approve or discard.', runtimeSessionId: 'sess-1' }]],
      ]),
    };
    const mockConnections = {
      slots: new Map([['local', { bridge: mockBridge }]]),
    };

    const memoryManager = new HermesMemoryManager({ connections: mockConnections });
    const pending = memoryManager.getPendingReviews('local', 'default');

    assert.equal(pending.length, 1);
    assert.equal(pending[0].nativeInstruction, '/memory pending');
    assert.equal(pending[0].status, 'pending');
  });
});
