import { EventEmitter } from 'node:events';
import { randomUUID } from 'node:crypto';

export function checkStaleSnapshot(timestamp, activeWindow, targetWindow) {
  const ageMs = Date.now() - (timestamp || 0);
  if (ageMs > 30000) return true;
  if (activeWindow && targetWindow && activeWindow !== targetWindow) return true;
  return false;
}

export function truncatePayloadIfNeeded(resultPayload) {
  if (!resultPayload) return { payload: resultPayload, truncated: false };
  const jsonStr = typeof resultPayload === 'string' ? resultPayload : JSON.stringify(resultPayload);
  if (jsonStr.length <= 65536) {
    return { payload: resultPayload, truncated: false };
  }
  const summaryText = typeof resultPayload === 'object' && resultPayload.result_text
    ? String(resultPayload.result_text).slice(0, 8000)
    : jsonStr.slice(0, 8000);
  return {
    payload: {
      summary: summaryText,
      truncated: true,
      originalLength: jsonStr.length,
    },
    truncated: true,
  };
}

export class ComputerManager extends EventEmitter {
  constructor({ connections } = {}) {
    super();
    this.connections = connections;
    this.captures = new Map(); // connectionId -> CaptureReceipt[]
    this.actions = new Map();  // connectionId -> ComputerActionRequest[]
    this.leases = new Map();   // connectionId -> BotScreenLease
    this.probedHosts = new Set(); // hosts that emitted a native computer_use event

    if (this.connections) {
      this.connections.on('update', event => this.handleRuntimeEvent(event));
    }
  }

  getTarget({ connectionId = 'local', threadId } = {}) {
    const connId = connectionId || 'local';
    const lease = this.getLease({ connectionId: connId });
    const connection = this.connections?.statusFor?.(connId);
    const connected = connection?.connected === true;
    const probed = this.probedHosts.has(connId);
    return {
      connectionId: connId,
      host: connection?.host || connection?.name || (connId === 'local' ? 'This Mac' : `Host (${connId})`),
      profile: 'default',
      app: undefined,
      window: undefined,
      driverStatus: probed ? (connected ? 'available' : 'unavailable') : 'unavailable',
      modes: probed && connected ? ['som', 'vision', 'ax'] : [],
      humanHasControl: lease.humanHasControl,
      // Bot Screen is a separate native contract; do not claim it from a tool connection.
      botScreenStreamAvailable: false,
    };
  }

  getLease({ connectionId = 'local' } = {}) {
    const connId = connectionId || 'local';
    if (!this.leases.has(connId)) {
      this.leases.set(connId, {
        active: false,
        leasedBy: 'agent',
        humanHasControl: false,
      });
    }
    return this.leases.get(connId);
  }

  setHumanControl({ connectionId = 'local', threadId, humanHasControl } = {}) {
    const connId = connectionId || 'local';
    const current = this.getLease({ connectionId: connId });
    const updated = {
      ...current,
      active: humanHasControl,
      leasedBy: humanHasControl ? 'human' : 'agent',
      humanHasControl: Boolean(humanHasControl),
    };
    this.leases.set(connId, updated);
    
    this.emit('changed', {
      type: 'computer.lease.changed',
      connectionId: connId,
      threadId,
      lease: updated,
    });

  return {
    ...this.getTarget({ connectionId: connId, threadId }),
    ...updated,
  };
  }

  getCaptures({ connectionId = 'local', threadId } = {}) {
    const connId = connectionId || 'local';
    const list = this.captures.get(connId) || [];
    const target = this.getTarget({ connectionId: connId, threadId });

    // Mark staleness dynamically
    return list.map(capture => ({
      ...capture,
      stale: checkStaleSnapshot(capture.timestamp, target.window, capture.targetWindow),
    }));
  }

  recordCapture({ connectionId = 'local', threadId, capture } = {}) {
    const connId = connectionId || 'local';
    const list = this.captures.get(connId) || [];
    const receipt = {
      id: capture.id || randomUUID(),
      timestamp: capture.timestamp || Date.now(),
      mode: capture.mode || 'som',
      targetApp: capture.targetApp || 'Finder',
      targetWindow: capture.targetWindow || 'Desktop',
      imageUrl: capture.imageUrl || null,
      base64: capture.base64 || null,
      textSummary: capture.textSummary || null,
      elements: capture.elements || [],
      stale: false,
    };

    const updated = [receipt, ...list].slice(0, 50);
    this.captures.set(connId, updated);

    this.emit('changed', {
      type: 'computer.capture.changed',
      connectionId: connId,
      threadId,
      capture: receipt,
    });

    return receipt;
  }

