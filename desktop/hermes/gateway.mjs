import { EventEmitter } from 'node:events';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

export function localEndpoint(value) {
  const url = new URL(value);
  if (url.protocol !== 'http:' || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.username || url.password || url.search || url.hash || !['', '/'].includes(url.pathname)) throw new Error('Only a local HTTP Hermes backend is supported.');
  return url.origin;
}
export async function candidates(ledgerPath = join(homedir(), '.hermes', 'spawn-ledger.json')) {
  try {
    const rows = JSON.parse(await readFile(ledgerPath, 'utf8'));
    if (!Array.isArray(rows)) return [];
    return rows.filter(row => ['serve', 'dashboard'].includes(row.purpose) && row.isolated !== true && Number.isInteger(row.port) && row.port > 0 && row.port <= 65535 && Number.isInteger(row.pid) && row.pid > 0 && ['', 'localhost', '127.0.0.1', '::1', '0.0.0.0', '::'].includes(row.host ?? ''))
      .sort((a, b) => (b.registered_at ?? 0) - (a.registered_at ?? 0)).map(row => `http://127.0.0.1:${row.port}`).slice(0, 4);
  } catch { return []; }
}

export class HermesGateway extends EventEmitter {
  constructor({ fetcher = fetch, Socket = WebSocket } = {}) {
    super(); this.fetcher = fetcher; this.Socket = Socket; this.pending = new Map(); this.nextID = 0; this.generation = 0; this.connected = false;
  }
  async get(path, authenticated = false) {
    const response = await this.fetcher(new URL(path, this.endpoint), { redirect: 'error', signal: AbortSignal.timeout(15000), headers: authenticated ? { 'X-Hermes-Session-Token': this.token } : {} });
    if ([401, 403].includes(response.status)) throw new Error('Hermes requires login; gated backends are not supported by this local connector.');
    if (!response.ok) throw new Error(`Hermes returned HTTP ${response.status}.`);
    const text = await response.text();
    if (Buffer.byteLength(text) > 4 * 1024 * 1024) throw new Error('Hermes response exceeds the local connector limit.');
    return text;
  }
  async connect(endpoint, { serverRequests = false } = {}) {
    endpoint = localEndpoint(endpoint); this.disconnect(); this.endpoint = endpoint;
    const generation = this.generation;
    const health = JSON.parse(await this.get('/api/health'));
    if (health.ok !== true || health.auth_required !== false) throw new Error('Hermes is unavailable or requires login.');
    const html = await this.get('/');
    const match = html.match(/window\.__HERMES_SESSION_TOKEN__\s*=\s*("(?:[^"\\]|\\.)*")/);
    const token = match && JSON.parse(match[1]);
    if (typeof token !== 'string' || !token || generation !== this.generation) throw new Error('Hermes handshake could not complete.');
    this.token = token;
    const url = new URL('/api/ws', endpoint); url.protocol = 'ws:'; url.searchParams.set('token', token);
    const socket = new this.Socket(url); this.socket = socket;
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Hermes readiness timed out.')), 15000);
      this.ready = { resolve: () => { clearTimeout(timer); resolve(); }, reject: error => { clearTimeout(timer); reject(error); } };
      socket.addEventListener('message', event => { if (generation === this.generation) this.receive(String(event.data)); });
      socket.addEventListener('close', () => { if (generation === this.generation) this.lost(new Error('Hermes disconnected. Work may still be running.')); });
      socket.addEventListener('error', () => { if (generation === this.generation) this.lost(new Error('Hermes connection failed.')); });
    }).catch(error => { this.disconnect(); throw error; });
    try { await this.request('client.capabilities', { server_requests: serverRequests }); }
    catch (error) { this.disconnect(); throw error; }
    return { connected: true, endpoint, capabilities: this.capabilities, version: health.version };
  }
  receive(text) {
    for (const line of text.split('\n').filter(Boolean)) {
      let frame; try { frame = JSON.parse(line); } catch { continue; }
      if (frame.method === 'event') {
        if (frame.params?.type === 'gateway.ready') { this.connected = true; this.capabilities = frame.params.payload; this.ready?.resolve(); this.ready = null; }
        this.emit('event', frame.params);
      } else if (typeof frame.method === 'string' && frame.id !== undefined) this.emit('request', frame);
      else if (typeof frame.method === 'string') this.emit('notification', frame);
      else if (Number.isSafeInteger(frame.id)) {
        const waiter = this.pending.get(frame.id); if (!waiter) continue;
        this.pending.delete(frame.id); clearTimeout(waiter.timer);
        frame.error ? waiter.reject(new Error(frame.error.message ?? 'Hermes RPC failed.')) : waiter.resolve(frame.result);
      }
    }
  }
  request(method, params = {}, timeout = 30000) {
    if (!this.connected) return Promise.reject(new Error('Connect Hermes before continuing.'));
    const id = ++this.nextID;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('Hermes response timed out. Check the session before retrying.')); }, timeout);
      this.pending.set(id, { resolve, reject, timer });
      try { this.socket.send(JSON.stringify({ jsonrpc: '2.0', id, method, params })); }
      catch { clearTimeout(timer); this.pending.delete(id); reject(new Error('Hermes send failed. Outcome may be uncertain.')); }
    });
  }
  respond(id, result, error) {
    if (!this.connected) throw new Error('Hermes is disconnected.');
    this.socket.send(JSON.stringify({ jsonrpc: '2.0', id, ...(error ? { error } : { result }) }));
  }
  lost(error) { this.emit('disconnected', { message: error.message }); this.disconnect(); }
  disconnect() {
    this.generation++; this.connected = false; this.ready?.reject(new Error('Hermes disconnected.')); this.ready = null;
    for (const waiter of this.pending.values()) { clearTimeout(waiter.timer); waiter.reject(new Error('Hermes disconnected. Work may still be running.')); }
    this.pending.clear(); this.socket?.close(); this.socket = null; this.token = null; this.endpoint = null;
  }
}
