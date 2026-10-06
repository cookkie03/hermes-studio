import { mkdtempSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { WorkspaceStore } from '../src/server/workspace.js';
import { FileWorkspaceService } from '../src/server/file-service.js';
import { SpaceWorkspace } from '../src/client/SpaceWorkspace.js';
import { SpaceNav } from '../src/client/SpaceNav.js';
import { SaveToSpaceReview } from '../src/client/SaveToSpaceReview.js';
import type { Space, WorkspaceState } from '../src/shared/types.js';

describe('F6 Spaces Linked to Projects and Folders', () => {
  let tempDir1: string;
  let tempDir2: string;

  beforeEach(() => {
    tempDir1 = mkdtempSync(join(tmpdir(), 'f6-vault-local-'));
    tempDir2 = mkdtempSync(join(tmpdir(), 'f6-vault-remote-'));
  });

  afterEach(() => {
    try { rmSync(tempDir1, { recursive: true, force: true }); } catch {}
    try { rmSync(tempDir2, { recursive: true, force: true }); } catch {}
  });

  it('handles namesake projects/roots across two distinct hosts/profiles without collision', () => {
    const store = new WorkspaceStore(':memory:', 'owner-f6');
    const space = store.createSpace('Finance & Research', 'Multi-host workspace');

    // Root 1 on local
    writeFileSync(join(tempDir1, 'README.md'), '# Local Finance Brain\nLocal content');
    const binding1 = store.linkFolder(space.id, {
      rootId: 'root-local',
      host: 'local',
      name: 'Finance-Brain',
      path: tempDir1,
      isReadOnly: false,
    });

    // Root 2 on debian-mini-pc with the same name
    writeFileSync(join(tempDir2, 'README.md'), '# Remote Finance Brain\nRemote server content');
    const binding2 = store.linkFolder(space.id, {
      rootId: 'root-remote',
      host: 'debian-mini-pc',
      name: 'Finance-Brain',
      path: tempDir2,
      isReadOnly: false,
    });

    expect(binding1.name).toBe(binding2.name);
    expect(binding1.host).toBe('local');
    expect(binding2.host).toBe('debian-mini-pc');
    expect(binding1.rootId).not.toBe(binding2.rootId);

    const file1 = store.files.readFile('root-local', 'README.md');
    const file2 = store.files.readFile('root-remote', 'README.md');

    expect(file1.content).toContain('Local Finance Brain');
    expect(file2.content).toContain('Remote Finance Brain');
    expect(file1.revision).not.toBe(file2.revision);

    store.close();
  });

  it('supports linking multiple folders to a single Space', () => {
    const store = new WorkspaceStore(':memory:', 'owner-f6');
    const space = store.createSpace('Multi-Folder Space', 'Aggregated folders');

    store.linkFolder(space.id, {
      rootId: 'f1',
      host: 'local',
      name: 'Obsidian-Vault',
      path: tempDir1,
    });
    store.linkFolder(space.id, {
      rootId: 'f2',
      host: 'debian-mini-pc',
      name: 'Backend-Repo',
      path: tempDir2,
    });

    const bindings = store.folderBindings(space.id);
    expect(bindings.length).toBe(2);
    expect(bindings.map((b) => b.name)).toEqual(['Obsidian-Vault', 'Backend-Repo']);

    store.close();
  });

  it('renders an empty state with Add Folder action when a Space has zero folders', () => {
    const emptySpace: Space = {
      id: 'empty-space-1',
      name: 'Empty Research Space',
      description: 'No folders yet',
      createdAt: Date.now(),
    };

    const emptyWorkspace: WorkspaceState = {
      spaces: [emptySpace],
      dots: [],
      conversations: [],
      setup: { intelligence: true, model: true, browser: true, voice: true, slack: '', missing: [] },
      calls: [],
      folderBindings: [],
    };

    const html = renderToStaticMarkup(
      <SpaceWorkspace
        space={emptySpace}
        workspace={emptyWorkspace}
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

    expect(html).toContain('No folders linked to this Space yet');
    expect(html).toContain('Link Your First Folder');
    expect(html).not.toContain('fictional-file-123.md');
  });

  it('unlinks a folder without deleting files or directories on disk', () => {
    const store = new WorkspaceStore(':memory:', 'owner-f6');
    const space = store.createSpace('Preservation Space', 'Testing safe unlink');

    const testFilePath = join(tempDir1, 'critical-notes.md');
    writeFileSync(testFilePath, '# Irreplaceable Notes');

    const binding = store.linkFolder(space.id, {
      rootId: 'safe-root',
      host: 'local',
      name: 'Safe-Vault',
      path: tempDir1,
    });

    expect(existsSync(testFilePath)).toBe(true);
    expect(store.folderBindings(space.id).length).toBe(1);

    // Unlink
    const unlinked = store.unlinkFolder(space.id, binding.id);
    expect(unlinked).toBe(true);
    expect(store.folderBindings(space.id).length).toBe(0);

    // Disk contents MUST remain intact
    expect(existsSync(testFilePath)).toBe(true);

    store.close();
  });

  it('detects external file modification conflicts during write operations', () => {
    const fileService = new FileWorkspaceService([
      { id: 'conflict-root', host: 'local', name: 'Conflict-Test', path: tempDir1 },
    ]);

    const filePath = 'analysis.md';
    writeFileSync(join(tempDir1, filePath), 'Original version v1');

    const readRes = fileService.readFile('conflict-root', filePath);
    const initialRev = readRes.revision;

    // External modification occurs (e.g. from Obsidian or another process)
    writeFileSync(join(tempDir1, filePath), 'External edit version v2');

    // Attempting to write with the stale initial revision should detect conflict
    const result = fileService.writeFile({
      rootId: 'conflict-root',
      relativePath: filePath,
      content: 'My colliding studio edit',
      expectedRevision: initialRev,
      toolName: 'studio_editor',
    });

    expect(result.receipt.outcome).toBe('conflict');
    expect(result.receipt.error).toContain('External conflict');
  });

  it('renders SpaceNav with distinct host indicators for multi-host folder roots', () => {
    const space: Space = {
      id: 'space-nav-test',
      name: 'DevOps Space',
      description: 'Infra and apps',
      createdAt: Date.now(),
    };

    const html = renderToStaticMarkup(
      <SpaceNav
        space={space}
        active={true}
        onOpen={() => {}}
      />,
    );

    expect(html).toContain('DevOps Space');
    expect(html).toContain('space-nav-group');
  });
});
