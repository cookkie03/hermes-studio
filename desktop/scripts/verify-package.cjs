'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const required = ['electron/main.cjs', 'electron/preload.cjs', 'electron/backend-bootstrap.cjs',
  'hermes/server.mjs', 'upstream/dist/client/index.html', 'upstream/LICENSE', 'upstream/PROVENANCE.md'];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) throw new Error(`Missing packaged input: ${file}`);
}
const config = JSON.parse(fs.readFileSync(path.join(root, 'package.json')));
if (config.main !== 'electron/main.cjs') throw new Error('Wrong packaged entrypoint');
if (config.devDependencies.electron === 'latest') throw new Error('Electron version is not pinned');
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'upstream/dist/server/metadata-manifest.json')));
if (metadata.some(file => /(?:dot-agent|platform|headless|runner)\.js$/.test(file))) throw new Error('Legacy executor in packaged metadata');
for (const file of metadata) if (!fs.existsSync(path.join(root, 'upstream/dist/server', file))) throw new Error(`Missing metadata: ${file}`);
console.log('PASS: production entrypoint, built renderer, adapter, MIT notice and pinned Electron');
