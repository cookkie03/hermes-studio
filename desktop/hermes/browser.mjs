import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

export function sanitizeUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new Error('A valid URL string is required.');
  }
  const trimmed = rawUrl.trim();
  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error('Invalid URL format.');
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only http: and https: protocols are permitted.');
  }
  parsed.username = '';
  parsed.password = '';
  return parsed.toString();
}

function titleFromUrl(urlStr) {
  try {
    const u = new URL(urlStr);
    return u.hostname + (u.pathname !== '/' ? u.pathname : '');
  } catch {
    return urlStr;
  }
}

export class HermesBrowserService {
  constructor({ dataDir } = {}) {
    this.dataDir = dataDir;
    this.filePath = dataDir ? join(dataDir, 'browser-workspace.json') : null;
    this.sessions = new Map();
    this.writeQueue = Promise.resolve();
  }

  async initialize() {
    if (!this.filePath) return;
    try {
      const text = await readFile(this.filePath, 'utf8');
      const data = JSON.parse(text);
      if (data && typeof data === 'object') {
        for (const [dotId, state] of Object.entries(data)) {
          this.sessions.set(dotId, state);
        }
      }
    } catch {
      // File missing or corrupt, initialize clean
    }
  }

  async persist() {
    if (!this.filePath) return;
    this.writeQueue = this.writeQueue.then(async () => {
      const obj = {};
      for (const [dotId, state] of this.sessions.entries()) {
        obj[dotId] = state;
      }
      await mkdir(dirname(this.filePath), { recursive: true });
      await writeFile(this.filePath, JSON.stringify(obj, null, 2), 'utf8');
    }).catch(() => {});
    return this.writeQueue;
  }

  getOrCreateSession(dotId) {
    if (!dotId) throw new Error('dotId is required.');
    let session = this.sessions.get(dotId);
    if (!session) {
      const defaultTab = {
        id: 'tab-default',
        url: 'https://hermes.local/start',
        title: 'Hermes Start Page',
        content: '<h1>Welcome to Hermes Browser</h1><p>Persistent profile active.</p>',
        createdAt: Date.now(),
      };
      session = {
        dotId,
        holder: 'bot', // 'bot' | 'human'
        requested: false,
        transitioning: false,
        resumeSnapshotRequired: false,
        activeTabId: defaultTab.id,
        tabs: [defaultTab],
        history: [
          {
            id: randomUUID(),
            url: defaultTab.url,
            title: defaultTab.title,
            visitedAt: Date.now(),
          },
        ],
        audit: [
          {
            id: randomUUID(),
            action: 'init_session',
            actor: 'owner',
            outcome: 'succeeded',
            createdAt: Date.now(),
            details: 'Browser profile initialized.',
          },
        ],
        cookiesCount: 3,
        localStorageCount: 5,
        lastNavigatedAt: Date.now(),
      };
      this.sessions.set(dotId, session);
      void this.persist();
    }
    return session;
  }

  getStatus(dotId) {
    const session = this.getOrCreateSession(dotId);
    const activeTab = session.tabs.find(t => t.id === session.activeTabId) || session.tabs[0];

    return {
      configured: true,
      state: 'running',
      holder: session.holder,
      requested: session.requested,
      transitioning: session.transitioning,
      resumeSnapshotRequired: session.resumeSnapshotRequired,
      activeTabId: session.activeTabId,
      activeUrl: activeTab ? activeTab.url : 'https://hermes.local/start',
      activeTitle: activeTab ? activeTab.title : 'Hermes Start Page',
      activeContent: activeTab ? activeTab.content : '',
      tabs: session.tabs,
      history: session.history,
      audit: session.audit,
      cookiesCount: session.cookiesCount,
      localStorageCount: session.localStorageCount,
      lastNavigatedAt: session.lastNavigatedAt,
      permissions: {
        enabled: true,
        browser: true,
        files: true,
        shell: false,
      },
      control: {
        holder: session.holder,
        requested: session.requested,
        transitioning: session.transitioning,
        resumeSnapshotRequired: session.resumeSnapshotRequired,
      },
    };
  }

  async takeControl(dotId) {
    const session = this.getOrCreateSession(dotId);
    session.holder = 'human';
    session.requested = false;
    session.transitioning = false;
    session.audit.unshift({
      id: randomUUID(),
      action: 'takeover',
      actor: 'owner',
      outcome: 'succeeded',
      createdAt: Date.now(),
      details: 'Human user assumed browser control.',
    });
    await this.persist();
    return this.getStatus(dotId);
  }

  async releaseControl(dotId) {
    const session = this.getOrCreateSession(dotId);
    session.holder = 'bot';
    session.requested = false;
    session.transitioning = false;
    session.audit.unshift({
      id: randomUUID(),
      action: 'resume',
      actor: 'owner',
      outcome: 'succeeded',
      createdAt: Date.now(),
      details: 'Agent resumed browser control.',
    });
    await this.persist();
    return this.getStatus(dotId);
  }

  checkLease(session, actor) {
    if (actor === 'agent' && session.holder === 'human') {
      throw new Error('Control standard: Human user has taken over the browser. Agent browser commands are suspended until explicit Resume.');
    }
  }

