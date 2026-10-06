import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';

export class CollaborationManager {
  constructor({ dataDir, gateway } = {}) {
    this.dataDir = dataDir;
    this.gateway = gateway;

    this.subagents = new Map(); // id -> SubagentTask
    this.messages = new Map(); // id -> BotMessage
    this.rooms = new Map(); // roomId -> HostedRoom
    this.roomLogs = new Map(); // roomId -> RoomLogEvent[]
    this.spaceLinks = new Map(); // `${spaceId}:${profile}` -> SpaceProfileLink

    this.initialized = false;
    this.storagePath = dataDir ? join(dataDir, 'collaboration.json') : null;
  }

  async initialize() {
    if (this.initialized) return;
    this.initialized = true;

    if (!this.storagePath) return;

    try {
      const raw = await readFile(this.storagePath, 'utf8');
      const data = JSON.parse(raw);

      if (Array.isArray(data.subagents)) {
        for (const item of data.subagents) this.subagents.set(item.id, item);
      }
      if (Array.isArray(data.messages)) {
        for (const item of data.messages) this.messages.set(item.id, item);
      }
      if (Array.isArray(data.rooms)) {
        for (const item of data.rooms) this.rooms.set(item.roomId, item);
      }
      if (data.roomLogs && typeof data.roomLogs === 'object') {
        for (const [roomId, logs] of Object.entries(data.roomLogs)) {
          this.roomLogs.set(roomId, logs);
        }
      }
      if (Array.isArray(data.spaceLinks)) {
        for (const item of data.spaceLinks) {
          this.spaceLinks.set(`${item.spaceId}:${item.profile}`, item);
        }
      }
    } catch {
      // Clean start if file missing or corrupted
    }
  }

  async persist() {
    if (!this.storagePath) return;
    try {
      await mkdir(dirname(this.storagePath), { recursive: true });
      const payload = {
        subagents: Array.from(this.subagents.values()),
        messages: Array.from(this.messages.values()),
        rooms: Array.from(this.rooms.values()),
        roomLogs: Object.fromEntries(this.roomLogs.entries()),
        spaceLinks: Array.from(this.spaceLinks.values()),
      };
      await writeFile(this.storagePath, JSON.stringify(payload, null, 2), 'utf8');
    } catch {
      // Ignore background persistence errors
    }
  }

  // --- Subagents (`delegate_task`) ---

  async listSubagents(parentId) {
    await this.initialize();
    const all = Array.from(this.subagents.values());
    if (!parentId) return all;
    return all.filter((s) => s.parentId === parentId);
  }

  async spawnSubagent({
    parentId = 'default-thread',
    goal = '',
    context = '',
    outputSchema,
    model = 'auto/fast',
    effort = 'Standard',
    spaceId = 'default',
    host = 'This Mac',
  }) {
    await this.initialize();
    if (!goal.trim()) throw new Error('Subagent goal is required.');

    const id = `subagent-${randomUUID().slice(0, 8)}`;
    const subagentId = `child-${randomUUID().slice(0, 6)}`;
    const task = {
      id,
      parentId,
      subagentId,
      goal: goal.trim(),
      context: context.trim(),
      outputSchema,
      status: 'working',
      model,
      effort,
      spaceId,
      host,
      output: `[${new Date().toISOString()}] Subagent ${subagentId} spawned for parent ${parentId}.\nGoal: ${goal.trim()}\nRunning initial execution steps...`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      result: null,
    };

    this.subagents.set(id, task);
    await this.persist();
    return task;
  }

  async getSubagentTail(id, maxBytes = 16384) {
    await this.initialize();
    const task = this.subagents.get(id);
    if (!task) throw new Error(`Subagent ${id} not found.`);

    const output = task.output || '';
    const buffer = Buffer.from(output, 'utf8');
    if (buffer.length <= maxBytes) {
      return { id: task.id, subagentId: task.subagentId, status: task.status, tail: output, totalBytes: buffer.length };
    }
    const sliced = buffer.subarray(buffer.length - maxBytes).toString('utf8');
    return { id: task.id, subagentId: task.subagentId, status: task.status, tail: sliced, totalBytes: buffer.length };
  }

