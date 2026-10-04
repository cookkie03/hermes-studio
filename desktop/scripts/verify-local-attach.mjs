// Explicit manual check. Reads connection metadata and public health; never starts services or creates sessions.
import { mkdtemp, rm } from "node:fs/promises";
import { candidates } from "../hermes/gateway.mjs";
import { RuntimeConnections } from "../hermes/connections.mjs";
if (!process.argv.includes("--live-mac"))
  throw new Error(
    "Pass --live-mac for an authorized attach to the installed runtime.",
  );
const dataDir = await mkdtemp("/private/tmp/hs-live-attach-");
const manager = new RuntimeConnections({ dataDir });
try {
  const endpoints = await candidates();
  let endpoint;
  for (const value of endpoints) {
    try {
      const health = await (
        await fetch(new URL("/api/health", value), {
          redirect: "error",
          signal: AbortSignal.timeout(2000),
        })
      ).json();
      if (health.ok === true && health.auth_required === false) {
        endpoint = value;
        break;
      }
    } catch {}
  }
  if (!endpoint)
    throw new Error(
      "No existing ungated local Hermes backend found. No service was started or changed.",
    );
  await manager.initialize();
  await manager.saveConnection({
    id: "local",
    name: "This Mac",
    mode: "local",
    endpoint,
  });
  const status = await manager.connect();
  const before = await (await fetch(new URL("/api/health", endpoint))).json();
  manager.close();
  const after = await (await fetch(new URL("/api/health", endpoint))).json();
  console.log(
    JSON.stringify({
      connected: status.connected,
      state: status.state,
      version: status.version,
      sessionsCreated: 0,
      promptsSent: 0,
      backendHealthyBeforeClose: before.ok === true,
      backendHealthyAfterClose: after.ok === true,
      servicesChanged: false,
    }),
  );
} finally {
  manager.close();
  await rm(dataDir, { recursive: true, force: true });
}
