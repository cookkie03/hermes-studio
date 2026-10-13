import { mkdtempSync, rmSync, writeFileSync, symlinkSync, mkdirSync, unlinkSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it, describe, beforeEach, afterEach } from 'vitest';
import { FileWorkspaceService } from '../src/server/file-service.js';
import {
  parseFileChip,
  formatFileChip,
  filterFileMentions,
  validatePathSecurity,
  computeSimpleDiff,
  type FileRoot,
  type FileItem,
} from '../src/shared/file-workspace.js';

describe('F5 Files & Artifacts Workspace', () => {
  let tempDir1: string;
  let tempDir2: string;
  let service: FileWorkspaceService;

  beforeEach(() => {
    tempDir1 = mkdtempSync(join(tmpdir(), 'f5-root1-'));
    tempDir2 = mkdtempSync(join(tmpdir(), 'f5-root2-'));

    service = new FileWorkspaceService([
      { id: 'root-1', host: 'local', name: 'Local-Brain', path: tempDir1 },
      { id: 'root-2', host: 'debian-mini-pc', name: 'Debian-Brain', path: tempDir2 },
    ]);
  });

  afterEach(() => {
    try { rmSync(tempDir1, { recursive: true, force: true }); } catch {}
    try { rmSync(tempDir2, { recursive: true, force: true }); } catch {}
  });

  it('handles namesakes across two distinct roots and hosts', () => {
    writeFileSync(join(tempDir1, 'README.md'), 'Content from local');
    writeFileSync(join(tempDir2, 'README.md'), 'Content from debian host');

    const file1 = service.readFile('root-1', 'README.md');
    const file2 = service.readFile('root-2', 'README.md');

    expect(file1.host).toBe('local');
    expect(file1.content).toBe('Content from local');

    expect(file2.host).toBe('debian-mini-pc');
    expect(file2.content).toBe('Content from debian host');
    expect(file1.revision).not.toBe(file2.revision);
  });

  it('lists and searches the authorized root without requiring a subdirectory', () => {
    writeFileSync(join(tempDir1, 'note.md'), 'Synthetic note');
    expect(service.listFiles('root-1').map((item) => item.name)).toEqual(['note.md']);
    expect(service.searchFiles('root-1', 'note').map((item) => item.path)).toEqual(['note.md']);
  });

  it('rejects new file creation through a parent symlink outside the root', () => {
    symlinkSync(tempDir2, join(tempDir1, 'external'));
    expect(() => service.writeFile({ rootId: 'root-1', relativePath: 'external/new.md', content: 'Synthetic content' })).toThrow(/outside authorized root/i);
    expect(service.listFiles('root-2', '.').map((item) => item.name)).not.toContain('new.md');
  });

  it('rejects path traversal attempts outside root boundary', () => {
    expect(() => service.readFile('root-1', '../secret.txt')).toThrow(/Access denied|Path traversal/i);
    expect(() => service.readFile('root-1', '../../etc/passwd')).toThrow(/Access denied|Path traversal/i);
    expect(() => service.writeFile({ rootId: 'root-1', relativePath: '../outside.txt', content: 'hack' })).toThrow(/Access denied/i);
  });

  it('detects and blocks symlinks resolving outside authorized root', () => {
    const outsideDir = mkdtempSync(join(tmpdir(), 'f5-outside-'));
    const outsideFile = join(outsideDir, 'external.txt');
    writeFileSync(outsideFile, 'Top secret outside root');

    const symlinkPath = join(tempDir1, 'symlink-outside.txt');
    try {
      symlinkSync(outsideFile, symlinkPath);
      expect(() => service.readFile('root-1', 'symlink-outside.txt')).toThrow(/Symlink resolves outside authorized root/i);
    } finally {
      try { rmSync(outsideDir, { recursive: true, force: true }); } catch {}
    }
  });

  it('detects external disk conflicts on write and prevents blind overwrites', () => {
    const filePath = join(tempDir1, 'notes.md');
    writeFileSync(filePath, 'Version 1 on disk');

    const initial = service.readFile('root-1', 'notes.md');
    expect(initial.revision).toBeDefined();

    // Simulate an external process (e.g. Obsidian or specialist) modifying the file on disk
    writeFileSync(filePath, 'Version 2 modified externally by Obsidian');

    // Attempt saving local draft with old expectedRevision
    const writeResult = service.writeFile({
      rootId: 'root-1',
      relativePath: 'notes.md',
      content: 'Version 1 user draft edit',
      expectedRevision: initial.revision,
      toolName: 'user_editor',
    });

    expect(writeResult.receipt.outcome).toBe('conflict');
    expect(writeResult.receipt.error).toContain('External conflict');

    // Verify disk content was preserved and NOT overwritten
    const currentOnDisk = service.readFile('root-1', 'notes.md');
    expect(currentOnDisk.content).toBe('Version 2 modified externally by Obsidian');
  });

  it('handles binary files and large payloads gracefully', () => {
    // Write binary buffer containing null byte
    const binPath = join(tempDir1, 'sample.bin');
    const binData = Buffer.from([0x00, 0x01, 0x02, 0xff]);
    writeFileSync(binPath, binData);

    const binRead = service.readFile('root-1', 'sample.bin');
    expect(binRead.isBinary).toBe(true);
    expect(binRead.content).toContain('Binary file preview unavailable');

    // Write file larger than 2MB limit
    const largePath = join(tempDir1, 'large.txt');
    const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024, 'a');
    writeFileSync(largePath, largeBuffer);

    const largeRead = service.readFile('root-1', 'large.txt');
    expect(largeRead.largeFile).toBe(true);
    expect(largeRead.size).toBeGreaterThan(2 * 1024 * 1024);
  });

  it('parses, formats, and filters progressive @ file references and chips', () => {
    const parsed = parseFileChip('@debian-mini-pc/Debian-Brain/notes/summary.md:15-30');
    expect(parsed).toEqual({
      host: 'debian-mini-pc',
      rootId: 'Debian-Brain',
      rootName: 'Debian-Brain',
      path: 'notes/summary.md',
      lineStart: 15,
      lineEnd: 30,
    });

    const formatted = formatFileChip(parsed!);
    expect(formatted).toBe('@debian-mini-pc/Debian-Brain/notes/summary.md:15-30');

    const roots: FileRoot[] = [
      { id: 'root-1', host: 'local', name: 'Local-Brain', path: tempDir1 },
    ];
    const items: FileItem[] = [
      { rootId: 'root-1', host: 'local', path: 'docs/architecture.md', fullPath: '/path', name: 'architecture.md', kind: 'file', size: 100, revision: 'r1', updatedAt: Date.now() },
      { rootId: 'root-1', host: 'local', path: 'docs/setup.md', fullPath: '/path2', name: 'setup.md', kind: 'file', size: 200, revision: 'r2', updatedAt: Date.now() },
    ];

    const filter1 = filterFileMentions('@arch', roots, items);
    expect(filter1.length).toBe(1);
    expect(filter1[0].path).toBe('docs/architecture.md');

    const filter2 = filterFileMentions('@docs', roots, items);
    expect(filter2.length).toBe(2);
  });

  it('computes simple line diffs for D34 visible timeline receipts', () => {
    const oldText = 'line 1\nline 2\nline 3';
    const newText = 'line 1\nline 2 modified\nline 3\nline 4';

    const diff = computeSimpleDiff(oldText, newText);
    expect(diff.addedLines).toBeGreaterThan(0);
    expect(diff.removedLines).toBeGreaterThan(0);
    expect(diff.diffSummary).toContain('- line 2');
    expect(diff.diffSummary).toContain('+ line 2 modified');
    expect(diff.diffSummary).toContain('+ line 4');
  });

  it('enforces read-only root constraints', () => {
    service.registerRoot({
      id: 'readonly-root',
      host: 'local',
      name: 'Read-Only-Vault',
      path: tempDir2,
      isReadOnly: true,
    });

    expect(() =>
      service.writeFile({
        rootId: 'readonly-root',
        relativePath: 'test.txt',
        content: 'data',
      })
    ).toThrow(/read-only/i);
  });
});


it('preserves a stale draft when the original file was deleted externally', () => {
  const root=mkdtempSync(join(tmpdir(),'f5-deleted-'));
  try {
    const service=new FileWorkspaceService([{id:'deleted',host:'local',name:'QA',path:root}]);
    const path=join(root,'draft.md');writeFileSync(path,'Original');const original=service.readFile('deleted','draft.md');unlinkSync(path);
    const result=service.writeFile({rootId:'deleted',relativePath:'draft.md',content:'Stale draft',expectedRevision:original.revision});
    expect(result.receipt.outcome).toBe('conflict');expect(existsSync(path)).toBe(false);
  } finally {rmSync(root,{recursive:true,force:true});}
});
