import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { RoutinesManager, normalizeSchedule, normalizeRunStatus, normalizeDeliveryStatus } from './routines.mjs';

class MockGateway extends EventEmitter {
  constructor() {
    super();
    this.connected = true;
    this.jobsByProfile = new Map(); // profile -> Map(jobId -> job)
    this.runsByJob = new Map(); // jobId -> [runs]
    this.deliveryTargets = [
      { id: 'local', name: 'Local (save only)', home_target_set: true, home_env_var: null },
      { id: 'telegram', name: 'Telegram', home_target_set: true, home_env_var: 'TELEGRAM_CHANNEL' },
    ];
    this.httpCalls = [];
    this.triggerBehavior = 'success';
  }

  getProfileMap(profile = 'default') {
    if (!this.jobsByProfile.has(profile)) {
      this.jobsByProfile.set(profile, new Map());
    }
    return this.jobsByProfile.get(profile);
  }

  async http(path, { method = 'GET', body, timeout } = {}) {
    this.httpCalls.push({ path, method, body, timeout });
    if (!this.connected) throw new Error('Hermes backend is offline.');

    const url = new URL(path, 'http://127.0.0.1');
    const pathname = url.pathname;
    const profile = url.searchParams.get('profile') || 'default';
    if (pathname === '/api/cron/jobs' && method === 'POST' && !url.searchParams.get('profile')) {
      throw new Error('A concrete owner profile is required to create a routine.');
    }

    // GET /api/cron/delivery-targets
    if (pathname === '/api/cron/delivery-targets' && method === 'GET') {
      return { targets: this.deliveryTargets };
    }

    // GET /api/cron/jobs
    if (pathname === '/api/cron/jobs' && method === 'GET') {
      if (profile === 'all') {
        const allJobs = [];
        for (const [prof, map] of this.jobsByProfile.entries()) {
          for (const job of map.values()) {
            allJobs.push({ ...job, profile: prof });
          }
        }
        return allJobs;
      }
      const map = this.getProfileMap(profile);
      return [...map.values()].map(j => ({ ...j, profile }));
    }

    // POST /api/cron/jobs
    if (pathname === '/api/cron/jobs' && method === 'POST') {
      const map = this.getProfileMap(profile);
      const id = body.id || `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const job = {
        id,
        name: body.name || null,
        prompt: body.prompt,
        schedule: body.schedule,
        schedule_display: body.schedule,
        enabled: true,
        state: 'active',
        deliver: body.deliver || 'local',
        failure_deliver: body.failure_deliver || null,
        model: body.model || null,
        provider: body.provider || null,
        profile,
        created_at: Date.now(),
        updated_at: Date.now(),
      };
      map.set(id, job);
      return job;
    }

    // Single job routes: /api/cron/jobs/:id[/pause|resume|trigger|runs]
    const jobMatch = pathname.match(/^\/api\/cron\/jobs\/([^/]+)(?:\/(pause|resume|trigger|runs))?$/);
    if (jobMatch) {
      const jobId = decodeURIComponent(jobMatch[1]);
      const action = jobMatch[2];
      const map = this.getProfileMap(profile);
      let job = map.get(jobId);

      // If not found in requested profile and profile is not explicit, search all
      if (!job && profile === 'all') {
        for (const [p, m] of this.jobsByProfile.entries()) {
          if (m.has(jobId)) {
            job = m.get(jobId);
            break;
          }
        }
      }

      if (action === 'runs' && method === 'GET') {
        const runs = this.runsByJob.get(jobId) || [];
        return { runs };
      }

      if (action === 'pause' && method === 'POST') {
        if (!job) throw new Error(`Job ${jobId} not found`);
        job.enabled = false;
        job.state = 'paused';
        return job;
      }

      if (action === 'resume' && method === 'POST') {
        if (!job) throw new Error(`Job ${jobId} not found`);
        job.enabled = true;
        job.state = 'active';
        return job;
      }

      if (action === 'trigger' && method === 'POST') {
        if (!job) throw new Error(`Job ${jobId} not found`);
        if (this.triggerBehavior === 'timeout') {
          throw new Error('Trigger request timed out after 24 hours.');
        }
        if (this.triggerBehavior === 'error') {
          throw new Error('Trigger execution failed server-side.');
        }
        const runId = `run-${Date.now()}`;
        const run = {
          id: runId,
          jobId,
          session_id: `sess-${runId}`,
          profile,
          status: 'succeeded',
          result: 'Executed scheduled routine successfully.',
          deliver: job.deliver,
          delivery_status: 'delivered',
          started_at: Date.now(),
          completed_at: Date.now() + 1200,
        };
        const runs = this.runsByJob.get(jobId) || [];
        runs.unshift(run);
        this.runsByJob.set(jobId, runs);
        return { ok: true, run };
      }

      if (!action && method === 'GET') {
        if (!job) throw new Error(`Job ${jobId} not found`);
        return job;
      }

      if (!action && method === 'PUT') {
        if (!job) throw new Error(`Job ${jobId} not found`);
        const updates = body.updates || {};
        Object.assign(job, updates, { updated_at: Date.now() });
        return job;
      }

      if (!action && method === 'DELETE') {
        if (!job) throw new Error(`Job ${jobId} not found`);
        map.delete(jobId);
        return { ok: true };
      }
    }

    throw new Error(`Unhandled mock path: ${method} ${pathname}`);
  }
}

test('normalizeSchedule parses intervals, one-shot, and cron expressions', () => {
  assert.equal(normalizeSchedule('30m').kind, 'interval');
  assert.equal(normalizeSchedule('30m').display, 'Every 30m');
  assert.equal(normalizeSchedule('every 2h').kind, 'interval');
  assert.equal(normalizeSchedule('in 45m').kind, 'one-shot');
  assert.equal(normalizeSchedule('in 2 hours').kind, 'one-shot');
  assert.equal(normalizeSchedule('0 9 * * 1-5').kind, 'cron');
  assert.equal(normalizeSchedule('@daily').kind, 'cron');
  assert.equal(normalizeSchedule({ expr: '0 8 * * *', kind: 'cron', display: 'Daily 8am', tz: 'Europe/Rome' }).tz, 'Europe/Rome');
});

test('RoutinesManager: lifecycle (create, list, update, pause, resume, trigger, delete)', async () => {
  const gateway = new MockGateway();
  const manager = new RoutinesManager({ gateway });

  // 1. Create a routine
  const created = await manager.createJob({
    name: 'Morning Digest',
    prompt: 'Summarize top research updates.',
    schedule: '0 8 * * *',
    deliver: 'telegram',
    model: 'auto/fast',
  }, { profile: 'default' });

  assert.equal(created.name, 'Morning Digest');
  assert.equal(created.prompt, 'Summarize top research updates.');
  assert.equal(created.enabled, true);
  assert.equal(created.state, 'active');
  assert.equal(created.schedule.kind, 'cron');

  // 2. List routines
  const { jobs } = await manager.listJobs();
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0].id, created.id);

  // 3. Pause routine
  await manager.pauseJob(created.id);
  const pausedJob = await manager.getJob(created.id);
  assert.equal(pausedJob.enabled, false);
  assert.equal(pausedJob.state, 'paused');

  // 4. Resume routine
  await manager.resumeJob(created.id);
  const resumedJob = await manager.getJob(created.id);
  assert.equal(resumedJob.enabled, true);
  assert.equal(resumedJob.state, 'active');

  // 5. Update routine
  const updated = await manager.updateJob(created.id, {
    name: 'Updated Morning Digest',
    prompt: 'Summarize top tech news and papers.',
    schedule: 'in 2h',
  });
  assert.equal(updated.name, 'Updated Morning Digest');
  assert.equal(updated.schedule.kind, 'one-shot');

  // 6. Trigger routine (run now)
  await manager.triggerJob(created.id);
  const { runs } = await manager.getRuns(created.id);
  assert.equal(runs.length, 1);
  assert.equal(runs[0].status, 'succeeded');
  assert.equal(runs[0].deliveryStatus, 'delivered');

  // 7. Delete routine
  const delRes = await manager.deleteJob(created.id);
  assert.equal(delRes.ok, true);
  const remaining = await manager.listJobs();
  assert.equal(remaining.jobs.length, 0);
});

test('RoutinesManager: identical jobId across distinct profiles does not collide', async () => {
  const gateway = new MockGateway();
  const manager = new RoutinesManager({ gateway });

  // Manually insert same jobId under profile "research" and profile "personal"
  const jobResearch = {
    id: 'digest-01',
    name: 'Research Digest',
    prompt: 'Gather arxiv papers',
    schedule: 'every 1d',
    enabled: true,
  };
  const jobPersonal = {
    id: 'digest-01',
    name: 'Personal Digest',
    prompt: 'Check personal reminders',
    schedule: 'every 1d',
    enabled: true,
  };

  gateway.getProfileMap('research').set('digest-01', jobResearch);
  gateway.getProfileMap('personal').set('digest-01', jobPersonal);

  const resResearch = await manager.getJob('digest-01', { profile: 'research' });
  const resPersonal = await manager.getJob('digest-01', { profile: 'personal' });

  assert.equal(resResearch.name, 'Research Digest');
  assert.equal(resResearch.profile, 'research');
  assert.equal(resPersonal.name, 'Personal Digest');
  assert.equal(resPersonal.profile, 'personal');

  const { jobs: allJobs } = await manager.listJobs({ profile: 'all' });
  assert.equal(allJobs.length, 2);
  const profiles = allJobs.map(j => j.profile);
  assert.ok(profiles.includes('research'));
  assert.ok(profiles.includes('personal'));
});

test('RoutinesManager: failed delivery is distinct from failed run execution', async () => {
  const gateway = new MockGateway();
  const manager = new RoutinesManager({ gateway });

  // Simulate a run where model succeeded, but external platform delivery failed (e.g. invalid telegram token)
  gateway.runsByJob.set('job-delivery-err', [
    {
      id: 'run-101',
      jobId: 'job-delivery-err',
      session_id: 'sess-101',
      status: 'succeeded',
      result: 'Finished draft report.',
      deliver: 'telegram',
      delivery_status: 'delivery-failed',
      delivery_error: 'Telegram API returned 403 Forbidden (bot kicked from group)',
      started_at: Date.now() - 5000,
      completed_at: Date.now() - 4000,
    },
  ]);

  const { runs } = await manager.getRuns('job-delivery-err');
  assert.equal(runs.length, 1);
  assert.equal(runs[0].status, 'succeeded'); // Run itself succeeded!
  assert.equal(runs[0].deliveryStatus, 'delivery-failed'); // Delivery failed!
  assert.equal(runs[0].deliveryError, 'Telegram API returned 403 Forbidden (bot kicked from group)');
  assert.equal(runs[0].resultSummary, 'Finished draft report.');
});

test('RoutinesManager: trigger timeout does not retry automatically', async () => {
  const gateway = new MockGateway();
  gateway.triggerBehavior = 'timeout';
  const manager = new RoutinesManager({ gateway });

  const job = {
    id: 'long-job',
    prompt: 'Long training task',
    schedule: '0 0 * * *',
    enabled: true,
  };
  gateway.getProfileMap('default').set('long-job', job);

  await assert.rejects(
    async () => {
      await manager.triggerJob('long-job');
    },
    /timed out/
  );

  // Exactly one call was made, no automatic second attempt
  const triggerCalls = gateway.httpCalls.filter(c => c.path.includes('/trigger'));
  assert.equal(triggerCalls.length, 1);
});

test('RoutinesManager: reports clear error when host is offline or scheduler unreachable', async () => {
  const gateway = new MockGateway();
  gateway.connected = false;
  const manager = new RoutinesManager({ gateway });

  await assert.rejects(
    async () => {
      await manager.listJobs();
    },
    /offline/
  );
});

test('RoutinesManager: update cannot change the owning profile', async () => {
  const manager = new RoutinesManager({ gateway: new MockGateway() });
  await assert.rejects(
    manager.updateJob('missing', { profile: 'bot-b' }),
    /ownership is immutable/,
  );
});

test('RoutinesManager: bot-chat delivery target is passed through without fan-out', async () => {
  const gateway = new MockGateway();
  gateway.deliveryTargets.push({ id: 'bot-chat:bot-a', name: 'Bot A Chat', home_target_set: true });
  const manager = new RoutinesManager({ gateway });
  const created = await manager.createJob({
    name: 'Bot A recurring check',
    prompt: 'Check the synthetic queue and report changes.',
    schedule: '30m',
    deliver: 'bot-chat:bot-a',
  }, { profile: 'bot-a' });
  assert.equal(created.profile, 'bot-a');
  assert.equal(created.deliver, 'bot-chat:bot-a');
  assert.equal(gateway.httpCalls.filter((call) => call.method === 'POST').length, 1);
});

test('RoutinesManager: creation without a concrete profile is rejected', async () => {
  const manager = new RoutinesManager({ gateway: new MockGateway() });
  await assert.rejects(
    manager.createJob({ prompt: 'Synthetic task', schedule: '1h' }),
    /concrete owner profile/,
  );
});
test('RoutinesManager: historical runs survive client close and relaunch', async () => {
  const gateway = new MockGateway();
  // Populate backend storage with runs
  gateway.runsByJob.set('persistent-job', [
    {
      id: 'run-prev-01',
      jobId: 'persistent-job',
      session_id: 'sess-prev-01',
      status: 'succeeded',
      result: 'Autonomous overnight synthesis completed.',
      deliver: 'local',
      started_at: Date.now() - 86400000,
      completed_at: Date.now() - 86390000,
    },
    {
      id: 'run-prev-02',
      jobId: 'persistent-job',
      session_id: 'sess-prev-02',
      status: 'interrupted',
      error: 'Host was suspended mid-execution.',
      started_at: Date.now() - 43200000,
      completed_at: Date.now() - 43100000,
    }
  ]);

  // Simulate client instance 1
  let manager = new RoutinesManager({ gateway });
  let { runs } = await manager.getRuns('persistent-job');
  assert.equal(runs.length, 2);
  assert.equal(runs[0].status, 'succeeded');
  assert.equal(runs[1].status, 'interrupted');

  // Client closes and restarts (fresh RoutinesManager instance against same backend)
  manager = new RoutinesManager({ gateway });
  let fetchedAfterRestart = await manager.getRuns('persistent-job');
  assert.equal(fetchedAfterRestart.runs.length, 2);
  assert.equal(fetchedAfterRestart.runs[0].resultSummary, 'Autonomous overnight synthesis completed.');
  assert.equal(fetchedAfterRestart.runs[1].error, 'Host was suspended mid-execution.');
});

test('native output history keeps unknown success, second-based times, output and delivery evidence',async()=>{
 const gateway=new MockGateway();gateway.runsByJob.set('native-output',[{id:'cron_output:j:exec:0',title:'FAILED · crash',preview:'crash',source:'cron_output',started_at:1791831400,ended_at:1791831401,is_active:false,deliver:'telegram'}]);
 const manager=new RoutinesManager({gateway});const {runs}=await manager.getRuns('native-output',{profile:'qa'});
 assert.equal(runs[0].status,'unknown');assert.equal(runs[0].startedAt,1791831400000);assert.equal(runs[0].completedAt,1791831401000);assert.equal(runs[0].resultSummary,'crash');assert.equal(runs[0].deliveryStatus,'none');
});
