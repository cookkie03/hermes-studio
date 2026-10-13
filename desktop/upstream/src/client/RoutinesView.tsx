import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock3,
  Play,
  Pause,
  Plus,
  Search,
  RefreshCw,
  Trash2,
  Edit2,
  History,
  AlertCircle,
  CheckCircle2,
  Send,
  Loader2,
  Layers,
  Sparkles,
  ServerOff,
  Bot,
} from 'lucide-react';
import type { RoutineJob, Space, Dot } from '../shared/types';
import { api } from './api';
import { RoutineEditor } from './RoutineEditor';
import { RoutineRunHistory, formatRunTime } from './RoutineRunHistory';
import { Mascot } from './Mascot';

interface RoutinesViewProps {
  spaces?: Space[];
  dots?: Dot[];
}

export function RoutinesView({ spaces = [], dots = [] }: RoutinesViewProps) {
  const [routines, setRoutines] = useState<RoutineJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [schedulerActive, setSchedulerActive] = useState(true);
  // A blank scope preserves the native cross-profile read-only view. Mutations
  // always use the job's returned profile, so a same-named job cannot collide.
  const [ownerProfile, setOwnerProfile] = useState('');
  const [ownerProfileOptions, setOwnerProfileOptions] = useState<string[]>([]);
  const [editingRoutine, setEditingRoutine] = useState<RoutineJob | null | 'new'>(null);
  const [viewingRunsRoutine, setViewingRunsRoutine] = useState<RoutineJob | null>(null);
  const [triggeringJobId, setTriggeringJobId] = useState<string | null>(null);
  const [actionBusyJobId, setActionBusyJobId] = useState<string | null>(null);

  const routineScope = (job?: RoutineJob) =>
    job?.profile ? `?profile=${encodeURIComponent(job.profile)}` : '';

  const fetchRoutines = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const scope = ownerProfile ? `?profile=${encodeURIComponent(ownerProfile)}` : '';
      const res = await api<{ jobs: RoutineJob[]; schedulerActive?: boolean }>(
        `/hermes/routines${scope}`
      );
      setRoutines(res.jobs ?? []);
      setOwnerProfileOptions((previous) => [...new Set([
        ...previous,
        ...(res.jobs ?? []).map((job) => job.profile).filter((profile): profile is string => Boolean(profile)),
      ])].sort());
      setSchedulerActive(res.schedulerActive !== false);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Hermes routines.');
      setSchedulerActive(false);
    } finally {
      setLoading(false);
    }
  }, [ownerProfile]);

  useEffect(() => {
    void fetchRoutines();
    const timer = setInterval(() => {
      void fetchRoutines();
    }, 15000);
    return () => clearInterval(timer);
  }, [fetchRoutines]);

  const handleTogglePause = async (job: RoutineJob) => {
    setActionBusyJobId(job.id);
    try {
      const action = job.enabled ? 'pause' : 'resume';
      await api(
        `/hermes/routines/${encodeURIComponent(job.id)}/${action}${routineScope(job)}`,
        'POST',
      );
      await fetchRoutines();
    } catch (err: any) {
      setError(err?.message || `Failed to ${job.enabled ? 'pause' : 'resume'} routine.`);
    } finally {
      setActionBusyJobId(null);
    }
  };

  const handleTrigger = async (job: RoutineJob) => {
    setTriggeringJobId(job.id);
    try {
      await api(
        `/hermes/routines/${encodeURIComponent(job.id)}/trigger${routineScope(job)}`,
        'POST',
      );
      await fetchRoutines();
    } catch (err: any) {
      setError(err?.message || 'Failed to trigger routine execution.');
    } finally {
      setTriggeringJobId(null);
    }
  };

  const handleDelete = async (job: RoutineJob) => {
    if (!window.confirm(`Are you sure you want to delete routine "${job.name || job.id}"?`)) {
      return;
    }
    setActionBusyJobId(job.id);
    try {
      await api(
        `/hermes/routines/${encodeURIComponent(job.id)}${routineScope(job)}`,
        'DELETE',
      );
      await fetchRoutines();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete routine.');
    } finally {
      setActionBusyJobId(null);
    }
  };

  const filtered = routines.filter((job) => {
    const q = search.toLowerCase();
    return (
      (job.name && job.name.toLowerCase().includes(q)) ||
      (job.prompt && job.prompt.toLowerCase().includes(q)) ||
      (job.schedule_display && job.schedule_display.toLowerCase().includes(q)) ||
      job.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="routines-view-container">
      <div className="routines-top-bar">
        <div className="routines-header-title">
          <Clock3 size={24} className="text-accent" />
          <div>
            <h1>Hermes Routines</h1>
            <p className="subtitle">
              Native autonomous jobs running 24/7 in background even after closing Studio.
            </p>
          </div>
        </div>

        <div className="routines-header-actions">
          <button
            type="button"
            className="icon-button"
            aria-label="Refresh routines"
            onClick={fetchRoutines}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'spin' : ''} />
          </button>
          <button
            type="button"
            className="primary-button create-routine-btn"
            onClick={() => setEditingRoutine('new')}
          >
            <Plus size={16} />
            <span>New Routine</span>
          </button>
        </div>
      </div>

      {!schedulerActive && (
        <div className="routine-host-warning-banner" role="alert">
          <ServerOff size={18} />
          <div>
            <strong>Hermes Host Scheduler Unavailable</strong>
            <p>
              The connected Hermes runtime is offline or cron scheduler is not reachable.
              Existing schedules remain intact on the host and will execute when active.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="routine-error-banner" role="alert">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="routines-controls-bar">
        <label className="routine-profile-filter">
          <span>Owner profile</span>
          <select
            aria-label="Filter routines by owner profile"
            value={ownerProfile}
            onChange={(event) => setOwnerProfile(event.target.value)}
            disabled={loading}
          >
            <option value="">All profiles (read-only view)</option>
            {ownerProfileOptions.map((profile) => (
              <option key={profile} value={profile}>{profile}</option>
            ))}
          </select>
        </label>
        <label className="search-box">
          <Search size={16} />
          <input
            aria-label="Search routines"
            placeholder="Search routines by name, prompt or schedule…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </div>

      <div className="routines-content-area">
        {loading && routines.length === 0 ? (
          <div className="routine-loading-state">
            <Loader2 size={28} className="spin text-accent" />
            <span>Fetching scheduled routines from Hermes…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="routine-empty-state">
            <Mascot small={false} decorative />
            <h2>{search ? 'No matching routines found' : 'Let Hermes handle recurring work.'}</h2>
            <p>
              {search
                ? 'Try a different search query or clear the filter.'
                : 'Create routines like “Daily Morning Research Digest”, “Weekly Report Preparation”, or recurring checks that execute 24/7.'}
            </p>
            {!search && (
              <button
                type="button"
                className="primary-button mt-4"
                onClick={() => setEditingRoutine('new')}
              >
                <Plus size={16} />
                <span>Create your first Routine</span>
              </button>
            )}
          </div>
        ) : (
          <div className="routines-grid">
            {filtered.map((job) => {
              const isTriggering = triggeringJobId === job.id;
              const isActionBusy = actionBusyJobId === job.id;
              const scheduleText =
                job.schedule_display ||
                (typeof job.schedule === 'object' ? job.schedule?.display : job.schedule) ||
                'Scheduled';

              return (
                <div key={job.id} className={`routine-card ${!job.enabled ? 'is-paused' : ''}`}>
                  <div className="routine-card-header">
                    <div className="routine-card-title-block">
                      <div className="routine-name-row">
                        <h3>{job.name || 'Untitled Routine'}</h3>
                        <span
                          className={`routine-state-pill ${
                            !job.enabled ? 'paused' : 'active'
                          }`}
                        >
                          {job.enabled ? (
                            <>
                              <CheckCircle2 size={12} /> Active
                            </>
                          ) : (
                            <>
                              <Pause size={12} /> Paused
                            </>
                          )}
                        </span>
                      </div>
                      <span className="routine-id-tag">ID: {job.id}</span>
                      {job.deliver?.startsWith('bot-chat') && (
                        <span className="routine-bot-owner-tag" title="Bot Chat target is machine-local">
                          Bot Chat: {job.profile || 'own profile'}
                        </span>
                      )}
                    </div>

                    <div className="routine-card-actions">
                      <button
                        type="button"
                        className="quiet-button action-icon-btn"
                        aria-label="View run history"
                        title="Run History & Logs"
                        onClick={() => setViewingRunsRoutine(job)}
                      >
                        <History size={16} />
                      </button>
                      <button
                        type="button"
                        className="quiet-button action-icon-btn"
                        aria-label="Edit routine"
                        title="Edit Routine"
                        onClick={() => setEditingRoutine(job)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="quiet-button action-icon-btn danger"
                        aria-label="Delete routine"
                        title="Delete Routine"
                        onClick={() => handleDelete(job)}
                        disabled={isActionBusy}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="routine-prompt-preview">
                    <p>{job.prompt}</p>
                  </div>

                  <div className="routine-metadata-pills">
                    <span className="meta-pill schedule-pill" title="Schedule">
                      <Clock3 size={12} /> {scheduleText}
                    </span>
                    {job.deliver && (
                      <span className={`meta-pill deliver-pill ${job.deliver.startsWith('bot-chat') ? 'bot-chat-pill' : ''}`} title="Delivery Destination">
                        <Send size={12} /> {job.deliver}
                      </span>
                    )}
                    {job.deliver?.startsWith('bot-chat') && (
                      <span className="routine-delivery-note">
                        Bot Chat delivery starts a separate turn in the owning profile.
                      </span>
                    )}
                    {job.model && (
                      <span className="meta-pill model-pill" title="Model Override">
                        <Sparkles size={12} /> {job.model}
                      </span>
                    )}
                    <span className="meta-pill profile-pill" title="Owning Host / Profile">
                      <Layers size={12} /> {job.connectionId || 'local'}:{job.profile || 'default'}
                    </span>
                  </div>

                  <div className="routine-card-footer">
                    <div className="routine-timing-info">
                      {job.next_run_at ? (
                        <span>Next: <strong>{formatRunTime(job.next_run_at)}</strong></span>
                      ) : null}
                      {job.last_run_at ? (
                        <span>Last run: {formatRunTime(job.last_run_at)}</span>
                      ) : null}
                    </div>

                    <div className="routine-footer-buttons">
                      <button
                        type="button"
                        className="quiet-button"
                        onClick={() => handleTogglePause(job)}
                        disabled={isActionBusy}
                      >
                        {job.enabled ? (
                          <>
                            <Pause size={14} /> Pause
                          </>
                        ) : (
                          <>
                            <Play size={14} /> Resume
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        className="primary-button run-now-btn"
                        onClick={() => handleTrigger(job)}
                        disabled={isTriggering || isActionBusy}
                      >
                        {isTriggering ? (
                          <>
                            <Loader2 size={14} className="spin" /> Running…
                          </>
                        ) : (
                          <>
                            <Play size={14} /> Run Now
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingRoutine && (
        <RoutineEditor
          routine={editingRoutine === 'new' ? null : editingRoutine}
          profile={editingRoutine === 'new' ? (ownerProfile || undefined) : undefined}
          spaces={spaces}
          dots={dots}
          onSave={(saved) => {
            setEditingRoutine(null);
            void fetchRoutines();
            setOwnerProfileOptions((previous) => [...new Set([...previous, saved.profile].filter((profile): profile is string => Boolean(profile)))].sort());
          }}
          onClose={() => setEditingRoutine(null)}
        />
      )}

      {viewingRunsRoutine && (
        <RoutineRunHistory
          routine={viewingRunsRoutine}
          onClose={() => setViewingRunsRoutine(null)}
        />
      )}
    </div>
  );
}
