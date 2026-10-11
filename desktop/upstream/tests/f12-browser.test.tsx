import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/client/api', () => ({
  api: vi.fn().mockResolvedValue({
    configured: true,
    state: 'running',
    holder: 'bot',
    activeTabId: 'tab-1',
    activeUrl: 'https://news.ycombinator.com',
    activeTitle: 'Hacker News',
    activeContent: '<h1>Hacker News</h1>',
    tabs: [
      {
        id: 'tab-1',
        url: 'https://news.ycombinator.com',
        title: 'Hacker News',
        content: '<h1>Hacker News</h1>',
        createdAt: 1774350000000,
      },
    ],
    history: [
      {
        id: 'hist-1',
        url: 'https://news.ycombinator.com',
        title: 'Hacker News',
        visitedAt: 1774350000000,
      },
    ],
    audit: [
      {
        id: 'aud-1',
        action: 'navigate',
        actor: 'agent',
        outcome: 'succeeded',
        createdAt: 1774350000000,
        details: 'Navigated to https://news.ycombinator.com',
      },
    ],
    cookiesCount: 3,
    localStorageCount: 5,
  }),
}));
import { ComputerPanel } from '../src/client/ComputerPanel';
import type { Dot } from '../src/shared/types';

describe('F12 Hermes Integrated Browser Surface', () => {
  const syntheticDot: Dot = {
    id: 'scout-dot',
    name: 'Scout Specialist',
    instructions: 'Autonomous research and browser inspection.',
    spaceId: 'default-space',
    spaceIds: ['default-space'],
    researchAllowed: true,
    memoryAllowed: true,
    createdAt: Date.now(),
  };

  it('renders browser workspace with address bar, tabs, and accessibility attributes', () => {
    const html = renderToStaticMarkup(
      <ComputerPanel dot={syntheticDot} />
    );

    expect(html).toContain('role="tabpanel"');
    expect(html).toContain('aria-label="Browser Surface"');
    expect(html).toContain('role="tablist"');
    expect(html).toContain('aria-label="Browser Tabs"');
    expect(html).toContain('aria-label="Browser address URL"');
    expect(html).toContain('Enter URL (https://...)');
  });

  it('renders control lease banner with Agent Control and Take Over button', () => {
    const html = renderToStaticMarkup(
      <ComputerPanel dot={syntheticDot} />
    );

    expect(html).toContain('Agent Control');
    expect(html).toContain('Take Over');
    expect(html).toContain('aria-label="Take over browser control"');
    expect(html).toContain('Hermes agent controls the browser');
  });

  it('renders profile tag, storage metadata and audit activity footer', () => {
    const html = renderToStaticMarkup(
      <ComputerPanel dot={syntheticDot} />
    );

    expect(html).toContain('Profile: Scout Specialist');
    expect(html).toContain('cookies');
    expect(html).toContain('keys');
    expect(html).toContain('Browser Activity Log');
    expect(html).toContain('audit-stream');
  });

  it('provides navigation action buttons for history and reset', () => {
    const html = renderToStaticMarkup(
      <ComputerPanel dot={syntheticDot} />
    );

    expect(html).toContain('aria-label="Toggle browsing history"');
    expect(html).toContain('aria-label="Reset profile and storage"');
    expect(html).toContain('History');
    expect(html).toContain('Reset');
  });
});
