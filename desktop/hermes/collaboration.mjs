import { randomUUID } from 'node:crypto';
import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { resolveThreadScope, assertCurrentScope } from './native-scope.mjs';

// Only native receipts and client-side bookmarks are persisted. Legacy demo records
// are retained in the file but never promoted to execution, delivery or project state.
export class CollaborationManager {
  constructor({ dataDir, connections, workspace } = {}) {
    this.connections = connections; this.workspace = workspace;
    this.storagePath = dataDir ? join(dataDir, 'collaboration.json') : null;
    this.messages = new Map(); this.rooms = new Map(); this.spaceLinks = new Map();
    this.writeQueue = Promise.resolve(); this.ready = null;
  }
  initialize() {
    return this.ready ??= (async () => {
      if (!this.storagePath) return;
      try {
        const data = JSON.parse(await readFile(this.storagePath, 'utf8'));
        if (data.version !== 2) { this.legacyDemo = data; return; }
        this.legacyDemo = data.legacyDemo;
        for (const record of data.messages ?? []) this.messages.set(record.id, record);
        for (const record of data.rooms ?? []) this.rooms.set(record.key, record);
        for (const record of data.spaceLinks ?? []) this.spaceLinks.set(record.key, record);
      } catch (error) { if (error.code !== 'ENOENT') throw new Error('Collaboration records could not be read; existing data was preserved.'); }
    })();
  }
  persist() {
    if (!this.storagePath) return Promise.resolve();
    const operation = this.writeQueue.then(async () => {
      await mkdir(dirname(this.storagePath), { recursive: true });
      const temporary = `${this.storagePath}.${randomUUID()}.tmp`;
      await writeFile(temporary, JSON.stringify({ version: 2, legacyDemo: this.legacyDemo, messages: [...this.messages.values()], rooms: [...this.rooms.values()], spaceLinks: [...this.spaceLinks.values()] }), { mode: 0o600 });
      await rename(temporary, this.storagePath);
    }); this.writeQueue = operation.catch(() => {}); return operation;
  }
  scope(threadId) { return resolveThreadScope(this.connections, threadId); }
  async call(owner, method, params = {}, timeout) {
    const result = await owner.gateway.request(method, { ...params, profile: owner.profile }, timeout);
    assertCurrentScope(this.connections, owner); return result;
  }
  async listSubagents(parentId) {
    const owner = this.scope(parentId);
    const result = await this.call(owner, 'subagent.list', { session_id: owner.session.runtimeId });
    return (result.subagents ?? []).map(item => ({ ...item, id: item.subagent_id ?? item.id, subagentId: item.subagent_id ?? item.id, parentId, host: owner.host, profile: owner.profile, goal: item.goal ?? item.task ?? '', nativeStatus: item.status, acceptingSteer: item.accepting_steer === true, status: item.status === 'running' ? 'working' : item.status ?? 'unknown', output: item.output ?? '' }));
  }
  async spawnSubagent() { throw new Error('Direct subagent spawn is not supported. Ask the parent in chat to delegate using its native delegate_task tool.'); }
  async requireChild(id, owner) {
    const children = await this.call(owner, 'subagent.list', { session_id: owner.session.runtimeId });
    if (!(children.subagents ?? []).some(child => (child.subagent_id ?? child.id) === id)) throw new Error('This child does not belong to the selected native conversation.');
  }
  async getSubagentTail(id, maxBytes = 16384, { threadId } = {}) {
    const owner = this.scope(threadId); await this.requireChild(id, owner);
    const result = await this.call(owner, 'subagent.tail', { session_id: owner.session.runtimeId, subagent_id: id });
    const text = result.tail ?? result.output ?? result.text ?? '';
    const buffer = Buffer.from(typeof text === 'string' ? text : JSON.stringify(text));
    return { ...result, id, subagentId: id, tail: buffer.subarray(-Math.min(16384, Math.max(1, maxBytes))).toString('utf8'), totalBytes: buffer.length };
  }
  async steerSubagent(id, text, { threadId } = {}) {
    if (typeof text !== 'string' || !text.trim()) throw new Error('Steering text is required.');
    const owner = this.scope(threadId); await this.requireChild(id, owner);
    return this.call(owner, 'subagent.steer', { session_id: owner.session.runtimeId, subagent_id: id, text });
  }
  async interruptSubagent(id, { threadId } = {}) {
    const owner = this.scope(threadId); await this.requireChild(id, owner);
    return this.call(owner, 'subagent.interrupt', { session_id: owner.session.runtimeId, subagent_id: id });
  }
  async listBotMessages({ threadId } = {}) {
    this.connections.forThread(threadId); await this.initialize();
    return [...this.messages.values()].filter(row => row.threadId === threadId).sort((a,b) => a.createdAt-b.createdAt);
  }
  async sendBotMessage({ threadId, toProfile, toDotId, content } = {}) {
    if (typeof content !== 'string' || !content.trim() || content.length > 16000) throw new Error('A message of 1–16,000 characters is required.');
    const owner = this.scope(threadId);
    if (toDotId) {
      const target = this.workspace?.dot(toDotId)?.nativeBinding;
      if (!target || target.connectionId !== owner.connectionId) throw new Error('Choose a native Bot on the owning host; cross-host relay is not configured.');
      toProfile = target.profile;
    }
    const roster = await this.call(owner, 'profiles.list', { include_sessions: false });
    if (!roster.profiles?.some(p => p.name === toProfile)) throw new Error('Target profile is not in the native roster.');
    await this.initialize();
    const receipt = { id: randomUUID(), threadId, connectionId: owner.connectionId, fromProfile: owner.profile, toProfile, content: content.trim(), status: 'delivery_uncertain', createdAt: Date.now(), deliveryId: null, reply: null, error: null };
    this.messages.set(receipt.id, receipt); await this.persist();
    try {
      const result = await owner.gateway.request('bot_relay.deliver', { profile: toProfile, message: receipt.content, from_profile: owner.profile, from_handle: owner.profile }, 1400000);
      assertCurrentScope(this.connections, owner);
      // Target profile is a recipient, not the sender's routing profile.
      receipt.status = ['queued','reply_received','failed'].includes(result.status) ? result.status : typeof result.reply === 'string' ? 'reply_observed' : 'delivery_uncertain';
      receipt.reply = typeof result.reply === 'string' ? result.reply : null;
      receipt.deliveryId = result.delivery_id ?? null;
      receipt.error = result.error ?? null;
    } catch (error) { receipt.error = error.message; await this.persist(); throw error; }
    await this.persist(); return receipt;
  }
  roomKey(owner, id) { return JSON.stringify([owner.connectionId, owner.profile, id]); }
  async listRooms({ threadId } = {}) {
    const owner = this.scope(threadId); await this.initialize();
    const result = [];
    for (const record of this.rooms.values()) if (record.connectionId === owner.connectionId && record.profile === owner.profile) {
      const state = await this.call(owner, 'groups.state', { room_id: record.roomId });
      result.push({ ...record, state: (state.room ?? state).disbanded_at ? 'disbanded' : 'active', native: state });
    }
    return result;
  }
  async createRoom({ threadId, roomId = randomUUID(), name, members } = {}) {
    const owner = this.scope(threadId);
    const capabilities = await this.call(owner, 'groups.capabilities');
    if (!capabilities.driver || !capabilities.methods?.includes('groups.create')) throw new Error('Native hosted groups are not available on this host.');
    const roster=await this.call(owner,'profiles.list',{include_sessions:false});
    if(!Array.isArray(members) || members.length < 2 || members.length > 6)throw new Error('Select 2–6 native Bots on the owning host.');
    const seen=new Set();
    for(const member of members){
      const binding=this.workspace?.dot(member.member_id)?.nativeBinding;
      if(!binding || binding.connectionId!==owner.connectionId || binding.installId!==roster.install_id || binding.profile!==member.profile || !roster.profiles?.some(row=>row.name===member.profile) || seen.has(member.profile))throw new Error('Room members must be distinct native Bots on the owning installation.');
      seen.add(member.profile);
    }
    const result = await this.call(owner, 'groups.create', { room_id: roomId, name, members });
    const nativeId = result.room_id ?? result.room?.room_id;
    if (!nativeId) throw new Error('Hermes did not confirm a room identity. Inspect native groups before retrying.');
    const record = { key: this.roomKey(owner, nativeId), roomId: nativeId, name: result.room?.name ?? result.name ?? name, members: result.room?.members ?? members, state: result.room?.disbanded_at ? 'disbanded' : 'active', connectionId: owner.connectionId, profile: owner.profile, createdAt: Date.now() };
    await this.initialize(); this.rooms.set(record.key, record); await this.persist(); return record;
  }
  async getRoomLog(roomId, { threadId, sinceSeq = 0, limit = 50 } = {}) {
    const owner = this.scope(threadId);
    const events=[]; let cursor=sinceSeq;
    // Bound each read and preserve the native sequence while showing the newest page.
    for(let page=0;page<100;page++) {
      const result=await this.call(owner,'groups.log',{room_id:roomId,since_seq:cursor,limit:200});
      const rows=result.events ?? result.log ?? [];
      events.push(...rows);
      const next=rows.at(-1)?.seq;
      if(!result.has_more || !Number.isFinite(next) || next<=cursor)break;
      cursor=next;
    }
    return events.slice(-Math.min(200,Math.max(1,limit))).map(event=>({...event,
      eventId:event.event_id, fromProfile:typeof event.actor==='string' ? event.actor : event.actor?.profile ?? event.actor?.handle ?? 'Not reported',
      timestamp:typeof event.created_at==='number' ? event.created_at*1000 : null,
    }));
  }

