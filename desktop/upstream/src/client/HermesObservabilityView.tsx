import React, { useState, useEffect } from 'react';
import type {
  HermesNativeMemoryStatus,
  HermesCapabilityMatrix,
  HermesCapabilityMatrixItem,
} from '../shared/types';
import { CapabilitiesView } from './CapabilitiesView';

export function HermesObservabilityView({
  connectionId = 'local',
  profile = 'default',
}: {
  connectionId?: string;
  profile?: string;
}) {
  const [memoryStatus, setMemoryStatus] = useState<HermesNativeMemoryStatus | null>(null);
  const [capabilityMatrix, setCapabilityMatrix] = useState<HermesCapabilityMatrix | null>(null);
  const [capabilityPanel, setCapabilityPanel] = useState<'overview' | 'catalog'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'memory' | 'capabilities'>('memory');

  useEffect(() => {
    let active = true;
    async function loadObservability() {
      try {
        setLoading(true);
        const [memRes, capRes] = await Promise.all([
          fetch(`/api/hermes/memory?connectionId=${connectionId}&profile=${profile}`),
          fetch(`/api/hermes/capabilities/matrix?connectionId=${connectionId}&profile=${profile}`),
        ]);

        if (active) {
          if (memRes.ok) {
            setMemoryStatus(await memRes.json());
          }
          if (capRes.ok) {
            setCapabilityMatrix(await capRes.json());
          }
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load Hermes observability data');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadObservability();
    return () => {
      active = false;
    };
  }, [connectionId, profile]);

  if (loading) {
    return (
      <div className="hermes-observability-view loading" role="region" aria-label="Hermes Observability Loading">
        <p>Inspecting native Hermes capabilities and memory status...</p>
      </div>
    );
  }

  return (
    <div className="hermes-observability-view" role="region" aria-label="Hermes Memory & Capabilities Observability">
      <header className="observability-header">
        <div>
          <h2>Hermes Observability & Native Memory</h2>
          <p className="subtext">
            Authoritative profile memory from connected backend ({connectionId} / {profile}).
          </p>
        </div>
        <div className="observability-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'memory'}
            className={`tab-button ${activeTab === 'memory' ? 'active' : ''}`}
            onClick={() => setActiveTab('memory')}
          >
            Profile Memory & Budgets
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'capabilities'}
            className={`tab-button ${activeTab === 'capabilities' ? 'active' : ''}`}
            onClick={() => setActiveTab('capabilities')}
          >
            Capabilities Matrix
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      {activeTab === 'memory' && memoryStatus && (
        <section className="observability-section memory-section" aria-label="Memory Observability">
          <div className="memory-info-card">
            <div className="info-badge">
              <span>Provider: <strong>{memoryStatus.activeProvider}</strong></span>
              <span>Connection: <strong>{memoryStatus.connectionId}</strong></span>
              <span>Profile: <strong>{memoryStatus.profile}</strong></span>
              {memoryStatus.isOffline && <span className="offline-tag">Offline Snapshot</span>}
            </div>

            <div className="memory-budgets-grid">
              {memoryStatus.budgets.map((budget) => (
                <article key={budget.category} className="budget-card">
                  <header>
                    <h3>{budget.label}</h3>
                    <span className="budget-percent">{budget.percentage}%</span>
                  </header>
                  <div className="progress-bar-track" role="progressbar" aria-valuenow={budget.percentage} aria-valuemin={0} aria-valuemax={100}>
                    <div
                      className={`progress-bar-fill ${budget.percentage > 90 ? 'critical' : budget.percentage > 70 ? 'warning' : 'ok'}`}
                      style={{ width: `${Math.min(100, budget.percentage)}%` }}
                    />
                  </div>
                  <footer className="budget-footer">
                    <span>
                      {budget.currentChars.toLocaleString()} / {budget.charLimit.toLocaleString()} chars
                    </span>
                    <small>Enforced on injection</small>
                  </footer>
                </article>
              ))}
            </div>

            <div className="gap-explanation-box">
              <strong>Verified API Gap & Specification Notice:</strong>
              <p>{memoryStatus.byteSizeGapExplanation}</p>
            </div>
          </div>

          {memoryStatus.pendingReviews.length > 0 && (
            <div className="pending-reviews-block">
              <h3>Pending Self-Improvement Reviews</h3>
              {memoryStatus.pendingReviews.map((review) => (
                <div key={review.id} className="pending-review-card">
                  <p>{review.text}</p>
                  <div className="pending-review-action">
                    <span>Native resolution required: <code>{review.nativeInstruction}</code></span>
                    <small>Execute command in chat timeline to approve or discard.</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="memory-entries-list">
            <h3>Active Memory Entries in Profile ({memoryStatus.entries.length})</h3>
            {memoryStatus.entries.length === 0 ? (
              <p className="empty-notice">No active memory entries recorded in this profile yet.</p>
            ) : (
              memoryStatus.entries.map((entry) => (
                <article key={entry.id} className="memory-entry-card">
                  <header>
                    <span className={`entry-badge ${entry.category}`}>{entry.category.toUpperCase()}</span>
                    <small>{entry.provenance}</small>
                  </header>
                  <pre className="entry-content">{entry.content}</pre>
                </article>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'capabilities' && (
        <section className="observability-section capabilities-section" aria-label="Capabilities Matrix">
          <div className="capabilities-subtabs" role="tablist" aria-label="Capabilities content">
            <button type="button" role="tab" aria-selected={capabilityPanel === 'overview'} className={`tab-button ${capabilityPanel === 'overview' ? 'active' : ''}`} onClick={() => setCapabilityPanel('overview')}>Coverage overview</button>
            <button type="button" role="tab" aria-selected={capabilityPanel === 'catalog'} className={`tab-button ${capabilityPanel === 'catalog' ? 'active' : ''}`} onClick={() => setCapabilityPanel('catalog')}>Native catalog</button>
          </div>
          {capabilityPanel === 'catalog' ? (
            <CapabilitiesView connectionId={connectionId} profile={profile} />
          ) : capabilityMatrix && (
            <div className="capabilities-grid">
              {capabilityMatrix.items.map((item: HermesCapabilityMatrixItem) => (
                <article key={item.id} className="capability-card">
                  <header>
                    <span className="card-badge">{item.owningCard}</span>
                    <h3>{item.name}</h3>
                    <span className={`status-pill ${item.status}`}>{item.status.replace('_', ' ')}</span>
                  </header>
                  <p className="surface-info"><strong>Surface:</strong> {item.surface}</p>
                  <p className="contract-info"><strong>Native Contract:</strong> <code>{item.nativeContract}</code></p>
                  <p className="evidence-info">{item.evidence}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
