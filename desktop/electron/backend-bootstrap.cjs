'use strict';
const path = require('node:path');
const fs = require('node:fs');

/** Starts the packaged UI service only. Never spawns or terminates the Hermes agent runtime. */
function startInterfaceServer({ utilityProcess, root, dataDirectory, token, onStarted, onUnexpectedExit, timeoutMs = 45_000 }) {
  return new Promise((resolve, reject) => {
    const entry = path.join(root, 'hermes', 'server.mjs');
    const staticDirectory = path.join(root, 'upstream', 'dist', 'client');
    if (!fs.existsSync(entry) || !fs.existsSync(path.join(staticDirectory, 'index.html'))) {
      reject(new Error('Packaged service or built interface is missing. Run the production build first.'));
      return;
    }
    const environment = { ...process.env };
    for (const key of Object.keys(environment)) {
      if (/(?:API_KEY|TOKEN|SECRET|PASSWORD)$/.test(key)) delete environment[key];
    }
    Object.assign(environment, {
      NODE_ENV: 'production', HERMES_STUDIO_HOST: '127.0.0.1', HERMES_STUDIO_PORT: '0',
      HERMES_STUDIO_DATA_DIR: dataDirectory, HERMES_STUDIO_STATIC_DIR: staticDirectory,
      HERMES_STUDIO_OWNER_TOKEN: token,
    });
    const child = utilityProcess.fork(entry, [], { env: environment, stdio: 'pipe', serviceName: 'Hermes Studio interface' });
    onStarted(child);
    let settled = false;
    let ready = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill();
      reject(new Error('The local interface service did not become ready.'));
    }, timeoutMs);
    child.on('message', (message) => {
      if (settled || !message || message.type !== 'ready' || !Number.isInteger(message.port) || message.port <= 0 || message.port > 65535) return;
      settled = true;
      ready = true;
      clearTimeout(timer);
      resolve(`http://127.0.0.1:${message.port}`);
    });
    // Drain without writing private service output or provider credentials to logs.
    child.stdout?.on('data', () => {});
    child.stderr?.on('data', () => {});
    child.on('exit', () => {
      clearTimeout(timer);
      if (!settled) {
        settled = true;
        reject(new Error('The local interface service stopped before becoming ready.'));
      } else if (ready) { onUnexpectedExit(); }
    });
  });
}
module.exports = { startInterfaceServer };
