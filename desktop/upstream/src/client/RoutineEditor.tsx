import React, { useState, useEffect } from 'react';
import { Clock3, X, AlertCircle, Sparkles, Send } from 'lucide-react';
import type { RoutineJob, RoutineDeliveryTarget, Space, Dot } from '../shared/types';
import { api } from './api';

interface RoutineEditorProps {
  routine?: RoutineJob | null;
  spaces?: Space[];
  dots?: Dot[];
  onSave: (saved: RoutineJob) => void;
  onClose: () => void;
  profile?: string;
}

export function RoutineEditor({
  routine,
  spaces = [],
  dots = [],
  onSave,
  onClose,
  profile,
}: RoutineEditorProps) {
  const [name, setName] = useState(routine?.name ?? '');
  const [prompt, setPrompt] = useState(routine?.prompt ?? '');
  const [scheduleKind, setScheduleKind] = useState<'interval' | 'daily' | 'cron' | 'oneshot'>(() => {
    if (!routine?.schedule) return 'interval';
    const s = typeof routine.schedule === 'object' ? routine.schedule.expr || '' : routine.schedule;
    if (/^in\s+/i.test(s)) return 'oneshot';
    if (/^(@|(\S+\s+){4}\S+)/.test(s)) return 'cron';
    if (/\d+:\d+/.test(s) || /daily/i.test(s)) return 'daily';
    return 'interval';
  });
  const [scheduleExpr, setScheduleExpr] = useState(() => {
    if (!routine?.schedule) return '1h';
    return typeof routine.schedule === 'object' ? routine.schedule.expr || '1h' : routine.schedule;
  });
  const [deliver, setDeliver] = useState(routine?.deliver ?? 'local');
  const [model, setModel] = useState(routine?.model ?? '');
  const effectiveProfile = routine?.profile ?? profile;
  const routineScope = effectiveProfile ? `?profile=${encodeURIComponent(effectiveProfile)}` : '';
  const [targets, setTargets] = useState<RoutineDeliveryTarget[]>([
    { id: 'local', name: 'Local (save only)', home_target_set: true },
  ]);
  const selectedTargetUnavailable = Boolean(deliver && !targets.some((target) => target.id === deliver && target.home_target_set));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void api<{ targets: RoutineDeliveryTarget[] }>(
      `/hermes/routines/delivery-targets${routineScope}`,
    )
      .then((res) => {
        if (Array.isArray(res?.targets) && res.targets.length > 0) {
          setTargets(res.targets);
        }
      })
      .catch(() => {});
  }, [routineScope]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please provide a self-contained instruction for Hermes.');
      return;
    }
    if (!scheduleExpr.trim()) {
      setError('Please provide a schedule.');
      return;
    }
    if (selectedTargetUnavailable) {
      setError('The selected delivery destination is not available on this Hermes host.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      let saved: RoutineJob;
      if (routine?.id) {
        saved = await api<RoutineJob>(`/hermes/routines/${encodeURIComponent(routine.id)}${routineScope}`, 'PUT', {
          name: name.trim() || null,
          prompt: prompt.trim(),
          schedule: scheduleExpr.trim(),
          deliver: deliver || 'local',
          model: model.trim() || null,
        });
      } else {
        const createScope = profile ? `?profile=${encodeURIComponent(profile)}` : '';
        saved = await api<RoutineJob>(`/hermes/routines${createScope}`, 'POST', {
          name: name.trim() || undefined,
          prompt: prompt.trim(),
          schedule: scheduleExpr.trim(),
          deliver: deliver || 'local',
          model: model.trim() || undefined,
        });
      }
      onSave(saved);
    } catch (err: any) {
      setError(err?.message || 'Failed to save routine.');
    } finally {
      setBusy(false);
    }
  };

  const handleSchedulePreset = (kind: 'interval' | 'daily' | 'cron' | 'oneshot', val: string) => {
    setScheduleKind(kind);
    setScheduleExpr(val);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="routine-editor-title">
      <div className="routine-editor-card">
        {routine?.profile && (
          <p className="routine-owner-notice" role="note">
            Owner profile: <strong>{routine.profile}</strong>. Delivery and changes stay in this profile.
          </p>
        )}
        {deliver.startsWith('bot-chat') && (
          <p className="routine-owner-notice" role="note">
            Bot Chat is machine-local. Hermes will start a separate Bot turn when the scheduler delivers a result.
          </p>
        )}
        <div className="routine-editor-header">
          <div className="routine-editor-title-group">
            <Clock3 size={20} className="text-accent" />
            <h2 id="routine-editor-title">{routine ? 'Edit Routine' : 'New Routine'}</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close routine editor"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="routine-error-banner" role="alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="routine-editor-form">
          <div className="form-group">
            <label htmlFor="routine-name">Routine Name (optional)</label>
            <input
              id="routine-name"
              type="text"
              placeholder="e.g. Daily Research Digest, Morning Briefing"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
              maxLength={120}
            />
          </div>

          <div className="form-group">
            <label htmlFor="routine-prompt">
              Self-contained Instruction (Prompt) <span className="required-star">*</span>
            </label>
            <textarea
              id="routine-prompt"
              rows={4}
              placeholder="Provide complete instructions. Hermes executes routines autonomously in a fresh session with no prior conversation context."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={busy}
              required
            />
            <small className="form-hint">
              💡 Routines run 24/7 on the native Hermes scheduler even when Studio is closed.
            </small>
          </div>

          <div className="form-group">
            <label>Schedule Preset</label>
            <div className="schedule-presets">
              <button
                type="button"
                className={`preset-btn ${scheduleKind === 'interval' && scheduleExpr === '30m' ? 'active' : ''}`}
                onClick={() => handleSchedulePreset('interval', '30m')}
              >
                Every 30m
              </button>
              <button
                type="button"
                className={`preset-btn ${scheduleKind === 'interval' && scheduleExpr === '1h' ? 'active' : ''}`}
                onClick={() => handleSchedulePreset('interval', '1h')}
              >
                Every 1h
              </button>
              <button
                type="button"
                className={`preset-btn ${scheduleKind === 'daily' && scheduleExpr === '0 9 * * *' ? 'active' : ''}`}
                onClick={() => handleSchedulePreset('daily', '0 9 * * *')}
              >
                Daily 9:00 AM
              </button>
              <button
                type="button"
                className={`preset-btn ${scheduleKind === 'daily' && scheduleExpr === '0 8 * * 1-5' ? 'active' : ''}`}
                onClick={() => handleSchedulePreset('daily', '0 8 * * 1-5')}
              >
                Weekdays 8:00 AM
              </button>
              <button
                type="button"
                className={`preset-btn ${scheduleKind === 'oneshot' ? 'active' : ''}`}
                onClick={() => handleSchedulePreset('oneshot', 'in 1h')}
              >
                One-shot (in 1h)
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="routine-schedule-expr">Schedule Expression</label>
            <input
              id="routine-schedule-expr"
              type="text"
              placeholder="e.g. 30m, 2h, 0 9 * * *, in 45m"
              value={scheduleExpr}
              onChange={(e) => setScheduleExpr(e.target.value)}
              disabled={busy}
              required
            />
            <small className="form-hint">
              Supports intervals (e.g. <code>30m</code>, <code>2h</code>), cron expressions (e.g. <code>0 9 * * 1-5</code>), or relative delays (e.g. <code>in 2 hours</code>).
            </small>
          </div>

          <div className="form-row">
            <div className="form-group flex-1">
              <label htmlFor="routine-delivery">Delivery Destination</label>
              <select
                id="routine-delivery"
                value={deliver}
                onChange={(e) => setDeliver(e.target.value)}
                disabled={busy}
              >
                {targets.map((t) => (
                  <option key={t.id} value={t.id} disabled={!t.home_target_set}>
                    {t.name} {!t.home_target_set ? '(Not configured)' : ''}
                  </option>
                ))}
                {!targets.some((target) => target.id.startsWith('bot-chat')) && (
                  <option value="bot-chat" disabled>
                    Bot Chat (not advertised by host)
                  </option>
                )}
              </select>
              {selectedTargetUnavailable && (
                <small className="form-hint" role="alert">
                  This destination is not confirmed by the connected Hermes host and cannot be scheduled.
                </small>
              )}
            </div>

            <div className="form-group flex-1">
              <label htmlFor="routine-model">Model Override (optional)</label>
              <input
                id="routine-model"
                type="text"
                placeholder="Default agent model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={busy}
              />
            </div>
          </div>

          <div className="routine-editor-actions">
            <button
              type="button"
              className="quiet-button"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
              disabled={busy || !prompt.trim() || !scheduleExpr.trim()}
            >
              <Send size={14} />
              {busy ? 'Saving…' : routine ? 'Save Changes' : 'Create Routine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
