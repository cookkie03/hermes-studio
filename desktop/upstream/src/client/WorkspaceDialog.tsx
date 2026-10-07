import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { RuntimeConnections } from './RuntimeConnections';
import { characters, type Character } from './Mascot';
import type { Dot, Memory, State, WorkspaceState } from '../shared/types';
export type Dialog =
  | { type: 'space' }
  | { type: 'dot'; dot?: Dot; spaceId: string }
  | { type: 'settings' }
  | { type: 'memory'; memory?: Memory }
  | { type: 'schedule'; threadId: string };
export function WorkspaceDialog({
  dialog,
  state,
  workspace,
  onClose,
  mutate,
}: {
  dialog: Dialog;
  state: State;
  workspace: WorkspaceState;
  onClose: () => void;
  mutate: (path: string, method: string, body?: unknown) => Promise<boolean>;
}) {
  const [name, setName] = useState(
    dialog.type === 'dot' ? (dialog.dot?.name ?? '') : '',
  );
  const [text, setText] = useState(
    dialog.type === 'dot'
      ? (dialog.dot?.instructions ?? '')
      : dialog.type === 'memory'
        ? (dialog.memory?.text ?? '')
        : '',
  );
  const [research, setResearch] = useState(
    dialog.type === 'dot'
      ? (dialog.dot?.researchAllowed ?? true)
      : state.settings.researchAllowed,
  );
  const [memory, setMemory] = useState(
    dialog.type === 'dot'
      ? (dialog.dot?.memoryAllowed ?? true)
      : state.settings.memoryAllowed,
  );
  const [spaceIds, setSpaceIds] = useState(
    dialog.type === 'dot' ? (dialog.dot?.spaceIds ?? [dialog.spaceId]) : [],
  );
  const [defaultSpace, setDefaultSpace] = useState(
    dialog.type === 'dot' ? (dialog.dot?.spaceId ?? dialog.spaceId) : '',
  );
  const [interval, setInterval] = useState('86400');
  const [learningContainer, setLearningContainer] = useState(
    dialog.type === 'dot' ? (dialog.dot?.learningContainerId ?? '') : '',
  );
  const [skillDelivery, setSkillDelivery] = useState(
    dialog.type === 'dot' ? (dialog.dot?.skillDeliveryEnabled ?? true) : true,
  );
  const [avatarId, setAvatarId] = useState<Character>(
    dialog.type === 'dot' ? ((dialog.dot?.avatarId as Character) ?? 'blue') : 'blue',
  );
  const [settingsTab, setSettingsTab] = useState<'runtime' | 'studio'>('runtime');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const container = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    container.current
      ?.querySelector<HTMLElement>('input,textarea,select')
      ?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const items = [
          ...(container.current?.querySelectorAll<HTMLElement>(
            'button:not([disabled]),input,textarea,select,a[href]',
          ) ?? []),
        ];
        if (event.shiftKey && document.activeElement === items[0]) {
          event.preventDefault();
          items.at(-1)?.focus();
        } else if (!event.shiftKey && document.activeElement === items.at(-1)) {
          event.preventDefault();
          items[0]?.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, []);
  const title =
    dialog.type === 'space'
      ? 'A space for something.'
      : dialog.type === 'dot'
        ? dialog.dot
          ? 'Make this Dot yours.'
          : 'Meet your next specialist.'
        : dialog.type === 'settings'
          ? 'Your workspace, your rules.'
          : dialog.type === 'memory'
            ? 'Something to remember.'
            : 'Let your Dot keep time.';
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        ref={container}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close icon-button"
          aria-label="Close dialog"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        <span className="eyebrow">HERMES STUDIO</span>
        <h2 id="dialog-title">{title}</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            let path = '',
              method = 'POST',
              body: unknown;
            if (dialog.type === 'space') {
              path = '/spaces';
              body = { name, description: text };
            }
            if (dialog.type === 'dot') {
              path = dialog.dot ? `/dots/${dialog.dot.id}` : '/dots';
              method = dialog.dot ? 'PUT' : 'POST';
              body = {
                spaceId: defaultSpace,
                spaceIds,
                name,
                instructions: text,
                researchAllowed: research,
                memoryAllowed: memory,
                learningContainerId: learningContainer.trim() || null,
                skillDeliveryEnabled: skillDelivery,
                avatarId,
              };
            }
            if (dialog.type === 'settings') {
              path = '/settings';
              method = 'PATCH';
              body = { researchAllowed: research, memoryAllowed: memory };
            }
            if (dialog.type === 'memory') {
              path = dialog.memory
                ? `/memories/${dialog.memory.id}`
                : '/memories';
              method = dialog.memory ? 'PUT' : 'POST';
              body = { text };
            }
            if (dialog.type === 'schedule') {
              path = '/tasks';
              body = {
                prompt: text,
                threadId: dialog.threadId,
                intervalSeconds: Number(interval),
              };
            }
            if (await mutate(path, method, body)) onClose();
            else
              setError('Could not save. Review the workspace error and retry.');
            setBusy(false);
          }}
        >
          {(dialog.type === 'space' || dialog.type === 'dot') && (
            <>
              <label className="field-label" htmlFor="entity-name">
                Name
              </label>
              <input
                id="entity-name"
                value={name}
                maxLength={40}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </>
          )}
          {dialog.type === 'dot' && (
            <fieldset className="avatar-picker-fields">
              <legend className="field-label">Avatar</legend>
              <div className="avatar-picker-grid" role="radiogroup" aria-label="Choose an avatar">
                {characters.map((char) => (
                  <label
                    key={char}
                    className={`avatar-option ${avatarId === char ? 'selected' : ''}`}
                    style={{
                      display: 'inline-flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      cursor: 'pointer',
                      border: avatarId === char ? '2px solid var(--accent, #3b82f6)' : '2px solid transparent',
                      borderRadius: '8px',
                      padding: '4px',
                      marginRight: '8px',
                      background: avatarId === char ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                    }}
                  >
                    <input
                      type="radio"
                      name="avatarId"
                      value={char}
                      checked={avatarId === char}
                      onChange={() => setAvatarId(char)}
                      style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }}
                    />
                    <img
                      src={`/dots/${char}.png`}
                      alt={`${char} avatar`}
                      width={48}
                      height={48}
                      style={{ borderRadius: '4px' }}
                    />
                    <span style={{ fontSize: '12px', marginTop: '4px', textTransform: 'capitalize' }}>{char}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {dialog.type !== 'settings' && (
            <>
              <label className="field-label" htmlFor="entity-text">
                {dialog.type === 'dot'
                  ? 'Role instructions'
                  : dialog.type === 'space'
                    ? 'What belongs here?'
                    : dialog.type === 'memory'
                      ? 'Preference or context'
                      : 'Task to revisit'}
              </label>
              <textarea
                id="entity-text"
                rows={4}
                maxLength={dialog.type === 'schedule' ? 4000 : 2000}
                required={dialog.type !== 'space'}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={
                  dialog.type === 'dot'
                    ? 'You are a thoughtful research partner. Compare evidence and be clear about uncertainty.'
                    : ''
                }
              />
            </>
          )}
          {dialog.type === 'dot' && (
            <fieldset className="space-access-fields">
              <legend>Space access</legend>
              <p className="muted">
                Choose where this Dot can read and edit pages.
              </p>
              {workspace.spaces.map((space) => (
                <label className="permission-row" key={space.id}>
                  <input
                    type="checkbox"
                    checked={spaceIds.includes(space.id)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...spaceIds, space.id]
                        : spaceIds.filter((id) => id !== space.id);
                      setSpaceIds(next);
                      if (!next.includes(defaultSpace))
                        setDefaultSpace(next[0] ?? '');
                    }}
                  />
                  <span>{space.name}</span>
                </label>
              ))}
              <label className="field-label" htmlFor="default-space">
                Default destination for saved pages
              </label>
              <select
                id="default-space"
                value={defaultSpace}
                required
                onChange={(event) => setDefaultSpace(event.target.value)}
              >
                <option value="" disabled>
                  Choose a Space
                </option>
                {workspace.spaces
                  .filter((space) => spaceIds.includes(space.id))
                  .map((space) => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
              </select>
            </fieldset>
          )}
          {dialog.type === 'settings' && (
            <div className="settings-scope-tabs" role="tablist" aria-label="Settings scope">
              <button
                type="button"
                role="tab"
                aria-selected={settingsTab === 'runtime'}
                aria-controls="hermes-runtime-panel"
                id="tab-hermes-runtime"
                className={`tab-button ${settingsTab === 'runtime' ? 'active' : ''}`}
                onClick={() => setSettingsTab('runtime')}
              >
                Hermes runtime
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={settingsTab === 'studio'}
                aria-controls="hermes-studio-panel"
                id="tab-hermes-studio"
                className={`tab-button ${settingsTab === 'studio' ? 'active' : ''}`}
                onClick={() => setSettingsTab('studio')}
              >
                Hermes Studio
              </button>
            </div>
          )}
          {dialog.type === 'settings' && settingsTab === 'runtime' && (
            <div id="hermes-runtime-panel" role="tabpanel" aria-labelledby="tab-hermes-runtime">
              <h3>Hermes runtime settings</h3>
              <div className="config-note">
                <strong>Runtime Scope & Limitations</strong>
                <p>
                  Host execution targets, model selection, profiles, and tool capabilities belong strictly to the connected Hermes backend. Studio settings present runtime status without creating a divergent local configuration.
                </p>
              </div>
              <RuntimeConnections />
            </div>
          )}
          {(dialog.type === 'dot' || (dialog.type === 'settings' && settingsTab === 'studio')) && (
            <div id={dialog.type === 'settings' ? 'hermes-studio-panel' : undefined} role={dialog.type === 'settings' ? 'tabpanel' : undefined} aria-labelledby={dialog.type === 'settings' ? 'tab-hermes-studio' : undefined}>
              {dialog.type === 'settings' && <h3>Hermes Studio preferences</h3>}
              <label className="permission-row">
                <input
                  type="checkbox"
                  checked={research}
                  disabled
                  onChange={(e) => setResearch(e.target.checked)}
                />
                <span>
                  <strong>Hermes controls research tools</strong>
                  <small>
                    Tool access follows the Hermes runtime configuration. This control does not change runtime permissions.
                  </small>
                </span>
              </label>
              <label className="permission-row">
                <input
                  type="checkbox"
                  checked={memory}
                  onChange={(e) => setMemory(e.target.checked)}
                />
                <span>
                  <strong>Include Studio memories in new messages</strong>
                  <small>
                    Include saved Studio preferences in subsequent messages. This does not change Hermes memory or stop active work.
                  </small>
                </span>
              </label>
            </div>
          )}
          {dialog.type === 'dot' && <p className="muted">Automatic learning and published-skill delivery are future integrations. This Dot's role is included in new Hermes messages; changing it does not restart ongoing work.</p>}
          {dialog.type === 'schedule' && (
            <>
              <label className="field-label" htmlFor="schedule-interval">
                Repeat after each successful run
              </label>
              <select
                id="schedule-interval"
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
              >
                <option value="60">Every minute (testing)</option>
                <option value="3600">Every hour</option>
                <option value="86400">Every day</option>
                <option value="604800">Every week</option>
              </select>
              <p className="muted">
                Scheduling is not connected to Hermes in this version. No background job will be created from this form.
              </p>
            </>
          )}
          {dialog.type === 'memory' && (
            <div className="config-note" style={{ marginTop: '0.75rem', marginBottom: '0.75rem' }}>
              <strong>Scope: Studio Local Preferences</strong>
              <p>
                Stored in local Studio storage. Studio local preferences are isolated from Hermes runtime profile memory (<code>USER</code> / <code>MEMORY</code> stores) and Space Markdown files (<code>MEMORY.md</code>).
              </p>
              <p className="muted" style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                Preferences are explicit context inclusions. Avoid secrets; enabled items are included with message context sent to your model provider.
              </p>
            </div>
          )}
          {error && (
            <p className="chat-error" role="alert">
              {error}
            </p>
          )}
          <button className="primary full" disabled={busy || dialog.type === 'schedule'}>
            {busy ? 'Saving…' : 'Save'}
          </button>
        </form>
      </section>
    </div>
  );
}
