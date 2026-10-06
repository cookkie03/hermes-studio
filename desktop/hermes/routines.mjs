import { EventEmitter } from 'node:events';

export function normalizeSchedule(schedule) {
  if (!schedule) return { display: 'Manual trigger', kind: 'manual' };
  if (typeof schedule === 'object') {
    return {
      expr: schedule.expr || '',
      kind: schedule.kind || 'cron',
      display: schedule.display || schedule.expr || 'Scheduled',
      tz: schedule.tz || undefined,
    };
  }
  const str = String(schedule).trim();
  if (/^in\s+/i.test(str)) {
    return { expr: str, kind: 'one-shot', display: str };
  }
  if (/^\d+[smhdwy]$/i.test(str) || /^every\s+/i.test(str)) {
    return { expr: str, kind: 'interval', display: str.startsWith('every') ? str : `Every ${str}` };
  }
  if (/^(@(hourly|daily|weekly|monthly|yearly|annually)|(\S+\s+){4}\S+)$/.test(str)) {
    return { expr: str, kind: 'cron', display: str };
  }
  return { expr: str, kind: 'custom', display: str };
}

export function normalizeRunStatus(rawStatus) {
  const s = String(rawStatus || '').toLowerCase();
  if (['succeeded', 'success', 'completed', 'done'].includes(s)) return 'succeeded';
  if (['running', 'active', 'in_progress'].includes(s)) return 'running';
  if (['queued', 'pending'].includes(s)) return 'queued';
  if (['interrupted', 'stopped', 'aborted', 'cancelled'].includes(s)) return 'interrupted';
  if (['failed', 'error'].includes(s)) return 'failed';
  return 'unknown';
}

export function normalizeDeliveryStatus(run) {
  if (run.delivery_error || run.deliveryError) return 'delivery-failed';
  if (run.delivery_status) return run.delivery_status;
  if (run.deliveryStatus) return run.deliveryStatus;
  if (run.deliver === 'local' || run.deliveryTarget === 'local') return 'local-saved';
  if (run.deliver || run.deliveryTarget) return 'delivered';
  return 'none';
}

export class RoutinesManager extends EventEmitter {
  constructor({ connections, gateway } = {}) {
    super();
    this.connections = connections;
    this.directGateway = gateway;
    this.longTriggerTimeoutMs = 24 * 60 * 60 * 1000;
  }

  resolveGateway(connectionId = 'local') {
    if (this.directGateway) return this.directGateway;
    if (!this.connections) throw new Error('Runtime connections manager not configured.');
    const slot = this.connections.slots.get(connectionId);
    if (!slot || !slot.bridge?.gateway?.connected) {
      throw new Error(`Hermes host (${connectionId}) is offline or scheduler is unreachable.`);
    }
    return slot.bridge.gateway;
  }

  async listJobs({ connectionId = 'local', profile } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const scopeParam = profile ? `?profile=${encodeURIComponent(profile)}` : '?profile=all';
    const rawJobs = await gateway.http(`/api/cron/jobs${scopeParam}`, { method: 'GET' });
    const list = Array.isArray(rawJobs) ? rawJobs : Array.isArray(rawJobs?.jobs) ? rawJobs.jobs : [];
    
    const jobs = list.map((item) => {
      const schedule = normalizeSchedule(item.schedule || item.schedule_display);
      return {
        id: item.id,
        name: item.name || null,
        prompt: item.prompt || '',
        schedule,
        schedule_display: item.schedule_display || schedule.display,
        enabled: typeof item.enabled === 'boolean' ? item.enabled : !item.paused,
        state: item.state || (item.enabled === false || item.paused ? 'paused' : 'active'),
        deliver: item.deliver || null,
        failure_deliver: item.failure_deliver || null,
        model: item.model || null,
        provider: item.provider || null,
        connectionId,
        profile: item.profile || profile || 'default',
        last_run_at: item.last_run_at || null,
        next_run_at: item.next_run_at || null,
        last_error: item.last_error || null,
        created_at: item.created_at || null,
        updated_at: item.updated_at || null,
      };
    });

    return { jobs, schedulerActive: true, connectionId, profile: profile || 'all' };
  }

  async getJob(jobId, { connectionId = 'local', profile } = {}) {
    if (!jobId || typeof jobId !== 'string') throw new Error('A valid routine job ID is required.');
    const gateway = this.resolveGateway(connectionId);
    const query = profile ? `?profile=${encodeURIComponent(profile)}` : '';
    const item = await gateway.http(`/api/cron/jobs/${encodeURIComponent(jobId)}${query}`, { method: 'GET' });
    if (!item || !item.id) throw new Error(`Routine job ${jobId} not found.`);

    const schedule = normalizeSchedule(item.schedule || item.schedule_display);
    return {
      id: item.id,
      name: item.name || null,
      prompt: item.prompt || '',
      schedule,
      schedule_display: item.schedule_display || schedule.display,
      enabled: typeof item.enabled === 'boolean' ? item.enabled : !item.paused,
      state: item.state || (item.enabled === false || item.paused ? 'paused' : 'active'),
      deliver: item.deliver || null,
      failure_deliver: item.failure_deliver || null,
      model: item.model || null,
      provider: item.provider || null,
      connectionId,
      profile: item.profile || profile || 'default',
      last_run_at: item.last_run_at || null,
      next_run_at: item.next_run_at || null,
      last_error: item.last_error || null,
      created_at: item.created_at || null,
      updated_at: item.updated_at || null,
    };
  }

