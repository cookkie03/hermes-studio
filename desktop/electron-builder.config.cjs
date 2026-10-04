'use strict';
const fs = require('node:fs');
const path = require('node:path');
const metadata = JSON.parse(fs.readFileSync(path.join(__dirname, 'upstream/dist/server/metadata-manifest.json'), 'utf8'));
module.exports = {
  ...require('./package.json').build,
  afterPack: require('./scripts/sign-development.cjs'),
  files: [
    'electron/**', 'hermes/**', '!hermes/**/*.test.mjs',
    'upstream/dist/client/**', 'package.json', 'upstream/LICENSE', 'upstream/PROVENANCE.md', 'README.md',
    { from: 'upstream/dist/server', to: 'upstream/dist/server', filter: [...metadata, 'metadata-manifest.json'] },
  ],
};
