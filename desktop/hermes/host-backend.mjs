import { EventEmitter } from "node:events";
import { spawn } from "node:child_process";
import { readFile, access } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { candidates, localEndpoint } from "./gateway.mjs";
import { SshConnection } from "./ssh.mjs";

export function bootstrapProgram(start = true) {
  return readFile(new URL("./host-bootstrap.py", import.meta.url), "utf8").then(
    (source) =>
      `import json\nOPTIONS = json.loads(${JSON.stringify(JSON.stringify({ start }))})\n${source}`,
  );
}
async function localBootstrap(program, signal) {
  if (signal?.aborted) throw new Error("Hermes startup cancelled.");
  const venv = join(
    homedir(),
    ".hermes",
    "hermes-agent",
    ".venv",
    "bin",
    "python",
  );
  let python = "python3";
  try {
    await access(venv);
    python = venv;
  } catch {}
  return new Promise((resolve, reject) => {
    const child = spawn(python, ["-"], { stdio: ["pipe", "pipe", "ignore"] });
    let output = "",
      settled = false;
    const end = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      error ? reject(error) : resolve(output);
    };
    const cancel = () => {
      child.kill();
      end(new Error("Hermes startup cancelled."));
    };
    const timer = setTimeout(() => {
      child.kill();
      end(new Error("Hermes startup timed out."));
    }, 90000);
    signal?.addEventListener("abort", cancel, { once: true });
    child.stdout.on("data", (data) => {
      output += data.toString();
      if (output.length > 65536) {
        child.kill();
        end(new Error("Host startup response exceeds the connection limit."));
      }
    });
    child.on("error", () =>
      end(new Error("Python for the installed Hermes runtime was not found.")),
    );
    child.on("exit", (code) =>
      end(code === 0 ? undefined : new Error("Hermes startup failed.")),
    );
    child.stdin.on("error", () => {});
    child.stdin.end(program);
  });
}
export class HostConnection extends EventEmitter {
  constructor(
    connection,
    {
      sshFactory = (c) => new SshConnection(c),
      bootstrap = localBootstrap,
    } = {},
  ) {
    super();
    this.connection = connection;
    this.sshFactory = sshFactory;
    this.bootstrap = bootstrap;
  }
  async open(options = {}) {
    const c = this.connection;
    if (c.mode === "local") {
      if (c.endpoint)
        return {
          endpoints: [localEndpoint(c.endpoint)],
          services: { web: "existing", gateway: "unknown" },
        };
      // Fast attach does not start, install or reconfigure a personal runtime.
      const endpoints = await candidates();
      const probes = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          const response = await fetch(new URL("/api/health", endpoint), {
            redirect: "error",
            signal: AbortSignal.any([
              AbortSignal.timeout(2000),
              ...(options.signal ? [options.signal] : []),
            ]),
          });
          const value = await response.json();
          if (response.ok && value.ok === true && value.auth_required === false)
            return endpoint;
          throw new Error("Not ready");
        }),
      );
      const available = probes
        .filter((p) => p.status === "fulfilled")
        .map((p) => p.value);
      if (available.length)
        return {
          endpoints: available,
          services: { web: "existing", gateway: "unknown" },
        };
    }
    const program = await bootstrapProgram(true);
    let raw;
    if (c.mode === "ssh") {
      this.ssh = this.sshFactory(c);
      this.ssh.on("disconnected", (error) => this.emit("disconnected", error));
      await this.ssh.open(options);
      raw = await this.ssh.bootstrap(program);
    } else raw = await this.bootstrap(program, options.signal);
    let result;
    try {
      result = JSON.parse(raw);
    } catch {
      throw new Error("The host returned an invalid Hermes startup response.");
    }
    if (result.error)
      throw Object.assign(new Error(result.error), {
        state: result.state ?? "unavailable",
      });
    if (
      !Array.isArray(result.endpoints) ||
      !result.endpoints.length ||
      result.endpoints.some(
        (e) => !Number.isInteger(e.port) || e.port < 1 || e.port > 65535,
      )
    )
      throw new Error("The host returned an invalid Hermes port.");
    const endpoints = [];
    for (const e of result.endpoints)
      endpoints.push(
        c.mode === "ssh"
          ? await this.ssh.forward(e.port)
          : `http://127.0.0.1:${e.port}`,
      );
    return { endpoints, services: result.services };
  }
  close() {
    this.ssh?.close();
  }
}
