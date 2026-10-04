import test from "node:test";
import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import { mkdtemp, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { createServer as httpServer } from "node:http";
import { connect as tcpConnect } from "node:net";
import ssh2 from "ssh2";
const { Server, utils } = ssh2;
import { SshConnection } from "./ssh.mjs";

const key = () =>
  generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs1", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  }).privateKey;
const listen = (server) =>
  new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
async function fixture(auth) {
  const directory = await mkdtemp("/private/tmp/hs-ssh-fixture-");
  const clientKey = key(),
    parsed = utils.parseKey(clientKey),
    clients = new Set(),
    executions = [];
  await writeFile(`${directory}/identity`, clientKey, { mode: 0o600 });
  await writeFile(
    `${directory}/config`,
    "Host fixture-alias\n HostName 127.0.0.1\n User fixture\n",
    { mode: 0o600 },
  );
  const backend = httpServer((_req, res) =>
    res.end(JSON.stringify({ ok: true, fixture: true })),
  );
  await listen(backend);
  const server = new Server({ hostKeys: [key()] }, (client) => {
    clients.add(client);
    client.on("error", () => {});
    client.on("close", () => clients.delete(client));
    client.on("authentication", (ctx) => {
      if (ctx.username !== "fixture") return ctx.reject();
      if (
        auth === "password" &&
        ctx.method === "password" &&
        ctx.password === "synthetic-only-password"
      )
        return ctx.accept();
      if (
        auth === "key" &&
        ctx.method === "publickey" &&
        ctx.key.data.equals(parsed.getPublicSSH()) &&
        (!ctx.signature || parsed.verify(ctx.blob, ctx.signature, ctx.hashAlgo))
      )
        return ctx.accept();
      ctx.reject(["publickey", "password"]);
    });
    client.on("ready", () => {
      client.on("session", (accept) => {
        const session = accept();
        session.on("exec", (acceptStream, _reject, info) => {
          executions.push(info.command);
          const stream = acceptStream();
          let input = "";
          stream.on("data", (data) => {
            input += data.toString();
          });
          stream.on("end", () => {
            assert.match(input, /OPTIONS/);
            stream.write(
              JSON.stringify({
                endpoints: [{ port: backend.address().port }],
                services: { web: "existing" },
              }),
            );
            stream.exit(0);
            stream.end();
          });
        });
      });
      client.on("tcpip", (accept, reject, info) => {
        if (
          info.destIP !== "127.0.0.1" ||
          info.destPort !== backend.address().port
        )
          return reject();
        const socket = tcpConnect(info.destPort, info.destIP);
        socket.once("connect", () => {
          const stream = accept();
          stream.pipe(socket).pipe(stream);
        });
        socket.on("error", () => reject());
      });
    });
  });
  await listen(server);
  const transport = new SshConnection(
    {
      id: "fixture",
      name: "Fixture",
      mode: "ssh",
      host: "fixture-alias",
      port: server.address().port,
    },
    {
      extraArgs: [
        "-F",
        `${directory}/config`,
        "-o",
        `UserKnownHostsFile=${directory}/known_hosts`,
        "-o",
        "GlobalKnownHostsFile=/dev/null",
        "-o",
        "IdentityAgent=none",
        "-o",
        "IdentitiesOnly=yes",
        "-i",
        `${directory}/identity`,
      ],
      timeoutMs: 15000,
    },
  );
  return {
    directory,
    transport,
    backend,
    executions,
    async close() {
      transport.close();
      for (const client of clients) client.end();
      await new Promise((resolve) => server.close(resolve));
      backend.closeAllConnections();
      await new Promise((resolve) => backend.close(resolve));
      await rm(directory, { recursive: true, force: true });
    },
  };
}
for (const auth of ["key", "password"])
  test(
    `real OpenSSH ${auth} auth, identity challenge, fixed bootstrap and loopback forwarding`,
    { timeout: 30000 },
    async () => {
      const f = await fixture(auth);
      const challenges = [];
      try {
        await f.transport.open({
          ...(auth === "password"
            ? { password: "synthetic-only-password" }
            : {}),
          onChallenge: async (challenge) => {
            challenges.push(challenge);
            assert.equal(challenge.kind, "host-key");
            return "yes";
          },
        });
        assert.equal(challenges.length, 1);
        assert.match(challenges[0].prompt, /SHA256|fingerprint/i);
        const result = JSON.parse(
          await f.transport.bootstrap("OPTIONS = {}\n"),
        );
        const endpoint = await f.transport.forward(result.endpoints[0].port);
        assert.equal((await (await fetch(endpoint)).json()).fixture, true);
        const helperFiles = await readdir(f.transport.directory);
        for (const file of helperFiles.filter((file) => file === "askpass"))
          assert.doesNotMatch(
            await readFile(`${f.transport.directory}/${file}`, "utf8"),
            /synthetic-only-password/,
          );
        assert.deepEqual(f.executions, ["sh -lc 'exec python3 -'"]);
        f.transport.close();
        assert.equal(
          (
            await (
              await fetch(`http://127.0.0.1:${f.backend.address().port}`)
            ).json()
          ).ok,
          true,
          "backend survives tunnel close",
        );
      } finally {
        await f.close();
      }
    },
  );
test(
  "wrong SSH password produces a sanitized state without persisting credentials",
  { timeout: 30000 },
  async () => {
    const f = await fixture("password");
    try {
      await assert.rejects(
        f.transport.open({
          password: "wrong-synthetic-secret",
          onChallenge: async (c) =>
            c.kind === "host-key" ? "yes" : "wrong-synthetic-secret",
        }),
        (error) =>
          error.state === "credentials-required" &&
          !error.message.includes("wrong-synthetic-secret"),
      );
      assert.equal(f.transport.password, undefined);
      assert.equal(f.executions.length, 0);
    } finally {
      await f.close();
    }
  },
);

test(
  "changed known host key is rejected without trusting or executing on the host",
  { timeout: 30000 },
  async () => {
    const f = await fixture("key");
    try {
      const port = f.transport.connection.port;
      const foreignKey = utils
        .parseKey(key())
        .getPublicSSH()
        .toString("base64");
      const line = `[127.0.0.1]:${port} ssh-rsa ${foreignKey}\n`;
      await writeFile(`${f.directory}/known_hosts`, line, { mode: 0o600 });
      await assert.rejects(
        f.transport.open({
          onChallenge: async () => {
            throw Error("Changed identity must not be auto-trusted");
          },
        }),
        (error) => error.state === "host-key-required",
      );
      assert.equal(await readFile(`${f.directory}/known_hosts`, "utf8"), line);
      assert.equal(f.executions.length, 0);
    } finally {
      await f.close();
    }
  },
);
