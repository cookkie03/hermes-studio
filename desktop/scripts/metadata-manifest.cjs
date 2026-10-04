'use strict';
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..', 'upstream', 'dist', 'server');
const queue = ['server/store.js', 'server/workspace.js', 'server/app.js', 'server/workspace-routes.js'];
const files = new Set();
const runtimePackages = new Set(['hono', '@hono/node-server', 'zod', '@modelcontextprotocol/sdk']);
while (queue.length) {
  const relative = queue.pop();
  if (files.has(relative)) continue;
  const absolute = path.resolve(root, relative);
  if (!absolute.startsWith(root + path.sep) || !fs.existsSync(absolute)) throw new Error(`Missing metadata module: ${relative}`);
  files.add(relative);
  const source = fs.readFileSync(absolute, 'utf8');
  for (const match of source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"]([^.'"][^'"]+)['"]/g)) {
    const specifier = match[1];
    if (specifier.startsWith('node:')) continue;
    const packageName = specifier.startsWith('@') ? specifier.split('/').slice(0, 2).join('/') : specifier.split('/')[0];
    if (!runtimePackages.has(packageName)) throw new Error(`Unaudited runtime package: ${packageName}`);
  }
  // Compiler-emitted imports use literal relative paths; external packages stay node_modules dependencies.
  const imports = source.matchAll(/(?:from\s*|import\s*\(\s*|import\s*)['"](\.[^'"]+)['"]/g);
  for (const match of imports) {
    const dependency = path.relative(root, path.resolve(path.dirname(absolute), match[1]));
    if (dependency.endsWith('.js')) queue.push(dependency);
  }
}
const manifest = [...files].sort();
fs.writeFileSync(path.join(root, 'metadata-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
if (manifest.some(file => /(?:dot-agent|platform|headless|runner)\.js$/.test(file))) throw new Error('Legacy executor entered the metadata graph');
console.log(`PASS: ${manifest.length} reachable metadata modules; legacy executor excluded`);
