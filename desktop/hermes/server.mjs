import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { timingSafeEqual, randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
import { Store } from '../upstream/dist/server/server/store.js';
import { WorkspaceStore } from '../upstream/dist/server/server/workspace.js';
import { createApp } from '../upstream/dist/server/server/app.js';
import { workspaceRoutes } from '../upstream/dist/server/server/workspace-routes.js';
import { RuntimeConnections } from './connections.mjs';
import { DraftStore } from './drafts.mjs';
import { RoutinesManager } from './routines.mjs';
import { CapabilitiesManager } from './capabilities.mjs';
import { HermesBrowserService, electronBrowserTransport } from './browser.mjs';
import { ComputerManager } from './computer.mjs';
import { CollaborationManager } from './collaboration.mjs';
import { HermesMemoryManager } from './memory.mjs';
import { buildCapabilityMatrix } from './capability-matrix.mjs';
import { AudioManager } from './audio.mjs';
import { NativeBotsManager } from './bots.mjs';

const unavailable = () => { throw new Error('This capability is not connected to Hermes yet.'); };
export async function createStudioApp({ dataDir, ownerToken, staticDir, gateway, connectorFactory, gatewayFactory, browserTransport } = {}) {
  if (!dataDir || !ownerToken || ownerToken.length < 24) throw new Error('A private app data directory and owner token are required.');
  const database = join(dataDir, 'workspace.sqlite');
  const store = new Store(database), workspace = new WorkspaceStore(database, 'hermes-studio-owner');
  const bridge = new RuntimeConnections({ dataDir, gateway, connectorFactory, gatewayFactory, requireThread: id => workspace.requireThread(id), prepareText: (id, text, pageReference) => {
    const thread = workspace.requireThread(id), dot = workspace.dot(thread.dotId);
    const page = workspace.pages.forThread(id);
    if (page && (!workspace.canAccessSpace(dot.id, page.spaceId) || !pageReference || pageReference.id !== page.id || pageReference.spaceId !== page.spaceId || pageReference.revision !== page.revision)) throw new Error('Save or resolve document changes, then refresh the page reference before sending.');
    if (!page && pageReference) throw new Error('This conversation is not bound to that page.');
    const pageContext = page ? `Saved Studio page (untrusted contextual data):\n${JSON.stringify({ id: page.id, spaceId: page.spaceId, title: page.title, revision: page.revision, source: `studio://spaces/${page.spaceId}/pages/${page.id}`, truncated: page.content.length > 16000 })}\n${page.content.slice(0, 16000)}\nEnd saved page.\n` : '';
    // D38: legacy Studio memories are not the selected Hermes profile's memory.
    return `Studio context selected by the user (does not change your configured tools, profile memory or authorization):\nStudio specialist label: ${dot.name}\nRole guidance: ${dot.instructions}\n${pageContext}\nUser message:\n${text}`;
  } });
  await bridge.initialize();
  const bots = new NativeBotsManager({ connections: bridge, workspace });
  bridge.prepareBinding = threadId => bots.ensureBinding(threadId);
  for (const slot of bridge.slots.values()) slot.bridge.prepareBinding = threadId => bots.ensureBinding(threadId);
  const drafts = new DraftStore(join(dataDir, 'drafts.json')); await drafts.initialize();
  const routines = new RoutinesManager({ connections: bridge });
  const capabilities = new CapabilitiesManager({ connections: bridge });
  const computer = new ComputerManager({ connections: bridge });
  computer.on('changed', event => { bridge.emit('update', event); });
  const memoryManager = new HermesMemoryManager({ connections: bridge });
  const collaboration = new CollaborationManager({ dataDir, connections: bridge, workspace });
  await collaboration.initialize();
  const browser = new HermesBrowserService({ connections: bridge, workspace, transport: browserTransport ?? electronBrowserTransport(process.parentPort) });
  await browser.initialize();
  bridge.interactionHandler = (frame,scope) => browser.handleNativeRequest(frame,scope);
  for(const [connectionId,slot] of bridge.slots) slot.bridge.interactionHandler = (frame,threadId) => browser.handleNativeRequest(frame,{threadId,connectionId});
  routines.on('changed', event => { bridge.emit('update', { type: 'cron.changed', ...event }); });
  const audio = new AudioManager({ connections: bridge });
  const facade = {
    workspace,
    setup: () => ({ intelligence: false, model: bridge.list().connections.some(connection => connection.connected), browser: !!browser.transport, voice: false, slack: 'not_configured', missing: [] }),
    createConversation: (dotId, title) => bots.createConversation(dotId,title),
    handle: () => new Response(JSON.stringify({ error: 'Use the local Hermes connector.' }), { status: 501 }),
    pages: {
      conversation: async (spaceId, pageId, dotId) => {
        workspace.pages.get(spaceId, pageId);
        if (!workspace.canAccessSpace(dotId, spaceId)) throw new Error('Dot does not have access to this Space.');
        const existing = workspace.pages.thread(pageId, dotId); if (existing?.ready) return workspace.requireThread(existing.threadId);
        const thread = await facade.createConversation(dotId, workspace.pages.get(spaceId, pageId).title);
        if (!workspace.pages.reserveThread(pageId, dotId, thread.id)) throw new Error('Page conversation is already being prepared.');
        workspace.pages.finishThread(pageId, dotId); return thread;
      },
      saveConversation: async (threadId, title, parentId) => {
        const thread = workspace.requireThread(threadId), dot = workspace.dot(thread.dotId);
        const history = await bridge.history(threadId);
        const content = history.messages.filter(m => ['user', 'assistant'].includes(m.role) && (!m.metadata?.delivery || m.metadata.delivery === 'acknowledged')).map(m => `**${m.role === 'user' ? 'You' : dot.name}**\n\n${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`).join('\n\n');
        if (!content.trim()) throw new Error('Conversation has no confirmed messages to save.');
        return workspace.pages.create(dot.spaceId, { title, parentId, content }, threadId);
      },
    },
  };
  const app = new Hono();
  app.use('/api/*', (c,next) => bodyLimit({ maxSize: c.req.path.startsWith('/api/audio/') ? 8*1024*1024 : 1000000 })(c,next));
  app.use('*', async (c, next) => {
    c.header('X-Content-Type-Options', 'nosniff'); c.header('Referrer-Policy', 'no-referrer');
    c.header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; media-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'");
    if (c.req.path.startsWith('/api/')) {
      c.header('Cache-Control', 'no-store');
      const url = new URL(c.req.url), origin = c.req.header('origin');
      if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) || (origin && origin !== url.origin) || c.req.header('sec-fetch-site') === 'cross-site') return c.json({ error: 'Cross-origin request rejected.' }, 403);
      const supplied = Buffer.from(c.req.header('authorization')?.replace(/^Bearer /, '') ?? ''), expected = Buffer.from(ownerToken);
      if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return c.json({ error: 'App authentication required.' }, 401);
      if (!['GET', 'HEAD'].includes(c.req.method) && !c.req.header('content-type')?.includes('application/json')) return c.json({ error: 'Use application/json.' }, 415);
    }
    await next();
  });
  app.post('/api/hermes/bots/sync', async c => c.json(await bots.sync()));
  app.get('/api/hermes/context', c => {
    const threadId = c.req.query('threadId');
    if (!threadId) return c.json({ connected: false, info: null });
    const status = bridge.status(threadId), native = bridge.forThread(threadId).sessions.get(threadId);
    return c.json({ connected: status.connected, host: status.name, connectionId: status.connectionId, info: native?.info ?? null });
  });
  app.get('/api/hermes/status', c => c.json(bridge.status(c.req.query('threadId'))));
  app.get('/api/hermes/connections', c => c.json(bridge.list()));
  app.post('/api/hermes/connections', async c => c.json(await bridge.saveConnection(await c.req.json())));
  app.post('/api/hermes/connections/:id/connect', async c => c.json(await bridge.connect({ ...await c.req.json(), connectionId: c.req.param('id') })));
  app.post('/api/hermes/connections/:id/disconnect', async c => c.json(await bridge.disconnect(c.req.param('id'))));
  app.get('/api/hermes/connections/:id/challenges', c => c.json(bridge.challenges(c.req.param('id'))));
  app.post('/api/hermes/connections/:id/challenges', async c => c.json(bridge.answerChallenge(c.req.param('id'), await c.req.json())));
  app.get('/api/hermes/thread-host', c => c.json(bridge.threadHost(c.req.query('threadId'))));
  app.put('/api/hermes/thread-host', async c => { const data = await c.req.json(); return c.json(await bridge.bindThread(data.threadId, data.connectionId)); });
  app.post('/api/hermes/connect', async c => c.json(await bridge.connect(await c.req.json())));
  app.post('/api/hermes/capabilities', async c => c.json(await bridge.registerHandler(await c.req.json())));
  app.get('/api/hermes/requests', c => c.json({ requests: [...bridge.requests.values()] }));
  app.post('/api/hermes/disconnect', async c => c.json(await bridge.disconnect((await c.req.json()).connectionId)));
  app.get('/api/hermes/history', async c => {
    const threadId = c.req.query('threadId'), thread = workspace.requireThread(threadId);
    const history = await bridge.history(threadId, { refresh: c.req.query('refresh') === '1' });
    const page = workspace.pages.forThread(threadId);
    const space = page && workspace.canAccessSpace(thread.dotId, page.spaceId) ? workspace.spaces().find(item => item.id === page.spaceId) : null;
    return c.json({ ...history, context: { studioSpace: space ? { id: space.id, name: space.name } : null,
      nativeProjectLink: history.session?.info?.project?.id ? 'reported' : 'unavailable',
      nativeBotBinding: workspace.dot(thread.dotId)?.nativeBinding ? 'bound' : 'unavailable',
      nativeBot: workspace.dot(thread.dotId)?.nativeBinding ?? null } });
  });
  app.post('/api/hermes/sessions', async c => { const data = await c.req.json(); return c.json(await bridge.session(data.threadId, data)); });
  app.post('/api/hermes/sessions/resume', async c => { const data = await c.req.json(); return c.json(await bridge.session(data.threadId, data)); });
  app.post('/api/hermes/send', async c => {
    if (store.settings().paused) return c.json({ error: 'Hermes Studio is paused.' }, 409);
    const data = await c.req.json(); return c.json(await bridge.send(data.threadId, data.text, data.clientSubmissionId, data.pageReference), 202);
  });
  app.post('/api/hermes/interrupt', async c => { const data = await c.req.json(); return c.json(await bridge.interrupt(data.threadId)); });
  app.post('/api/hermes/approval', async c => { const data = await c.req.json(); return c.json(bridge.approval(data)); });
  app.get('/api/conversations/:id/draft', c => { workspace.requireThread(c.req.param('id')); return c.json(drafts.get(c.req.param('id'))); });
  app.patch('/api/conversations/:id/draft', async c => { const id = c.req.param('id'); workspace.requireThread(id); const data = await c.req.json(); return c.json(await drafts.save(id, data.draft)); });
  app.get('/api/hermes/events', c => {
    const threadId = c.req.query('threadId'); if (threadId) workspace.requireThread(threadId);
    const handlerId = c.req.query('handlerId');
    if (handlerId && (!threadId || handlerId.length > 100)) return c.json({ error: 'An owned conversation is required for an approval handler.' }, 400);
    const streamHandler = handlerId ? `${handlerId}:${randomUUID()}` : undefined;
    const encoder = new TextEncoder(); let cleanup;
    const stream = new ReadableStream({
      start(controller) {
        const push = event => {
          if (threadId && event.connectionId && !event.threadId && event.connectionId !== bridge.threadHost(threadId).connectionId) return;
          if (threadId && event.threadId && event.threadId !== threadId && event.type !== 'approval-waiting') return;
          if (controller.desiredSize < -200) { cleanup?.(); controller.close(); return; }
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        };
        bridge.on('update', push);
        const renew = () => { if (streamHandler) void bridge.registerHandler({ handlerId: streamHandler, threadId, active: true }).catch(() => {}); };
        const heartbeat = setInterval(() => { controller.enqueue(encoder.encode(': keepalive\n\n')); renew(); }, 15000);
        let closed = false;
        cleanup = () => { if (closed) return; closed = true; clearInterval(heartbeat); bridge.off('update', push); if (streamHandler) void bridge.registerHandler({ handlerId: streamHandler, threadId, active: false }).catch(() => {}); };
        c.req.raw.signal.addEventListener('abort', cleanup, { once: true });
        renew();
        push({ type: 'connection', ...bridge.status(threadId) });
        for (const item of bridge.requests.values()) push(item);
      }, cancel() { cleanup?.(); },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } });
  });
  // Preserve metadata stores and page routes, but do not run a second tool/agent executor.
  app.all('/api/voice/*', c => c.json({ error: 'Voice and telephone calls are a future capability.' }, 501));
  // F17 Hermes Voice: Dictation & Spoken Response
  app.get('/api/audio/config', async c => c.json(await audio.getConfig({threadId:c.req.query('threadId')})));
  app.get('/api/audio/voice-config', async c => c.json(await audio.getConfig({threadId:c.req.query('threadId')})));
  app.post('/api/audio/transcribe', async c => {
    try {
      const data = await c.req.json().catch(() => ({}));
      return c.json(await audio.transcribe(data));
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
  });
  app.post('/api/audio/tts', async c => {
    try {
      const data = await c.req.json().catch(() => ({}));
      return c.json(await audio.tts(data));
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
  });
  app.post('/api/audio/voice-live/session', async c => {
    try { return c.json(await audio.createLiveSession(await c.req.json())); }
    catch(error) { return c.json({error:error.message},400); }
  });
  app.post('/api/browser/surface', async c => c.json(await browser.mount(await c.req.json())));
  app.post('/api/browser/unmount', async c => { await browser.unmount(await c.req.json());return c.json({unmounted:true}); });
  app.post('/api/browser/command', async c => {const body=await c.req.json();return c.json(await browser.command(body.dotId,body.action));});
  // F12 Integrated Browser Workspace & Control Lease
  app.get('/api/dots/:id/computer', async c => c.json(await browser.getStatus(c.req.param('id'))));
  app.get('/api/computers/:dotId', async c => c.json(await browser.getStatus(c.req.param('dotId'))));
  app.post('/api/dots/:id/computer/start', async c => c.json(await browser.getStatus(c.req.param('id'))));
  app.post('/api/dots/:id/computer/stop', async c => {await browser.unmount();return c.json({configured:false,state:'unmounted'});});
  app.post('/api/dots/:id/computer/take', async c => c.json(await browser.takeControl(c.req.param('id'))));
  app.post('/api/computers/:dotId/take', async c => c.json(await browser.takeControl(c.req.param('dotId'))));
  app.post('/api/dots/:id/computer/release', async c => c.json(await browser.releaseControl(c.req.param('id'))));
  app.post('/api/computers/:dotId/release', async c => c.json(await browser.releaseControl(c.req.param('dotId'))));
  app.post('/api/computers/:dotId/navigate', async c => {
    const data = await c.req.json();
    return c.json(await browser.navigate(c.req.param('dotId'), data.url, data.actor || 'owner'));
  });
  app.post('/api/computers/:dotId/tabs', async c => {
    const dotId = c.req.param('dotId');
    const data = await c.req.json();
    if (data.action === 'create') return c.json(await browser.createTab(dotId, data.url, data.actor || 'owner'));
    if (data.action === 'switch') return c.json(await browser.switchTab(dotId, data.tabId));
    if (data.action === 'close') return c.json(await browser.closeTab(dotId, data.tabId, data.actor || 'owner'));
    return c.json({ error: 'Invalid tab action.' }, 400);
  });
  app.post('/api/computers/:dotId/clear', async c => c.json(await browser.clearData(c.req.param('dotId'))));
  app.post('/api/dots/:id/computer/actions', async c => {
    const dotId = c.req.param('id');
    const data = await c.req.json();
    try {
      return c.json(await browser.executeAction(dotId, data.action, data.input, data.actor || 'agent'));
    } catch (err) {
      return c.json({ error: err.message }, 400);
    }
  });
  app.get('/api/hermes/computer/target', c => c.json(computer.getTarget({ connectionId: c.req.query('connectionId'), threadId: c.req.query('threadId') })));
  app.get('/api/hermes/computer/captures', c => c.json({ captures: computer.getCaptures({ connectionId: c.req.query('connectionId'), threadId: c.req.query('threadId') }) }));
  app.get('/api/hermes/computer/activity', c => c.json({ activity: computer.getActivity({ connectionId: c.req.query('connectionId'), threadId: c.req.query('threadId') }) }));
  app.get('/api/hermes/computer/lease', c => c.json(computer.getLease({ connectionId: c.req.query('connectionId') })));
  app.post('/api/hermes/computer/lease', async c => {
    const data = await c.req.json();
    return c.json({ error: 'Native Bot Screen takeover is not connected. No lease or runtime control was changed.' }, 501);
  });
  app.post('/api/hermes/computer/captures', async c => {
    const data = await c.req.json();
    return c.json({ error: 'Computer receipts are accepted only from the native runtime.' }, 501);
  });
  app.post('/api/hermes/computer/activity', async c => {
    const data = await c.req.json();
    return c.json({ error: 'Computer receipts are accepted only from the native runtime.' }, 501);
  });

  app.get('/api/hermes/routines', async c => c.json(await routines.listJobs({ connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.post('/api/hermes/routines', async c => c.json(await routines.createJob(await c.req.json(), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.get('/api/hermes/routines/delivery-targets', async c => c.json(await routines.getDeliveryTargets({ connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.get('/api/hermes/routines/:id', async c => c.json(await routines.getJob(c.req.param('id'), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.put('/api/hermes/routines/:id', async c => c.json(await routines.updateJob(c.req.param('id'), await c.req.json(), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.patch('/api/hermes/routines/:id', async c => c.json(await routines.updateJob(c.req.param('id'), await c.req.json(), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.post('/api/hermes/routines/:id/pause', async c => c.json(await routines.pauseJob(c.req.param('id'), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.post('/api/hermes/routines/:id/resume', async c => c.json(await routines.resumeJob(c.req.param('id'), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.post('/api/hermes/routines/:id/trigger', async c => c.json(await routines.triggerJob(c.req.param('id'), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.get('/api/hermes/capabilities/snapshot', async c => c.json(await capabilities.snapshot({ connectionId: c.req.query('connectionId'), profile: c.req.query('profile'), sessionId: c.req.query('sessionId') })));
  app.get('/api/hermes/capabilities/toolsets', async c => c.json(await capabilities.listToolsets({ connectionId: c.req.query('connectionId'), sessionId: c.req.query('sessionId') })));
  app.get('/api/hermes/capabilities/tools', async c => c.json(await capabilities.showTools({ connectionId: c.req.query('connectionId'), sessionId: c.req.query('sessionId') })));
  app.get('/api/hermes/capabilities/plugins', async c => c.json(await capabilities.listPlugins({ connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.get('/api/hermes/capabilities/skills', async c => c.json(await capabilities.listSkills({ connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.get('/api/hermes/capabilities/matrix', async c => c.json(await buildCapabilityMatrix({ capabilitiesManager: capabilities, connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.get('/api/hermes/memory', async c => c.json(await memoryManager.getMemoryStatus({ connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.delete('/api/hermes/routines/:id', async c => c.json(await routines.deleteJob(c.req.param('id'), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile') })));
  app.get('/api/hermes/routines/:id/runs', async c => c.json(await routines.getRuns(c.req.param('id'), { connectionId: c.req.query('connectionId'), profile: c.req.query('profile'), limit: Number(c.req.query('limit') || 20) })));
  // Collaboration and delegation routes (F14)
  app.get('/api/hermes/collaboration/projects', async c => c.json(await collaboration.listProjects({threadId:c.req.query('threadId')})));
  app.post('/api/hermes/collaboration/space-context', async c => c.json(await collaboration.applySpaceProject(await c.req.json())));
  app.get('/api/hermes/collaboration/subagents', async c => c.json(await collaboration.listSubagents(c.req.query('parentId'))));
  app.post('/api/hermes/collaboration/subagents', async c => {
    try {
      const body = await c.req.json();
      return c.json(await collaboration.spawnSubagent(body));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.get('/api/hermes/collaboration/subagents/:id/tail', async c => {
    try {
      return c.json(await collaboration.getSubagentTail(c.req.param('id'), Number(c.req.query('maxBytes') || 16384), { threadId: c.req.query('threadId') }));
    } catch (e) {
      return c.json({ error: e.message }, 404);
    }
  });
  app.post('/api/hermes/collaboration/subagents/:id/steer', async c => {
    try {
      const body = await c.req.json();
      return c.json(await collaboration.steerSubagent(c.req.param('id'), body.message, { threadId: body.threadId }));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.post('/api/hermes/collaboration/subagents/:id/interrupt', async c => {
    try {
      const body = await c.req.json();
      return c.json(await collaboration.interruptSubagent(c.req.param('id'), { threadId: body.threadId }));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.get('/api/hermes/collaboration/messages', async c => c.json(await collaboration.listBotMessages({
    threadId: c.req.query('threadId'),
    profile: c.req.query('profile'),
    dotId: c.req.query('dotId'),
  })));
  app.post('/api/hermes/collaboration/messages', async c => {
    try {
      const body = await c.req.json();
      return c.json(await collaboration.sendBotMessage(body));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.get('/api/hermes/collaboration/rooms', async c => c.json(await collaboration.listRooms({ threadId: c.req.query('threadId') })));
  app.post('/api/hermes/collaboration/rooms', async c => {
    try {
      const body = await c.req.json();
      return c.json(await collaboration.createRoom(body));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.get('/api/hermes/collaboration/rooms/:id/events', async c => {
    try {
      return c.json(await collaboration.getRoomLog(c.req.param('id'), {
        threadId: c.req.query('threadId'),
        sinceSeq: Number(c.req.query('sinceSeq') || 0),
        limit: Number(c.req.query('limit') || 50),
      }));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.post('/api/hermes/collaboration/rooms/:id/events', async c => {
    try {
      const body = await c.req.json();
      return c.json(await collaboration.sendRoomEvent(c.req.param('id'), body));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.post('/api/hermes/collaboration/rooms/:id/events/:eventId/retry', async c => {
    try {
      const body = await c.req.json();
      return c.json(await collaboration.retryRoomEvent(c.req.param('id'), c.req.param('eventId'), { threadId: body.threadId }));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.get('/api/hermes/collaboration/recall', async c => c.json(await collaboration.searchRecall({
    threadId: c.req.query('threadId'),
    query: c.req.query('query') || '',
    profile: c.req.query('profile'),
    limit: Number(c.req.query('limit') || 10),
  })));
  app.get('/api/hermes/collaboration/space-link', async c => c.json(await collaboration.getSpaceLink({
    threadId: c.req.query('threadId'),
    spaceId: c.req.query('spaceId'),
    profile: c.req.query('profile'),
  })));
  app.post('/api/hermes/collaboration/space-link', async c => {
    try {
      const body = await c.req.json();
      return c.json(await collaboration.createSpaceLink(body));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.post('/api/tasks', async c => {
    try {
      const body = await c.req.json();
      return c.json(await routines.createJob(body));
    } catch (e) {
      return c.json({ error: e.message || 'Recurring tasks must be configured in Hermes native routines.' }, 400);
    }
  });
  app.post('/api/tasks/:id/actions', async c => {
    try {
      const { action } = await c.req.json();
      const id = c.req.param('id');
      if (action === 'pause') return c.json(await routines.pauseJob(id));
      if (action === 'resume') return c.json(await routines.resumeJob(id));
      if (action === 'run') return c.json(await routines.triggerJob(id));
      if (action === 'cancel') return c.json(await routines.deleteJob(id));
      return c.json({ error: 'Unsupported action.' }, 400);
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.put('/api/tasks/:id/schedule', async c => {
    try {
      const { intervalSeconds } = await c.req.json();
      const id = c.req.param('id');
      const schedule = intervalSeconds ? `${Math.round(intervalSeconds / 60)}m` : 'manual';
      return c.json(await routines.updateJob(id, { schedule }));
    } catch (e) {
      return c.json({ error: e.message }, 400);
    }
  });
  app.route('/api', workspaceRoutes(facade, { begin: unavailable, activate: unavailable, compute: unavailable, end: unavailable }));
  app.route('/', createApp({ store, runner: { abort() {}, abortAll() {} }, config: { mode: 'live' }, ownerToken }));
  app.get('/api/*', c => c.json({ error: 'Not found.' }, 404));
  if (staticDir) { app.use('/*', serveStatic({ root: staticDir })); app.get('*', serveStatic({ path: join(staticDir, 'index.html') })); }
  app.onError((error, c) => c.json({ error: error instanceof SyntaxError ? 'Invalid JSON request.' : error.message }, error instanceof SyntaxError ? 400 : 503));
  return { app, bridge, routines, capabilities, computer, memoryManager, collaboration, browser, store, workspace, close: () => { bridge.close(); store.close(); workspace.close(); } };
}

export async function startStudio() {
  const service = await createStudioApp({ dataDir: process.env.HERMES_STUDIO_DATA_DIR, ownerToken: process.env.HERMES_STUDIO_OWNER_TOKEN, staticDir: process.env.HERMES_STUDIO_STATIC_DIR });
  if (process.env.HERMES_STUDIO_DISABLE_AUTOCONNECT !== '1') service.bridge.startAutoConnect();
  const host = process.env.HERMES_STUDIO_HOST ?? '127.0.0.1'; if (host !== '127.0.0.1') throw new Error('Studio binds only to loopback.');
  const server = serve({ fetch: service.app.fetch, hostname: host, port: Number(process.env.HERMES_STUDIO_PORT ?? 0) }, info => {
    process.parentPort?.postMessage({ type: 'ready', port: info.port });
    if (!process.parentPort) console.log(`HERMES_STUDIO_READY port=${info.port}`);
  });
  const stop = () => { service.close(); server.close(() => process.exit(0)); };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
  return { ...service, server };
}
if (process.parentPort || process.argv[1] === fileURLToPath(import.meta.url)) void startStudio().catch(error => { console.error('Hermes Studio service failed:', error.message); process.exitCode = 1; });
