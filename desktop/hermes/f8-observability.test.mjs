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

    assert.equal(userBudget.charLimit, null);
    assert.equal(memoryBudget.charLimit, null);
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
    assert.equal(userBudget.percentage, null);

    const userEntry = formatted.entries.find(e => e.category === 'user');
    assert.ok(userEntry.provenance.includes('worker-1'));
  });

  it('builds capability matrix mapping all Hermes cards and surfaces', async () => {
    const matrix = await buildCapabilityMatrix({ connectionId: 'local', profile: 'default' });

    assert.equal(matrix.connectionId, 'local');
    assert.equal(matrix.gatewayVersion, undefined);
    assert.equal(matrix.hostState, 'offline');
    assert.ok(matrix.items.length >= 10);

    const f8Item = matrix.items.find(i => i.owningCard === 'F8');
    assert.ok(f8Item);
    assert.equal(f8Item.status, 'unavailable_gap');
    assert.equal(f8Item.category, 'memory');
  });

  it('extracts pending review proposals requiring /memory pending native resolution', () => {
    const mockBridge = {
      bindings: new Map([['thread-1',{profile:'default',reviewNotes:[{id:'note-1',text:'Memory replacement pending. Use /memory pending to approve or discard.',runtimeSessionId:'sess-1'}]}]]),
      reviewReplay: new Map([['thread-1',{state:'unavailable',message:'Replay is unavailable'}]]),
    };
    const mockConnections = {
      slots: new Map([['local', { bridge: mockBridge }]]),
    };

    const memoryManager = new HermesMemoryManager({ connections: mockConnections });
    const pending = memoryManager.getPendingReviews('local', 'default');

    assert.equal(pending.length, 1);
    assert.equal(pending[0].nativeInstruction, '/memory pending');
    assert.equal(pending[0].status, 'review-note');
  });
});

 it('native memory metadata does not invent empty content or known character budgets', async()=>{
  const gateway={connected:true,http:async(path)=>({active:'builtin',providers:[],builtin_files:{user:123,memory:456}})};
  const manager=new HermesMemoryManager({gateway});const status=await manager.getMemoryStatus({profile:'qa'});
  assert.equal(status.available,true);assert.equal(status.contentAvailable,false);assert.equal(status.budgets[0].currentChars,null);assert.equal(status.budgets[0].rawSizeBytes,123);
 });
 it('unsupported memory endpoint remains unavailable rather than fresh empty memory',async()=>{
  const manager=new HermesMemoryManager({gateway:{connected:true,http:async()=>{throw Error('Unsupported HTTP route');}}});
  const status=await manager.getMemoryStatus({profile:'qa'});assert.equal(status.available,false);assert.equal(status.isStale,true);assert.match(status.reason,/Unsupported/);
 });
