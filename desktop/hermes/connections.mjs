import { EventEmitter } from "node:events";
import { randomUUID } from "node:crypto";
import { readFile, writeFile, mkdir, rename } from "node:fs/promises";
import { join } from "node:path";
import { HermesBridge } from "./bridge.mjs";
import { HermesGateway } from "./gateway.mjs";
import { HostConnection } from "./host-backend.mjs";

const authStates = new Set([
  "credentials-required",
  "host-key-required",
  "login-required",
  "unavailable",
]);
export { connectionInput } from "./connection-input.mjs";
import { connectionInput } from "./connection-input.mjs";

export class RuntimeConnections extends EventEmitter {
  constructor({
    dataDir,
    requireThread = () => {},
    prepareText,
    gateway,
    gatewayFactory = () => new HermesGateway(),
    connectorFactory = (c) => new HostConnection(c),
    retryDelay = 1500,
  } = {}) {
    super();
    this.dataDir = dataDir;
    this.requireThread = requireThread;
    this.prepareText = prepareText;
    this.gatewayFactory = gatewayFactory;
    this.connectorFactory = connectorFactory;
    this.retryDelay = retryDelay;
    this.connections = new Map([
      [
        "local",
        { id: "local", name: "This Mac", mode: "local", autoConnect: true },
      ],
    ]);
    this.threadHosts = new Map();
    this.slots = new Map();
    this.handlerHosts = new Map();
    this.writeQueue = Promise.resolve();
    this.registryQueue = Promise.resolve();
    this.bindingJobs = new Map();
    this.closed = false;
    if (gateway) this.makeSlot(this.connections.get("local"), gateway);
  }
  makeSlot(connection, gateway) {
    const existing = this.slots.get(connection.id);
    if (existing) return existing;
    const bridge = new HermesBridge({
      gateway: gateway ?? this.gatewayFactory(connection),
      connectionId: connection.id,
      bindingPath:
        connection.id === "local"
          ? join(this.dataDir, "hermes-sessions.json")
          : join(this.dataDir, "hermes-connections", `${connection.id}.json`),
      requireThread: this.requireThread,
      prepareText: this.prepareText,
    });
    const slot = { bridge, state: "disconnected", generation: 0, attempt: 0 };
    this.slots.set(connection.id, slot);
    bridge.on("update", (event) => {
      if (event.type === "connection" && !event.connected) {
        slot.state = "disconnected";
        slot.error = event.message;
        this.schedule(connection.id);
      }
      this.emit("update", { ...event, connectionId: connection.id });
    });
    return slot;
  }
  async initialize() {
    try {
      const saved = JSON.parse(
        await readFile(join(this.dataDir, "runtime-connections.json"), "utf8"),
      );
      if (
        saved.version !== 1 ||
        !Array.isArray(saved.connections) ||
        !Array.isArray(saved.threadHosts)
      )
        throw new Error("Unsupported connection registry.");
      const rows = saved.connections.map((c) => connectionInput(c, c.id));
      if (
        rows.some(
          (c) =>
            typeof c.id !== "string" || !/^local$|^[a-f0-9-]{36}$/.test(c.id),
        ) ||
        new Set(rows.map((c) => c.id)).size !== rows.length
      )
        throw new Error("Invalid connection registry.");
      this.connections = new Map(rows.map((c) => [c.id, c]));
      if (!this.connections.has("local"))
        throw new Error("Local connection is missing.");
      for (const [threadId, id] of saved.threadHosts) {
        if (typeof threadId !== "string" || !this.connections.has(id))
          throw new Error("Invalid conversation host binding.");
        this.threadHosts.set(threadId, id);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
    for (const connection of this.connections.values())
      await this.makeSlot(connection).bridge.initialize();
    for (const threadId of this.slots.get("local").bridge.bindings.keys())
      if (!this.threadHosts.has(threadId))
        this.threadHosts.set(threadId, "local");
  }
  mutateRegistry(operation) {
    const job = this.registryQueue.then(operation);
    this.registryQueue = job.catch(() => {});
    return job;
  }
  persist({
    connections = this.connections,
    threadHosts = this.threadHosts,
  } = {}) {
    const snapshot = JSON.stringify({
      version: 1,
      connections: [...connections.values()],
      threadHosts: [...threadHosts],
    });
    const operation = this.writeQueue.then(async () => {
      await mkdir(this.dataDir, { recursive: true });
      const path = join(this.dataDir, "runtime-connections.json"),
        tmp = `${path}.${randomUUID()}.tmp`;
      await writeFile(tmp, snapshot, { mode: 0o600 });
      await rename(tmp, path);
    });
    this.writeQueue = operation.catch(() => {});
    return operation;
  }
  connection(id) {
    const c = this.connections.get(id);
    if (!c) throw new Error("Connection not found.");
    return c;
  }
  threadHost(threadId) {
    this.requireThread(threadId);
    const id = this.threadHosts.get(threadId) ?? "local",
      connection = this.connection(id),
      bridge = this.slots.get(id).bridge;
    return {
      ...this.status(threadId),
      bound: bridge.bindings.has(threadId) || bridge.sessionJobs.has(threadId),
      assigned: this.threadHosts.has(threadId),
      name: connection.name,
    };
  }
  forThread(threadId) {
    this.requireThread(threadId);
    return this.slots.get(this.threadHosts.get(threadId) ?? "local").bridge;
  }
  status(threadId) {
    if (threadId) this.requireThread(threadId);
    return this.statusFor(
      threadId ? (this.threadHosts.get(threadId) ?? "local") : "local",
    );
  }
  list() {
    return {
      connections: [...this.connections.values()].map((c) => ({
        ...c,
        ...this.statusFor(c.id),
      })),
    };
  }
  statusFor(id) {
    const c = this.connection(id),
      s = this.slots.get(id);
    return {
      ...s.bridge.status(),
      connected: s.state === "available" && s.bridge.gateway.connected,
      version: s.bridge.gateway.version,
      state: s.state,
      lastError: s.error ?? s.bridge.lastError,
      services: s.services ?? null,
      name: c.name,
      connectionId: id,
      mode: c.mode,
      host: c.host ?? "This Mac",
    };
  }
  saveConnection(input) {
    return this.mutateRegistry(async () => {
      const id = input.id ?? randomUUID();
      if (input.id && !this.connections.has(id))
        throw new Error("Connection not found.");
      const row = connectionInput(input, id),
        prior = this.connections.get(id),
        slot = this.slots.get(id);
      if (
        prior &&
        ["mode", "host", "user", "port", "endpoint"].some(
          (key) => row[key] !== prior[key],
        )
      ) {
        if (
          [...this.threadHosts.values()].includes(id) ||
          slot.bridge.bindings.size
        )
          throw new Error(
            "This host already has assigned conversations. Add a new connection instead.",
          );
        if (slot.bridge.gateway.connected || slot.job)
          throw new Error("Disconnect before editing this host.");
      }
      const proposed = new Map(this.connections);
      proposed.set(id, row);
      await this.persist({ connections: proposed });
      this.connections = proposed;
      this.makeSlot(row);
      return { ...row, ...this.statusFor(id) };
    });
  }
  bindThread(threadId, id) {
    this.requireThread(threadId);
    this.connection(id);
    const previous = this.bindingJobs.get(threadId) ?? Promise.resolve();
    const job = previous.then(() =>
      this.mutateRegistry(async () => {
        const prior = this.threadHosts.get(threadId),
          old = this.forThread(threadId);
        if (
          (old.bindings.has(threadId) ||
            old.sessionJobs.has(threadId) ||
            old.turns.has(threadId)) &&
          (prior ?? "local") !== id
        )
          throw new Error("This conversation is already bound to its host.");
        const proposed = new Map(this.threadHosts);
        proposed.set(threadId, id);
        await this.persist({ threadHosts: proposed });
        this.threadHosts = proposed;
        this.emit("update", {
          type: "connection",
          threadId,
          ...this.status(threadId),
        });
        return this.threadHost(threadId);
      }),
    );
    const pending = job.finally(() => {
      if (this.bindingJobs.get(threadId) === pending)
        this.bindingJobs.delete(threadId);
    });
    this.bindingJobs.set(threadId, pending);
    return pending;
  }
  async connect({ connectionId = "local", endpoint, password } = {}) {
    if (this.closed) throw new Error("Studio is closing.");
    if (endpoint) {
      const c = this.connection(connectionId);
      await this.saveConnection({ ...c, endpoint, autoConnect: true });
    }
    const c = this.connection(connectionId),
      s = this.slots.get(connectionId);
    if (s.disconnectJob) throw new Error("This host is being disconnected.");
    if (s.job) return s.job;
    if (s.bridge.gateway.connected) return this.statusFor(connectionId);
    if (password !== undefined) {
      if (typeof password !== "string" || password.length > 4096)
        throw new Error("Invalid SSH credential.");
      s.password = password;
    }
    clearTimeout(s.retry);
    const generation = ++s.generation;
    s.state = c.mode === "ssh" ? "connecting" : "discovering";
    s.error = null;
    s.connector?.close();
    s.connector = this.connectorFactory(c);
    s.connector.on?.("disconnected", (error) => {
      if (generation !== s.generation || this.closed) return;
      s.bridge.disconnect();
      s.error = error.message;
      s.state = error.state ?? "disconnected";
      this.emit("update", {
        type: "connection",
        ...this.statusFor(connectionId),
      });
      this.schedule(connectionId);
    });
    this.emit("update", {
      type: "connection",
      ...this.statusFor(connectionId),
    });
    const run = async () => {
      const check = () => {
        if (this.closed || generation !== s.generation)
          throw new Error("Connection cancelled.");
      };
      try {
        const resolved = await s.connector.open({
          password: s.password,
          signal: (s.abort = new AbortController()).signal,
          onChallenge: (challenge) =>
            this.challenge(connectionId, generation, challenge),
        });
        check();
        s.services = resolved.services;
        for (const value of resolved.endpoints) {
          try {
            await s.bridge.connect({ endpoint: value });
            check();
            s.state = "available";
            s.attempt = 0;
            s.error = null;
            await this.mutateRegistry(async () => {
              check();
              const proposed = new Map(this.connections);
              proposed.set(connectionId, {
                ...this.connection(connectionId),
                autoConnect: true,
              });
              await this.persist({ connections: proposed });
              check();
              this.connections = proposed;
            });
            this.emit("update", {
              type: "connection",
              ...this.statusFor(connectionId),
            });
            return this.statusFor(connectionId);
          } catch (error) {
            check();
            s.error = error.message;
            if (
              error.state === "login-required" ||
              /requires login/.test(error.message)
            )
              throw error;
          }
        }
        throw new Error(
          s.error ?? "No Hermes backend is available on this host.",
        );
      } catch (error) {
        if (generation === s.generation) {
          s.bridge.disconnect();
          s.connector?.close();
          s.state =
            error.state ??
            (/requires login/.test(error.message) ? "login-required" : "error");
          s.error = error.publicMessage ?? error.message;
          this.emit("update", {
            type: "connection",
            ...this.statusFor(connectionId),
          });
        }
        throw error;
      }
    };
    s.job = run().finally(() => {
      if (generation === s.generation) {
        s.job = null;
        if (s.state !== "available") this.schedule(connectionId);
      }
    });
    return s.job;
  }
  challenge(id, generation, { kind, prompt }) {
    const s = this.slots.get(id);
    if (generation !== s.generation)
      return Promise.reject(new Error("Connection cancelled."));
    if (s.challenge)
      return Promise.reject(
        new Error("Another connection decision is pending."),
      );
    s.state =
      kind === "host-key" ? "host-key-required" : "credentials-required";
    return new Promise((resolve, reject) => {
      const challenge = {
        id: randomUUID(),
        kind,
        prompt,
        expiresAt: Date.now() + 120000,
      };
      const finish = (value, error) => {
        clearTimeout(s.challenge?.timer);
        s.challenge = null;
        s.state = "connecting";
        error ? reject(error) : resolve(value);
      };
      s.challenge = {
        ...challenge,
        finish,
        timer: setTimeout(
          () =>
            finish(
              null,
              Object.assign(new Error("Connection decision expired."), {
                state: "credentials-required",
              }),
            ),
          120000,
        ),
      };
      this.emit("update", {
        type: "connection-challenge",
        connectionId: id,
        challenge,
      });
    });
  }
  challenges(id) {
    const q = this.slots.get(this.connection(id).id).challenge;
    return {
      challenge: q
        ? { id: q.id, kind: q.kind, prompt: q.prompt, expiresAt: q.expiresAt }
        : null,
    };
  }
  answerChallenge(id, { challengeId, answer }) {
    const s = this.slots.get(this.connection(id).id),
      q = s.challenge;
    if (!q || q.id !== challengeId || q.expiresAt < Date.now())
      throw new Error("This connection decision is no longer open.");
    if (typeof answer !== "string" || answer.length > 4096)
      throw new Error("Invalid connection answer.");
    if (q.kind === "host-key" && !["yes", "no"].includes(answer))
      throw new Error("Accept or reject the server fingerprint.");
    if (q.kind === "credential") s.password = answer;
    q.finish(answer);
    return { accepted: true };
  }
  schedule(id) {
    const c = this.connections.get(id),
      s = this.slots.get(id);
    if (
      this.closed ||
      !c?.autoConnect ||
      s.job ||
      s.retry ||
      s.disconnectJob ||
      authStates.has(s.state)
    )
      return;
    s.retry = setTimeout(
      () => {
        s.retry = null;
        void this.connect({ connectionId: id }).catch(() => {});
      },
      Math.min(30000, this.retryDelay * 2 ** Math.min(s.attempt++, 5)),
    );
    s.retry.unref?.();
  }
  startAutoConnect() {
    for (const c of this.connections.values())
      if (c.autoConnect)
        void this.connect({ connectionId: c.id }).catch(() => {});
  }
  disconnect(id = "local") {
    this.connection(id);
    const s = this.slots.get(id);
    if (s.disconnectJob) return s.disconnectJob;
    // Invalidate in-flight startup now; teardown follows durable preference commit.
    const generation = s.generation,
      priorState = s.state;
    ++s.generation;
    const job = this.mutateRegistry(async () => {
      const proposed = new Map(this.connections);
      proposed.set(id, { ...this.connection(id), autoConnect: false });
      await this.persist({ connections: proposed });
      this.connections = proposed;
      this.closeSlot(s);
      s.state = "disconnected";
      s.error = null;
      this.emit("update", { type: "connection", ...this.statusFor(id) });
      return this.statusFor(id);
    }).catch((error) => {
      s.generation = generation;
      s.state = priorState;
      s.job = null;
      throw error;
    });
    s.disconnectJob = job.finally(() => {
      s.disconnectJob = null;
    });
    return s.disconnectJob;
  }
  closeSlot(s) {
    ++s.generation;
    clearTimeout(s.retry);
    s.retry = null;
    s.abort?.abort();
    s.challenge?.finish(null, new Error("Connection cancelled."));
    s.password = undefined;
    s.job = null;
    s.bridge.disconnect();
    s.connector?.close();
    s.connector = null;
  }
  close() {
    this.closed = true;
    for (const s of this.slots.values()) {
      this.closeSlot(s);
      s.bridge.close();
    }
  }
  async session(id, data = {}) {
    await this.bindingJobs.get(id);
    if (!this.threadHosts.has(id)) await this.bindThread(id, "local");
    return this.forThread(id).session(id, data);
  }
  async history(id, options) {
    await this.bindingJobs.get(id);
    return this.forThread(id).history(id, options);
  }
  async send(id, ...args) {
    await this.bindingJobs.get(id);
    if (!this.threadHosts.has(id)) await this.bindThread(id, "local");
    return this.forThread(id).send(id, ...args);
  }
  interrupt(id) {
    return this.forThread(id).interrupt(id);
  }
  async registerHandler(data) {
    this.requireThread(data.threadId);
    const id = this.threadHosts.get(data.threadId) ?? "local",
      prior = this.handlerHosts.get(data.handlerId);
    if (prior && (!data.active || prior !== id)) {
      await this.slots
        .get(prior)
        .bridge.registerHandler({ ...data, active: false });
      this.handlerHosts.delete(data.handlerId);
    }
    if (!data.active) return { serverRequests: false };
    this.handlerHosts.set(data.handlerId, id);
    return this.slots.get(id).bridge.registerHandler(data);
  }
  approval({ threadId, requestId, decisionId, result }) {
    this.requireThread(threadId);
    const b = this.forThread(threadId),
      request = b.requests.get(JSON.stringify(requestId));
    if (request?.threadId !== threadId || typeof decisionId !== "string" || request.decisionId !== decisionId)
      throw new Error("This decision does not belong to this conversation.");
    return b.approval(requestId, result, decisionId);
  }
  get requests() {
    return new Map(
      [...this.slots].flatMap(([id, s]) =>
        [...s.bridge.requests].map(([key, value]) => [
          `${id}:${key}`,
          { ...value, connectionId: id },
        ]),
      ),
    );
  }
  // Compatibility for the single-host baseline's metadata fixtures.
  get sessions() {
    return this.slots.get("local").bridge.sessions;
  }
  get bindings() {
    return this.slots.get("local").bridge.bindings;
  }
  get gateway() {
    return this.slots.get("local").bridge.gateway;
  }
}
