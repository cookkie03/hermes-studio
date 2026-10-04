import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HermesBridge } from './bridge.mjs';
import { DraftStore } from './drafts.mjs';
import { HermesGateway, localEndpoint, candidates } from './gateway.mjs';

class FixtureGateway extends EventEmitter {
  constructor() { super(); this.connected = true; this.calls = []; this.replies = []; this.resumeRunning = false; }
  async connect(endpoint, options) { this.connectOptions = options; this.connected = true; this.endpoint = endpoint; return { connected: true, endpoint }; }
  disconnect() { this.connected = false; }
  async request(method, params) {
    this.calls.push({ method, params });
    if (method === 'session.create' || method === 'session.resume') {
      await new Promise(resolve => setTimeout(resolve, 5));
      return { session_id: 'live-id', stored_session_id: 'saved-id', running: this.resumeRunning, status: this.resumeRunning ? 'streaming' : 'idle', messages: [{ role: 'assistant', content: 'Earlier result' }] };
    }
    if (method === 'prompt.submit') return new Promise(resolve => { this.finishSubmit = resolve; });
    return { interrupted: true };
  }
  respond(id, result, error) { this.replies.push({ id, result, error }); }
}
const ownThread = id => { if (!['a', 'b'].includes(id)) throw new Error('Conversation is not owned.'); };

test('a delayed admission cannot regress working or change the next turn', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway }), updates = [];
  bridge.on('update', event => updates.push(event));
  try {
    await bridge.send('a', 'First synthetic request', 'first');
    const firstAdmission = gateway.finishSubmit;
    gateway.emit('event', { type: 'message.delta', session_id: 'live-id', payload: { text: 'Streaming' } });
    firstAdmission({ admitted: true }); await new Promise(resolve => setImmediate(resolve));
    assert.equal(updates.filter(event => event.type === 'turn').at(-1).status, 'running');
    gateway.emit('event', { type: 'message.complete', session_id: 'live-id', payload: { text: 'Done' } });
    await bridge.send('a', 'Second synthetic request', 'second');
    const secondAdmission = gateway.finishSubmit;
    gateway.emit('event', { type: 'message.complete', session_id: 'live-id', payload: { text: 'Done again' } });
    await bridge.send('a', 'Third synthetic request', 'third');
    const count = updates.length;
    secondAdmission({ admitted: true }); await new Promise(resolve => setImmediate(resolve));
    assert.equal(updates.length, count);
    assert.equal((await bridge.history('a')).messages.find(message => message.id === 'second').metadata.delivery, 'acknowledged');
  } finally { bridge.close(); }
});

