import { EventEmitter } from "node:events";
import { spawn } from "node:child_process";
import { createServer as httpServer } from "node:http";
import { createServer as tcpServer } from "node:net";
import { mkdtemp, chmod, writeFile, stat, rm } from "node:fs/promises";
import { join } from "node:path";
import { connectionInput } from "./connection-input.mjs";

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const failure = (state, message) =>
  Object.assign(new Error(message), { state });
const helper = `#!/bin/sh\nexec /usr/bin/curl --silent --fail --max-time 125 --unix-socket "$HERMES_STUDIO_ASKPASS_SOCKET" --get --data-urlencode "prompt=$1" http://localhost/ask\n`;
export class SshConnection extends EventEmitter {
  constructor(
    connection,
    { sshBinary = "/usr/bin/ssh", extraArgs = [], timeoutMs = 150000 } = {},
  ) {
    super();
    this.connection = connectionInput(connection, connection.id);
    this.sshBinary = sshBinary;
    this.extraArgs = extraArgs;
    this.timeoutMs = timeoutMs;
    this.closed = false;
  }
  args() {
    const c = this.connection;
    return [
      ...this.extraArgs,
      ...(process.platform === "darwin" ? ["-o", "UseKeychain=no"] : []),
      "-o",
      "AddKeysToAgent=no",
      ...(c.port ? ["-p", String(c.port)] : []),
      ...(c.user ? ["-l", c.user] : []),
      "-o",
      "ConnectTimeout=15",
      "-o",
      "ServerAliveInterval=15",
      "-o",
      "ServerAliveCountMax=3",
      "-o",
      "StrictHostKeyChecking=ask",
      "-o",
      "NumberOfPasswordPrompts=1",
      "-o",
      "ControlPersist=no",
      "-S",
      this.controlPath,
    ];
  }
  async open({ password, onChallenge, signal } = {}) {
    if (this.closed) throw new Error("SSH connection cancelled.");
    this.password = password;
    this.directory = await mkdtemp("/private/tmp/hs-ssh-");
    await chmod(this.directory, 0o700);
    this.controlPath = join(this.directory, "master");
    const socketPath = join(this.directory, "ask"),
      helperPath = join(this.directory, "askpass");
    await writeFile(helperPath, helper, { mode: 0o700 });
    this.askpass = httpServer(async (req, res) => {
      try {
        const prompt =
          new URL(req.url, "http://localhost").searchParams.get("prompt") ?? "";
        if (prompt.length > 4096 || this.closed)
          throw new Error("SSH challenge cancelled.");
        const kind = /yes\/no|authenticity|fingerprint/i.test(prompt)
          ? "host-key"
          : "credential";
        let answer;
        if (kind === "credential" && this.password !== undefined) {
          answer = this.password;
          this.password = undefined;
        } else answer = await onChallenge({ kind, prompt });
        if (this.closed) throw new Error("SSH challenge cancelled.");
        res.writeHead(200, {
          "Content-Type": "text/plain",
          "Cache-Control": "no-store",
        });
        res.end(answer + "\n");
      } catch {
        res.writeHead(403);
        res.end();
      }
    });
    await new Promise((resolve, reject) => {
      this.askpass.once("error", reject);
      this.askpass.listen(socketPath, resolve);
    });
    await chmod(socketPath, 0o600);
    this.abort = () => this.close();
    signal?.addEventListener("abort", this.abort, { once: true });
    this.signal = signal;
    if (signal?.aborted) {
      this.close();
      throw new Error("SSH connection cancelled.");
    }
    let errorText = "";
    this.exit = null;
    this.master = spawn(
      this.sshBinary,
      [...this.args(), "-o", "ControlMaster=yes", "-N", this.connection.host],
      {
        stdio: ["ignore", "ignore", "pipe"],
        env: {
          ...process.env,
          SSH_ASKPASS: helperPath,
          SSH_ASKPASS_REQUIRE: "force",
          DISPLAY: "hermes-studio",
          HERMES_STUDIO_ASKPASS_SOCKET: socketPath,
        },
      },
    );
    this.master.stderr.on("data", (chunk) => {
      if (errorText.length < 16000) errorText += chunk.toString();
    });
    this.master.on("error", () => {
      this.exit = failure(
        "unavailable",
        "The system SSH client could not start.",
      );
    });
    this.master.on("exit", () => {
      this.exit =
        /REMOTE HOST IDENTIFICATION|Host key verification failed/.test(
          errorText,
        )
          ? failure(
              "host-key-required",
              "The SSH server identity is unknown or changed. Review its fingerprint before connecting.",
            )
          : /Permission denied|authentication failures|incorrect passphrase/i.test(
                errorText,
              )
            ? failure(
                "credentials-required",
                "SSH authentication failed. Check the user, key or password.",
              )
            : failure(
                "error",
                "SSH disconnected. Check the host address, SSH service and network.",
              );
      if (!this.closed) this.emit("disconnected", this.exit);
    });
    const deadline = Date.now() + this.timeoutMs;
    while (!this.closed && !this.exit && Date.now() < deadline) {
      try {
        if ((await stat(this.controlPath)).isSocket()) return this;
      } catch {}
      await wait(80);
    }
    const error =
      this.exit ??
      failure(
        "error",
        this.closed ? "SSH connection cancelled." : "SSH connection timed out.",
      );
    this.close();
    throw error;
  }
  run(args, { stdin = "", timeoutMs = 90000, command } = {}) {
    if (this.closed || this.exit)
      return Promise.reject(this.exit ?? new Error("SSH disconnected."));
    return new Promise((resolve, reject) => {
      const child = spawn(
        this.sshBinary,
        [
          ...this.args(),
          "-o",
          "BatchMode=yes",
          ...args,
          this.connection.host,
          ...(command ? [command] : []),
        ],
        { stdio: ["pipe", "pipe", "ignore"] },
      );
      let output = "",
        settled = false;
      const finish = (error) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        this.signal?.removeEventListener("abort", cancel);
        error ? reject(error) : resolve(output);
      };
      const cancel = () => {
        child.kill();
        finish(new Error("SSH operation cancelled."));
      };
      const timer = setTimeout(() => {
        child.kill();
        finish(new Error("SSH operation timed out."));
      }, timeoutMs);
      this.signal?.addEventListener("abort", cancel, { once: true });
      child.stdout.on("data", (chunk) => {
        output += chunk.toString();
        if (output.length > 65536) {
          child.kill();
          finish(new Error("SSH response exceeds the connection limit."));
        }
      });
      child.on("error", () => finish(new Error("SSH operation failed.")));
      child.on("exit", (code) =>
        finish(code === 0 ? undefined : new Error("SSH operation failed.")),
      );
      child.stdin.on("error", () => {});
      child.stdin.end(stdin);
    });
  }
  bootstrap(script) {
    // Fixed program over stdin; connection values never become shell code.
    return this.run([], { stdin: script, command: "sh -lc 'exec python3 -'" });
  }
  async forward(remotePort) {
    if (!Number.isInteger(remotePort) || remotePort < 1 || remotePort > 65535)
      throw new Error("Invalid Hermes port.");
    for (let attempt = 0; attempt < 4; attempt++) {
      const server = tcpServer();
      await new Promise((resolve, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolve);
      });
      const port = server.address().port;
      await new Promise((resolve) => server.close(resolve));
      try {
        await this.run(
          ["-O", "forward", "-L", `127.0.0.1:${port}:127.0.0.1:${remotePort}`],
          { timeoutMs: 15000 },
        );
        return `http://127.0.0.1:${port}`;
      } catch (error) {
        if (attempt === 3) throw error;
      }
    }
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.password = undefined;
    this.signal?.removeEventListener("abort", this.abort);
    this.master?.kill();
    this.askpass?.closeAllConnections();
    this.askpass?.close();
    if (this.directory)
      void rm(this.directory, { recursive: true, force: true }).catch(() => {});
  }
}
