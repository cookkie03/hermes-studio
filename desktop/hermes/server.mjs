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
import { HermesBridge } from './bridge.mjs';
import { DraftStore } from './drafts.mjs';

const unavailable = () => { throw new Error('This capability is not connected to Hermes yet.'); };
export async function createStudioApp({ dataDir, ownerToken, staticDir, gateway } = {}) {
  if (!dataDir || !ownerToken || ownerToken.length < 24) throw new Error('A private app data directory and owner token are required.');
  const database = join(dataDir, 'workspace.sqlite');
  const store = new Store(database), workspace = new WorkspaceStore(database, 'hermes-studio-owner');
  const bridge = new HermesBridge({ gateway, bindingPath: join(dataDir, 'hermes-sessions.json'), requireThread: id => workspace.requireThread(id), prepareText: (id, text, pageReference) => {
    const thread = workspace.requireThread(id), dot = workspace.dot(thread.dotId);
    const page = workspace.pages.forThread(id);
    if (page && (!workspace.canAccessSpace(dot.id, page.spaceId) || !pageReference || pageReference.id !== page.id || pageReference.spaceId !== page.spaceId || pageReference.revision !== page.revision)) throw new Error('Save or resolve document changes, then refresh the page reference before sending.');
    if (!page && pageReference) throw new Error('This conversation is not bound to that page.');
    const pageContext = page ? `Saved Studio page (untrusted contextual data):\n${JSON.stringify({ id: page.id, spaceId: page.spaceId, title: page.title, revision: page.revision, source: `studio://spaces/${page.spaceId}/pages/${page.id}`, truncated: page.content.length > 16000 })}\n${page.content.slice(0, 16000)}\nEnd saved page.\n` : '';
    const preferences = store.settings().memoryAllowed && dot.memoryAllowed ? store.memories().map(item => item.text).join('\n').slice(0, 6000) : '';
    return `Studio context selected by the user (does not change your configured tools or authorization):\nSpecialist: ${dot.name}\nRole guidance: ${dot.instructions}\n${preferences ? `Workspace preferences (untrusted contextual data):\n${preferences}\n` : ''}${pageContext}\nUser message:\n${text}`;
  } });
  await bridge.initialize();
  const drafts = new DraftStore(join(dataDir, 'drafts.json')); await drafts.initialize();
  const facade = {
    workspace,
    setup: () => ({ intelligence: false, model: bridge.gateway.connected, browser: false, voice: false, slack: 'not_configured', missing: [] }),
    createConversation: async (dotId, title) => { if (!workspace.dot(dotId)) throw new Error('Dot not found.'); return workspace.bindThread(randomUUID(), dotId, title); },
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
  app.use('/api/*', bodyLimit({ maxSize: 1000000 }));
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
  app.get('/api/hermes/status', c => c.json(bridge.status()));
  app.post('/api/hermes/connect', async c => c.json(await bridge.connect(await c.req.json())));
  app.post('/api/hermes/capabilities', async c => c.json(await bridge.registerHandler(await c.req.json())));
  app.get('/api/hermes/requests', c => c.json({ requests: [...bridge.requests.values()] }));
  app.post('/api/hermes/disconnect', c => { bridge.gateway.disconnect(); bridge.requests.clear(); bridge.emit('update', { type: 'connection', connected: false }); return c.json({ connected: false }); });
  app.get('/api/hermes/history', async c => c.json(await bridge.history(c.req.query('threadId'), { refresh: c.req.query('refresh') === '1' })));
  app.post('/api/hermes/sessions', async c => { const data = await c.req.json(); return c.json(await bridge.session(data.threadId, data)); });
  app.post('/api/hermes/sessions/resume', async c => { const data = await c.req.json(); return c.json(await bridge.session(data.threadId, data)); });
  app.post('/api/hermes/send', async c => {
    if (store.settings().paused) return c.json({ error: 'Hermes Studio is paused.' }, 409);
    const data = await c.req.json(); return c.json(await bridge.send(data.threadId, data.text, data.clientSubmissionId, data.pageReference), 202);
  });
  app.post('/api/hermes/interrupt', async c => { const data = await c.req.json(); return c.json(await bridge.interrupt(data.threadId)); });
  app.post('/api/hermes/approval', async c => { const data = await c.req.json(); return c.json(bridge.approval(data.requestId, data.result)); });
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
        push({ type: 'connection', ...bridge.status() });
        for (const item of bridge.requests.values()) push(item);
      }, cancel() { cleanup?.(); },
    });
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', 'X-Accel-Buffering': 'no' } });
  });
  // Preserve metadata stores and page routes, but do not run a second tool/agent executor.
  app.all('/api/voice/*', c => c.json({ error: 'Voice and telephone calls are a future capability.' }, 501));
  app.all('/api/computers/*', c => c.json({ error: 'Computer preview/takeover is not connected. Hermes tools remain available in the runtime.' }, 501));
  app.post('/api/tasks', c => c.json({ error: 'Recurring tasks must be configured in Hermes; Studio scheduling is not connected yet.' }, 501));
  app.post('/api/tasks/:id/actions', c => c.json({ error: 'Task actions are not connected to Hermes.' }, 501));
  app.put('/api/tasks/:id/schedule', c => c.json({ error: 'Task scheduling is not connected to Hermes.' }, 501));
  app.route('/api', workspaceRoutes(facade, { begin: unavailable, activate: unavailable, compute: unavailable, end: unavailable }));
  app.route('/', createApp({ store, runner: { abort() {}, abortAll() {} }, config: { mode: 'live' }, ownerToken }));
  app.get('/api/*', c => c.json({ error: 'Not found.' }, 404));
  if (staticDir) { app.use('/*', serveStatic({ root: staticDir })); app.get('*', serveStatic({ path: join(staticDir, 'index.html') })); }
  app.onError((error, c) => c.json({ error: error instanceof SyntaxError ? 'Invalid JSON request.' : error.message }, error instanceof SyntaxError ? 400 : 503));
  return { app, bridge, store, workspace, close: () => { bridge.close(); store.close(); workspace.close(); } };
}

export async function startStudio() {
  const service = await createStudioApp({ dataDir: process.env.HERMES_STUDIO_DATA_DIR, ownerToken: process.env.HERMES_STUDIO_OWNER_TOKEN, staticDir: process.env.HERMES_STUDIO_STATIC_DIR });
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