test('connect is attach-only, never creates a session or sends a prompt', async () => {
  const gateway = new FixtureGateway(); const bridge = new HermesBridge({ gateway });
  await bridge.connect({ endpoint: 'http://127.0.0.1:8400', serverRequests: true });
  assert.deepEqual(gateway.connectOptions, { serverRequests: false });
  assert.deepEqual(gateway.calls, [{ method: 'client.capabilities', params: { server_requests: false } }]);
});
test('concurrent user submits reserve the turn before session creation; duplicates reuse local identity', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway, requireThread: ownThread });
  const first = bridge.send('a', 'A synthetic question', 'client-1');
  const duplicate = bridge.send('a', 'A synthetic question', 'client-1');
  await assert.rejects(bridge.send('a', 'Different question', 'client-2'), /active or uncertain/);
  const [one, two] = await Promise.all([first, duplicate]); assert.deepEqual(one, two);
  assert.equal(gateway.calls.filter(call => call.method === 'session.create').length, 1);
  assert.equal(gateway.calls.filter(call => call.method === 'prompt.submit').length, 1);
  await assert.rejects(bridge.send('a', 'Different text', 'client-1'), /different content/);
});
test('acknowledgement is not completion; runtime events and full tool payloads remain authoritative', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway }), updates = [];
  bridge.on('update', event => updates.push(event)); await bridge.send('a', 'Synthetic');
  assert.equal(updates.at(-1).status, 'dispatching');
  gateway.finishSubmit({ admitted: true }); await new Promise(resolve => setImmediate(resolve));
  assert.equal(updates.at(-1).status, 'accepted'); assert.equal((await bridge.history('a')).running, true);
  const tool = { tool_id: 'tool-1', name: 'terminal', args: { command: 'synthetic' }, future_field: { kept: true } };
  gateway.emit('event', { type: 'tool.start', session_id: 'live-id', payload: tool });
  assert.deepEqual(updates.at(-1).event.payload, tool);
  gateway.emit('event', { type: 'message.complete', session_id: 'live-id', payload: { text: 'Confirmed result', status: 'complete' } });
  const history = await bridge.history('a'); assert.equal(history.running, false); assert.equal(history.messages.at(-1).content, 'Confirmed result');
});
test('unowned sessions and unknown global events cannot leak to renderer or mutate history', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway }), updates = [];
  await bridge.session('a'); bridge.on('update', event => updates.push(event));
  for (const type of ['message.delta', 'message.complete', 'tool.start', 'tool.complete']) gateway.emit('event', { type, session_id: 'unowned-private-session', payload: { text: 'Must not escape', status: 'complete' } });
  gateway.emit('event', { type: 'private.unknown', payload: { text: 'Must not escape' } });
  assert.deepEqual(updates, []); assert.equal((await bridge.history('a')).messages.length, 1);
});
test('approval replies use RPC identity; stale, duplicate and invented choices are rejected', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway }); await bridge.session('a');
  const frame = { id: 'rpc-approval', method: 'approval', params: { request_id: 'queue-entry', gateway_session_id: 'live-id', choices: ['once', 'deny'], command: 'synthetic' } };
  gateway.emit('request', frame); assert.equal(gateway.replies.length, 0);
  assert.throws(() => bridge.approval('rpc-approval', { choice: 'always' }), /offered/);
  bridge.approval('rpc-approval', { choice: 'once' }); assert.equal(gateway.replies[0].id, 'rpc-approval');
  assert.throws(() => bridge.approval('rpc-approval', { choice: 'once' }), /no longer open/);
  gateway.emit('request', frame);
  gateway.emit('event', { type: 'request.cancel', payload: { id: 'rpc-approval', method: 'approval', reason: 'resolved' } });
  assert.throws(() => bridge.approval('rpc-approval', { choice: 'once' }), /no longer open/);
  gateway.emit('request', { ...frame, id: 'unowned', params: { ...frame.params, gateway_session_id: 'private' } });
  assert.equal(bridge.requests.size, 0); assert.equal(gateway.replies.at(-1).error.code, -32602);
});
test('stored identity survives relaunch and refresh reconciles real runtime running phase', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'hermes-bridge-'));
  try {
    const bindingPath = join(directory, 'sessions.json'), gateway = new FixtureGateway();
    const first = new HermesBridge({ gateway, bindingPath }); await first.session('a');
    const second = new HermesBridge({ gateway, bindingPath }); await second.initialize();
    await assert.rejects(second.session('a', { storedId: 'personal-archive' }), /owned session/);
    gateway.resumeRunning = true;
    assert.equal((await second.history('a')).running, true);
    assert.equal(gateway.calls.at(-1).params.session_id, 'saved-id');
    gateway.resumeRunning = false;
    assert.equal((await second.history('a', { refresh: true })).running, false);
    assert.equal((await readFile(bindingPath, 'utf8')).includes('saved-id'), true);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('drafts survive origin changes/relaunch and concurrent writes do not lose other threads', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'hermes-drafts-'));
  try {
    const path = join(directory, 'drafts.json'), first = new DraftStore(path); await first.initialize();
    await Promise.all([first.save('a', 'Caffè\nFirst line'), first.save('b', 'Second draft')]);
    const reopened = new DraftStore(path); await reopened.initialize(); assert.equal(reopened.get('a').draft, 'Caffè\nFirst line'); assert.equal(reopened.get('b').draft, 'Second draft');
    const corrupt = '{interrupted'; await writeFile(path, corrupt);
    await assert.rejects(new DraftStore(path).initialize()); assert.equal(await readFile(path, 'utf8'), corrupt);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test('discovery and endpoint validation reject remote/private imports before network activity', async () => {
  for (const endpoint of ['https://127.0.0.1:1', 'http://remote.example', 'http://user:pass@localhost', 'http://localhost/?token=x', 'http://localhost/path']) assert.throws(() => localEndpoint(endpoint));
  const directory = await mkdtemp(join(tmpdir(), 'hermes-ledger-'));
  try {
    const path = join(directory, 'ledger.json'); await writeFile(path, JSON.stringify([
      { purpose: 'serve', port: 8400, pid: 1, registered_at: 1 },
      { purpose: 'serve', port: 8401, pid: 2, registered_at: 2, isolated: true },
      { purpose: 'serve', port: 8402, pid: 3, host: 'remote.example' },
    ])); assert.deepEqual(await candidates(path), ['http://127.0.0.1:8400']);
  } finally { await rm(directory, { recursive: true, force: true }); }
  const gateway = new HermesGateway(); assert.doesNotThrow(() => gateway.receive('{"id":9223372036854775808,"result":false}\ninvalid'));
});
test('cold resume accepts documented session_key, restores requests and never invents an idle phase', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway });
  bridge.bindings.set('a', { storedId: 'saved-id' });
  gateway.request = async () => ({ session_id: 'live-id', session_key: 'saved-id', status: 'resuming', hydrating: true, open_requests: [
    { id: 'snapshot-rpc', method: 'approval', params: { session_id: 'live-id', choices: ['deny'] } },
  ], messages: [] });
  const history = await bridge.history('a'); assert.equal(history.session.storedId, 'saved-id'); assert.equal(history.running, true);
  assert.equal(history.pendingRequests[0].requestId, 'snapshot-rpc'); assert.equal(gateway.replies.length, 0);
});
test('cold send cannot bypass a resumed active or uncertain runtime turn', async () => {
  for (const snapshot of [
    { running: true, status: 'streaming' },
    { running: false, status: 'hydrating', hydrating: true },
    { status: 'resuming' },
    {},
  ]) {
    const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway, requireThread: ownThread });
    bridge.bindings.set('a', { storedId: 'saved-id' });
    gateway.request = async (method, params) => {
      gateway.calls.push({ method, params });
      if (method === 'session.resume') return { session_id: 'live-id', stored_session_id: 'saved-id', messages: [], ...snapshot };
      return {};
    };
    try {
      await assert.rejects(bridge.send('a', 'Synthetic follow-up', 'cold-submit'), /active or uncertain/);
      assert.equal(gateway.calls.filter(call => call.method === 'prompt.submit').length, 0);
      assert.equal((await bridge.history('a')).running, true);
      assert.equal((await bridge.history('a')).messages.length, 0);
      await assert.rejects(bridge.send('a', 'Another follow-up', 'another-submit'), /active or uncertain/);
    } finally { bridge.close(); }
  }
});
test('cold send dispatches once after the owned resume explicitly confirms idle', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway, requireThread: ownThread });
  bridge.bindings.set('a', { storedId: 'saved-id' });
  try {
    await bridge.send('a', 'Synthetic idle follow-up', 'cold-idle-submit');
    assert.equal(gateway.calls.filter(call => call.method === 'session.resume').length, 1);
    assert.equal(gateway.calls.filter(call => call.method === 'prompt.submit').length, 1);
    assert.equal((await bridge.history('a')).messages.at(-1).content, 'Synthetic idle follow-up');
  } finally { bridge.close(); }
});
test('prepared persona/context is projected only by exact owned prompt hash on resumed history', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway, prepareText: (_id, text) => `Synthetic role context\n${text}` });
  await bridge.send('a', 'Visible user text', 'user-visible-id');
  const wire = gateway.calls.find(call => call.method === 'prompt.submit').params.text;
  const projected = bridge.projectHistory('a', [{ id: 'durable-row', role: 'user', content: wire }, { role: 'user', content: 'Different role-like text' }]);
  assert.equal(projected[0].id, 'user-visible-id'); assert.equal(projected[0].content, 'Visible user text'); assert.equal(projected[0].metadata.runtimeMessageId, 'durable-row');
  assert.equal(projected[1].content, 'Different role-like text');
});
test('approval handler leases update capabilities on the same connection and stale cleanup cannot disable another view', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway, requireThread: ownThread });
  try {
    await bridge.registerHandler({ handlerId: 'old-ui', threadId: 'a', active: true });
    await Promise.all([bridge.registerHandler({ handlerId: 'new-ui', threadId: 'b', active: true }), bridge.registerHandler({ handlerId: 'old-ui', threadId: 'a', active: false })]);
    assert.equal(gateway.calls.at(-1).params.server_requests, true); assert.equal(bridge.approvalEnabled, true);
    assert.equal(gateway.calls.some(call => call.method === 'session.create' || call.method === 'prompt.submit'), false);
    await bridge.registerHandler({ handlerId: 'new-ui', threadId: 'b', active: false }); assert.equal(gateway.calls.at(-1).params.server_requests, false);
    await assert.rejects(bridge.registerHandler({ handlerId: 'unknown', threadId: 'private', active: true }), /not owned/);
  } finally { bridge.close(); }
});
test('owned tool provenance survives relaunch without importing unrelated session tools', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'hermes-tools-'));
  const path = join(directory, 'bindings.json'), gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway, bindingPath: path });
  try {
    await bridge.send('a', 'Synthetic tool task');
    gateway.emit('event', { type: 'tool.start', session_id: 'live-id', payload: { tool_id: 'tool1', name: 'read_file', args: { path: 'synthetic.txt' } } });
    gateway.emit('event', { type: 'tool.complete', session_id: 'live-id', payload: { tool_id: 'tool1', name: 'read_file', result_text: 'Synthetic contents' } });
    gateway.emit('event', { type: 'tool.complete', session_id: 'unowned', payload: { tool_id: 'private', name: 'read_file', result_text: 'Must never persist' } });
    await bridge.writeQueue;
    const reopened = new HermesBridge({ gateway: new FixtureGateway(), bindingPath: path }); await reopened.initialize();
    const history = await reopened.history('a'); assert.equal(history.toolEvents.length, 2); assert.equal(history.toolEvents[1].payload.result_text, 'Synthetic contents');
    assert.doesNotMatch(await readFile(path, 'utf8'), /Must never persist/); reopened.close();
  } finally { bridge.close(); await rm(directory, { recursive: true, force: true }); }
});

