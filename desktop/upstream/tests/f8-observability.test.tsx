import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { HermesObservabilityView } from '../src/client/HermesObservabilityView';

describe('F8 Hermes Observability GUI Components', () => {
  it('renders loading state initially', () => {
    const html = renderToStaticMarkup(
      <HermesObservabilityView connectionId="local" profile="default" />
    );

    expect(html).toContain('role="region"');
    expect(html).toContain('Inspecting native Hermes capabilities and memory status...');
  });
});
