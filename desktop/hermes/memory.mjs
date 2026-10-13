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
    for (const [threadId, binding] of slot.bridge.bindings || []) {
      const notes = Array.isArray(binding.reviewNotes) ? binding.reviewNotes : [];
      const ownerProfile=slot.bridge.sessions?.get(threadId)?.info?.profile_name ?? slot.bridge.bindings?.get(threadId)?.profile;
      if(ownerProfile!==profile)continue;
      for (const note of notes || []) {
        if (note.text && (note.text.includes('/memory pending') || note.text.toLowerCase().includes('pending'))) {
          pending.push({
            id: note.id || `pending-${threadId}`,
            text: note.text,
            timestamp: note.receivedAt ? Date.parse(note.receivedAt) : null,
            session_id: note.runtimeSessionId || note.storedSessionId || threadId,
            status: 'review-note',
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
      if(typeof gateway.http !== 'function')throw new Error('Native memory HTTP transport is unavailable.');
      const rawMemory = await gateway.http(`/api/memory?profile=${encodeURIComponent(profile)}`);
      if(!rawMemory || !rawMemory.builtin_files || !Array.isArray(rawMemory.providers))throw new Error('Hermes did not report its memory metadata contract.');
      const raw = {...rawMemory,provider:rawMemory.active || 'Not reported',files:{'user.md':rawMemory.builtin_files.user,'memory.md':rawMemory.builtin_files.memory}};
      // File content is optional and must use a native roster home, never a Mac path guess.
      if(typeof gateway.request === 'function') {
        try {
          const roster=await gateway.request('profiles.list',{include_sessions:false});
          const owner=roster.profiles?.find(row=>row.name===profile || profile==='default' && row.is_default);
          if(typeof owner?.path==='string' && owner.path) {
            for(const [file,key] of [['USER.md','userContent'],['MEMORY.md','memoryContent']]) {
              const path=owner.path.replace(/[\\/]$/,'')+'/memories/'+file;
              const value=await gateway.http(`/api/fs/read-text?profile=${encodeURIComponent(profile)}&path=${encodeURIComponent(path)}`);
              if(typeof value.text==='string' && !value.binary && !value.truncated)raw[key]=value.text;
            }
          }
        }catch{/* Metadata remains valid; unreadable content stays explicitly unknown. */}
        try {const soul=await gateway.http(`/api/profiles/${encodeURIComponent(profile)}/soul`);if(soul.exists===true && typeof soul.content==='string')raw.soulPrompt=soul.content;}catch{}
      }
      const status = this.formatMemoryStatus(raw, { connectionId, profile });
      this.cachedSnapshots.set(cacheKey, status); return status;
    } catch (error) {
      const cached=this.cachedSnapshots.get(cacheKey);
      return {...(cached ?? this.generateDefaultStatus({connectionId,profile,isOffline:false,isStale:true})),available:false,isStale:true,reason:error.message};
    }
  }

  formatMemoryStatus(raw, { connectionId, profile }) {
    const userContent = raw?.userContent || raw?.user_profile || '';
    const memoryContent = raw?.memoryContent || raw?.notes || '';
    const soulPrompt = raw?.soulPrompt || raw?.soul || null;
    const activeProvider = raw?.provider || 'Not reported';

    const userChars = typeof raw?.userContent==='string' ? userContent.length : null;
    const memoryChars = typeof raw?.memoryContent==='string' ? memoryContent.length : null;

    const userBudget = {
      category: 'user',
      label: 'USER Profile (User Persona & Preferences)',
      charLimit: null,
      currentChars: userChars,
      percentage: null,
      rawSizeBytes: raw?.files?.['user.md'] ?? null,
    };

    const memoryBudget = {
      category: 'memory',
      label: 'MEMORY Notes (Assistant Environment & Conventions)',
      charLimit: null,
      currentChars: memoryChars,
      percentage: null,
      rawSizeBytes: raw?.files?.['memory.md'] ?? null,
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
      available: true,
      contentAvailable: userChars !== null && memoryChars !== null,
      activeProvider,
      budgets: [userBudget, memoryBudget],
      entries,
      soulPrompt,
      curatorStatus: {
        enabled: raw?.curator?.enabled ?? false,
        lastRunAt: raw?.curator?.lastRunAt ?? null,
        statusText: raw?.curator?.statusText ?? 'Native curator state not reported.',
      },
      pendingReviews,
      snapshotTimestamp: Date.now(),
      isStale: false,
      isOffline: false,
      byteSizeGapExplanation: 'Hermes /api/memory reports on-disk file size in bytes. Full text is shown only when the native profile home and read-text endpoint are verified. Configured injection character limits are not reported by this API; missing content is unknown, not empty.',
    };
  }

  generateDefaultStatus({ connectionId, profile, isOffline = false, isStale = false }) {
    const userBudget = {
      category: 'user',
      label: 'USER Profile (User Persona & Preferences)',
      charLimit: null,
      currentChars: null,
      percentage: null,
      rawSizeBytes: null,
    };

    const memoryBudget = {
      category: 'memory',
      label: 'MEMORY Notes (Assistant Environment & Conventions)',
      charLimit: null,
      currentChars: null,
      percentage: null,
      rawSizeBytes: null,
    };

    const pendingReviews = this.getPendingReviews(connectionId, profile);

    return {
      connectionId,
      profile,
      available: false,
      contentAvailable: false,
      activeProvider: 'Not reported',
      budgets: [userBudget, memoryBudget],
      entries: [],
      soulPrompt: null,
      curatorStatus: {
        enabled: false,
        lastRunAt: null,
        statusText: 'Native curator state not reported.',
      },
      pendingReviews,
      snapshotTimestamp: Date.now(),
      isStale,
      isOffline,
      byteSizeGapExplanation: 'Hermes /api/memory reports on-disk file size in bytes. Full text is shown only when the native profile home and read-text endpoint are verified. Configured injection character limits are not reported by this API; missing content is unknown, not empty.',
    };
  }
}
