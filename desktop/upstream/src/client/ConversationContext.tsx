export interface NativeSessionInfo {
  profile_name?: unknown;
  model?: unknown;
  reasoning_effort?: unknown;
  reasoning_effort_wire?: unknown;
  cwd?: unknown;
  project?: { id?: unknown; name?: unknown } | null;
}
export interface StudioConversationContext {
  studioSpace: { id: string; name: string } | null;
  nativeProjectLink: 'unavailable';
  nativeBotBinding: 'unavailable';
}
const reported = (value: unknown) => typeof value === 'string' && value ? value : 'Not reported';
export function ConversationContext({ context, info, connected, host }: {
  context?: StudioConversationContext; info?: NativeSessionInfo; connected: boolean; host?: string;
}) {
  return <section className="conversation-context" aria-label="Conversation context">
    <dl>
      <div><dt>Studio Space</dt><dd>{context ? context.studioSpace ? `${context.studioSpace.name} · document context` : 'None selected' : 'Loading…'}</dd></div>
      <div><dt>Host</dt><dd>{host ?? 'Not reported'}{!connected && ' · offline'}</dd></div>
      <div><dt>Hermes profile</dt><dd>{reported(info?.profile_name)}</dd></div>
      <div><dt>Model</dt><dd>{reported(info?.model)}</dd></div>
      <div><dt>Effort</dt><dd>{reported(info?.reasoning_effort)}{typeof info?.reasoning_effort_wire === 'string' && info.reasoning_effort_wire && info.reasoning_effort_wire !== info.reasoning_effort && ` · runtime sends ${info.reasoning_effort_wire}`}</dd></div>
    </dl>
    <details><summary>Native project and specialist context</summary>
      <p>Native project: {reported(info?.project?.name)} · ID: {reported(info?.project?.id)}. Working folder: {reported(info?.cwd)}.</p>
      <p>Space-to-profile project links and native Bot identity are not connected yet. A Studio specialist label does not select a Hermes profile. Documents sent with this chat do not change its native project or grant access to another profile.</p>
      {!connected && <p>Native context is unverified while offline.</p>}
    </details>
  </section>;
}
