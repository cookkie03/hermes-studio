import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStudioApp } from './server.mjs';
class NoRuntime extends EventEmitter { connected = false; calls = []; disconnect() {} async request(method, params) { this.calls.push({ method, params }); return {}; } }
test('metadata API preserves revisions, failures and local records across a service restart without runtime activity', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'hermes-metadata-'));
  const ownerToken = 'synthetic-owner-token-with-enough-length';
  const gateway = new NoRuntime();
  let service = await createStudioApp({ dataDir, ownerToken, gateway });
  const request = (path, method = 'GET', body) => service.app.request(`http://127.0.0.1${path}`, {
    method, headers: { Authorization: `Bearer ${ownerToken}`, 'Content-Type': 'application/json' },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  try {
    const space = await (await request('/api/spaces', 'POST', { name: 'Synthetic persistent space' })).json();
    const pagePath = `/api/spaces/${space.id}/pages`;
    const page = await (await request(pagePath, 'POST', { title: 'Persistent page', content: 'Initial content' })).json();
    const memory = await (await request('/api/memories', 'POST', { text: 'Synthetic persistent memory' })).json();
    const workspace = await (await request('/api/workspace')).json();
    const dot = workspace.dots[0];
    const denied = await request(`${pagePath}/${page.id}/conversation`, 'POST', { dotId: dot.id });
    assert.equal(denied.status, 503);
    const thread = await (await request('/api/conversations', 'POST', { dotId: dot.id, title: 'Local only' })).json();
    await request(`/api/conversations/${thread.id}/draft`, 'PATCH', { draft: 'Keep my unsent draft' });
    const current = await (await request(`${pagePath}/${page.id}`, 'PATCH', { content: 'Saved revision', expectedRevision: page.revision })).json();
    assert.equal((await request(`${pagePath}/${page.id}`, 'PATCH', { content: 'Stale draft', expectedRevision: page.revision })).status, 409);
    const update = service.workspace.pages.update;
    service.workspace.pages.update = () => { throw new Error('Synthetic storage write failure'); };
    assert.equal((await request(`${pagePath}/${page.id}`, 'PATCH', { content: 'Failed draft', expectedRevision: current.revision })).status, 503);
    service.workspace.pages.update = update;
    assert.equal((await (await request(`${pagePath}/${page.id}`)).json()).content, 'Saved revision');
    service.close(); service = undefined;
    service = await createStudioApp({ dataDir, ownerToken, gateway });
    const reopened = await (await request('/api/workspace')).json();
    assert.ok(reopened.spaces.some(item => item.id === space.id));
    assert.ok(reopened.conversations.some(item => item.id === thread.id));
    assert.equal((await (await request(`${pagePath}/${page.id}`)).json()).revision, current.revision);
    assert.equal((await (await request(`/api/conversations/${thread.id}/draft`)).json()).draft, 'Keep my unsent draft');
    assert.ok((await (await request('/api/state')).json()).memories.some(item => item.id === memory.id));
    assert.deepEqual(gateway.calls, []);
  } finally { service?.close(); await rm(dataDir, { recursive: true, force: true }); }
});
test('local metadata/pages/drafts work with no provider keys; unsafe API calls and unsupported capabilities fail explicitly', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'hermes-service-')), ownerToken = 'synthetic-owner-token-with-enough-length';
  const gateway = new NoRuntime(), service = await createStudioApp({ dataDir, ownerToken, gateway });
  const request = (path, method = 'GET', body, headers = {}) => service.app.request(`http://127.0.0.1${path}`, { method, headers: { Authorization: `Bearer ${ownerToken}`, ...(method === 'GET' ? {} : { 'Content-Type': 'application/json' }), ...headers }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  try {
    assert.equal((await request('/api/workspace', 'GET', undefined, { Authorization: '' })).status, 401);
    assert.equal((await request('/api/workspace', 'GET', undefined, { Origin: 'http://evil.example' })).status, 403);
    const workspace = await (await request('/api/workspace')).json(); assert.deepEqual(workspace.setup.missing, []);
    const dot = workspace.dots[0], space = workspace.spaces[0];
    const threadResponse = await request('/api/conversations', 'POST', { dotId: dot.id, title: 'Synthetic conversation' });
    assert.equal(threadResponse.status, 201); const thread = await threadResponse.json(); assert.deepEqual(gateway.calls, []);
    assert.equal((await request(`/api/conversations/${thread.id}/draft`, 'PATCH', { draft: 'Persist this draft' })).status, 200);
    assert.equal((await (await request(`/api/conversations/${thread.id}/draft`)).json()).draft, 'Persist this draft');
    assert.equal((await request('/api/conversations/not-owned/draft')).status, 503);
    const pageResponse = await request(`/api/spaces/${space.id}/pages`, 'POST', { title: 'Synthetic page', content: '# Source' });
    assert.equal(pageResponse.status, 201); const page = await pageResponse.json();
    assert.equal((await request(`/api/spaces/${space.id}/pages/${page.id}`, 'PATCH', { content: 'Updated', expectedRevision: page.revision })).status, 200);
    assert.equal((await request(`/api/spaces/${space.id}/pages/${page.id}`, 'PATCH', { content: 'Stale', expectedRevision: page.revision })).status, 409);
    assert.equal((await request('/api/tasks', 'POST', { prompt: 'Synthetic recurring task' })).status, 501);
    assert.equal((await request('/api/voice/calls', 'POST', {})).status, 501);
    assert.equal((await request('/api/hermes/status')).status, 200);
    const originalHistory = service.bridge.history;
    service.bridge.history = async () => ({ messages: [
      { role: 'user', content: 'Undelivered pending text', metadata: { delivery: 'pending' } },
      { role: 'user', content: 'Uncertain text', metadata: { delivery: 'uncertain' } },
    ] });
    assert.notEqual((await request(`/api/conversations/${thread.id}/page`, 'POST', { title: 'Must not save uncertain transcript' })).status, 201);
    service.bridge.history = async () => ({ messages: [
      { role: 'user', content: 'Acknowledged text', metadata: { delivery: 'acknowledged' } },
      { role: 'user', content: 'Undelivered pending text', metadata: { delivery: 'pending' } },
      { role: 'assistant', content: 'Confirmed result' },
    ] });
    const savedResponse = await request(`/api/conversations/${thread.id}/page`, 'POST', { title: 'Confirmed transcript' });
    assert.equal(savedResponse.status, 201); const savedPage = await savedResponse.json();
    assert.match(savedPage.content, /Acknowledged text/); assert.match(savedPage.content, /Confirmed result/); assert.doesNotMatch(savedPage.content, /Undelivered/);
    service.bridge.history = originalHistory;
    const pageThread = await (await request(`/api/spaces/${space.id}/pages/${page.id}/conversation`, 'POST', { dotId: dot.id })).json();
    const persistedPage = await (await request(`/api/spaces/${space.id}/pages/${page.id}`)).json();
    service.bridge.sessions.set(pageThread.id, { runtimeId: 'synthetic-page-runtime', storedId: 'synthetic-page-stored', messages: [] });
    service.bridge.bindings.set(pageThread.id, { storedId: 'synthetic-page-stored' });
    const reference = { id: page.id, spaceId: space.id, revision: persistedPage.revision };
    assert.notEqual((await request('/api/hermes/send', 'POST', { threadId: pageThread.id, text: 'Inspect the page', pageReference: { ...reference, revision: 0 } })).status, 202);
    assert.equal(gateway.calls.some(call => call.method === 'prompt.submit'), false);
    assert.equal((await request('/api/hermes/send', 'POST', { threadId: pageThread.id, text: 'Inspect the page', pageReference: reference })).status, 202);
    const prompt = gateway.calls.find(call => call.method === 'prompt.submit').params.text;
    assert.match(prompt, /Updated/); assert.match(prompt, /studio:\/\/spaces\//); assert.match(prompt, new RegExp(`"revision":${persistedPage.revision}`));
    gateway.connected = true;
    const stream = await request(`/api/hermes/events?threadId=${thread.id}&handlerId=mounted-handler`);
    const reader = stream.body.getReader(); await reader.read(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(gateway.calls.at(-1).params.server_requests, true);
    const secondStream = await request(`/api/hermes/events?threadId=${thread.id}&handlerId=mounted-handler`);
    const secondReader = secondStream.body.getReader(); await secondReader.read();
    await reader.cancel(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(gateway.calls.at(-1).params.server_requests, true);
    await secondReader.cancel(); await new Promise(resolve => setImmediate(resolve));
    assert.equal(gateway.calls.at(-1).params.server_requests, false);
  } finally { service.close(); await rm(dataDir, { recursive: true, force: true }); }
});


test('chat context distinguishes a page Space from native profile/project and never injects shared memories', async () => {
  const dataDir = await mkdtemp(join(tmpdir(), 'hermes-chat-context-')), ownerToken = 'synthetic-owner-token-with-enough-length';
  const gateway = new NoRuntime(), service = await createStudioApp({ dataDir, ownerToken, gateway });
  const request = (path, method = 'GET', body) => service.app.request(`http://127.0.0.1/api${path}`, { method, headers: { Authorization: `Bearer ${ownerToken}`, 'Content-Type': 'application/json' }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  try {
    const workspace = await (await request('/workspace')).json(), dot = workspace.dots[0], spaceId = dot.spaceIds[0];
    const page = await (await request(`/spaces/${spaceId}/pages`, 'POST', { title: 'Finance', content: 'Explicit document context' })).json();
    const thread = await (await request(`/spaces/${spaceId}/pages/${page.id}/conversation`, 'POST', { dotId: dot.id })).json();
    const plain = await (await request('/conversations', 'POST', { dotId: dot.id, title: 'No Space selected' })).json();
    await request('/memories', 'POST', { text: 'SHARED MEMORY MUST NOT BECOME SPECIALIST MEMORY' });
    const info = { profile_name: 'synthetic-cto', model: 'synthetic-model', reasoning_effort: 'high', cwd: '/synthetic/finance', project: { id: 'profile-local-project', name: 'Finance' } };
    service.bridge.sessions.set(thread.id, { runtimeId: 'synthetic-live', storedId: 'synthetic-stored', messages: [], info });
    service.bridge.bindings.set(thread.id, { storedId: 'synthetic-stored' });
    const history = await (await request(`/hermes/history?threadId=${thread.id}`)).json();
    assert.equal(history.context.studioSpace.id, spaceId);
    assert.equal(history.context.nativeProjectLink, 'unavailable');
    assert.equal(history.session.info.profile_name, 'synthetic-cto');
    assert.equal((await (await request(`/hermes/history?threadId=${plain.id}`)).json()).context.studioSpace, null);
    await request('/hermes/send', 'POST', { threadId: thread.id, text: 'Inspect selected document', pageReference: { id: page.id, spaceId, revision: page.revision } });
    const wire = gateway.calls.find(call => call.method === 'prompt.submit').params.text;
    assert.match(wire, /Explicit document context/); assert.doesNotMatch(wire, /SHARED MEMORY MUST NOT/);
    assert.equal(gateway.calls.some(call => /projects\.|workspace.move|profile/.test(call.method)), false);
  } finally { service.close(); await rm(dataDir, { recursive: true, force: true }); }
});