  async sendRoomEvent(roomId, { threadId, payload, eventId = randomUUID() } = {}) {
    const owner = this.scope(threadId);
    if (!payload || typeof payload.text !== 'string') throw new Error('Room text is required.');
    return this.call(owner, 'groups.send', { room_id: roomId, event_id: eventId, payload: { text: payload.text, thread_id: threadId } });
  }
  async retryRoomEvent(roomId, taskId, { threadId } = {}) { return this.call(this.scope(threadId), 'groups.retry', { room_id: roomId, task_id: taskId }); }
  async searchRecall({ threadId, query = '', limit = 10 } = {}) {
    const owner = this.scope(threadId); const history = await this.connections.history(threadId);
    assertCurrentScope(this.connections, owner);
    if (!query.trim()) return [];
    return (history.messages ?? []).filter(m => typeof m.content === 'string' && m.content.toLowerCase().includes(query.toLowerCase())).slice(-Math.min(50,Math.max(1,limit))).map(m => ({ id:m.id, sessionId:owner.runtimeId, timestamp:m.timestamp ?? m.created_at ?? null, threadId, messageId:m.id, snippet:m.content.slice(0,2000), source:'owned-native-conversation', profile:owner.profile, anchor:`conversation:${threadId}:${m.id}` }));
  }
  linkKey(owner, spaceId) { return JSON.stringify([owner.connectionId, owner.profile, spaceId]); }
  async getSpaceLink({ threadId, spaceId } = {}) {
    const owner = this.scope(threadId); await this.initialize();
    const link = this.spaceLinks.get(this.linkKey(owner, spaceId));
    if (!link) return { spaceId, profile:owner.profile, connectionId:owner.connectionId, host:owner.host, projectId:null, status:'missing' };
    const result = await this.call(owner, 'projects.get', { id:link.projectId });
    if (result.project?.id !== link.projectId) throw new Error('The linked native project could not be verified.');
    return { ...link, status:'linked', project:result.project };
  }
  async listProjects({ threadId } = {}) { return (await this.call(this.scope(threadId), 'projects.list')).projects ?? []; }
  async applySpaceProject({threadId,spaceId}={}) {
    const owner=this.scope(threadId);
    if(owner.session.running || owner.bridge.turns?.has(threadId))throw new Error('Wait for the current native turn to finish before changing its project.');
    const link=await this.getSpaceLink({threadId,spaceId});
    const cwd=link.project?.primary_path;
    if(link.status!=='linked' || !cwd)throw new Error('Choose a verified native project with a primary folder first.');
    const result=await this.call(owner,'session.cwd.set',{session_id:owner.session.runtimeId,cwd});
    owner.session.info={...owner.session.info,...result};
    owner.bridge.emit?.('update',{type:'session-context',threadId,info:owner.session.info});
    return {...link,contextChanged:true,nativeResult:result};
  }
  async createSpaceLink({ threadId, spaceId, projectId } = {}) {
    if (typeof projectId !== 'string' || !projectId) throw new Error('A real native project ID is required.');
    const owner = this.scope(threadId);
    const thread = this.workspace?.requireThread(threadId);
    if (!spaceId || !this.workspace?.canAccessSpace(thread.dotId,spaceId)) throw new Error('This specialist has no access to the selected Space.');
    const result = await this.call(owner, 'projects.get', { id:projectId });
    if (result.project?.id !== projectId) throw new Error('Hermes did not confirm the requested project.');
    const link={key:this.linkKey(owner,spaceId),spaceId,projectId,profile:owner.profile,connectionId:owner.connectionId,host:owner.host,status:'linked',project:result.project};
    await this.initialize();this.spaceLinks.set(link.key,link);await this.persist();return link;
  }
}
