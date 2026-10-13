export function resolveThreadScope(connections, threadId) {
  if (typeof threadId !== 'string' || !threadId) throw new Error('An owned conversation is required.');
  if (!connections) throw new Error('Runtime connections are not configured.');
  const bridge = connections.forThread(threadId);
  const host = connections.threadHost(threadId);
  if (!host.connected || !bridge.gateway.connected) throw new Error('The owning Hermes host is offline.');
  const session = bridge.sessions.get(threadId);
  if (!session?.runtimeId) throw new Error('Open the owned conversation to load its native session first.');
  const profile = session.info?.profile_name || bridge.bindings?.get(threadId)?.profile;
  if (typeof profile !== 'string' || !profile) throw new Error('The native session has not reported its profile.');
  return { bridge, gateway: bridge.gateway, session, runtimeId: session.runtimeId, threadId, profile, connectionId: host.connectionId, host: host.name, generation: bridge.transportGeneration };
}
export function assertCurrentScope(connections, owner) {
  const current = resolveThreadScope(connections, owner.threadId);
  if (current.gateway !== owner.gateway || current.runtimeId !== owner.runtimeId || current.profile !== owner.profile || current.generation !== owner.generation) throw new Error('The native conversation changed while the operation was pending.');
  return current;
}
