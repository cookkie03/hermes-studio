// F3: actual packaged renderer -> REST/SSE bridge -> synthetic HTTP/WebSocket runtime.
// No Hermes discovery, credentials, personal profiles or model calls.
const { _electron } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '..');
  const data = await fs.mkdtemp('/private/tmp/hs-approvals-ui-');
  const fixture = spawn('python3', ['-u', path.join(root, '../Verification/RuntimeWebSocketFixture.py'), '--conversations'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let app, page;
  const errors = [];
  try {
    const port = await new Promise((resolve, reject) => {
      let output = '';
      const timer = setTimeout(() => reject(Error('Synthetic runtime readiness timed out')), 5000);
      fixture.stdout.on('data', chunk => {
        output += chunk;
        if (/^\d+\n/.test(output)) { clearTimeout(timer); resolve(Number(output.split('\n')[0])); }
      });
      fixture.on('error', error => { clearTimeout(timer); reject(error); });
    });
    const launch = async () => {
      app = await _electron.launch({ executablePath: path.join(root, 'release/mac-arm64/Hermes Studio.app/Contents/MacOS/Hermes Studio'), args: [`--user-data-dir=${data}`], env: { ...process.env, HERMES_STUDIO_DISABLE_AUTOCONNECT: '1' }, timeout: 45000 });
      const page = await app.firstWindow({ timeout: 50000 });
      page.on('pageerror', error => errors.push(error.message));
      await page.getByText('SPACES', { exact: true }).waitFor();
      return page;
    };
    page = await launch();
    const ids = await page.evaluate(async endpoint => {
      const request = async (url, body) => {
        const response = await fetch('/api' + url, { method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
        if (!response.ok) throw Error('Synthetic setup failed: ' + url);
        return response.json();
      };
      await request('/hermes/connections', { id: 'local', name: 'Synthetic F2 host', mode: 'local', endpoint });
      await request('/hermes/connect', { connectionId: 'local' });
      const workspace = await request('/workspace');
      return Promise.all(['F2 alpha', 'F2 beta'].map(async title => (await request('/conversations', { dotId: workspace.dots[0].id, title })).id));
    }, `http://127.0.0.1:${port}`);
    await page.reload();
    const select = title => page.locator('.thread-list').getByRole('button', { name: new RegExp(title) }).click();
    await select('F2 alpha');
    let composer = page.getByRole('textbox', { name: 'Message Hermes', exact: true });
    await composer.fill('Synthetic draft, never sent');
    await page.waitForFunction(() => !document.querySelector('[aria-label="Send message"]').disabled);
    const session = await page.evaluate(async id => (await (await fetch('/api/hermes/sessions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ threadId: id }) })).json()).runtimeId, ids[0]);
    const inject = async (route, id, reason) => {
      const response = await fetch(`http://127.0.0.1:${port}/fixture/${route}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: session, id, reason }) });
      assert.equal(response.ok, true);
    };
    await inject('approval', 'allow');
    const card = page.getByRole('region', { name: 'Hermes approval' });
    // section has an accessible name and native buttons; no dialog focus trap.
    await page.getByRole('button', { name: 'Allow once', exact: true }).waitFor();
    await page.evaluate(() => {
      const original = window.fetch; window.fixtureDecisions = 0;
      window.fetch = async (...args) => {
        if (!String(args[0]).endsWith('/hermes/approval')) return original(...args);
        window.fixtureDecisions++; const response = await original(...args);
        await new Promise(resolve => setTimeout(resolve, 300)); return response;
      };
      const button = [...document.querySelectorAll('button')].find(b => b.textContent === 'Allow once');
      button.click(); button.click();
    });
    await page.getByText('Decision sent. Await runtime activity to verify the action.', { exact: true }).waitFor();
    assert.equal(await page.evaluate(() => window.fixtureDecisions), 1);
    assert.deepEqual(await (await fetch(`http://127.0.0.1:${port}/fixture/decisions`)).json(), [{ id: 'allow', result: { choice: 'once' } }]);
    await inject('approval', 'cancel');
    await page.getByRole('button', { name: 'Deny', exact: true }).waitFor();
    await inject('cancel', 'cancel', 'timeout');
    await page.getByText('Request expired.', { exact: true }).waitFor();
    assert.equal(await page.getByRole('button', { name: 'Deny', exact: true }).count(), 0);
    await inject('approval', 'cancel'); // A fresh request can reuse the withdrawn RPC ID.
    const deny = page.getByRole('button', { name: 'Deny', exact: true });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(b => b.textContent === 'Deny' && !b.disabled));
    await deny.focus(); assert.equal(await deny.evaluate(el => el === document.activeElement), true);
    await deny.press('Enter');
    await page.waitForFunction(() => window.fixtureDecisions === 2);
    await page.waitForFunction(() => !document.querySelector('.hermes-approval button'));
    for (const width of [900, 1360]) {
      await page.setViewportSize({ width, height: 900 });
      assert.equal(await page.locator('.hermes-approval').evaluateAll(elements => elements.every(el => el.getBoundingClientRect().right <= innerWidth)), true);
    }
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
    assert.deepEqual(await (await fetch(`http://127.0.0.1:${port}/fixture/decisions`)).json(), [{ id: 'allow', result: { choice: 'once' } }, { id: 'cancel', result: { choice: 'deny' } }]);
    assert.deepEqual(errors, []);
    console.log('PASS packaged F3: owned REST/SSE/WS decision, double click, timeout, keyboard, 900/1360, Reduced Motion; no personal runtime.');
  } finally { if (app) await app.close(); fixture.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
