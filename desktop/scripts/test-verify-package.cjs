'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { verifyPackage } = require('./verify-package.cjs');

test('verifyPackage passes for a valid package root structure', (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-package-test-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  // Create valid structure
  fs.mkdirSync(path.join(tmp, 'electron'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'electron/main.cjs'), '');
  fs.writeFileSync(path.join(tmp, 'electron/preload.cjs'), '');
  fs.writeFileSync(path.join(tmp, 'electron/backend-bootstrap.cjs'), '');
  fs.writeFileSync(path.join(tmp, 'electron/browser-host.cjs'), '');
  fs.writeFileSync(path.join(tmp, 'electron/external-links.cjs'), '');

  fs.mkdirSync(path.join(tmp, 'hermes'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'hermes/server.mjs'), '');

  fs.mkdirSync(path.join(tmp, 'upstream/dist/client'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'upstream/dist/client/index.html'), '');
  fs.writeFileSync(path.join(tmp, 'upstream/LICENSE'), '');
  fs.writeFileSync(path.join(tmp, 'upstream/PROVENANCE.md'), '');

  fs.writeFileSync(path.join(tmp, 'README.md'), '');

  fs.mkdirSync(path.join(tmp, 'upstream/dist/server/server'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, 'upstream/dist/server/metadata-manifest.json'),
    JSON.stringify(['server/app.js'])
  );
  fs.writeFileSync(path.join(tmp, 'upstream/dist/server/server/app.js'), '');

  fs.writeFileSync(
    path.join(tmp, 'package.json'),
    JSON.stringify({
      main: 'electron/main.cjs',
      devDependencies: {
        electron: '44.5.1'
      }
    })
  );

  const result = verifyPackage(tmp);
  assert.equal(result.success, true);
});

test('verifyPackage fails if electron/browser-host.cjs or external-links.cjs is missing', (t) => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-package-test-'));
  t.after(() => fs.rmSync(tmp, { recursive: true, force: true }));

  fs.mkdirSync(path.join(tmp, 'electron'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'electron/main.cjs'), '');
  fs.writeFileSync(path.join(tmp, 'electron/preload.cjs'), '');
  fs.writeFileSync(path.join(tmp, 'electron/backend-bootstrap.cjs'), '');

  fs.mkdirSync(path.join(tmp, 'hermes'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'hermes/server.mjs'), '');

  fs.mkdirSync(path.join(tmp, 'upstream/dist/client'), { recursive: true });
  fs.writeFileSync(path.join(tmp, 'upstream/dist/client/index.html'), '');
  fs.writeFileSync(path.join(tmp, 'upstream/LICENSE'), '');
  fs.writeFileSync(path.join(tmp, 'upstream/PROVENANCE.md'), '');
  fs.writeFileSync(path.join(tmp, 'README.md'), '');

  fs.mkdirSync(path.join(tmp, 'upstream/dist/server/server'), { recursive: true });
  fs.writeFileSync(
    path.join(tmp, 'upstream/dist/server/metadata-manifest.json'),
    JSON.stringify(['server/app.js'])
  );
  fs.writeFileSync(path.join(tmp, 'upstream/dist/server/server/app.js'), '');

  fs.writeFileSync(
    path.join(tmp, 'package.json'),
    JSON.stringify({
      main: 'electron/main.cjs',
      devDependencies: { electron: '44.5.1' }
    })
  );

  assert.throws(() => {
    verifyPackage(tmp);
  }, /Missing packaged input: electron\/browser-host\.cjs/);
});
