import React, { useState, useEffect } from 'react';
import {
  Clock3,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Ban,
  Send,
  RefreshCw,
  Coins,
  Cpu,
} from 'lucide-react';
import type { RoutineJob, RoutineRun } from '../shared/types';
import { api } from './api';

interface RoutineRunHistoryProps {
  routine: RoutineJob;
  onClose: () => void;
}

export function formatRunTime(ts: number | string | null | undefined): string {
  if (!ts) return '—';
  const time = typeof ts === 'string' ? new Date(ts).getTime() : ts;
  if (isNaN(time) || time <= 0) return String(ts);
  return new Date(time).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function RoutineRunHistory({ routine, onClose }: RoutineRunHistoryProps) {
  const [runs, setRuns] = useState<RoutineRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRunId, setExpandedRunId] = useState<string | null>(null);

  const fetchRuns = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api<{ runs: RoutineRun[] }>(
        `/hermes/routines/${encodeURIComponent(routine.id)}/runs?limit=30&connectionId=${encodeURIComponent(routine.connectionId ?? 'local')}${routine.profile ? `&profile=${encodeURIComponent(routine.profile)}` : ''}`
      );
      setRuns(res.runs ?? []);
      if (res.runs?.length > 0 && !expandedRunId) {
        setExpandedRunId(res.runs[0].id);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch routine run history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRuns();
  }, [routine.id, routine.connectionId, routine.profile]);

  const renderStatusBadge = (status: RoutineRun['status']) => {
    switch (status) {
      case 'succeeded':
        return (
          <span className="run-badge run-succeeded" title="Execution completed successfully">
            <CheckCircle2 size={12} /> Succeeded
          </span>
        );
      case 'running':
        return (
          <span className="run-badge run-running" title="Execution in progress">
            <Loader2 size={12} className="spin" /> Running
          </span>
        );
      case 'failed':
        return (
          <span className="run-badge run-failed" title="Execution failed">
            <XCircle size={12} /> Failed
          </span>
        );
      case 'interrupted':
        return (
          <span className="run-badge run-interrupted" title="Execution interrupted / cancelled">
            <Ban size={12} /> Interrupted
          </span>
        );
      case 'queued':
        return (
          <span className="run-badge run-queued" title="Queued for execution">
            <Clock3 size={12} /> Queued
          </span>
        );
      default:
        return (
          <span className="run-badge run-unknown">
            <AlertTriangle size={12} /> {status}
          </span>
        );
    }
  };

  const renderDeliveryBadge = (deliveryStatus?: RoutineRun['deliveryStatus'], deliveryTarget?: string | null) => {
    if (!deliveryStatus || deliveryStatus === 'none') return null;
    if (deliveryStatus === 'delivery-failed') {
      return (
        <span className="delivery-badge delivery-error" title="Output delivery failed">
          <XCircle size={11} /> Delivery Error
        </span>
      );
    }
    if (deliveryStatus === 'local-saved') {
      return (
        <span className="delivery-badge delivery-local" title="Saved locally">
          <CheckCircle2 size={11} /> Local Saved
        </span>
      );
    }
    if (deliveryStatus !== 'delivered') return <span className="delivery-badge">Delivery: {deliveryStatus}</span>;
    return (
      <span className="delivery-badge delivery-success" title={`Delivered to ${deliveryTarget || 'platform'}`}>
        <Send size={11} /> Delivered ({deliveryTarget || 'Platform'})
      </span>
    );
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="runs-dialog-title">
      <div className="routine-runs-card">
        <div className="routine-runs-header">
          <div>
            <h2 id="runs-dialog-title">Run History & Delivery</h2>
            <p className="routine-runs-subtitle">
              {routine.name ? `Routine: ${routine.name}` : `Job ID: ${routine.id}`}
            </p>
          </div>
          <div className="routine-runs-header-actions">
            <button
              type="button"
              className="icon-button"
              aria-label="Refresh run history"
              onClick={fetchRuns}
              disabled={loading}
            >
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label="Close run history"
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {error && (
          <div className="routine-error-banner" role="alert">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="routine-runs-body">
          {loading && runs.length === 0 ? (
            <div className="routine-loading-state">
              <Loader2 size={24} className="spin text-accent" />
              <span>Loading execution logs from Hermes…</span>
            </div>
          ) : runs.length === 0 ? (
            <div className="routine-empty-runs">
              <Clock3 size={32} />
              <h3>No runs recorded yet</h3>
              <p>When this routine executes according to its schedule or trigger, its runs and outputs will appear here.</p>
            </div>
          ) : (
            <div className="routine-runs-list">
              {runs.map((run) => {
                const isExpanded = expandedRunId === run.id;
                return (
                  <div
                    key={run.id}
                    className={`routine-run-item ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => setExpandedRunId(isExpanded ? null : run.id)}
                  >
                    <div className="routine-run-summary-row">
                      <div className="run-time-col">
                        <strong>{formatRunTime(run.startedAt)}</strong>
                        <small>{run.sessionId || run.id}</small>
                      </div>

                      <div className="run-status-col">
                        {renderStatusBadge(run.status)}
                        {renderDeliveryBadge(run.deliveryStatus, run.deliveryTarget)}
                      </div>

                      {(run.inputTokens || run.outputTokens || run.costUsd) && (
                        <div className="run-metrics-col">
                          {run.costUsd ? (
                            <span className="metric-tag" title="Total USD Cost">
                              <Coins size={11} /> ${run.costUsd.toFixed(4)}
                            </span>
                          ) : null}
                          {run.outputTokens ? (
                            <span className="metric-tag" title="Tokens (in/out)">
                              <Cpu size={11} /> {run.inputTokens ?? 0} / {run.outputTokens}
                            </span>
                          ) : null}
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div className="routine-run-detail-pane" onClick={(e) => e.stopPropagation()}>
                        {run.error && (
                          <div className="run-error-box">
                            <strong>Execution Error:</strong>
                            <pre>{run.error}</pre>
                          </div>
                        )}

                        {run.deliveryError && (
                          <div className="run-delivery-error-box">
                            <strong>Delivery Warning:</strong>
                            <p>{run.deliveryError}</p>
                          </div>
                        )}

                        {run.resultSummary && (
                          <div className="run-result-box">
                            <strong>Result / Summary:</strong>
                            <div className="run-result-text">{run.resultSummary}</div>
                          </div>
                        )}

                        <div className="run-metadata-footer">
                          <span>Connection: <code>{run.connectionId || 'local'}</code></span>
                          <span>Profile: <code>{run.profile || 'Not reported'}</code></span>
                          {run.completedAt ? (
                            <span>Finished: {formatRunTime(run.completedAt)}</span>
                          ) : null}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
