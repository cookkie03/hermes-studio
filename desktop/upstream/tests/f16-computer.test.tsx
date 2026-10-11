import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
vi.mock('../src/client/api', () => ({
  api: vi.fn().mockResolvedValue({
    configured: true,
    state: 'running',
    holder: 'bot',
    tabs: [],
    captures: [],
    activity: [],
    connectionId: 'local',
    host: 'Synthetic Bot Host',
    profile: 'test',
    driverStatus: 'available',
    modes: ['som', 'vision', 'ax'],
    humanHasControl: false,
    botScreenStreamAvailable: true,
  }),
}));
import { ComputerPanel } from '../src/client/ComputerPanel';
import type { Dot } from '../src/shared/types';

describe('F16 native Hermes computer surface', () => {
  const dot: Dot = {
    id: 'synthetic-dot',
    name: 'Synthetic Computer Dot',
    instructions: 'Synthetic only.',
    spaceId: 'default-space',
    spaceIds: ['default-space'],
    researchAllowed: true,
    memoryAllowed: true,
    createdAt: Date.now(),
  };

  it('renders target/provenance and keeps takeover disabled until a stream is available', () => {
    const html = renderToStaticMarkup(<ComputerPanel dot={dot} />);
    expect(html).toContain('Native Hermes Computer Use');
    expect(html).toContain('Target unavailable');
    expect(html).toContain('Take control');
  });
});
