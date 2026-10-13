import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, statSync, writeFileSync, renameSync, unlinkSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import type {
  FileDiffReceipt,
  FileItem,
  FileReadResult,
  FileRoot,
} from '../shared/file-workspace.js';
import { validatePathSecurity } from '../shared/file-workspace.js';

export interface FileWriteOptions {
  rootId: string;
  relativePath: string;
  content: string;
  expectedRevision?: string;
  toolName?: string;
}

export class FileWorkspaceService {
  private roots: Map<string, FileRoot> = new Map();
  private receipts: FileDiffReceipt[] = [];

  constructor(initialRoots: FileRoot[] = []) {
    for (const root of initialRoots) {
      this.registerRoot(root);
    }
  }

  public registerRoot(root: FileRoot): void {
    const normalizedPath = resolve(root.path);
    if (!existsSync(normalizedPath)) {
      mkdirSync(normalizedPath, { recursive: true });
    }
    const realRootPath = realpathSync(normalizedPath);
    this.roots.set(root.id, {
      ...root,
      path: realRootPath,
    });
  }

  public getRoots(): FileRoot[] {
    return Array.from(this.roots.values());
  }

  public getRoot(rootId: string): FileRoot | undefined {
    return this.roots.get(rootId);
  }

  public listFiles(rootId: string, subPath: string = ''): FileItem[] {
    const root = this.roots.get(rootId);
    if (!root) throw new Error(`Root '${rootId}' not found.`);

    const targetDir = resolve(join(root.path, subPath));
    // An empty subpath is the authorized root, not an invalid file name.
    const sec = validatePathSecurity(root.path, subPath || '.');
    if (!sec.valid) throw new Error(sec.error);

    if (!existsSync(targetDir)) return [];

    const realTargetDir = realpathSync(targetDir);
    const secReal = validatePathSecurity(root.path, subPath || '.', realTargetDir);
    if (!secReal.valid) throw new Error(secReal.error);

    const items: FileItem[] = [];
    const entries = readdirSync(realTargetDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

      const fullPath = join(realTargetDir, entry.name);
      const relativePath = relative(root.path, fullPath).replace(/\\/g, '/');

      try {
        const lstat = lstatSync(fullPath);
        const isSymlink = lstat.isSymbolicLink();
        let realTarget: string | undefined;

        if (isSymlink) {
          try {
            realTarget = realpathSync(fullPath);
            const symSec = validatePathSecurity(root.path, relativePath, realTarget);
            if (!symSec.valid) {
              // Mark symlink escaping root
              items.push({
                rootId: root.id,
                host: root.host,
                path: relativePath,
                fullPath,
                name: entry.name,
                kind: 'file',
                size: 0,
                isSymlink: true,
                symlinkTarget: realTarget,
                revision: 'forbidden',
                updatedAt: Date.now(),
              });
              continue;
            }
          } catch {
            // Broken symlink
            continue;
          }
        }

        const stat = statSync(fullPath);
        const kind = stat.isDirectory() ? 'directory' : 'file';
        const revision = kind === 'file' ? this.computeFileRevision(fullPath, stat) : 'dir';

        items.push({
          rootId: root.id,
          host: root.host,
          path: relativePath,
          fullPath,
          name: entry.name,
          kind,
          size: stat.size,
          isSymlink,
          symlinkTarget: realTarget,
          revision,
          updatedAt: stat.mtimeMs,
        });
      } catch {
        // Skip unreadable files
      }
    }

    return items;
  }

  public readFile(rootId: string, relativePath: string): FileReadResult {
    const root = this.roots.get(rootId);
    if (!root) throw new Error(`Root '${rootId}' not found.`);

    const sec = validatePathSecurity(root.path, relativePath);
    if (!sec.valid) throw new Error(sec.error);

    const fullPath = resolve(join(root.path, relativePath));
    if (!existsSync(fullPath)) throw new Error(`File '${relativePath}' not found.`);

    const realPath = realpathSync(fullPath);
    const symSec = validatePathSecurity(root.path, relativePath, realPath);
    if (!symSec.valid) throw new Error(symSec.error);

    const stat = statSync(realPath);
    if (stat.isDirectory()) throw new Error(`Path '${relativePath}' is a directory.`);

    const MAX_SIZE = 2 * 1024 * 1024; // 2 MiB limit for editing
    const largeFile = stat.size > MAX_SIZE;

    const buffer = readFileSync(realPath);
    const isBinary = this.checkIsBinary(buffer);
    const revision = this.computeBufferRevision(buffer);

    const content = isBinary
      ? `[Binary file preview unavailable — ${stat.size} bytes]`
      : buffer.toString('utf-8');

    return {
      rootId: root.id,
      host: root.host,
      path: relativePath,
      content,
      revision,
      size: stat.size,
      isBinary,
      largeFile,
      updatedAt: stat.mtimeMs,
    };
  }