test('disconnect during binding write cannot resurrect a stale live session or approval', async () => {
  const gateway = new FixtureGateway(), bridge = new HermesBridge({ gateway });
  let release, writing;
  const started = new Promise(resolve => writing = resolve);
  bridge.persistBindings = () => new Promise(resolve => { release = resolve; writing(); });
  try {
    const job = bridge.session('a'); const result = assert.rejects(job, /connection changed/);
    await started; bridge.disconnect(); release(); await result;
    assert.equal(bridge.sessions.size, 0); assert.equal(bridge.requests.size, 0); assert.equal(bridge.approvalEnabled, false);
    assert.equal(bridge.bindings.get('a').storedId, 'saved-id');
    assert.equal(bridge.sessionJobs.size, 0);
  } finally { release?.(); bridge.close(); }
});

test('stale HTTP handshake cannot disconnect or overwrite a newer gateway connection', async () => {
  let oldHealth;
  const old = new Promise(resolve => oldHealth = resolve);
  class Socket extends EventTarget {
    constructor() { super(); queueMicrotask(() => this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ method: 'event', params: { type: 'gateway.ready', payload: {} } }) }))); }
    send(text) { const frame = JSON.parse(text); queueMicrotask(() => this.dispatchEvent(new MessageEvent('message', { data: JSON.stringify({ id: frame.id, result: {} }) }))); }
    close() {}
  }
  const gateway = new HermesGateway({ Socket, fetcher: async url => {
    if (url.port === '8401' && url.pathname === '/api/health') return old;
    return new Response(url.pathname === '/api/health' ? JSON.stringify({ ok: true, auth_required: false, version: 'new' }) : 'window.__HERMES_SESSION_TOKEN__="synthetic";');
  } });
  try {
    const first = gateway.connect('http://127.0.0.1:8401'); const rejected = assert.rejects(first, /cancelled/);
    await gateway.connect('http://127.0.0.1:8402'); oldHealth(new Response(JSON.stringify({ ok: true, auth_required: false, version: 'old' }))); await rejected;
    assert.equal(gateway.connected, true); assert.equal(gateway.version, 'new'); assert.equal(gateway.endpoint, 'http://127.0.0.1:8402');
  } finally { gateway.disconnect(); }
});
