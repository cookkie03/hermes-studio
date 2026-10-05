// F2: actual packaged renderer -> REST/SSE bridge -> synthetic HTTP/WebSocket runtime.
// No Hermes discovery, credentials, personal profiles or model calls.
const { _electron } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');
const { spawn } = require('node:child_process');
const assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '..');
  const data = await fs.mkdtemp('/private/tmp/hs-conversations-ui-');
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
    await composer.fill('Synthetic first question');
    const send = page.getByRole('button', { name: 'Send message', exact: true });
    await send.waitFor();
    await page.waitForFunction(() => !document.querySelector('[aria-label="Send message"]').disabled);
    // Delay the actual HTTP response after the server receives the request; SSE keeps flowing.
    await page.evaluate(() => {
      const original = window.fetch;
      window.fixtureOriginalFetch = original; window.fixtureSends = 0;
      window.fetch = async (...args) => {
        const sending = String(args[0]).endsWith('/hermes/send');
        if (sending) window.fixtureSends++;
        const response = await original(...args);
        if (sending) await new Promise(resolve => setTimeout(resolve, 800));
        return response;
      };
    });
    await composer.press('Enter');
    await composer.fill('New draft during dispatch');
    await composer.press('Enter');
    await page.getByText('Synthetic streaming response', { exact: true }).waitFor();
    await page.getByText('Synthetic confirmed response', { exact: true }).waitFor();
    await page.getByText('Late synthetic tool result', { exact: true }).waitFor();
    await page.getByText('Memory replacement proposed, not applied. Use /memory pending to approve or discard.', { exact: true }).waitFor();
    await page.getByText('Skill creation confirmed by synthetic Hermes.', { exact: true }).waitFor();
    assert.equal(await page.locator('.hermes-review-note').count(), 2, 'Native replay overlap duplicated a note');
    assert.equal(await page.getByRole('button', { name: 'Interrupt current turn' }).count(), 0, 'Review note restarted Working');
    await page.getByRole('region', { name: 'Conversation context', exact: true }).getByText('synthetic-specialist', { exact: true }).waitFor();
    assert.equal(await page.locator('.conversation-context').getByText('None selected', { exact: true }).count(), 1, 'Native Finance project was mistaken for a selected Studio Space');
    // A late note must not pull the reader away from older content.
    await page.evaluate(() => { const log = document.querySelector('.hermes-timeline'); log.style.height = '130px'; log.style.flex = '0 0 130px'; log.scrollTop = 0; log.dispatchEvent(new Event('scroll')); });
    const scrollBefore = await page.locator('.hermes-timeline').evaluate(element => element.scrollTop);
    const ownedSession = await page.evaluate(async id => (await (await fetch(`/api/hermes/history?threadId=${id}`)).json()).session.runtimeId, ids[0]);
    const reviewResponse = await fetch(`http://127.0.0.1:${port}/fixture/review`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id: ownedSession }) });
    assert.equal(reviewResponse.ok, true);
    await page.getByText('Synthetic review while reading older messages.', { exact: true }).waitFor();
    await page.getByRole('button', { name: 'Show new activity', exact: true }).waitFor();
    assert.equal(await page.locator('.hermes-timeline').evaluate(element => element.scrollTop), scrollBefore);
    await page.getByRole('button', { name: 'Show new activity', exact: true }).click();
    await page.evaluate(() => { const log = document.querySelector('.hermes-timeline'); log.style.removeProperty('height'); log.style.removeProperty('flex'); log.scrollTop = log.scrollHeight; log.dispatchEvent(new Event('scroll')); });
    assert.equal(await page.evaluate(() => window.fixtureSends), 1, 'Double send escaped the submission lock');
    assert.equal(await composer.inputValue(), 'New draft during dispatch');
    assert.equal(await page.locator('.chat-bubble.user').count(), 1);
    assert.equal(await page.locator('.chat-bubble.assistant').count(), 1);
    await page.evaluate(() => { window.fetch = window.fixtureOriginalFetch; });
    // IME Enter preserves text and does not send.
    await composer.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', isComposing: true, bubbles: true });
    await composer.press('Shift+Enter');
    assert.equal(await page.locator('.chat-bubble.user').count(), 1);
    assert.match(await composer.inputValue(), /\n/);
    await composer.fill('Saved alpha draft');
    await page.waitForFunction(async id => (await (await fetch(`/api/conversations/${id}/draft`)).json()).draft === 'Saved alpha draft', ids[0]);
    await select('F2 beta');
    await composer.fill('Saved beta draft');
    await page.waitForFunction(async id => (await (await fetch(`/api/conversations/${id}/draft`)).json()).draft === 'Saved beta draft', ids[1]);
    assert.equal(await page.locator('.chat-bubble').count(), 0, 'Previous conversation leaked');
    assert.equal(await page.locator('.hermes-review-note').count(), 0, 'Previous review notes leaked');
    await select('F2 alpha');
    assert.equal(await composer.inputValue(), 'Saved alpha draft');
    await page.getByText('Synthetic confirmed response', { exact: true }).waitFor();
    for (const width of [1360, 900]) {
      await app.evaluate(({ BrowserWindow }, width) => BrowserWindow.getAllWindows()[0].setSize(width, 800), width);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: path.join(data, `chat-${width}.png`) });
      if (width === 900) {
        await page.getByRole('button', { name: 'Close result panel', exact: true }).click();
        await page.locator('.conversation-context').getByText('synthetic-model', { exact: true }).waitFor();
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
        await page.locator('.hermes-review-note').first().scrollIntoViewIfNeeded();
        await page.screenshot({ path: path.join(data, 'reviews-900.png') });
        await page.getByRole('button', { name: 'Show computer', exact: true }).click();
      }
    }
    await composer.focus(); await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.matches(':focus-visible') && parseFloat(getComputedStyle(document.activeElement).outlineWidth) >= 2), true);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.equal(await page.evaluate(() => [...document.querySelectorAll('*')].some(element => {
      const style = getComputedStyle(element);
      return style.animationName !== 'none' || style.transitionDuration.split(',').some(value => parseFloat(value) > 0);
    })), false);
    // Leave while a real dispatch is pending; its delayed response cannot clear another chat's draft.
    await page.evaluate(() => {
      const original = window.fetch;
      window.fixtureOriginalFetch = original; window.fixtureSends = 0;
      window.fetch = async (...args) => {
        const sending = String(args[0]).endsWith('/hermes/send');
        if (sending) window.fixtureSends++;
        const response = await original(...args);
        if (sending) await new Promise(resolve => setTimeout(resolve, 1500));
        return response;
      };
    });
    await composer.fill('Synthetic navigation question'); await composer.press('Enter');
    await page.getByText('Synthetic streaming response', { exact: true }).waitFor();
    await select('F2 beta');
    await composer.fill('Beta survives late alpha response');
    await page.waitForFunction(() => !document.body.innerText.includes('Synthetic streaming response'));
    await page.waitForFunction(async id => (await (await fetch(`/api/conversations/${id}/draft`)).json()).draft === 'Beta survives late alpha response', ids[1]);
    assert.equal(await page.locator('.chat-bubble').count(), 0);
    assert.equal(await composer.inputValue(), 'Beta survives late alpha response');
    await page.evaluate(() => { window.fetch = window.fixtureOriginalFetch; });
    await select('F2 alpha');
    await page.getByText('Synthetic confirmed response', { exact: true }).first().waitFor();
    await page.waitForFunction(() => document.querySelectorAll('.hermes-review-note').length === 5);
    // Disconnect and inspect archived notes offline, then reconnect and deduplicate native replay.
    await page.evaluate(async () => { await fetch('/api/hermes/disconnect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ connectionId: 'local' }) }); });
    await page.getByText('Saved review notes are available. Notes emitted while disconnected have not been verified.', { exact: true }).waitFor();
    assert.equal(await page.locator('.hermes-review-note').count(), 5);
    await page.getByRole('button', { name: 'Connect Hermes', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('[aria-label="Send message"]').disabled);
    assert.equal(await page.locator('.hermes-review-note').count(), 5, 'Reconnect replay duplicated reviews');
    // A clean SSE EOF must invalidate replay confidence, even without a thrown error.
    await select('F2 beta');
    await page.evaluate(id => {
      const original = window.fetch; window.fixtureOriginalFetch = original;
      let ended = false;
      window.fetch = async (...args) => {
        const response = await original(...args);
        if (!ended && String(args[0]).includes('/hermes/events?threadId=' + id)) {
          ended = true;
          const reader = response.body.getReader();
          return new Response(new ReadableStream({ async start(controller) {
            const chunk = await reader.read(); if (!chunk.done) controller.enqueue(chunk.value);
            await new Promise(resolve => setTimeout(resolve, 800));
            await reader.cancel(); controller.close();
          } }), { headers: response.headers });
        }
        return response;
      };
    }, ids[0]);
    await select('F2 alpha');
    await page.getByText('Saved review notes are available. Notes emitted while disconnected have not been verified.', { exact: true }).waitFor();
    await page.evaluate(() => { window.fetch = window.fixtureOriginalFetch; });
    await page.getByRole('button', { name: 'Connect Hermes', exact: true }).click();
    await page.waitForFunction(() => !document.querySelector('[aria-label="Send message"]').disabled);
    // Intentional clearing survives navigation even before the debounce fires.
    await composer.fill(''); await select('F2 beta');
    await page.waitForFunction(async id => (await (await fetch(`/api/conversations/${id}/draft`)).json()).draft === '', ids[0]);
    await select('F2 alpha'); await composer.fill('Saved alpha draft');
    await page.waitForFunction(async id => (await (await fetch(`/api/conversations/${id}/draft`)).json()).draft === 'Saved alpha draft', ids[0]);
    // PageConversation must cancel a prepared prompt when its view or host changes.
    const document = await page.evaluate(async () => {
      const workspace = await (await fetch('/api/workspace')).json();
      const dot = workspace.dots[0], spaceId = dot.spaceIds[0];
      const response = await fetch(`/api/spaces/${spaceId}/pages`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'F2 saved-page fixture', content: '# Synthetic saved page' }) });
      if (!response.ok) throw Error('Synthetic page creation failed');
      const saved = await response.json();
      location.hash = `/spaces/${spaceId}/pages/${saved.id}`;
      return saved;
    });
    await page.getByRole('textbox', { name: 'Page title', exact: true }).waitFor();
    await page.getByRole('button', { name: 'Send to page assistant', exact: true }).click();
    await page.getByRole('button', { name: 'Close page chat', exact: true }).waitFor();
    const savedPath = `/api/spaces/${document.spaceId}/pages/${document.id}`;
    const holdSavedPage = async () => {
      await page.evaluate(savedPath => {
        const original = window.fetch;
        window.fixtureOriginalFetch = original; window.fixtureSends = 0; window.fixturePagePending = false; window.fixturePageReleased = false; window.fixtureHostPending = false;
        const hostGate = new Promise(resolve => { window.fixtureReleaseHost = resolve; });
        const gate = new Promise(resolve => { window.fixtureReleasePage = resolve; });
        window.fetch = async (...args) => {
          if (String(args[0]).endsWith('/hermes/send')) { window.fixtureSends++; window.fixtureSubmission = JSON.parse(args[1].body); }
          if (String(args[0]).endsWith('/hermes/thread-host') && args[1]?.method === 'PUT') { window.fixtureHostPending = true; await hostGate; }
          const response = await original(...args);
          if (String(args[0]) === savedPath && (!args[1]?.method || args[1].method === 'GET')) {
            window.fixturePagePending = true; await gate; window.fixturePageReleased = true;
          }
          return response;
        };
      }, savedPath);
    };
    const releaseSavedPage = async () => {
      await page.evaluate(() => window.fixtureReleasePage());
      await page.waitForFunction(() => window.fixturePageReleased);
      // Allow the saved-page promise continuation to run before examining delivery.
      await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 50)));
      assert.equal(await page.evaluate(() => window.fixtureSends), 0);
      await page.evaluate(() => { window.fetch = window.fixtureOriginalFetch; });
    };
    let pageComposer = page.getByRole('textbox', { name: 'Message Hermes', exact: true });
    await pageComposer.fill('Synthetic cancelled preparation');
    await page.waitForFunction(() => !document.querySelector('[aria-label="Send message"]').disabled);
    await holdSavedPage(); await pageComposer.press('Enter');
    await page.waitForFunction(() => window.fixturePagePending);
    await page.getByRole('button', { name: 'Close page chat', exact: true }).click();
    await releaseSavedPage();
    await page.getByRole('button', { name: 'Send to page assistant', exact: true }).click();
    await pageComposer.waitFor();
    const otherHost = await page.evaluate(async () => {
      const response = await fetch('/api/hermes/connections', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Other synthetic host', mode: 'ssh', host: 'fixture.invalid', user: 'fixture', autoConnect: false }) });
      if (!response.ok) throw Error('Other synthetic host setup failed');
      return (await response.json()).id;
    });
    await pageComposer.fill('Synthetic host-change preparation');
    await page.waitForFunction(() => !document.querySelector('[aria-label="Send message"]').disabled);
    await holdSavedPage(); await pageComposer.press('Enter');
    await page.waitForFunction(() => window.fixturePagePending);
    const picker = page.getByLabel('Hermes host', { exact: true });
    await page.waitForFunction(otherHost => [...document.querySelectorAll('select option')].some(option => option.value === otherHost), otherHost);
    await picker.selectOption(otherHost);
    await page.waitForFunction(() => window.fixtureHostPending);
    await releaseSavedPage();
    await page.evaluate(() => window.fixtureReleaseHost());
    await page.waitForFunction(async otherHost => {
      const select = document.querySelector('select[id^="host-"]');
      if (!select || select.disabled) return false;
      const threadId = select.id.slice(5);
      return (await (await fetch('/api/hermes/thread-host?threadId=' + threadId)).json()).connectionId === otherHost;
    }, otherHost);
    await picker.selectOption('local');
    // A successful explicit send uses the revision actually saved by the document owner.
    await page.getByRole('button', { name: 'Page actions', exact: true }).click();
    await page.getByRole('menuitem', { name: 'Markdown source', exact: true }).click();
    await page.getByRole('textbox', { name: 'Page Markdown', exact: true }).fill('# Synthetic revised page');
    await page.evaluate(() => {
      const original = window.fetch;
      window.fixtureOriginalFetch = original;
      window.fetch = (...args) => { if (String(args[0]).endsWith('/hermes/send')) window.fixtureSubmission = JSON.parse(args[1].body); return original(...args); };
    });
    await pageComposer.fill('Synthetic revision question');
    await page.waitForFunction(() => !document.querySelector('[aria-label="Send message"]').disabled);
    await pageComposer.press('Enter');
    await page.getByText('Synthetic confirmed response', { exact: true }).waitFor();
    const reference = await page.evaluate(() => window.fixtureSubmission.pageReference);
    const saved = await page.evaluate(async savedPath => (await (await fetch(savedPath)).json()), savedPath);
    assert.deepEqual(reference, { id: saved.id, spaceId: saved.spaceId, revision: saved.revision });
    assert.equal(saved.content, '# Synthetic revised page');
    await page.evaluate(() => { window.fetch = window.fixtureOriginalFetch; });
    await select('F2 alpha');
    console.log(JSON.stringify({ checkpoint: 'before restart', data, ids, drafts: await page.evaluate(async ids => Promise.all(ids.map(async id => (await (await fetch(`/api/conversations/${id}/draft`)).json()).draft)), ids) }));
    const origin = await page.evaluate(() => location.origin);
    await app.close(); app = undefined;
    page = await launch();
    await select('F2 alpha');
    composer = page.getByRole('textbox', { name: 'Message Hermes', exact: true });
    await page.waitForFunction(() => document.querySelector('[aria-label="Message Hermes"]')?.value === 'Saved alpha draft');
    await page.waitForFunction(() => document.querySelectorAll('.hermes-review-note').length === 5);
    assert.notEqual(await page.evaluate(() => location.origin), origin, 'Restart did not exercise a new origin');
    await select('F2 beta');
    await page.waitForFunction(() => document.querySelector('[aria-label="Message Hermes"]')?.value === 'Beta survives late alpha response');
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ pass: true, syntheticRuntime: true, nativeReviewNotes: true, backgroundReviews: true, reviewReplayDeduplication: true, reviewOfflineRestart: true, cleanStreamClosure: true, scrollPreserved: true, truthfulContext: true, streamingBeforeHttp: true, doubleSend: true, lateToolResult: true, draftDuringSend: true, chatIsolation: true, navigationDuringDispatch: true, pagePreparationCancelled: true, hostPreparationCancelled: true, savedRevision: true, restartNewOrigin: true, ime: true, keyboard: true, reducedMotion: true, widths: [1360, 900], dataDirectory: data }));
  } catch (error) {
    console.error('Synthetic data directory: ' + data);
    if (page) { console.error((await page.locator('body').innerText()).slice(-7000)); await page.screenshot({ path: path.join(data, 'failure.png') }); }
    throw error;
  } finally { if (app) await app.close(); fixture.kill(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