  async steerSubagent(id, message) {
    await this.initialize();
    const task = this.subagents.get(id);
    if (!task) throw new Error(`Subagent ${id} not found.`);
    if (['completed', 'failed', 'interrupted'].includes(task.status)) {
      throw new Error(`Subagent ${id} is already in state '${task.status}' and cannot be steered.`);
    }

    const timestamp = new Date().toISOString();
    task.output += `\n[${timestamp}] [STEER DIRECTIVE]: ${message}`;
    task.status = 'working';
    task.updatedAt = Date.now();

    this.subagents.set(id, task);
    await this.persist();
    return task;
  }

  async interruptSubagent(id) {
    await this.initialize();
    const task = this.subagents.get(id);
    if (!task) throw new Error(`Subagent ${id} not found.`);

    const timestamp = new Date().toISOString();
    task.output += `\n[${timestamp}] [INTERRUPTED]: Execution stopped by parent agent call.`;
    task.status = 'interrupted';
    task.updatedAt = Date.now();

    this.subagents.set(id, task);
    await this.persist();
    return task;
  }

  // --- Bot Messaging (`message_agent`) ---

  async listBotMessages({ threadId, profile, dotId } = {}) {
    await this.initialize();
    let all = Array.from(this.messages.values());
    if (threadId) all = all.filter((m) => m.threadId === threadId);
    if (profile) all = all.filter((m) => m.fromProfile === profile || m.toProfile === profile);
    if (dotId) all = all.filter((m) => m.fromDotId === dotId || m.toDotId === dotId);
    return all.sort((a, b) => a.createdAt - b.createdAt);
  }

  async sendBotMessage({
    fromProfile = 'default',
    toProfile = 'peer',
    fromDotId = 'dot-a',
    toDotId = 'dot-b',
    threadId = 'default-thread',
    content = '',
    simulateFailure = false,
  }) {
    await this.initialize();
    if (!content.trim()) throw new Error('Bot message content cannot be empty.');
    if (content.length > 16000) throw new Error('Bot message body exceeds maximum length of 16,000 characters.');

    const id = `msg-${randomUUID().slice(0, 8)}`;
    const deliveryId = `deliv-${randomUUID().slice(0, 8)}`;

    const msg = {
      id,
      deliveryId,
      fromProfile,
      toProfile,
      fromDotId,
      toDotId,
      threadId,
      content: content.trim(),
      status: 'queued', // Ack queued is a handoff, not a receipt
      createdAt: Date.now(),
      reply: null,
      error: null,
    };

    this.messages.set(id, msg);

    // Simulate async transition to working -> reply_received or failed
    if (simulateFailure) {
      setTimeout(() => {
        msg.status = 'failed';
        msg.error = `Delivery failed to ${toProfile} (${toDotId}). Host unconfirmed.`;
        this.messages.set(id, msg);
        void this.persist();
      }, 50);
    } else {
      setTimeout(() => {
        msg.status = 'working';
        this.messages.set(id, msg);
        void this.persist();

        setTimeout(() => {
          msg.status = 'reply_received';
          msg.reply = `Ack & reply from ${toProfile}: Received message "${content.slice(0, 40)}..." and processed.`;
          this.messages.set(id, msg);
          void this.persist();
        }, 100);
      }, 50);
    }

    await this.persist();
    return msg;
  }

  // --- Hosted Rooms (`groups.*`) ---

  async listRooms() {
    await this.initialize();
    return Array.from(this.rooms.values());
  }