  getActivity({ connectionId = 'local', threadId } = {}) {
    const connId = connectionId || 'local';
    return this.actions.get(connId) || [];
  }

  recordAction({ connectionId = 'local', threadId, action } = {}) {
    const connId = connectionId || 'local';
    const target = this.getTarget({ connectionId: connId, threadId });
    const lease = this.getLease({ connectionId: connId });

    let status = action.status || 'pending_approval';
    let error = action.error;

    if (lease.humanHasControl) {
      status = 'denied';
      error = 'Human has control of the computer. Agent action paused/denied.';
    }

    const { payload, truncated } = truncatePayloadIfNeeded(action.result);

    const record = {
      id: action.id || randomUUID(),
      toolId: action.toolId,
      action: action.action || 'capture',
      args: action.args || {},
      target,
      status,
      createdAt: action.createdAt || Date.now(),
      approvedAt: action.approvedAt,
      completedAt: action.completedAt,
      preCapture: action.preCapture,
      postCapture: action.postCapture,
      resultSummary: typeof payload === 'string' ? payload : JSON.stringify(payload),
      error,
      payloadTruncated: truncated,
    };

    const list = this.actions.get(connId) || [];
    const existingIdx = list.findIndex(item => item.id === record.id || (record.toolId && item.toolId === record.toolId));

    let updated;
    if (existingIdx >= 0) {
      updated = [...list];
      updated[existingIdx] = { ...updated[existingIdx], ...record };
    } else {
      updated = [record, ...list].slice(0, 100);
    }

    this.actions.set(connId, updated);

    this.emit('changed', {
      type: 'computer.activity.changed',
      connectionId: connId,
      threadId,
      action: record,
    });

    return record;
  }

  handleRuntimeEvent(event) {
    if (!event) return;
    const runtime = event.type === 'runtime' && event.event ? event.event : event;
    const name = runtime.payload?.name || runtime.name;
    if (!name || (!name.startsWith('computer_') && name !== 'computer_use')) return;

    const connId = event.connectionId || runtime.connectionId || 'local';
    const threadId = event.threadId || runtime.threadId;
    this.probedHosts.add(connId);

    if (runtime.type === 'tool.start') {
      const args = runtime.payload?.args || {};
      const actionName = args.action || name.replace(/^computer_/, '') || 'capture';
      this.recordAction({
        connectionId: connId,
        threadId,
        action: {
          toolId: runtime.payload?.tool_id,
          action: actionName,
          args,
          status: 'working',
          createdAt: Date.now(),
        },
      });
    } else if (runtime.type === 'tool.complete') {
      const toolId = runtime.payload?.tool_id;
      const result = runtime.payload?.result;
      const error = runtime.payload?.error;

      // Extract capture if result contains snapshot / base64 / screenshot
      if (result && typeof result === 'object' && (result.base64 || result.image_url || result.screenshot)) {
        this.recordCapture({
          connectionId: connId,
          threadId,
          capture: {
            mode: result.mode || 'som',
            targetApp: result.app,
            targetWindow: result.window,
            base64: result.base64,
            imageUrl: result.image_url || result.screenshot,
            elements: result.elements || [],
          },
        });
      }

      this.recordAction({
        connectionId: connId,
        threadId,
        action: {
          toolId,
          status: error ? 'failed' : 'succeeded',
          completedAt: Date.now(),
          result,
          error,
        },
      });
    } else if (runtime.type === 'approval-waiting') {
      this.recordAction({
        connectionId: connId,
        threadId,
        action: {
          toolId: runtime.payload?.tool_id,
          action: runtime.payload?.action || 'computer_mutation',
          args: runtime.payload?.args || {},
          status: 'pending_approval',
          createdAt: Date.now(),
        },
      });
    } else if (runtime.type === 'approval-granted') {
      this.recordAction({
        connectionId: connId,
        threadId,
        action: {
          toolId: runtime.payload?.tool_id,
          status: 'approved',
          approvedAt: Date.now(),
        },
      });
    } else if (runtime.type === 'approval-denied') {
      this.recordAction({
        connectionId: connId,
        threadId,
        action: {
          toolId: runtime.payload?.tool_id,
          status: 'denied',
          error: runtime.payload?.reason || 'User denied action',
        },
      });
    }
  }
}