  async navigate(dotId, rawUrl, actor = 'owner') {
    const session = this.getOrCreateSession(dotId);
    this.checkLease(session, actor);

    const validUrl = sanitizeUrl(rawUrl);
    const title = titleFromUrl(validUrl);

    let tab = session.tabs.find(t => t.id === session.activeTabId);
    if (!tab) {
      tab = {
        id: randomUUID(),
        url: validUrl,
        title,
        content: `<div>Navigated to ${validUrl}</div>`,
        createdAt: Date.now(),
      };
      session.tabs.push(tab);
      session.activeTabId = tab.id;
    } else {
      tab.url = validUrl;
      tab.title = title;
      tab.content = `<div>Content of ${validUrl}</div>`;
    }

    session.lastNavigatedAt = Date.now();

    // Add to history if not duplicate of latest
    const lastHistory = session.history[0];
    if (!lastHistory || lastHistory.url !== validUrl) {
      session.history.unshift({
        id: randomUUID(),
        url: validUrl,
        title,
        visitedAt: Date.now(),
      });
      if (session.history.length > 100) session.history.pop();
    }

    session.audit.unshift({
      id: randomUUID(),
      action: 'navigate',
      actor,
      outcome: 'succeeded',
      createdAt: Date.now(),
      details: `Navigated to ${validUrl}`,
    });
    if (session.audit.length > 100) session.audit.pop();

    await this.persist();
    return this.getStatus(dotId);
  }

  async createTab(dotId, rawUrl = 'https://hermes.local/start', actor = 'owner') {
    const session = this.getOrCreateSession(dotId);
    this.checkLease(session, actor);

    const validUrl = sanitizeUrl(rawUrl);
    const title = titleFromUrl(validUrl);
    const newTab = {
      id: `tab-${randomUUID().slice(0, 8)}`,
      url: validUrl,
      title,
      content: `<div>New tab loaded ${validUrl}</div>`,
      createdAt: Date.now(),
    };

    session.tabs.push(newTab);
    session.activeTabId = newTab.id;

    session.history.unshift({
      id: randomUUID(),
      url: validUrl,
      title,
      visitedAt: Date.now(),
    });

    session.audit.unshift({
      id: randomUUID(),
      action: 'create_tab',
      actor,
      outcome: 'succeeded',
      createdAt: Date.now(),
      details: `Opened tab: ${title}`,
    });

    await this.persist();
    return this.getStatus(dotId);
  }

  async switchTab(dotId, tabId) {
    const session = this.getOrCreateSession(dotId);
    const exists = session.tabs.some(t => t.id === tabId);
    if (!exists) throw new Error('Tab not found.');
    session.activeTabId = tabId;
    await this.persist();
    return this.getStatus(dotId);
  }

  async closeTab(dotId, tabId, actor = 'owner') {
    const session = this.getOrCreateSession(dotId);
    this.checkLease(session, actor);

    const index = session.tabs.findIndex(t => t.id === tabId);
    if (index === -1) throw new Error('Tab not found.');

    session.tabs.splice(index, 1);
    if (session.tabs.length === 0) {
      const newDefault = {
        id: `tab-${randomUUID().slice(0, 8)}`,
        url: 'https://hermes.local/start',
        title: 'Hermes Start Page',
        content: '<h1>Start Page</h1>',
        createdAt: Date.now(),
      };
      session.tabs.push(newDefault);
      session.activeTabId = newDefault.id;
    } else if (session.activeTabId === tabId) {
      session.activeTabId = session.tabs[Math.max(0, index - 1)].id;
    }

    session.audit.unshift({
      id: randomUUID(),
      action: 'close_tab',
      actor,
      outcome: 'succeeded',
      createdAt: Date.now(),
      details: `Closed tab ${tabId}`,
    });

    await this.persist();
    return this.getStatus(dotId);
  }

  async clearData(dotId) {
    const session = this.getOrCreateSession(dotId);
    session.history = [];
    session.cookiesCount = 0;
    session.localStorageCount = 0;

    const defaultTab = {
      id: 'tab-default',
      url: 'https://hermes.local/start',
      title: 'Hermes Start Page',
      content: '<h1>Hermes Start Page</h1><p>Profile reset.</p>',
      createdAt: Date.now(),
    };
    session.tabs = [defaultTab];
    session.activeTabId = defaultTab.id;

    session.audit.unshift({
      id: randomUUID(),
      action: 'clear_storage',
      actor: 'owner',
      outcome: 'succeeded',
      createdAt: Date.now(),
      details: 'Cleared cookies, storage and history.',
    });

    await this.persist();
    return this.getStatus(dotId);
  }

  async executeAction(dotId, action, input = {}, actor = 'agent') {
    const session = this.getOrCreateSession(dotId);
    this.checkLease(session, actor);

    const activeTab = session.tabs.find(t => t.id === session.activeTabId) || session.tabs[0];

    let resultText = 'Action succeeded.';
    if (action === 'navigate') {
      return this.navigate(dotId, input?.url, actor);
    } else if (action === 'click') {
      resultText = `Clicked element ${input?.ref ?? '#element'} on ${activeTab.url}`;
    } else if (action === 'type') {
      resultText = `Typed text into ${input?.ref ?? 'input field'} on ${activeTab.url}`;
    } else if (action === 'scroll') {
      resultText = `Scrolled page on ${activeTab.url}`;
    } else if (action === 'snapshot' || action === 'read') {
      resultText = `Captured DOM snapshot of ${activeTab.url}`;
    }

    session.audit.unshift({
      id: randomUUID(),
      action: action,
      actor,
      outcome: 'succeeded',
      createdAt: Date.now(),
      details: resultText,
    });
    if (session.audit.length > 100) session.audit.pop();

    await this.persist();
    return {
      status: this.getStatus(dotId),
      result: {
        action,
        url: activeTab.url,
        title: activeTab.title,
        output: resultText,
      },
    };
  }
}
