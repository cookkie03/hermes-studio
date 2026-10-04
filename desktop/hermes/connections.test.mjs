import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { RuntimeConnections } from "./connections.mjs";

class Runtime extends EventEmitter {
  connected = false;
  calls = [];
  replies = [];
  async connect(endpoint) {
    this.endpoint = endpoint;
    this.connected = true;
    return { connected: true, endpoint, version: "fixture" };
  }
  disconnect() {
    this.connected = false;
  }
  async request(method, params) {
    this.calls.push({ method, params });
    if (method.startsWith("session."))
      return {
        session_id: "same-runtime-id",
        stored_session_id: "same-stored-id",
        running: false,
        messages: [],
      };
    return {};
  }
  respond(id, result) {
    this.replies.push({ id, result });
  }
}
function fixture(dataDir) {
  const runtimes = new Map(),
    closed = [];
  const manager = new RuntimeConnections({
    dataDir,
    requireThread: (id) => {
      if (!["a", "b"].includes(id)) throw new Error("Not owned");
    },
    gatewayFactory: (connection) => {
      const r = new Runtime();
      runtimes.set(connection.id, r);
      return r;
    },
    connectorFactory: (connection) => ({
      open: async () => ({ endpoints: ["http://127.0.0.1:9000"] }),
      close: () => closed.push(connection.id),
    }),
    retryDelay: 20,
  });
  return { manager, runtimes, closed };
}
test("two hosts with equal runtime IDs keep conversations, events and approvals scoped", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "studio-hosts-"));
  const { manager, runtimes, closed } = fixture(dataDir);
  try {
    await manager.initialize();
    const remote = await manager.saveConnection({
      name: "Fixture remote",
      mode: "ssh",
      host: "fixture.invalid",
      user: "fixture",
    });
    await manager.bindThread("a", "local");
    await manager.bindThread("b", remote.id);
    await Promise.all([
      manager.connect({ connectionId: "local" }),
      manager.connect({
        connectionId: remote.id,
        password: "synthetic-password",
      }),
    ]);
    await Promise.all([manager.session("a"), manager.session("b")]);
    assert.equal(manager.status("a").connectionId, "local");
    assert.equal(manager.status("b").connectionId, remote.id);
    const updates = [];
    manager.on("update", (event) => updates.push(event));
    for (const [id, runtime] of runtimes)
      runtime.emit("request", {
        id: "same-request",
        method: "approval",
        params: { session_id: "same-runtime-id", choices: ["deny"] },
      });
    assert.equal(manager.requests.size, 2);
    manager.approval({
      threadId: "b",
      requestId: "same-request",
      result: { choice: "deny" },
    });
    assert.equal(runtimes.get("local").replies.length, 0);
    assert.equal(runtimes.get(remote.id).replies.length, 1);
    runtimes.get(remote.id).emit("event", {
      type: "message.delta",
      session_id: "same-runtime-id",
      payload: { text: "remote only" },
    });
    assert.equal(updates.at(-1).threadId, "b");
    assert.equal(updates.at(-1).connectionId, remote.id);
    await assert.rejects(manager.bindThread("b", "local"), /bound|assigned/);
    await manager.disconnect(remote.id);
    assert.equal(manager.status("a").connected, true);
    assert.equal(manager.status("b").connected, false);
    assert.ok(closed.includes(remote.id));
    const snapshot = await readFile(
      join(dataDir, "runtime-connections.json"),
      "utf8",
    );
    assert.doesNotMatch(snapshot, /synthetic-password/);
    assert.equal(
      runtimes
        .get(remote.id)
        .calls.some((x) =>
          ["session.interrupt", "prompt.submit"].includes(x.method),
        ),
      false,
    );
  } finally {
    manager.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("relaunch preserves host assignment and ignores saved credential fields", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "studio-hosts-"));
  const first = fixture(dataDir);
  let second;
  try {
    await first.manager.initialize();
    const host = await first.manager.saveConnection({
      name: "Remote",
      mode: "ssh",
      host: "fixture.invalid",
      password: "not-a-persisted-field",
    });
    await first.manager.bindThread("b", host.id);
    await first.manager.connect({
      connectionId: host.id,
      password: "volatile-only",
    });
    await first.manager.session("b");
    first.manager.close();
    second = fixture(dataDir);
    await second.manager.initialize();
    assert.equal(second.manager.threadHost("b").connectionId, host.id);
    assert.equal(second.manager.threadHost("b").bound, true);
    assert.equal(second.manager.status("b").connected, false);
    assert.equal(second.manager.slots.get(host.id).password, undefined);
    const text = await readFile(
      join(dataDir, "runtime-connections.json"),
      "utf8",
    );
    assert.doesNotMatch(text, /volatile-only|not-a-persisted-field|password/);
    await second.manager.connect({ connectionId: host.id });
    await second.manager.history("b");
    assert.equal(
      second.runtimes
        .get(host.id)
        .calls.find((c) => c.method === "session.resume").params
        .close_on_disconnect,
      false,
    );
  } finally {
    first.manager.close();
    second?.manager.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});