  async createJob(payload, { connectionId = 'local', profile } = {}) {
    if (!payload || typeof payload !== 'object') throw new Error('Routine payload is required.');
    if (!payload.prompt || typeof payload.prompt !== 'string' || !payload.prompt.trim()) {
      throw new Error('A self-contained routine instruction (prompt) is required.');
    }
    if (!payload.schedule || (typeof payload.schedule !== 'string' && typeof payload.schedule !== 'object')) {
      throw new Error('A valid schedule expression is required.');
    }

    const scheduleStr = typeof payload.schedule === 'object' ? payload.schedule.expr || '' : payload.schedule;
    if (!scheduleStr.trim()) throw new Error('A valid schedule expression is required.');

    const gateway = this.resolveGateway(connectionId);
    const query = profile ? `?profile=${encodeURIComponent(profile)}` : '';

    const body = {
      prompt: payload.prompt.trim(),
      schedule: scheduleStr.trim(),
      ...(payload.name ? { name: payload.name.trim() } : {}),
      ...(payload.deliver ? { deliver: payload.deliver } : {}),
      ...(payload.failure_deliver ? { failure_deliver: payload.failure_deliver } : {}),
      ...(payload.model ? { model: payload.model } : {}),
      ...(payload.provider ? { provider: payload.provider } : {}),
    };

    const created = await gateway.http(`/api/cron/jobs${query}`, {
      method: 'POST',
      body,
    });

    const schedule = normalizeSchedule(created.schedule || created.schedule_display || body.schedule);
    const result = {
      id: created.id,
      name: created.name || payload.name || null,
      prompt: created.prompt || body.prompt,
      schedule,
      schedule_display: created.schedule_display || schedule.display,
      enabled: typeof created.enabled === 'boolean' ? created.enabled : true,
      state: created.state || 'active',
      deliver: created.deliver || payload.deliver || null,
      failure_deliver: created.failure_deliver || payload.failure_deliver || null,
      model: created.model || payload.model || null,
      provider: created.provider || payload.provider || null,
      connectionId,
      profile: created.profile || profile || 'default',
      last_run_at: created.last_run_at || null,
      next_run_at: created.next_run_at || null,
      last_error: null,
      created_at: created.created_at || Date.now(),
      updated_at: created.updated_at || Date.now(),
    };

    this.emit('changed', { type: 'created', jobId: result.id, connectionId, profile: result.profile });
    return result;
  }

  async updateJob(jobId, updates, { connectionId = 'local', profile } = {}) {
    if (!jobId || typeof jobId !== 'string') throw new Error('A valid routine job ID is required.');
    if (!updates || typeof updates !== 'object') throw new Error('Updates payload is required.');

    const gateway = this.resolveGateway(connectionId);
    const query = profile ? `?profile=${encodeURIComponent(profile)}` : '';

    const payload = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.prompt !== undefined) payload.prompt = updates.prompt;
    if (updates.schedule !== undefined) {
      payload.schedule = typeof updates.schedule === 'object' ? updates.schedule.expr : updates.schedule;
    }
    if (updates.deliver !== undefined) payload.deliver = updates.deliver;
    if (updates.failure_deliver !== undefined) payload.failure_deliver = updates.failure_deliver;
    if (updates.model !== undefined) payload.model = updates.model;
    if (updates.provider !== undefined) payload.provider = updates.provider;
    if (updates.enabled !== undefined) payload.enabled = Boolean(updates.enabled);

    const updated = await gateway.http(`/api/cron/jobs/${encodeURIComponent(jobId)}${query}`, {
      method: 'PUT',
      body: { updates: payload },
    });

    const schedule = normalizeSchedule(updated.schedule || updated.schedule_display || payload.schedule);
    const result = {
      id: updated.id || jobId,
      name: updated.name !== undefined ? updated.name : updates.name,
      prompt: updated.prompt !== undefined ? updated.prompt : updates.prompt,
      schedule,
      schedule_display: updated.schedule_display || schedule.display,
      enabled: typeof updated.enabled === 'boolean' ? updated.enabled : true,
      state: updated.state || (updated.enabled ? 'active' : 'paused'),
      deliver: updated.deliver !== undefined ? updated.deliver : updates.deliver,
      failure_deliver: updated.failure_deliver !== undefined ? updated.failure_deliver : updates.failure_deliver,
      model: updated.model !== undefined ? updated.model : updates.model,
      provider: updated.provider !== undefined ? updated.provider : updates.provider,
      connectionId,
      profile: updated.profile || profile || 'default',
      last_run_at: updated.last_run_at || null,
      next_run_at: updated.next_run_at || null,
      last_error: updated.last_error || null,
      created_at: updated.created_at || null,
      updated_at: updated.updated_at || Date.now(),
    };

