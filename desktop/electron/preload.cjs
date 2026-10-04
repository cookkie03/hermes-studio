'use strict';
const { contextBridge, ipcRenderer } = require('electron');
// This bridge exposes product information only, never credentials, filesystem, shell or arbitrary IPC.
contextBridge.exposeInMainWorld('hermesStudioDesktop', Object.freeze({
  platform: process.platform,
  packaged: true,
}));
// Only native user clicks can request source navigation. No callable IPC is exposed to page scripts.
window.addEventListener('click', (event) => {
  if (!event.isTrusted || event.defaultPrevented) return;
  const anchor = event.target?.closest?.('a[href]');
  if (!anchor || anchor.hasAttribute('download')) return;
  let url;
  try { url = new URL(anchor.href); } catch { return; }
  if (!['http:', 'https:'].includes(url.protocol) || url.origin === window.location.origin) return;
  event.preventDefault();
  ipcRenderer.send('hermes:open-source', url.href);
}, true);