test("disconnect during discovery cancels a stale connection and cannot revive autoConnect", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "studio-hosts-"));
  let resolve;
  const waiting = new Promise((r) => (resolve = r));
  const manager = new RuntimeConnections({
    dataDir,
    gatewayFactory: () => new Runtime(),
    connectorFactory: () => ({ open: () => waiting, close() {} }),
    retryDelay: 10,
  });
  try {
    await manager.initialize();
    const job = manager.connect();
    const result = assert.rejects(job, /cancelled/);
    await manager.disconnect();
    resolve({ endpoints: ["http://127.0.0.1:9000"] });
    await result;
    assert.equal(manager.status().connected, false);
    assert.equal(manager.list().connections[0].autoConnect, false);
    assert.equal(manager.slots.get("local").retry, null);
  } finally {
    resolve({ endpoints: [] });
    manager.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});
test("transport loss reconnects its host without replaying a prompt", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "studio-hosts-"));
  const f = fixture(dataDir);
  try {
    await f.manager.initialize();
    await f.manager.connect();
    await f.manager.session("a");
    f.runtimes.get("local").connected = false;
    f.runtimes.get("local").emit("disconnected", { message: "fixture drop" });
    await new Promise((r) => setTimeout(r, 100));
    assert.equal(f.manager.status("a").connected, true);
    assert.equal(
      f.runtimes.get("local").calls.filter((c) => c.method === "prompt.submit")
        .length,
      0,
    );
  } finally {
    f.manager.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});
test("challenge is scoped, one-shot and cancelled with the volatile password", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "studio-hosts-"));
  const f = fixture(dataDir);
  try {
    await f.manager.initialize();
    const s = f.manager.slots.get("local");
    const pending = f.manager.challenge("local", s.generation, {
      kind: "credential",
      prompt: "Synthetic password",
    });
    const q = f.manager.challenges("local").challenge;
    assert.throws(
      () =>
        f.manager.answerChallenge("local", {
          challengeId: "wrong",
          answer: "secret",
        }),
      /no longer/,
    );
    f.manager.answerChallenge("local", {
      challengeId: q.id,
      answer: "volatile-secret",
    });
    assert.equal(await pending, "volatile-secret");
    assert.throws(
      () =>
        f.manager.answerChallenge("local", {
          challengeId: q.id,
          answer: "secret",
        }),
      /no longer/,
    );
    await f.manager.disconnect();
    assert.equal(s.password, undefined);
    assert.equal(f.manager.challenges("local").challenge, null);
  } finally {
    f.manager.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});

test("failed binding persistence blocks concurrent session creation on the tentative host", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "studio-hosts-"));
  const f = fixture(dataDir);
  try {
    await f.manager.initialize();
    const remote = await f.manager.saveConnection({
      name: "Remote",
      mode: "ssh",
      host: "fixture.invalid",
    });
    await f.manager.connect({ connectionId: remote.id });
    let fail;
    const original = f.manager.persist.bind(f.manager);
    f.manager.persist = () =>
      new Promise((_resolve, reject) => {
        fail = reject;
      });
    const binding = f.manager.bindThread("b", remote.id);
    const bindingResult = assert.rejects(binding, /fixture storage/);
    await new Promise((resolve) => setImmediate(resolve));
    assert.equal(f.manager.threadHost("b").connectionId, "local");
    const session = f.manager.session("b");
    const sessionResult = assert.rejects(session, /fixture storage/);
    fail(new Error("fixture storage"));
    await Promise.all([bindingResult, sessionResult]);
    assert.equal(
      f.runtimes
        .get(remote.id)
        .calls.some((c) => c.method === "session.create"),
      false,
    );
    assert.equal(f.manager.threadHost("b").connectionId, "local");
    f.manager.persist = original;
  } finally {
    f.manager.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});
test("disconnect commits autoConnect before teardown; failure preserves connection and successful teardown clears approvals", async () => {
  const dataDir = await mkdtemp(join(tmpdir(), "studio-hosts-"));
  const f = fixture(dataDir);
  try {
    await f.manager.initialize();
    await f.manager.connect();
    await f.manager.session("a");
    await f.manager.registerHandler({
      handlerId: "fixture-view",
      threadId: "a",
      active: true,
    });
    f.runtimes
      .get("local")
      .emit("request", {
        id: "decision",
        method: "approval",
        params: { session_id: "same-runtime-id", choices: ["deny"] },
      });
    assert.equal(f.manager.requests.size, 1);
    const original = f.manager.persist.bind(f.manager);
    f.manager.persist = async () => {
      assert.equal(f.runtimes.get("local").connected, true);
      throw new Error("fixture storage");
    };
    await assert.rejects(f.manager.disconnect(), /fixture storage/);
    assert.equal(f.manager.status().connected, true);
    assert.equal(f.manager.list().connections[0].autoConnect, true);
    f.manager.persist = async (snapshot) => {
      assert.equal(f.runtimes.get("local").connected, true);
      await original(snapshot);
    };
    await f.manager.disconnect();
    assert.equal(f.manager.requests.size, 0);
    assert.equal(f.manager.status().approvalEnabled, false);
    assert.equal((await f.manager.history("a")).pendingRequests.length, 0);
    assert.equal(
      JSON.parse(
        await readFile(join(dataDir, "runtime-connections.json"), "utf8"),
      ).connections[0].autoConnect,
      false,
    );
  } finally {
    f.manager.close();
    await rm(dataDir, { recursive: true, force: true });
  }
});
