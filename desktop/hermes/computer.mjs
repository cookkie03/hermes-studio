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

  connectionFor(connectionId, threadId) {
    return threadId ? this.connections?.threadHost?.(threadId)?.connectionId ?? connectionId ?? 'local' : connectionId ?? 'local';
  }

  getTarget({ connectionId, threadId } = {}) {
    const connId = this.connectionFor(connectionId, threadId);
    const lease = this.getLease({ connectionId: connId });
    const connection = this.connections?.statusFor?.(connId);
    const connected = connection?.connected === true;
    const captures = (this.captures.get(connId) ?? []).filter(row => !threadId || row.threadId === threadId);
    const latest = captures[0];
    const info = threadId ? this.connections?.forThread?.(threadId)?.sessions?.get(threadId)?.info : undefined;
    const probed = Boolean(latest);
    return {
      connectionId: connId,
      host: connection?.host || connection?.name || (connId === 'local' ? 'This Mac' : `Host (${connId})`),
      profile: info?.profile_name,
      app: latest?.targetApp,
      window: latest?.targetWindow,
      driverStatus: probed ? (connected ? 'available' : 'unavailable') : 'unavailable',
      modes: probed && connected ? [...new Set(captures.map(row => row.mode).filter(Boolean))] : [],
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
    // Receipt observation is not a native display lease. Fail before changing state.
    throw new Error('Native computer takeover is not supported by this adapter.');
  }

  observeNativeLease({ connectionId = 'local', threadId, humanHasControl } = {}) {
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

  getCaptures({ connectionId, threadId } = {}) {
    const connId = this.connectionFor(connectionId, threadId);
    const list = this.captures.get(connId) || [];
    const target = this.getTarget({ connectionId: connId, threadId });

    // Mark staleness dynamically
    return list.filter(capture => !threadId || capture.threadId === threadId).map(capture => ({
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
      threadId,
      mode: capture.mode,
      targetApp: capture.targetApp,
      targetWindow: capture.targetWindow,
      imageUrl: capture.imageUrl || null,
      base64: capture.base64 || null,
      textSummary: capture.textSummary || null,
      elements: capture.elements || [],
      stale: false,
    };

    const updated = [receipt, ...list.filter(item => item.id !== receipt.id)].slice(0, 50);
    this.captures.set(connId, updated);

    this.emit('changed', {
      type: 'computer.capture.changed',
      connectionId: connId,
      threadId,
      capture: receipt,
    });

    return receipt;
  }

  getActivity({ connectionId, threadId } = {}) {
    const connId = this.connectionFor(connectionId, threadId);
    return (this.actions.get(connId) || []).filter(row => !threadId || row.threadId === threadId);
  }

  recordAction({ connectionId = 'local', threadId, action } = {}) {
    const connId = connectionId || 'local';
    const target = this.getTarget({ connectionId: connId, threadId });
    const lease = this.getLease({ connectionId: connId });

    let status = action.status || 'pending_approval';
    let error = action.error;

    // Preserve the outcome emitted by Hermes, including in-flight completions.

    const { payload, truncated } = truncatePayloadIfNeeded(action.result);

    const list = this.actions.get(connId) || [];
    const existingIdx = list.findIndex(item => item.threadId === threadId && (action.id ? item.id === action.id : action.toolId && item.toolId === action.toolId));
    const previous = existingIdx >= 0 ? list[existingIdx] : {};
    const supplied = Object.fromEntries(Object.entries(action).filter(([, value]) => value !== undefined));
    const record = {
      ...previous, ...supplied,
      id: previous.id ?? action.id ?? randomUUID(),
      threadId,
      action: action.action ?? previous.action ?? 'unknown',
      args: action.args ?? previous.args ?? {},
      target: previous.target ?? target,
      status, error,
      createdAt: previous.createdAt ?? action.createdAt ?? Date.now(),
      ...(action.result === undefined ? {} : { resultSummary: typeof payload === 'string' ? payload : JSON.stringify(payload), payloadTruncated: truncated }),
    };
    const updated = [...list];
    if (existingIdx >= 0) updated[existingIdx] = record;
    else updated.unshift(record);
    updated.splice(100);

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
      let result = runtime.payload?.result;
      if (typeof result === 'string') { try { result = JSON.parse(result); } catch {} }
      const error = runtime.payload?.error || result?.error || (result?.ok === false || result?.success === false ? 'Native computer action failed.' : undefined);

      // Read the actual text or multimodal computer_use envelope. A remote file path is not a local image.
      const meta = result?.meta ?? result ?? {};
      const image = result?.content?.find(item => item.type === 'image_url')?.image_url?.url ?? result?.image_url ?? result?.screenshot;
      const safeImage = typeof image === 'string' && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(image) ? image : null;
      if (!error && result && (safeImage || result.base64 || meta.screenshot_path || result.elements || result.summary || result.text_summary)) {
        this.recordCapture({ connectionId: connId, threadId, capture: {
          id: toolId ? `${threadId}:${toolId}` : undefined,
          mode: meta.mode, targetApp: result.app ?? meta.app,
          targetWindow: result.window_title ?? meta.window_title ?? result.window,
          base64: result.base64, imageUrl: safeImage,
          textSummary: result.summary ?? result.text_summary ?? result.content?.find(item => item.type === 'text')?.text,
          elements: result.elements ?? meta.elements ?? [],
        } });
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
