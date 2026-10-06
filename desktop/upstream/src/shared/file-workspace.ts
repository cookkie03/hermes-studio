import type { Dot } from './types.js';

export interface FileRoot {
  id: string;
  host: string; // e.g. 'local' or 'debian-mini-pc'
  name: string; // e.g. 'Second-Brain'
  path: string; // absolute path on host
  isReadOnly?: boolean;
}

export interface FileItem {
  rootId: string;
  host: string;
  path: string; // relative to root
  fullPath: string;
  name: string;
  kind: 'file' | 'directory';
  size: number;
  mimeType?: string;
  isBinary?: boolean;
  isSymlink?: boolean;
  symlinkTarget?: string;
  revision: string; // content hash or etag
  updatedAt: number;
}

export interface FileReference {
  host: string;
  rootId: string;
  rootName: string;
  path: string;
  lineStart?: number;
  lineEnd?: number;
  revision?: string;
}

export interface FileDiffReceipt {
  id: string;
  host: string;
  rootId: string;
  path: string;
  revision: string;
  toolName: string; // e.g. 'write_file', 'patch'
  outcome: 'applied' | 'rejected' | 'conflict';
  oldContent?: string;
  newContent?: string;
  timestamp: number;
  error?: string;
}

export interface FileReadResult {
  rootId: string;
  host: string;
  path: string;
  content: string;
  revision: string;
  size: number;
  isBinary: boolean;
  largeFile: boolean; // > 2MB
  updatedAt: number;
}

/**
 * Progressive @ mention parsing.
 * Matches syntax like "@host/root/path:10-25" or "@root/path" or "@path".
 */
export function parseFileChip(chipText: string): FileReference | null {
  const trimmed = chipText.trim();
  if (!trimmed.startsWith('@')) return null;
  const raw = trimmed.slice(1);
  if (!raw) return null;

  // Split line range if present (e.g., path.ts:15-30 or path.ts:15)
  const lineMatch = raw.match(/^(.*?):(\d+)(?:-(\d+))?$/);
  let pathPart = raw;
  let lineStart: number | undefined;
  let lineEnd: number | undefined;

  if (lineMatch) {
    pathPart = lineMatch[1];
    lineStart = parseInt(lineMatch[2], 10);
    lineEnd = lineMatch[3] ? parseInt(lineMatch[3], 10) : lineStart;
  }

  const parts = pathPart.split('/').filter(Boolean);
  if (parts.length === 0) return null;

  let host = 'local';
  let rootName = 'workspace';
  let path = pathPart;

  if (parts.length >= 3 && (parts[0] === 'local' || parts[0].includes('-') || parts[0].includes('.'))) {
    host = parts[0];
    rootName = parts[1];
    path = parts.slice(2).join('/');
  } else if (parts.length >= 2) {
    rootName = parts[0];
    path = parts.slice(1).join('/');
  }

  return {
    host,
    rootId: rootName,
    rootName,
    path,
    lineStart,
    lineEnd,
  };
}

/**
 * Formats a file reference back into an authoritative chip string.
 * Example: "@local/Second-Brain/notes/summary.md:10-25"
 */
export function formatFileChip(ref: FileReference): string {
  let chip = `@${ref.host}/${ref.rootName}/${ref.path}`;
  if (ref.lineStart !== undefined) {
    chip += `:${ref.lineStart}`;
    if (ref.lineEnd !== undefined && ref.lineEnd !== ref.lineStart) {
      chip += `-${ref.lineEnd}`;
    }
  }
  return chip;
}

/**
 * Filter available file roots & items given a progressive @ query string.
 */
export function filterFileMentions(
  query: string,
  roots: FileRoot[],
  items: FileItem[]
): FileReference[] {
  const clean = query.replace(/^@/, '').toLowerCase().trim();
  const results: FileReference[] = [];

  for (const item of items) {
    if (item.kind !== 'file') continue;
    const root = roots.find((r) => r.id === item.rootId);
    const rootName = root ? root.name : item.rootId;
    const fullTag = `${item.host}/${rootName}/${item.path}`.toLowerCase();
    
    if (!clean || fullTag.includes(clean) || item.name.toLowerCase().includes(clean) || item.path.toLowerCase().includes(clean)) {
      results.push({
        host: item.host,
        rootId: item.rootId,
        rootName,
        path: item.path,
        revision: item.revision,
      });
    }
  }

  return results.slice(0, 10);
}

/**
 * Validates path security rules for file operations within a root directory.
 * Rejects path traversal (../), null bytes, and symlink targets outside root.
 */
export function validatePathSecurity(
  rootPath: string,
  targetRelativePath: string,
  symlinkResolvedTarget?: string
): { valid: boolean; error?: string } {
  if (!targetRelativePath || targetRelativePath.includes('\0')) {
    return { valid: false, error: 'Path contains invalid characters.' };
  }

  // Reject path traversal attempts
  const normalizedRel = targetRelativePath.replace(/\\/g, '/');
  if (
    normalizedRel.startsWith('/') ||
    normalizedRel.includes('../') ||
    normalizedRel.includes('/..') ||
    normalizedRel === '..'
  ) {
    return { valid: false, error: 'Access denied: Path traversal outside root is forbidden.' };
  }

  if (symlinkResolvedTarget) {
    const normRoot = rootPath.replace(/\\/g, '/').replace(/\/$/, '');
    const normTarget = symlinkResolvedTarget.replace(/\\/g, '/');
    if (!normTarget.startsWith(normRoot + '/') && normTarget !== normRoot) {
      return { valid: false, error: 'Access denied: Symlink resolves outside authorized root.' };
    }
  }

  return { valid: true };
}

/**
 * Compute line diff between old and new string content for D34 visible timeline receipts.
 */
export function computeSimpleDiff(
  oldContent: string,
  newContent: string
): { addedLines: number; removedLines: number; diffSummary: string } {
  const oldLines = oldContent.split('\n');
  const newLines = newContent.split('\n');

  let addedLines = 0;
  let removedLines = 0;
  const diffParts: string[] = [];

  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    if (i >= oldLines.length) {
      addedLines++;
      diffParts.push(`+ ${newLines[i]}`);
    } else if (i >= newLines.length) {
      removedLines++;
      diffParts.push(`- ${oldLines[i]}`);
    } else if (oldLines[i] !== newLines[i]) {
      removedLines++;
      addedLines++;
      diffParts.push(`- ${oldLines[i]}`);
      diffParts.push(`+ ${newLines[i]}`);
    }
  }

  return {
    addedLines,
    removedLines,
    diffSummary: diffParts.slice(0, 100).join('\n') + (diffParts.length > 100 ? '\n... (truncated)' : ''),
  };
}
