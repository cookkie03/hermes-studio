'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const crypto = require('node:crypto');
const { verifyArtifacts } = require('./verify-artifacts.cjs');
const commit = 'a'.repeat(40);

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'release-integrity-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  // Deliberately synthetic bytes: unit test only, never macOS/DMG evidence.
  const bytes = Buffer.alloc(10000000);
  const dmg = { filename: 'Hermes Studio-0.1.0-arm64.dmg', sizeBytes: bytes.length,
    sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
    sha512: crypto.createHash('sha512').update(bytes).digest('hex') };
  const manifest = { gitCommit: commit, version: '0.1.0', tag: 'v0.1.0', platform: 'darwin', arch: 'arm64',
    artifacts: { dmg, app: { signature: 'ad-hoc_verified_deep_strict' } } };
  const save = () => fs.writeFileSync(path.join(dir, 'release-manifest.json'), JSON.stringify(manifest));
  fs.writeFileSync(path.join(dir, dmg.filename), bytes);
  fs.writeFileSync(path.join(dir, `${dmg.filename}.sha256`), `${dmg.sha256}  ${dmg.filename}\n`);
  save();
  return { dir, manifest, save, dmg };
}
test('accepts internally consistent synthetic transport evidence', t => {
  const { dir } = fixture(t);
  verifyArtifacts(dir, commit, '0.1.0');
});
for (const field of ['gitCommit', 'version', 'tag', 'platform', 'arch']) {
  test(`rejects incorrect ${field}`, t => {
    const f = fixture(t); f.manifest[field] = 'wrong'; f.save();
    assert.throws(() => verifyArtifacts(f.dir, commit, '0.1.0'));
  });
}
for (const field of ['sizeBytes', 'sha256', 'sha512', 'filename']) {
  test(`rejects incorrect artifact ${field}`, t => {
    const f = fixture(t); f.dmg[field] = field === 'filename' ? '../escape.dmg' : 'wrong'; f.save();
    assert.throws(() => verifyArtifacts(f.dir, commit, '0.1.0'));
  });
}
test('rejects failed signature status', t => {
  const f = fixture(t); f.manifest.artifacts.app.signature = 'not_verified'; f.save();
  assert.throws(() => verifyArtifacts(f.dir, commit, '0.1.0'));
});
test('rejects corrupted DMG bytes', t => {
  const f = fixture(t); fs.writeFileSync(path.join(f.dir, f.dmg.filename), Buffer.alloc(10000000, 1));
  assert.throws(() => verifyArtifacts(f.dir, commit, '0.1.0'));
});
test('rejects corrupted checksum sidecar', t => {
  const f = fixture(t); fs.writeFileSync(path.join(f.dir, `${f.dmg.filename}.sha256`), 'wrong');
  assert.throws(() => verifyArtifacts(f.dir, commit, '0.1.0'));
});
test('rejects unexpected artifacts', t => {
  const f = fixture(t); fs.writeFileSync(path.join(f.dir, 'stale.dmg'), 'stale');
  assert.throws(() => verifyArtifacts(f.dir, commit, '0.1.0'));
});
test('rejects missing artifacts', t => {
  const f = fixture(t); fs.unlinkSync(path.join(f.dir, f.dmg.filename));
  assert.throws(() => verifyArtifacts(f.dir, commit, '0.1.0'));
});