  public writeFile(options: FileWriteOptions): { receipt: FileDiffReceipt; newRevision: string } {
    const { rootId, relativePath, content, expectedRevision, toolName = 'user_editor' } = options;
    const root = this.roots.get(rootId);
    if (!root) throw new Error(`Root '${rootId}' not found.`);

    if (root.isReadOnly) {
      throw new Error(`Root '${root.name}' is read-only.`);
    }

    const sec = validatePathSecurity(root.path, relativePath);
    if (!sec.valid) throw new Error(sec.error);

    const fullPath = resolve(join(root.path, relativePath));

    let oldContent = '';
    let currentRevision = '';
    let fileExists = existsSync(fullPath);

    if (fileExists) {
      const realPath = realpathSync(fullPath);
      const symSec = validatePathSecurity(root.path, relativePath, realPath);
      if (!symSec.valid) throw new Error(symSec.error);

      const existingRead = this.readFile(rootId, relativePath);
      oldContent = existingRead.content;
      currentRevision = existingRead.revision;
    }

      // Check external conflict: if expectedRevision was supplied and differs from disk
      if (expectedRevision && expectedRevision !== currentRevision) {
        const receipt: FileDiffReceipt = {
          id: `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          host: root.host,
          rootId: root.id,
          path: relativePath,
          revision: currentRevision,
          toolName,
          outcome: 'conflict',
          oldContent,
          newContent: content,
          timestamp: Date.now(),
          error: `External conflict: file modified on disk (expected ${expectedRevision}, found ${currentRevision}).`,
        };
        this.receipts.push(receipt);
        return { receipt, newRevision: currentRevision };
      }

    // Validate the nearest existing parent even when the destination is new.
    // Continue on its canonical path so an outside symlink cannot become a writer.
    let ancestor = dirname(fullPath);
    const missingParents: string[] = [];
    while (!existsSync(ancestor)) {
      missingParents.unshift(basename(ancestor));
      const parent = dirname(ancestor);
      if (parent === ancestor) throw new Error('Authorized parent directory not found.');
      ancestor = parent;
    }
    const realAncestor = realpathSync(ancestor);
    const ancestorSecurity = validatePathSecurity(root.path, relativePath, realAncestor);
    if (!ancestorSecurity.valid) throw new Error(ancestorSecurity.error);
    const dir = resolve(realAncestor, ...missingParents);
    mkdirSync(dir, { recursive: true });
    const realDir = realpathSync(dir);
    const parentSecurity = validatePathSecurity(root.path, relativePath, realDir);
    if (!parentSecurity.valid) throw new Error(parentSecurity.error);
    const destination = fileExists ? realpathSync(fullPath) : join(realDir, basename(fullPath));
    const destinationSecurity = validatePathSecurity(root.path, relativePath, destination);
    if (!destinationSecurity.valid) throw new Error(destinationSecurity.error);
    const temporary = join(dirname(destination), `.hermes-write-${randomUUID()}`);
    try {
      writeFileSync(temporary, content, { encoding: 'utf-8', flag: 'wx', mode: fileExists ? statSync(destination).mode & 0o777 : 0o600 });
      renameSync(temporary, destination);
    } finally {
      if (existsSync(temporary)) unlinkSync(temporary);
    }
    const newBuffer = Buffer.from(content, 'utf-8');
    const newRevision = this.computeBufferRevision(newBuffer);

    const receipt: FileDiffReceipt = {
      id: `receipt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      host: root.host,
      rootId: root.id,
      path: relativePath,
      revision: newRevision,
      toolName,
      outcome: 'applied',
      oldContent,
      newContent: content,
      timestamp: Date.now(),
    };
    this.receipts.push(receipt);

    return { receipt, newRevision };
  }

  public searchFiles(rootId: string, query: string): FileItem[] {
    const all = this.listFiles(rootId);
    const clean = query.toLowerCase().trim();
    if (!clean) return all;

    return all.filter(
      (item) =>
        item.name.toLowerCase().includes(clean) ||
        item.path.toLowerCase().includes(clean)
    );
  }

  public getReceipts(): FileDiffReceipt[] {
    return [...this.receipts];
  }

  private computeFileRevision(filePath: string, stat: { mtimeMs: number; size: number }): string {
    return createHash('sha256')
      .update(`${filePath}:${stat.mtimeMs}:${stat.size}`)
      .digest('hex')
      .slice(0, 12);
  }

  private computeBufferRevision(buffer: Buffer): string {
    return createHash('sha256').update(buffer).digest('hex').slice(0, 12);
  }

  private checkIsBinary(buffer: Buffer): boolean {
    // Check first 8000 bytes for null character
    const checkLen = Math.min(buffer.length, 8000);
    for (let i = 0; i < checkLen; i++) {
      if (buffer[i] === 0) return true;
    }
    return false;
  }
}
