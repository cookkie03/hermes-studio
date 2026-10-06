import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { HermesBrowserService, sanitizeUrl } from './browser.mjs';

describe('HermesBrowserService Backend Integration (F12)', () => {
  let tempDir;
  let service;

  beforeEach(async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'f12-browser-test-'));
    service = new HermesBrowserService({ dataDir: tempDir });
    await service.initialize();
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  test('sanitizeUrl validates and cleans URLs correctly', () => {
    assert.equal(sanitizeUrl('https://example.com/page'), 'https://example.com/page');
    assert.equal(sanitizeUrl('http://user:pass@example.com/login'), 'http://example.com/login');
    assert.throws(() => sanitizeUrl('javascript:alert(1)'), /Only http: and https: protocols/);
    assert.throws(() => sanitizeUrl('file:///etc/passwd'), /Only http: and https: protocols/);
    assert.throws(() => sanitizeUrl('not-a-url'), /Invalid URL format/);
  });

  test('initializes default session state and persists to disk', async () => {
    const status = service.getStatus('dot-scout');
    assert.equal(status.holder, 'bot');
    assert.equal(status.activeUrl, 'https://hermes.local/start');
    assert.equal(status.tabs.length, 1);
    assert.equal(status.history.length, 1);

    // Create a second instance pointing to the same dataDir to test persistence
    const service2 = new HermesBrowserService({ dataDir: tempDir });
    await service2.initialize();
    const status2 = service2.getStatus('dot-scout');
    assert.equal(status2.activeUrl, 'https://hermes.local/start');
  });

  test('handles tab navigation, switching, creation and closing', async () => {
    await service.navigate('dot-scout', 'https://news.ycombinator.com');
    let status = service.getStatus('dot-scout');
    assert.equal(status.activeUrl, 'https://news.ycombinator.com/');
    assert.equal(status.history[0].url, 'https://news.ycombinator.com/');

    // Create new tab
    await service.createTab('dot-scout', 'https://github.com');
    status = service.getStatus('dot-scout');
    assert.equal(status.tabs.length, 2);
    assert.equal(status.activeUrl, 'https://github.com/');

    // Switch tab back to first tab
    const firstTabId = status.tabs[0].id;
    await service.switchTab('dot-scout', firstTabId);
    status = service.getStatus('dot-scout');
    assert.equal(status.activeTabId, firstTabId);
    assert.equal(status.activeUrl, 'https://news.ycombinator.com/');

    // Close active tab
    await service.closeTab('dot-scout', firstTabId);
    status = service.getStatus('dot-scout');
    assert.equal(status.tabs.length, 1);
    assert.equal(status.activeUrl, 'https://github.com/');
  });

  test('enforces takeover and release control lease transitions', async () => {
    let status = service.getStatus('dot-scout');
    assert.equal(status.holder, 'bot');

    // Human takes over control
    status = await service.takeControl('dot-scout');
    assert.equal(status.holder, 'human');
    assert.equal(status.audit[0].action, 'takeover');

    // Agent attempt to navigate during takeover fails with lease error
    await assert.rejects(
      () => service.navigate('dot-scout', 'https://agent-attempt.com', 'agent'),
      /Control standard: Human user has taken over the browser/
    );

    // Agent attempt to run action during takeover fails
    await assert.rejects(
      () => service.executeAction('dot-scout', 'click', { ref: '#button' }, 'agent'),
      /Control standard: Human user has taken over the browser/
    );

    // Human navigation during takeover succeeds
    await service.navigate('dot-scout', 'https://user-manual.com', 'owner');
    status = service.getStatus('dot-scout');
    assert.equal(status.activeUrl, 'https://user-manual.com/');

    // Human releases control back to agent
    status = await service.releaseControl('dot-scout');
    assert.equal(status.holder, 'bot');
    assert.equal(status.audit[0].action, 'resume');

    // Agent navigation after release succeeds
    await service.navigate('dot-scout', 'https://agent-success.com', 'agent');
    status = service.getStatus('dot-scout');
    assert.equal(status.activeUrl, 'https://agent-success.com/');
  });

  test('clears browser storage, history and tabs', async () => {
    await service.navigate('dot-scout', 'https://example.com');
    await service.clearData('dot-scout');
    const status = service.getStatus('dot-scout');
    assert.equal(status.history.length, 0);
    assert.equal(status.cookiesCount, 0);
    assert.equal(status.localStorageCount, 0);
    assert.equal(status.activeUrl, 'https://hermes.local/start');
  });
});