    this.emit('changed', { type: 'updated', jobId, connectionId, profile: result.profile });
    return result;
  }

  async pauseJob(jobId, { connectionId = 'local', profile } = {}) {
    if (!jobId) throw new Error('Routine ID is required.');
    const gateway = this.resolveGateway(connectionId);
    const query = profile ? `?profile=${encodeURIComponent(profile)}` : '';
    const res = await gateway.http(`/api/cron/jobs/${encodeURIComponent(jobId)}/pause${query}`, { method: 'POST' });
    this.emit('changed', { type: 'paused', jobId, connectionId, profile });
    return res;
  }

  async resumeJob(jobId, { connectionId = 'local', profile } = {}) {
    if (!jobId) throw new Error('Routine ID is required.');
    const gateway = this.resolveGateway(connectionId);
    const query = profile ? `?profile=${encodeURIComponent(profile)}` : '';
    const res = await gateway.http(`/api/cron/jobs/${encodeURIComponent(jobId)}/resume${query}`, { method: 'POST' });
    this.emit('changed', { type: 'resumed', jobId, connectionId, profile });
    return res;
  }

  async triggerJob(jobId, { connectionId = 'local', profile } = {}) {
    if (!jobId) throw new Error('Routine ID is required.');
    const gateway = this.resolveGateway(connectionId);
    const query = profile ? `?profile=${encodeURIComponent(profile)}` : '';
    // Note: Do not retry automatically on timeout or failure.
    const res = await gateway.http(`/api/cron/jobs/${encodeURIComponent(jobId)}/trigger${query}`, {
      method: 'POST',
      timeout: this.longTriggerTimeoutMs,
    });
    this.emit('changed', { type: 'triggered', jobId, connectionId, profile });
    return res;
  }

  async deleteJob(jobId, { connectionId = 'local', profile } = {}) {
    if (!jobId) throw new Error('Routine ID is required.');
    const gateway = this.resolveGateway(connectionId);
    const query = profile ? `?profile=${encodeURIComponent(profile)}` : '';
    await gateway.http(`/api/cron/jobs/${encodeURIComponent(jobId)}${query}`, { method: 'DELETE' });
    this.emit('changed', { type: 'deleted', jobId, connectionId, profile });
    return { ok: true, jobId };
  }

  async getRuns(jobId, { connectionId = 'local', profile, limit = 20 } = {}) {
    if (!jobId) throw new Error('Routine ID is required.');
    const gateway = this.resolveGateway(connectionId);
    const query = `?limit=${limit}${profile ? `&profile=${encodeURIComponent(profile)}` : ''}`;
    const raw = await gateway.http(`/api/cron/jobs/${encodeURIComponent(jobId)}/runs${query}`, { method: 'GET' });
    const rawRuns = Array.isArray(raw) ? raw : Array.isArray(raw?.runs) ? raw.runs : [];

    const runs = rawRuns.map((r, index) => {
      const runId = r.id || r.session_id || r.runId || `run-${index}-${Date.now()}`;
      const status = normalizeRunStatus(r.status || (r.is_active ? 'running' : 'completed'));
      const deliveryStatus = normalizeDeliveryStatus(r);
      return {
        id: runId,
        jobId,
        sessionId: r.session_id || r.sessionId || runId,
        connectionId,
        profile: r.profile || profile || 'default',
        startedAt: r.started_at || r.created_at || r.last_active || Date.now(),
        completedAt: r.completed_at || r.finished_at || null,
        status,
        deliveryStatus,
        deliveryTarget: r.deliver || r.delivery_target || r.deliveryTarget || null,
        deliveryError: r.delivery_error || r.deliveryError || null,
        resultSummary: r.result || r.summary || r.text || (r.messages?.length ? r.messages[r.messages.length - 1].content : null),
        error: r.error || r.last_error || null,
        inputTokens: r.input_tokens || 0,
        outputTokens: r.output_tokens || 0,
        costUsd: r.actual_cost_usd ?? r.estimated_cost_usd ?? null,
      };
    });

    return { runs, jobId, connectionId };
  }

  async getDeliveryTargets({ connectionId = 'local', profile } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const query = profile ? `?profile=${encodeURIComponent(profile)}` : '';
    const res = await gateway.http(`/api/cron/delivery-targets${query}`, { method: 'GET' });
    const targets = Array.isArray(res) ? res : Array.isArray(res?.targets) ? res.targets : [
      { id: 'local', name: 'Local (save only)', home_target_set: true, home_env_var: null },
    ];
    return { targets };
  }
}
