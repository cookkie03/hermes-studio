'use strict';
const assert = require('node:assert/strict');
const { sourceURL } = require('../electron/external-links.cjs');
const privateOrigin = 'http://127.0.0.1:41414';
assert.equal(sourceURL('https://example.org/source?q=research#paragraph', privateOrigin), 'https://example.org/source?q=research#paragraph');
assert.equal(sourceURL('http://example.org/source', privateOrigin), 'http://example.org/source');
for (const value of ['javascript:alert(1)', 'file:///etc/passwd', 'mailto:user@example.org', 'https://user:password@example.org', 'https://user@example.org', privateOrigin + '/api/hermes/status', 'bad URL', {}, 'https://example.org/' + 'x'.repeat(8192)]) {
  assert.equal(sourceURL(value, privateOrigin), null);
}
console.log('PASS: source URL http(s) allowlist; credential, scheme, private-service and malformed URL rejection');
