import { EventEmitter } from 'node:events';
import { randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { HermesGateway, candidates } from './gateway.mjs';

export class HermesBridge extends EventEmitter {
  constructor({ gateway = new HermesGateway(), bindingPath, connectionId = 'local', requireThread = () => {}, prepareText = (_threadId, text) => text } = {}) {
    super(); this.gateway = gateway; this.bindingPath = bindingPath; this.connectionId = connectionId; this.requireThread = requireThread;
    this.reviewReplay = new Map(); this.reviewPersistenceErrors = new Map();
    this.transportGeneration = 0; this.prepareText = prepareText; this.sessionJobs = new Map(); this.earlyRequests = [];
    this.handlers = new Map(); this.capabilityQueue = Promise.resolve(); this.approvalEnabled = false;
    this.handlerExpiry = setInterval(() => {
      let expired = false; for (const [id, lease] of this.handlers) if (lease.expiresAt < Date.now()) { this.handlers.delete(id); expired = true; }
      if (expired && this.gateway.connected) void this.updateCapabilities().catch(() => {});
    }, 10000); this.handlerExpiry.unref();
    this.bindings = new Map(); this.sessions = new Map(); this.turns = new Map(); this.requests = new Map(); this.submissions = new Map(); this.lastError = null; this.writeQueue = Promise.resolve();
    gateway.on('event', event => this.runtimeEvent(event));
    gateway.on('request', frame => this.serverRequest(frame));
    gateway.on('notification', frame => { if (frame.method === 'request.cancel') this.cancelRequest(frame.params); });
    gateway.on('disconnected', info => this.transportLost(info));
  }
  async initialize() {
    if (!this.bindingPath) return;
    try { const stored = JSON.parse(await readFile(this.bindingPath, 'utf8')); if (stored.version !== 1 || !Array.isArray(stored.bindings)) throw new Error('Unsupported Hermes session bindings.'); this.bindings = new Map(stored.bindings); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  async persistBindings() {
    if (!this.bindingPath) return;
    const operation = this.writeQueue.then(async () => {
      await mkdir(dirname(this.bindingPath), { recursive: true }); const temp = `${this.bindingPath}.${randomUUID()}.tmp`;
      await writeFile(temp, JSON.stringify({ version: 1, bindings: [...this.bindings] }), { mode: 0o600 }); await rename(temp, this.bindingPath);
    });
    this.writeQueue = operation.catch(() => {}); await operation;
  }
  status() { return { connected: this.gateway.connected, endpoint: this.gateway.endpoint, capabilities: this.gateway.capabilities ?? {}, approvalEnabled: this.approvalEnabled, lastError: this.lastError }; }
  async connect({ endpoint, serverRequests = false } = {}) {
    const endpoints = endpoint ? [endpoint] : await candidates();
    if (!endpoints.length) throw new Error('No local Hermes backend found. Start Hermes, then connect.');
    ++this.transportGeneration; this.sessionJobs.clear(); this.sessions.clear(); this.requests.clear(); this.earlyRequests = [];
    for (const value of endpoints) {
      try { const status = await this.gateway.connect(value, { serverRequests: false }); await this.updateCapabilities(); this.lastError = null; this.emit('update', { type: 'connection', ...status, approvalEnabled: this.approvalEnabled }); return status; }
      catch (error) { this.lastError = error.message; }
    }
    throw new Error(this.lastError);
  }
  async registerHandler({ handlerId, threadId, active }) {
    if (typeof handlerId !== 'string' || !handlerId || handlerId.length > 200 || typeof active !== 'boolean') throw new Error('A concrete approval handler lease is required.');
    this.requireThread(threadId);
    if (active) this.handlers.set(handlerId, { threadId, expiresAt: Date.now() + 45000 });
    else if (this.handlers.get(handlerId)?.threadId === threadId) this.handlers.delete(handlerId);
    return this.updateCapabilities();
  }
  async updateCapabilities() {
    const job = this.capabilityQueue.then(async () => {
      if (!this.gateway.connected) { this.approvalEnabled = false; return { serverRequests: false }; }
      const enabled = this.handlers.size > 0;
      await this.gateway.request('client.capabilities', { server_requests: enabled }); this.approvalEnabled = enabled;
      return { serverRequests: enabled };
    }); this.capabilityQueue = job.catch(() => {}); return job;
  }
  transportLost(info) { ++this.transportGeneration; this.sessionJobs.clear(); this.approvalEnabled = false; this.lastError = info.message; this.requests.clear(); this.earlyRequests = []; this.sessions.clear(); this.emit('update', { type: 'connection', connected: false, ...info }); }
  disconnect() { this.gateway.disconnect(); this.transportLost({ message: 'Disconnected. Hermes may still be working on its host.' }); }
  close() { clearInterval(this.handlerExpiry); this.disconnect(); }
  validateSession(result) {
    const storedId = result?.stored_session_id ?? result?.session_key;
    if (!result?.session_id || typeof result.session_id !== 'string' || !storedId || typeof storedId !== 'string') throw new Error('Hermes returned incomplete session identity.');
    return { runtimeId: result.session_id, storedId, info: result.info, running: typeof result.running === 'boolean' ? result.running : undefined, status: result.status, hydrating: result.hydrating, inflight: result.inflight, openRequests: Array.isArray(result.open_requests) ? result.open_requests : [], messages: Array.isArray(result.messages) ? result.messages : [] };
  }
  async session(threadId, { profile, storedId } = {}) {
    this.requireThread(threadId);
    const binding = this.bindings.get(threadId);
    if (storedId !== undefined && storedId !== binding?.storedId) throw new Error('Only this conversation’s owned session can be resumed.');
    if (profile !== undefined && profile !== binding?.profile) throw new Error('Importing another Hermes profile is not supported.');
    if (this.sessions.has(threadId)) return this.sessions.get(threadId);
    if (this.sessionJobs.has(threadId)) return this.sessionJobs.get(threadId);
    return this.loadSessionJob(threadId, profile, storedId);
  }
  loadSessionJob(threadId, profile, storedId) {
    const job = this.loadSession(threadId, profile, storedId).finally(() => { if (this.sessionJobs.get(threadId) === job) this.sessionJobs.delete(threadId); this.drainRequests(); });
    this.sessionJobs.set(threadId, job); return job;
  }
  async loadSession(threadId, profile, storedId) {
    const generation = this.transportGeneration;
    const check = () => { if (generation !== this.transportGeneration || !this.gateway.connected) throw new Error('Hermes connection changed while loading the session. Reconnect to inspect its owned binding.'); };
    const saved = storedId ?? this.bindings.get(threadId)?.storedId;
    profile ??= this.bindings.get(threadId)?.profile;
    const params = saved ? { session_id: saved, close_on_disconnect: false } : { source: 'desktop', idempotency_key: threadId, close_on_disconnect: false };
    if (profile) params.profile = profile;
    const result = this.validateSession(await this.gateway.request(saved ? 'session.resume' : 'session.create', params, saved ? 120000 : 30000));
    check();
    this.bindings.set(threadId, { ...this.bindings.get(threadId), storedId: result.storedId, ...(profile ? { profile } : {}) }); await this.persistBindings();
    check();
    result.messages = this.projectHistory(threadId, result.messages); this.sessions.set(threadId, result);
    this.emit('update', { type: 'session-context', threadId, info: result.info });
    this.drainRequests();
    for (const request of result.openRequests) this.serverRequest(request);
    if (saved) {
      if (result.running === false && !result.hydrating && !['resuming', 'hydrating'].includes(result.status)) {
        if (!this.turns.get(threadId)?.preparing) this.turns.delete(threadId);
      }
      else this.turns.set(threadId, { runtimeId: result.runtimeId, resumed: true, uncertain: result.running !== true });
    }
    await this.recoverReviews(threadId, result, check);
    check();
    return result;
  }
  projectHistory(threadId, messages) {
    const projections = this.bindings.get(threadId)?.projections ?? [], used = new Set();
    return messages.map(message => {
      if (message.role !== 'user' || typeof message.content !== 'string') return message;
      const hash = createHash('sha256').update(message.content).digest('hex');
      const index = projections.findIndex((item, i) => !used.has(i) && item.hash === hash);
      if (index < 0) return message;
      used.add(index); const item = projections[index];
      return { ...message, id: item.id, content: item.text, metadata: { ...message.metadata, delivery: 'acknowledged', runtimeMessageId: message.id } };
    });
  }
  async history(threadId, { refresh = false } = {}) {
    this.requireThread(threadId);
    let session = this.sessions.get(threadId);
    if (refresh && this.bindings.has(threadId) && this.gateway.connected) {
      if (!this.sessionJobs.has(threadId)) {
        const binding = this.bindings.get(threadId);
        this.loadSessionJob(threadId, binding.profile, binding.storedId);
      }
      session = await this.sessionJobs.get(threadId);
    } else if (!session && this.bindings.has(threadId) && this.gateway.connected) session = await this.session(threadId, this.bindings.get(threadId));
    return { messages: session?.messages ?? [], toolEvents: this.bindings.get(threadId)?.toolEvents ?? [], reviewNotes: this.bindings.get(threadId)?.reviewNotes ?? [],
      reviewReplay: this.gateway.connected ? this.reviewReplay.get(threadId) ?? { state: 'unavailable', message: 'Native review replay has not been verified for this conversation.' } : { state: 'offline', message: 'Saved review notes are available. Notes emitted while disconnected have not been verified.' },
      reviewPersistenceError: this.reviewPersistenceErrors.get(threadId) ?? this.bindings.get(threadId)?.reviewArchiveError, session, running: this.turns.has(threadId), pendingRequests: [...this.requests.values()].filter(item => item.threadId === threadId) };
  }
  archiveReview(threadId, event, epoch = this.gateway.capabilities?.replay_epoch) {
    const binding = this.bindings.get(threadId), session = this.sessions.get(threadId);
    const text = event.payload?.text;
    if (!binding || !session || typeof text !== 'string' || !text.trim()) return;
    if (Buffer.byteLength(text) > 1000000) {
      binding.reviewArchiveError = 'A native review exceeded the archive limit and was not saved. Inspect the original summary in Hermes.';
      void this.persistBindings().catch(error => this.reviewPersistenceErrors.set(threadId, error.message));
      this.emit('update', { type: 'persistence-error', threadId, message: binding.reviewArchiveError }); return;
    }
    // The native contract has text, not mutation receipts or a guaranteed turn ID.
    // Epoch/session/seq distinguishes identical summaries from different events.
    const sequenced = typeof epoch === 'string' && Number.isSafeInteger(event.seq) && event.seq > 0;
    const identity = [binding.storedId, event.session_id, epoch ?? null, sequenced ? event.seq : text];
    const id = createHash('sha256').update(JSON.stringify(identity)).digest('hex');
    if ((binding.reviewNotes ?? []).some(note => note.id === id)) return;
    const note = { id, text, connectionId: this.connectionId, storedSessionId: binding.storedId,
      runtimeSessionId: event.session_id, profile: typeof session.info?.profile_name === 'string' ? session.info.profile_name : binding.profile ?? null,
      receivedAt: new Date().toISOString(), identity: sequenced ? 'sequence' : 'text-fallback' };
    binding.reviewNotes = [...(binding.reviewNotes ?? []), note];
    void this.persistBindings().then(() => this.reviewPersistenceErrors.delete(threadId)).catch(error => {
      this.reviewPersistenceErrors.set(threadId, error.message);
      this.emit('update', { type: 'persistence-error', threadId, message: 'The native review could not be saved to disk. It is retained in this app session.' });
    });
    this.emit('update', { type: 'review-note', threadId, note });
  }
  async recoverReviews(threadId, session, check) {
    const epoch = this.gateway.capabilities?.replay_epoch;
    if (typeof epoch !== 'string' || !epoch) {
      this.reviewReplay.set(threadId, { state: 'unavailable', message: 'Native review replay is not advertised by this runtime.' }); return;
    }
    try {
      const replay = await this.gateway.request('session.events.since', { session_id: session.runtimeId, last_seen: 0 });
      check();
      if (replay?.epoch !== epoch || !Array.isArray(replay.events)) throw new Error('Native review replay returned an unverified snapshot.');
      for (const event of replay.events) if (event?.type === 'review.summary' && event.session_id === session.runtimeId) this.archiveReview(threadId, event, epoch);
      this.reviewReplay.set(threadId, replay.truncated === true
        ? { state: 'partial', message: 'The runtime replay window is incomplete. Older notes may be missing.' }
        : { state: 'available', message: 'Review notes recovered from the native runtime replay window.' });
    } catch (error) {
      check(); this.reviewReplay.set(threadId, { state: 'unavailable', message: `Native review replay is unavailable: ${error.message}` });
    }
  }
  async send(threadId, text, clientSubmissionId, pageReference) {
    this.requireThread(threadId);
    if (typeof text !== 'string' || !text.trim() || text.length > 32000) throw new Error('Enter a message up to 32,000 characters.');
    if (clientSubmissionId !== undefined && (typeof clientSubmissionId !== 'string' || clientSubmissionId.length > 200 || !clientSubmissionId)) throw new Error('Invalid submission identity.');
    const key = clientSubmissionId && `${threadId}:${clientSubmissionId}`;
    if (key && this.submissions.has(key)) { const prior = this.submissions.get(key); if (prior.text !== text) throw new Error('Submission identity was already used for different content.'); return prior.promise; }
    if (this.turns.has(threadId)) throw new Error('This session has an active or uncertain turn; reconnect and inspect it before sending again.');
    const promise = this.dispatch(threadId, text, clientSubmissionId, pageReference);
    if (key) this.submissions.set(key, { text, promise });
    return promise;
  }
  async dispatch(threadId, text, clientSubmissionId, pageReference) {
    const requestId = randomUUID(); this.turns.set(threadId, { requestId, preparing: true });
    let preparedText; try { preparedText = this.prepareText(threadId, text, pageReference); } catch (error) { this.turns.delete(threadId); throw error; }
    let session; try { session = await this.session(threadId); } catch (error) { this.turns.delete(threadId); throw error; }
    // A cold resume may discover work after send reserved a local preparation turn.
    // Keep that authoritative runtime state; only an idle snapshot permits dispatch.
    if (this.turns.get(threadId)?.resumed || this.turns.get(threadId)?.running) throw new Error('This session has an active or uncertain turn; reconnect and inspect it before sending again.');
    this.turns.set(threadId, { requestId, runtimeId: session.runtimeId });
    const userMessage = { id: clientSubmissionId ?? randomUUID(), role: 'user', content: text, metadata: { delivery: 'pending' } };
    const binding = this.bindings.get(threadId);
    binding.projections = [...(binding.projections ?? []), { id: userMessage.id, hash: createHash('sha256').update(preparedText).digest('hex'), text }];
    try { await this.persistBindings(); } catch (error) { this.turns.delete(threadId); throw error; }
    session.messages.push(userMessage);
    this.emit('update', { type: 'turn', threadId, requestId, status: 'dispatching' });
    void this.gateway.request('prompt.submit', { session_id: session.runtimeId, text: preparedText }, 1800000).then(() => {
      userMessage.metadata.delivery = 'acknowledged';
      const turn = this.turns.get(threadId);
      if (turn?.requestId !== requestId) return;
      this.emit('update', { type: 'admitted', threadId, requestId, clientSubmissionId: userMessage.id });
      if (!turn.running) this.emit('update', { type: 'turn', threadId, requestId, status: 'accepted' });
    }).catch(error => {
      if (this.turns.get(threadId)?.requestId !== requestId) return;
      // Preserve uncertain turn until explicit reconnection; never replay prompt automatically.
      userMessage.metadata.delivery = 'uncertain'; this.emit('update', { type: 'turn', threadId, requestId, status: 'error', uncertain: true, message: error.message });
    });
    return { accepted: true, requestId, session: { runtimeId: session.runtimeId, storedId: session.storedId } };
  }
  async interrupt(threadId) {
    const session = this.sessions.get(threadId); if (!session) throw new Error('No connected Hermes session for this conversation.');
    const result = await this.gateway.request('session.interrupt', { session_id: session.runtimeId });
    this.emit('update', { type: 'interrupt-pending', threadId }); return result;
  }
  runtimeEvent(event) {
    if (event?.type === 'request.cancel') {
      this.cancelRequest(event.payload); return;
    }
    const threadId = [...this.sessions].find(([, session]) => session.runtimeId === event?.session_id)?.[0];
    // A shared Hermes backend may emit events for personal sessions: never relay them.
    if (event?.session_id && !threadId) return;
    if (!event?.session_id && event?.type !== 'gateway.ready') return;
    if (threadId && event.type === 'session.info') this.sessions.get(threadId).info = event.payload;
    if (threadId && event.type === 'review.summary') this.archiveReview(threadId, event);
    if (threadId && ['tool.start', 'tool.complete'].includes(event.type)) {
      const binding = this.bindings.get(threadId);
      if (binding) {
        const size = Buffer.byteLength(JSON.stringify(event));
        const archived = size <= 65536 ? event : { ...event, payload: { tool_id: event.payload?.tool_id, name: event.payload?.name, result_text: String(event.payload?.result_text ?? '').slice(0, 8000), truncated: true } };
        binding.toolEvents = [...(binding.toolEvents ?? []), archived].slice(-100);
        void this.persistBindings().catch(error => this.emit('update', { type: 'persistence-error', threadId, message: error.message }));
      }
    }
    if (threadId && ['message.delta', 'message.interim', 'tool.start'].includes(event.type)) {
      const session = this.sessions.get(threadId);
      session.running = true; session.status = 'streaming';
      this.turns.set(threadId, { ...this.turns.get(threadId), runtimeId: session.runtimeId, running: true });
      this.emit('update', { type: 'turn', threadId, status: 'running' });
    }
    this.emit('update', { type: 'runtime', threadId, event });
    if (event?.type === 'message.complete' && threadId) {
      const session = this.sessions.get(threadId); session.messages.push({ id: randomUUID(), role: 'assistant', content: event.payload?.text ?? '' });
      session.running = false; session.status = event.payload?.status ?? 'completed';
      this.turns.delete(threadId);
      this.emit('update', { type: 'turn', threadId, status: event.payload?.status === 'interrupted' ? 'interrupted' : event.payload?.status === 'error' ? 'error' : 'completed', message: event.payload?.error });
    }
  }
  cancelRequest(params) {
    const key = JSON.stringify(params?.id);
    this.earlyRequests = this.earlyRequests.filter(frame => JSON.stringify(frame.id) !== key);
    const item = this.requests.get(key); if (!item) return;
    this.requests.delete(key); this.emit('update', { type: 'cancel', threadId: item.threadId, requestId: params.id, decisionId: item.decisionId, params });
  }
  serverRequest(frame) {
    if (frame.method !== 'approval') { this.gateway.respond(frame.id, null, { code: -32601, message: 'This client does not support this interaction yet.' }); return; }
    const runtimeId = frame.params?.session_id ?? frame.params?.gateway_session_id;
    const threadId = [...this.sessions].find(([, session]) => session.runtimeId === runtimeId)?.[0];
    if (!threadId) {
      // Reattach may replay a request before its RPC snapshot binds the new live ID.
      if (this.sessionJobs.size && this.earlyRequests.length < 100) { this.earlyRequests.push(frame); return; }
      this.gateway.respond(frame.id, null, { code: -32602, message: 'Request is not bound to an owned conversation.' }); return;
    }
    const key = JSON.stringify(frame.id);
    const existing = this.requests.get(key);
    if (existing) return; // Replay preserves the identity of the currently open card.
    const item = { type: 'request', threadId, requestId: frame.id, decisionId: randomUUID(), method: frame.method, params: frame.params };
    this.requests.set(JSON.stringify(frame.id), item); this.emit('update', item);
    this.emit('update', { type: 'approval-waiting', threadId, requestId: frame.id });
  }
  drainRequests() { const requests = this.earlyRequests; this.earlyRequests = []; for (const frame of requests) this.serverRequest(frame); }
  approval(requestId, result, decisionId) {
    const key = JSON.stringify(requestId); const item = this.requests.get(key);
    if (!item || (decisionId !== undefined && item.decisionId !== decisionId)) throw new Error('This request is no longer open.');
    if (decisionId !== undefined && ![...this.handlers.values()].some(lease => lease.expiresAt > Date.now())) throw new Error('No approval handler is ready. Reopen the conversation to inspect this request.');
    if (!result || !['once', 'session', 'always', 'deny'].includes(result.choice) || !Array.isArray(item.params?.choices) || !item.params.choices.includes(result.choice) || (result.all !== undefined && typeof result.all !== 'boolean')) throw new Error('Choose an option offered by this approval request.');
    this.gateway.respond(requestId, result); this.requests.delete(key);
    this.emit('update', { type: 'request-resolved', threadId: item.threadId, requestId, decisionId: item.decisionId }); return { ok: true };
  }
}
