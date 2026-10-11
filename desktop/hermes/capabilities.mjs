import { EventEmitter } from 'node:events';

export class CapabilitiesManager extends EventEmitter {
  constructor({ connections, gateway } = {}) {
    super();
    this.connections = connections;
    this.directGateway = gateway;
  }

  resolveGateway(connectionId = 'local') {
    if (this.directGateway) return this.directGateway;
    if (!this.connections) throw new Error('Runtime connections manager not configured.');
    const slot = this.connections.slots.get(connectionId);
    if (!slot || !slot.bridge?.gateway?.connected) {
      throw new Error(`Hermes host (${connectionId}) is offline or backend is unreachable.`);
    }
    return slot.bridge.gateway;
  }

  async listToolsets({ connectionId = 'local', sessionId } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = {};
    if (sessionId) params.session_id = sessionId;
    return await gateway.request('tools.list', params);
  }

  async showTools({ connectionId = 'local', sessionId } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = {};
    if (sessionId) params.session_id = sessionId;
    return await gateway.request('tools.show', params);
  }

  async listPlugins({ connectionId = 'local', profile } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = { action: 'list' };
    if (profile) params.profile = profile;
    return await gateway.request('plugins.manage', params);
  }

  async listSkills({ connectionId = 'local', profile } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = { action: 'list' };
    if (profile) params.profile = profile;
    return await gateway.request('skills.manage', params);
  }

  async snapshot({ connectionId = 'local', profile, sessionId } = {}) {
    const [toolsets, tools, plugins, skills] = await Promise.all([
      this.listToolsets({ connectionId, sessionId }),
      this.showTools({ connectionId, sessionId }),
      this.listPlugins({ connectionId, profile }),
      this.listSkills({ connectionId, profile }),
    ]);
    return {
      fetchedAt: new Date().toISOString(),
      connectionId,
      profile: profile || null,
      sessionId: sessionId || null,
      toolsets,
      tools,
      plugins,
      skills,
    };
  }
}
