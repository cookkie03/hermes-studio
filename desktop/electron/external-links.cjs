'use strict';
function sourceURL(value, privateOrigin) {
  if (typeof value !== 'string' || value.length > 8192) return null;
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.origin === privateOrigin) return null;
    return url.href;
  } catch { return null; }
}
module.exports = { sourceURL };
