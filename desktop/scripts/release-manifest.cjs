'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const releaseDir = path.join(root, 'release');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;

if (!fs.existsSync(releaseDir)) {
  throw new Error(`Release directory does not exist: ${releaseDir}`);
}

// Find the DMG
const files = fs.readdirSync(releaseDir);
const dmgFile = files.find(f => f.endsWith('.dmg') && !f.endsWith('.blockmap'));

if (!dmgFile) {
  throw new Error('No DMG found in release directory.');
}

const dmgPath = path.join(releaseDir, dmgFile);
const dmgStats = fs.statSync(dmgPath);

if (dmgStats.size < 10000000) {
  throw new Error(`DMG size suspiciously small: ${dmgStats.size} bytes`);
}

// Compute Hashes
const dmgBuffer = fs.readFileSync(dmgPath);
const sha256 = crypto.createHash('sha256').update(dmgBuffer).digest('hex');
const sha512 = crypto.createHash('sha512').update(dmgBuffer).digest('hex');

// Write SHA256 file
const sha256File = `${dmgPath}.sha256`;
fs.writeFileSync(sha256File, `${sha256}  ${dmgFile}\n`, 'utf8');

// Verify codesign of the .app
const appPath = path.join(releaseDir, 'mac-arm64', 'Hermes Studio.app');
let codesignStatus = 'not_verified';
if (fs.existsSync(appPath)) {
  try {
    execSync(`/usr/bin/codesign --verify --deep --strict "${appPath}"`, { stdio: 'pipe' });
    codesignStatus = 'ad-hoc_verified_deep_strict';
  } catch (err) {
    codesignStatus = `verification_failed: ${err.message}`;
  }
}

// Git info
let gitCommit = 'unknown';
let gitBranch = 'unknown';
try {
  gitCommit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
} catch {}

const manifest = {
  productName: pkg.build?.productName || 'Hermes Studio',
  version,
  tag: `v${version}`,
  arch: 'arm64',
  platform: 'darwin',
  gitCommit,
  gitBranch,
  releaseDate: new Date().toISOString(),
  artifacts: {
    dmg: {
      filename: dmgFile,
      sizeBytes: dmgStats.size,
      sha256,
      sha512,
    },
    app: {
      bundle: 'mac-arm64/Hermes Studio.app',
      signature: codesignStatus,
      signingIdentity: 'ad-hoc (development channel; no Apple Developer ID)',
    },
  },
  prerequisites: {
    os: 'macOS 13.0 or higher (arm64 Apple Silicon)',
    runtime: 'External Hermes Agent (local daemon or remote host) required for AI turns. Local spaces/notes/files function offline without Node/npm.',
  },
  limitations: [
    'Ad-hoc signed: macOS Gatekeeper requires manual allowance on first open (Right click -> Open or xattr quarantine removal).',
    'arm64 only: native Intel (x64) build not verified or promised.',
    'No automatic background updater configured in this initial release.',
  ],
};

const manifestPath = path.join(releaseDir, 'release-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');

console.log('PASS: Release manifest and SHA256 checksum generated successfully.');
console.log(`- DMG: ${dmgFile} (${dmgStats.size} bytes)`);
console.log(`- SHA256: ${sha256}`);
console.log(`- Commit: ${gitCommit}`);
console.log(`- Signature: ${codesignStatus}`);
console.log(`- Manifest: ${manifestPath}`);
