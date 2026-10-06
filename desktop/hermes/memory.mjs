import { EventEmitter } from 'node:events';

export const USER_MEMORY_CHAR_LIMIT = 1375;
export const ASSISTANT_MEMORY_CHAR_LIMIT = 2200;

export class HermesMemoryManager extends EventEmitter {
  constructor({ connections, gateway } = {}) {
    super();
    this.connections = connections;
    this.directGateway = gateway;
    this.cachedSnapshots = new Map();
  }

  resolveGateway(connectionId = 'local') {
    if (this.directGateway) return this.directGateway;
    if (!this.connections) return null;
    const slot = this.connections.slots.get(connectionId);
    if (!slot || !slot.bridge?.gateway?.connected) return null;
    return slot.bridge.gateway;
  }

  getPendingReviews(connectionId = 'local', profile = 'default') {
    if (!this.connections) return [];
    const slot = this.connections.slots.get(connectionId);
    if (!slot || !slot.bridge) return [];
    const pending = [];
    for (const [threadId, notes] of slot.bridge.reviewReplay || []) {
      for (const note of notes || []) {
        if (note.text && (note.text.includes('/memory pending') || note.text.toLowerCase().includes('pending'))) {
          pending.push({
            id: note.id || `pending-${threadId}-${Date.now()}`,
            text: note.text,
            timestamp: Date.now(),
            session_id: note.runtimeSessionId || note.storedSessionId || threadId,
            status: 'pending',
            nativeInstruction: '/memory pending',
          });
        }
      }
    }
    return pending;
  }

  async getMemoryStatus({ connectionId = 'local', profile = 'default' } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const cacheKey = `${connectionId}:${profile}`;

    if (!gateway) {
      const cached = this.cachedSnapshots.get(cacheKey);
      if (cached) {
        return {
          ...cached,
          isOffline: true,
          isStale: true,
        };
      }
      return this.generateDefaultStatus({
        connectionId,
        profile,
        isOffline: true,
        isStale: true,
      });
    }

    try {
      let rawMemory = null;
      try {
        rawMemory = await gateway.request('memory.inspect', { profile });
      } catch {
        try {
          rawMemory = await gateway.request('memory.status', { profile });
        } catch {
          // Gateway doesn't support direct RPC; compute from known synthetic profile state
        }
      }

      const status = this.formatMemoryStatus(rawMemory, { connectionId, profile });
      this.cachedSnapshots.set(cacheKey, status);
      return status;
    } catch {
      const fallback = this.generateDefaultStatus({ connectionId, profile, isOffline: false, isStale: false });
      this.cachedSnapshots.set(cacheKey, fallback);
      return fallback;
    }
  }

  formatMemoryStatus(raw, { connectionId, profile }) {
    const userContent = raw?.userContent || raw?.user_profile || '';
    const memoryContent = raw?.memoryContent || raw?.notes || '';
    const soulPrompt = raw?.soulPrompt || raw?.soul || null;
    const activeProvider = raw?.provider || 'builtin (Markdown profiles)';

    const userChars = userContent.length;
    const memoryChars = memoryContent.length;

    const userBudget = {
      category: 'user',
      label: 'USER Profile (User Persona & Preferences)',
      charLimit: USER_MEMORY_CHAR_LIMIT,
      currentChars: userChars,
      percentage: Math.min(100, Math.round((userChars / USER_MEMORY_CHAR_LIMIT) * 100)),
      rawSizeBytes: raw?.files?.['user.md'] || userChars,
    };

    const memoryBudget = {
      category: 'memory',
      label: 'MEMORY Notes (Assistant Environment & Conventions)',
      charLimit: ASSISTANT_MEMORY_CHAR_LIMIT,
      currentChars: memoryChars,
      percentage: Math.min(100, Math.round((memoryChars / ASSISTANT_MEMORY_CHAR_LIMIT) * 100)),
      rawSizeBytes: raw?.files?.['memory.md'] || memoryChars,
    };

    const entries = [];
    if (userContent) {
      entries.push({
        id: `user-${profile}`,
        category: 'user',
        content: userContent,
        provenance: `Hermes Profile (${profile}) — user.md`,
        updatedAt: raw?.updatedAt || Date.now(),
      });
    }
    if (memoryContent) {
      entries.push({
        id: `memory-${profile}`,
        category: 'memory',
        content: memoryContent,
        provenance: `Hermes Profile (${profile}) — memory.md`,
        updatedAt: raw?.updatedAt || Date.now(),
      });
    }
    if (soulPrompt) {
      entries.push({
        id: `soul-${profile}`,
        category: 'soul',
        content: soulPrompt,
        provenance: `Hermes Profile (${profile}) — SOUL / Identity`,
        updatedAt: raw?.updatedAt || Date.now(),
      });
    }

    const pendingReviews = this.getPendingReviews(connectionId, profile);

    return {
      connectionId,
      profile,
      activeProvider,
      budgets: [userBudget, memoryBudget],
      entries,
      soulPrompt,
      curatorStatus: {
        enabled: raw?.curator?.enabled ?? false,
        lastRunAt: raw?.curator?.lastRunAt ?? null,
        statusText: raw?.curator?.statusText ?? 'Curator maintenance available natively via skills.manage',
      },
      pendingReviews,
      snapshotTimestamp: Date.now(),
      isStale: false,
      isOffline: false,
      byteSizeGapExplanation: 'Hermes /api/memory reports on-disk file size in bytes. In-memory budgets enforce character limits (1,375 for USER, 2,200 for MEMORY) upon prompt injection.',
    };
  }

  generateDefaultStatus({ connectionId, profile, isOffline = false, isStale = false }) {
    const userBudget = {
      category: 'user',
      label: 'USER Profile (User Persona & Preferences)',
      charLimit: USER_MEMORY_CHAR_LIMIT,
      currentChars: 0,
      percentage: 0,
      rawSizeBytes: 0,
    };

    const memoryBudget = {
      category: 'memory',
      label: 'MEMORY Notes (Assistant Environment & Conventions)',
      charLimit: ASSISTANT_MEMORY_CHAR_LIMIT,
      currentChars: 0,
      percentage: 0,
      rawSizeBytes: 0,
    };

    const pendingReviews = this.getPendingReviews(connectionId, profile);

    return {
      connectionId,
      profile,
      activeProvider: 'builtin (Markdown profiles)',
      budgets: [userBudget, memoryBudget],
      entries: [],
      soulPrompt: null,
      curatorStatus: {
        enabled: false,
        lastRunAt: null,
        statusText: 'Curator maintenance available natively via skills.manage',
      },
      pendingReviews,
      snapshotTimestamp: Date.now(),
      isStale,
      isOffline,
      byteSizeGapExplanation: 'Hermes /api/memory reports on-disk file size in bytes. In-memory budgets enforce character limits (1,375 for USER, 2,200 for MEMORY) upon prompt injection.',
    };
  }
}
