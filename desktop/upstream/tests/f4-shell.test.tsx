import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { WorkspaceDialog } from '../src/client/WorkspaceDialog';
import type { State, WorkspaceState } from '../src/shared/types';

const stateFixture: State = {
  settings: {
    name: 'Test Dot',
    paused: false,
    researchAllowed: true,
    memoryAllowed: true,
  },
  tasks: [],
  memories: [],
  mode: 'sample',
  configured: true,
};

const workspaceFixture: WorkspaceState = {
  setup: {
    intelligence: true,
    model: true,
    browser: true,
    voice: true,
    slack: '',
    missing: [],
  },
  spaces: [
    { id: 'space-1', name: 'Primary Space', description: 'Space for testing', createdAt: Date.now() },
  ],
  dots: [
    {
      id: 'dot-1',
      name: 'Specialist Alpha',
      spaceId: 'space-1',
      spaceIds: ['space-1'],
      instructions: 'Analyze evidence',
      researchAllowed: true,
      memoryAllowed: true,
      createdAt: Date.now(),
    },
  ],
  conversations: [],
  calls: [],
};

describe('F4 Shell & Studio Components', () => {
  it('renders D34 scoped Settings tabs for Hermes runtime and Hermes Studio', () => {
    const html = renderToStaticMarkup(
      <WorkspaceDialog
        dialog={{ type: 'settings' }}
        state={stateFixture}
        workspace={workspaceFixture}
        onClose={() => {}}
        mutate={async () => true}
      />,
    );

    expect(html).toContain('settings-scope-tabs');
    expect(html).toContain('Hermes runtime');
    expect(html).toContain('Hermes Studio');
    expect(html).toContain('tab-hermes-runtime');
    expect(html).toContain('tab-hermes-studio');
    expect(html).toContain('Runtime Scope &amp; Limitations');
  });
});
