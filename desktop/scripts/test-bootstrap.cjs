'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { EventEmitter } = require('node:events');
const { startInterfaceServer } = require('../electron/backend-bootstrap.cjs');

(async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hermes-studio-bootstrap-'));
  try {
    fs.mkdirSync(path.join(root, 'hermes'), { recursive: true });
    fs.writeFileSync(path.join(root, 'hermes/server.mjs'), '');
    fs.mkdirSync(path.join(root, 'upstream/dist/client'), { recursive: true });
    fs.writeFileSync(path.join(root, 'upstream/dist/client/index.html'), '');
    let options, child, unexpected = 0;
    const utilityProcess = { fork(_entry, _args, config) {
      options = config;
      child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
      child.killed = false; child.kill = () => { child.killed = true; child.emit('exit', 0); };
      return child;
    } };
    const common = { utilityProcess, root, dataDirectory: root, token: 'synthetic-token',
      onStarted() {}, onUnexpectedExit() { unexpected++; } };
    const oldKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = 'synthetic-not-inherited';
    const ready = startInterfaceServer(common);
    if (oldKey === undefined) delete process.env.OPENAI_API_KEY; else process.env.OPENAI_API_KEY = oldKey;
    assert.equal(options.env.OPENAI_API_KEY, undefined);
    assert.equal(options.env.HERMES_STUDIO_OWNER_TOKEN, 'synthetic-token');
    assert.equal(options.env.HERMES_STUDIO_PORT, '0');
    child.emit('message', { type: 'ready', port: 0 });
    child.emit('message', { type: 'ready', port: '4310' });
    child.emit('message', { type: 'ready', port: 65536 });
    child.emit('message', { type: 'ready', port: 4310 });
    assert.equal(await ready, 'http://127.0.0.1:4310');
    child.kill(); assert.equal(unexpected, 1);
    const timedOut = startInterfaceServer({ ...common, timeoutMs: 15 });
    await assert.rejects(timedOut, /did not become ready/);
    assert.equal(child.killed, true);
    assert.equal(unexpected, 1);
    const exited = startInterfaceServer(common);
    child.emit('exit', 1);
    await assert.rejects(exited, /before becoming ready/);
    console.log('PASS: ready-port validation, credential isolation, owned-service timeout and early-exit handling');
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
