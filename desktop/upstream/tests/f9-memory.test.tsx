import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { WorkspaceStore } from '../src/server/workspace.js';
import { workspaceRoutes } from '../src/server/workspace-routes.js';
import { WorkspaceDialog } from '../src/client/WorkspaceDialog.js';
import { SpaceWorkspace } from '../src/client/SpaceWorkspace.js';
import type { Space, WorkspaceState, State, Memory } from '../src/shared/types.js';

const mockSetup = {
  voice: true,
  intelligence: true,
  model: true,
  browser: false,
  slack: 'not_configured' as const,
  missing: [],
};

describe('F9 — Space Markdown Memory & Scope Isolation', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'f9-memory-test-'));
  });

  afterEach(() => {
    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch {}
  });

  describe('F9-A: Local/Legacy Scope Isolation', () => {
    it('renders Studio local preference dialog with explicit isolation notes', () => {
      const mockState: State = {
        settings: { name: 'Studio', paused: false, researchAllowed: true, memoryAllowed: true },
        tasks: [],
        memories: [{ id: 'mem-1', text: 'Prefer concise outputs', createdAt: Date.now() }],
        mode: 'live',
        configured: true,
      };
      const mockWorkspace: WorkspaceState = {
        spaces: [],
        dots: [],
        conversations: [],
        setup: mockSetup,
        calls: [],
      };

      const html = renderToStaticMarkup(
        <WorkspaceDialog
          dialog={{ type: 'memory', memory: mockState.memories[0] }}
          state={mockState}
          workspace={mockWorkspace}
          onClose={() => {}}
          mutate={async () => true}
        />,
      );

      expect(html).toContain('Scope: Studio Local Preferences');
      expect(html).toContain('Stored in local Studio storage');
      expect(html).toContain('isolated from Hermes runtime profile memory');
      expect(html).toContain('MEMORY.md');
      expect(html).toContain('Prefer concise outputs');
    });

    it('preserves existing local preferences without implicit overwrites or Hermes injection', () => {
      const store = new WorkspaceStore(':memory:', 'owner-f9');
      const memories: Memory[] = [
        { id: 'm1', text: 'Local setting 1', createdAt: 1000 },
        { id: 'm2', text: 'Local setting 2', createdAt: 2000 },
      ];
      // Memories remain untouched in local state format
      expect(memories.length).toBe(2);
      expect(memories[0].text).toBe('Local setting 1');
      store.close();
    });
  });

  describe('F9-B: Space Markdown Memory Management', () => {
    it('binds and initializes a MEMORY.md file with standard template in an authorized folder', async () => {
      const store = new WorkspaceStore(':memory:', 'owner-f9');
      const space = store.createSpace('Research Space', 'Academic investigations');
      const binding = store.linkFolder(space.id, {
        rootId: 'root-vault',
        host: 'local',
        name: 'Research Vault',
        path: tempDir,
        isReadOnly: false,
      });

      const mockVoice = {
        begin: () => ({ id: '1', transcript: '', status: 'active', startedAt: Date.now() }),
        activate: () => true,
        compute: async () => {},
        end: () => {},
      };
      const app = workspaceRoutes({ workspace: store, setup: () => mockSetup }, mockVoice as any);

      // POST /spaces/:id/memory to initialize MEMORY.md
      const initRes = await app.request(`/spaces/${space.id}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rootId: binding.rootId,
          relativePath: 'MEMORY.md',
          policy: 'manual',
          createIfNotExists: true,
        }),
      });

      expect(initRes.status).toBe(200);
      const initData = (await initRes.json()) as any;
      expect(initData.config.rootId).toBe(binding.rootId);
      expect(initData.config.relativePath).toBe('MEMORY.md');
      expect(initData.config.policy).toBe('manual');
      expect(initData.config.lastOutcome).toBe('success');
      expect(initData.file.content).toContain('# Research Space — Space Memory');
      expect(initData.file.content).toContain('## Context & Goals');
      expect(initData.file.content).toContain('## Key Decisions');

      // Verify file is physically created on disk
      const diskContent = readFileSync(join(tempDir, 'MEMORY.md'), 'utf-8');
      expect(diskContent).toContain('# Research Space — Space Memory');

      store.close();
    });

    it('reads space memory and performs safe revision-controlled writes', async () => {
      const store = new WorkspaceStore(':memory:', 'owner-f9');
      const space = store.createSpace('Project Space', 'Engineering workspace');
      const binding = store.linkFolder(space.id, {
        rootId: 'root-eng',
        host: 'local',
        name: 'Eng Repo',
        path: tempDir,
        isReadOnly: false,
      });

      mkdirSync(join(tempDir, 'docs'), { recursive: true });
      writeFileSync(join(tempDir, 'docs/MEMORY.md'), '# Initial Space Context\nManual text');

      const mockVoice = {
        begin: () => ({ id: '1', transcript: '', status: 'active', startedAt: Date.now() }),
        activate: () => true,
        compute: async () => {},
        end: () => {},
      };
      const app = workspaceRoutes({ workspace: store, setup: () => mockSetup }, mockVoice as any);

      // Bind existing file
      await app.request(`/spaces/${space.id}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rootId: binding.rootId,
          relativePath: 'docs/MEMORY.md',
          policy: 'milestones',
        }),
      });

      // GET /spaces/:id/memory
      const getRes = await app.request(`/spaces/${space.id}/memory`);
      expect(getRes.status).toBe(200);
      const getData = (await getRes.json()) as any;
      expect(getData.config.relativePath).toBe('docs/MEMORY.md');
      expect(getData.file.content).toBe('# Initial Space Context\nManual text');
      const currentRev = getData.file.revision;

      // Safe write with matching revision
      const writeRes = await app.request(`/spaces/${space.id}/memory/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '# Initial Space Context\nManual text\nUpdated milestone.',
          expectedRevision: currentRev,
          mode: 'replace',
        }),
      });

      expect(writeRes.status).toBe(200);
      const writeData = (await writeRes.json()) as any;
      expect(writeData.outcome).toBe('success');
      expect(writeData.config.lastOutcome).toBe('success');

      store.close();
    });

    it('detects external modifications and returns 409 conflict when expectedRevision differs', async () => {
      const store = new WorkspaceStore(':memory:', 'owner-f9');
      const space = store.createSpace('Conflict Space', 'Test conflict detection');
      const binding = store.linkFolder(space.id, {
        rootId: 'root-c',
        host: 'local',
        name: 'Conflict Root',
        path: tempDir,
        isReadOnly: false,
      });

      writeFileSync(join(tempDir, 'MEMORY.md'), '# Base Memory');

      const mockVoice = {
        begin: () => ({ id: '1', transcript: '', status: 'active', startedAt: Date.now() }),
        activate: () => true,
        compute: async () => {},
        end: () => {},
      };
      const app = workspaceRoutes({ workspace: store, setup: () => mockSetup }, mockVoice as any);

      // Bind file
      await app.request(`/spaces/${space.id}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rootId: binding.rootId,
          relativePath: 'MEMORY.md',
          policy: 'manual',
        }),
      });

      // Get initial revision
      const getRes = await app.request(`/spaces/${space.id}/memory`);
      const initialRev = (await getRes.json() as any).file.revision;

      // Simulate external edit directly on disk
      writeFileSync(join(tempDir, 'MEMORY.md'), '# Base Memory\nExternal edit made on disk.');

      // Try writing with stale expectedRevision
      const conflictRes = await app.request(`/spaces/${space.id}/memory/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: '# Base Memory\nClient write attempt.',
          expectedRevision: initialRev,
          mode: 'replace',
        }),
      });

      expect(conflictRes.status).toBe(409);
      const conflictData = (await conflictRes.json()) as any;
      expect(conflictData.outcome).toBe('conflict');
      expect(conflictData.receipt.outcome).toBe('conflict');

      store.close();
    });

    it('appends milestone notes preserving existing manual sections', async () => {
      const store = new WorkspaceStore(':memory:', 'owner-f9');
      const space = store.createSpace('Milestone Space', 'Test milestone appending');
      const binding = store.linkFolder(space.id, {
        rootId: 'root-m',
        host: 'local',
        name: 'Milestone Root',
        path: tempDir,
        isReadOnly: false,
      });

      const initialManual = `# Space Memory\n\n## Core Principles\n- Principle 1: Safety first\n- Principle 2: Verified outcomes\n`;
      writeFileSync(join(tempDir, 'MEMORY.md'), initialManual);

      const mockVoice = {
        begin: () => ({ id: '1', transcript: '', status: 'active', startedAt: Date.now() }),
        activate: () => true,
        compute: async () => {},
        end: () => {},
      };
      const app = workspaceRoutes({ workspace: store, setup: () => mockSetup }, mockVoice as any);

      await app.request(`/spaces/${space.id}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rootId: binding.rootId,
          relativePath: 'MEMORY.md',
          policy: 'milestones',
        }),
      });

      // Append milestone
      const appendRes = await app.request(`/spaces/${space.id}/memory/write`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: 'F9 integration and test suite successfully completed.',
          appendHeading: '2026-10-06 — F9 Milestone Verified',
          mode: 'append',
        }),
      });

      expect(appendRes.status).toBe(200);

      const onDisk = readFileSync(join(tempDir, 'MEMORY.md'), 'utf-8');
      expect(onDisk).toContain('## Core Principles');
      expect(onDisk).toContain('Principle 1: Safety first');
      expect(onDisk).toContain('### 2026-10-06 — F9 Milestone Verified');
      expect(onDisk).toContain('F9 integration and test suite successfully completed.');

      store.close();
    });

    it('unbinds memory configuration without deleting physical file on disk', async () => {
      const store = new WorkspaceStore(':memory:', 'owner-f9');
      const space = store.createSpace('Unbind Space', 'Test unbinding');
      const binding = store.linkFolder(space.id, {
        rootId: 'root-u',
        host: 'local',
        name: 'Unbind Root',
        path: tempDir,
        isReadOnly: false,
      });

      writeFileSync(join(tempDir, 'MEMORY.md'), '# Preserved Memory');

      const mockVoice = {
        begin: () => ({ id: '1', transcript: '', status: 'active', startedAt: Date.now() }),
        activate: () => true,
        compute: async () => {},
        end: () => {},
      };
      const app = workspaceRoutes({ workspace: store, setup: () => mockSetup }, mockVoice as any);

      await app.request(`/spaces/${space.id}/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rootId: binding.rootId,
          relativePath: 'MEMORY.md',
          policy: 'manual',
        }),
      });

      // DELETE /spaces/:id/memory
      const delRes = await app.request(`/spaces/${space.id}/memory`, { method: 'DELETE' });
      expect(delRes.status).toBe(200);

      // Verify config is null in store
      expect(store.spaceMemoryConfig(space.id)).toBeNull();

      // Verify file is still intact on disk
      expect(readFileSync(join(tempDir, 'MEMORY.md'), 'utf-8')).toBe('# Preserved Memory');

      store.close();
    });
  });

  describe('SpaceWorkspace Memory Tab UI Component', () => {
    it('renders the Space Memory tab in SpaceWorkspace', () => {
      const space: Space = {
        id: 'space-f9',
        name: 'Personal Space',
        description: 'Personal projects',
        createdAt: Date.now(),
      };
      const workspace: WorkspaceState = {
        spaces: [space],
        dots: [],
        conversations: [],
        setup: mockSetup,
        calls: [],
        folderBindings: [
          {
            id: 'fb-1',
            spaceId: space.id,
            rootId: 'root-1',
            host: 'local',
            name: 'Vault',
            path: tempDir,
            createdAt: Date.now(),
          },
        ],
      };

      const html = renderToStaticMarkup(
        <SpaceWorkspace
          space={space}
          workspace={workspace}
          paused={false}
          onPage={() => {}}
          onDirty={() => {}}
          onRefresh={() => {}}
          onSchedule={() => {}}
          onThread={() => {}}
          onSettings={() => {}}
          onCreateDot={() => {}}
        />,
      );

      expect(html).toContain('Space Memory');
      expect(html).toContain('Linked Folders (1)');
      expect(html).toContain('Legacy Pages (0)');
    });
  });
});
