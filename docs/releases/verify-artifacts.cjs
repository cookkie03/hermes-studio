'use strict';
// CI-only transport integrity check; does not replace macOS signature verification.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');

function verifyArtifacts(directory, commit, version) {
  assert.match(commit, /^[a-f0-9]{40}$/);
  assert.match(version, /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
  const manifest = JSON.parse(fs.readFileSync(path.join(directory, 'release-manifest.json'), 'utf8'));
  assert.equal(manifest.gitCommit, commit);
  assert.equal(manifest.version, version);
  assert.equal(manifest.tag, `v${version}`);
  assert.equal(manifest.platform, 'darwin');
  assert.equal(manifest.arch, 'arm64');
  assert.equal(manifest.artifacts.app.signature, 'ad-hoc_verified_deep_strict');
  const artifact = manifest.artifacts.dmg;
  assert.match(artifact.filename, /^[A-Za-z0-9][A-Za-z0-9 ._-]*\.dmg$/);
  assert.deepEqual(fs.readdirSync(directory).sort(), [artifact.filename, `${artifact.filename}.sha256`, 'release-manifest.json'].sort());
  const bytes = fs.readFileSync(path.join(directory, artifact.filename));
  assert.ok(bytes.length >= 10000000, 'DMG suspiciously small');
  assert.equal(bytes.length, artifact.sizeBytes);
  const sha256 = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha256, artifact.sha256);
  assert.equal(crypto.createHash('sha512').update(bytes).digest('hex'), artifact.sha512);
  assert.equal(fs.readFileSync(path.join(directory, `${artifact.filename}.sha256`), 'utf8'), `${sha256}  ${artifact.filename}\n`);
}

module.exports = { verifyArtifacts };
if (require.main === module) {
  verifyArtifacts(...process.argv.slice(2));
  console.log('PASS: artifact bytes, checksums, signature status, version and source binding');
}
