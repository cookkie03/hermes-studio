'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('npm test lifecycle ensures metadata is built before test execution', () => {
  const pkgPath = path.resolve(__dirname, '..', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  assert.ok(pkg.scripts, 'scripts object exists');
  assert.ok(pkg.scripts.test, 'test script exists');
  assert.ok(pkg.scripts['build:metadata'], 'build:metadata script exists');

  // Verify build:metadata runs before test suites in npm test lifecycle
  const testScript = pkg.scripts.test;
  const buildMetadataIdx = testScript.indexOf('npm run build:metadata');
  const nodeTestIdx = testScript.indexOf('node --test');
  const testMetadataIdx = testScript.indexOf('npm run test:metadata');

  assert.ok(buildMetadataIdx !== -1, 'npm test must include npm run build:metadata');
  assert.ok(nodeTestIdx !== -1, 'npm test must include node --test');
  assert.ok(
    buildMetadataIdx < nodeTestIdx,
    'build:metadata must run before node --test suites importing dist/server'
  );
  if (testMetadataIdx !== -1) {
    assert.ok(
      buildMetadataIdx < testMetadataIdx,
      'build:metadata must run before test:metadata'
    );
  }
});
