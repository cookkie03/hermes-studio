'use strict';
const { app, BrowserWindow, utilityProcess, dialog, session, ipcMain, shell } = require('electron');
const path = require('node:path');
const { randomBytes } = require('node:crypto');
const { startInterfaceServer } = require('./backend-bootstrap.cjs');
const { sourceURL } = require('./external-links.cjs');

app.setName('Hermes Studio');
let window;
let ownedServer;
let origin;
let quitting = false;
const ownerToken = randomBytes(32).toString('hex');

function sameOrigin(value) {
  try { return new URL(value).origin === origin; } catch { return false; }
}
ipcMain.on('hermes:open-source', (event, value) => {
  if (!window || event.sender !== window.webContents || !sameOrigin(event.senderFrame?.url)) return;
  const url = sourceURL(value, origin);
  if (url) void shell.openExternal(url).catch(() => {});
});
function bootstrap() {
  return startInterfaceServer({
    utilityProcess, root: app.getAppPath(), dataDirectory: app.getPath('userData'), token: ownerToken,
    onStarted: (child) => { ownedServer = child; },
    onUnexpectedExit: () => {
      if (quitting) return;
      void dialog.showMessageBox({ type: 'error', title: 'Hermes Studio',
        message: 'The interface service stopped.',
        detail: 'Your Hermes runtime was not stopped. Quit and reopen Hermes Studio to reconnect.' });
    },
  }).then((url) => { origin = url; return url; });
}
function createWindow() {
  const windowSession = session.fromPartition('hermes-studio-ui');
  windowSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  windowSession.setPermissionCheckHandler(() => false);
  windowSession.webRequest.onBeforeSendHeaders({ urls: [`${origin}/api/*`] }, (details, callback) => {
    const headers = { ...details.requestHeaders };
    if (sameOrigin(details.url)) headers.Authorization = `Bearer ${ownerToken}`;
    callback({ requestHeaders: headers });
  });
  windowSession.webRequest.onHeadersReceived({ urls: [`${origin}/*`] }, (details, callback) => {
    const locationEntry = Object.entries(details.responseHeaders ?? {}).find(([name]) => name.toLowerCase() === 'location');
    const location = locationEntry?.[1]?.[0];
    if (details.statusCode >= 300 && details.statusCode < 400 && location) {
      try {
        if (!sameOrigin(new URL(location, details.url).href)) { callback({ cancel: true }); return; }
      } catch { callback({ cancel: true }); return; }
    }
    callback({ responseHeaders: details.responseHeaders });
  });
  window = new BrowserWindow({
    width: 1360, height: 900, minWidth: 880, minHeight: 620,
    title: 'Hermes Studio', backgroundColor: '#f6f3ee', show: false,
    webPreferences: {
      session: windowSession,
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true, nodeIntegration: false, sandbox: true,
      webSecurity: true, allowRunningInsecureContent: false,
    },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => { if (!sameOrigin(url)) event.preventDefault(); });
  window.webContents.on('will-redirect', (event, url) => { if (!sameOrigin(url)) event.preventDefault(); });
  window.webContents.on('will-attach-webview', (event) => event.preventDefault());
  window.on('closed', () => { window = undefined; });
  window.once('ready-to-show', () => window.show());
  void window.loadURL(origin);
}

app.on('before-quit', () => { quitting = true; });
app.on('will-quit', () => { ownedServer?.kill(); ownedServer = undefined; });
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (origin && !window) createWindow(); });

app.whenReady().then(async () => {
  try { await bootstrap(); createWindow(); }
  catch (error) {
    dialog.showErrorBox('Hermes Studio cannot start', error.message);
    app.quit();
  }
});
