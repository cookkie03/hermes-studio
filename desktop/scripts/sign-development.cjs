'use strict';
const { execFileSync } = require('node:child_process');
const path = require('node:path');
module.exports = async function signDevelopment(context) {
  const output = path.resolve(context.appOutDir);
  const release = path.resolve(__dirname, '..', 'release');
  if (!output.startsWith(release + path.sep)) throw new Error('Refusing to sign outside generated release output');
  const bundle = path.join(output, `${context.packager.appInfo.productFilename}.app`);
  execFileSync('/usr/bin/codesign', ['--force', '--deep', '--sign', '-', bundle], { stdio: 'pipe' });
  execFileSync('/usr/bin/codesign', ['--verify', '--deep', '--strict', bundle], { stdio: 'pipe' });
  console.log('PASS: generated development app ad-hoc signature and deep resource verification (no Apple identity/notarization)');
};
