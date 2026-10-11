import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CapabilitiesView } from '../src/client/CapabilitiesView';

describe('F11 CapabilitiesView', () => {
  it('renders a read-only, accessible native catalog shell', () => {
    const html = renderToStaticMarkup(<CapabilitiesView connectionId="synthetic-host" profile="synthetic-profile" />);

    expect(html).toContain('Capabilities');
    expect(html).toContain('Toolsets');
    expect(html).toContain('Tools');
    expect(html).toContain('Plugins');
    expect(html).toContain('Skills');
    expect(html).toContain('Read-only catalog');
    expect(html).toContain('synthetic-host');
    expect(html).toContain('synthetic-profile');
    expect(html).toContain('aria-label="Capability catalog categories"');
    expect(html).toContain('aria-label="Refresh Hermes capability catalog"');
  });
});