  async createRoom({ roomId, name, members = ['default', 'peer'] }) {
    await this.initialize();
    const id = roomId || `room-${randomUUID().slice(0, 8)}`;
    if (this.rooms.has(id)) throw new Error(`Room ${id} already exists.`);

    const room = {
      roomId: id,
      name: name || `Room ${id}`,
      members,
      state: 'active',
      createdAt: Date.now(),
    };

    this.rooms.set(id, room);
    if (!this.roomLogs.has(id)) this.roomLogs.set(id, []);
    await this.persist();
    return room;
  }

  async sendRoomEvent(roomId, { fromProfile = 'default', payload = {} }) {
    await this.initialize();
    const room = this.rooms.get(roomId);
    if (!room) throw new Error(`Room ${roomId} not found.`);
    if (room.state !== 'active') throw new Error(`Room ${roomId} is ${room.state} and cannot accept events.`);

    const logs = this.roomLogs.get(roomId) || [];
    const seq = logs.length + 1;
    const eventId = `evt-${randomUUID().slice(0, 8)}`;

    const event = {
      seq,
      eventId,
      roomId,
      fromProfile,
      payload,
      timestamp: Date.now(),
    };

    logs.push(event);
    this.roomLogs.set(roomId, logs);
    await this.persist();
    return event;
  }

  async getRoomLog(roomId, { sinceSeq = 0, limit = 50 } = {}) {
    await this.initialize();
    const logs = this.roomLogs.get(roomId) || [];
    const filtered = logs.filter((e) => e.seq > sinceSeq);
    return filtered.slice(0, limit);
  }

  async retryRoomEvent(roomId, eventId) {
    await this.initialize();
    const logs = this.roomLogs.get(roomId) || [];
    const event = logs.find((e) => e.eventId === eventId);
    if (!event) throw new Error(`Event ${eventId} not found in room ${roomId}.`);

    event.error = null;
    event.timestamp = Date.now();
    await this.persist();
    return event;
  }

  // --- Session Recall (`session_search`) ---

  async searchRecall({ query = '', profile, limit = 10 } = {}) {
    await this.initialize();
    const results = [];

    // Search across bot messages
    for (const msg of this.messages.values()) {
      if (profile && msg.fromProfile !== profile && msg.toProfile !== profile) continue;
      if (query && !msg.content.toLowerCase().includes(query.toLowerCase())) continue;

      results.push({
        sessionId: msg.threadId,
        profile: msg.fromProfile,
        threadId: msg.threadId,
        messageId: msg.id,
        snippet: msg.content.slice(0, 200),
        timestamp: msg.createdAt,
        score: query ? 0.9 : 0.5,
      });
    }

    // Search across room logs
    for (const [roomId, logs] of this.roomLogs.entries()) {
      for (const event of logs) {
        if (profile && event.fromProfile !== profile) continue;
        const text = typeof event.payload === 'string' ? event.payload : JSON.stringify(event.payload);
        if (query && !text.toLowerCase().includes(query.toLowerCase())) continue;

        results.push({
          sessionId: roomId,
          profile: event.fromProfile,
          threadId: roomId,
          messageId: event.eventId,
          snippet: `[Room Event #${event.seq}] ${text.slice(0, 180)}`,
          timestamp: event.timestamp,
          score: query ? 0.85 : 0.4,
        });
      }
    }

    return results.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  // --- D38 Space Profile Project Link ---

  async getSpaceLink({ spaceId, profile }) {
    await this.initialize();
    const key = `${spaceId}:${profile}`;
    const existing = this.spaceLinks.get(key);
    if (existing) return existing;

    // Return default missing link state
    return {
      spaceId,
      profile,
      projectId: null,
      host: 'This Mac',
      status: 'missing',
    };
  }

  async createSpaceLink({ spaceId, profile, projectId, host = 'This Mac' }) {
    await this.initialize();
    if (!spaceId || !profile) throw new Error('spaceId and profile are required.');

    const key = `${spaceId}:${profile}`;
    const link = {
      spaceId,
      profile,
      projectId: projectId || `proj-${profile}-${spaceId}`,
      host,
      status: 'linked',
    };

    this.spaceLinks.set(key, link);
    await this.persist();
    return link;
  }
}
