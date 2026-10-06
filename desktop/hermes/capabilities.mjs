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

  async listToolsets({ connectionId = 'local', profile, sessionId } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = {};
    if (profile) params.profile = profile;
    if (sessionId) params.session_id = sessionId;
    return await gateway.request('tools.list', params);
  }

  async showTools({ connectionId = 'local', profile, sessionId } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = {};
    if (profile) params.profile = profile;
    if (sessionId) params.session_id = sessionId;
    return await gateway.request('tools.show', params);
  }

  async configureTools({ action, names, connectionId = 'local', profile, sessionId } = {}) {
    if (!['enable', 'disable'].includes(action)) {
      throw new Error('Invalid action for tool configuration. Must be enable or disable.');
    }
    if (!Array.isArray(names) || names.length === 0) {
      throw new Error('Names list cannot be empty.');
    }
    const gateway = this.resolveGateway(connectionId);
    const params = { action, names };
    if (profile) params.profile = profile;
    if (sessionId) params.session_id = sessionId;
    return await gateway.request('tools.configure', params);
  }

  async listPlugins({ connectionId = 'local', profile } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = { action: 'list' };
    if (profile) params.profile = profile;
    return await gateway.request('plugins.manage', params);
  }

  async managePlugin({ action, name, key, enable, identifier, repo, force, ref, accept_capabilities, values, connectionId = 'local', profile } = {}) {
    const validActions = ['list', 'toggle', 'install', 'update', 'remove', 'settings', 'onboarding'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid plugin action: ${action}`);
    }
    const gateway = this.resolveGateway(connectionId);
    const params = { action };
    if (profile) params.profile = profile;
    if (name !== undefined) params.name = name;
    if (key !== undefined) params.key = key;
    if (enable !== undefined) params.enable = enable;
    if (identifier !== undefined) params.identifier = identifier;
    if (repo !== undefined) params.repo = repo;
    if (force !== undefined) params.force = force;
    if (ref !== undefined) params.ref = ref;
    if (accept_capabilities !== undefined) params.accept_capabilities = accept_capabilities;
    if (values !== undefined) params.values = values;
    return await gateway.request('plugins.manage', params);
  }

  async listSkills({ connectionId = 'local', profile } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = { action: 'list' };
    if (profile) params.profile = profile;
    return await gateway.request('skills.manage', params);
  }

  async manageSkills({ action = 'list', query, page, page_size, connectionId = 'local', profile } = {}) {
    const validActions = ['list', 'search', 'install', 'browse', 'inspect'];
    if (!validActions.includes(action)) {
      throw new Error(`Invalid skill action: ${action}`);
    }
    const gateway = this.resolveGateway(connectionId);
    const params = { action };
    if (profile) params.profile = profile;
    if (query !== undefined) params.query = query;
    if (page !== undefined) params.page = page;
    if (page_size !== undefined) params.page_size = page_size;
    return await gateway.request('skills.manage', params);
  }

  async reloadSkills({ connectionId = 'local', profile, sessionId } = {}) {
    const gateway = this.resolveGateway(connectionId);
    const params = {};
    if (profile) params.profile = profile;
    if (sessionId) params.session_id = sessionId;
    return await gateway.request('skills.reload', params);
  }
}
