import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
export class DraftStore {
  constructor(path) { this.path = path; this.drafts = {}; this.queue = Promise.resolve(); }
  async initialize() {
    try { const data = JSON.parse(await readFile(this.path, 'utf8')); if (data.version !== 1 || !data.drafts || Object.values(data.drafts).some(value => typeof value !== 'string')) throw new Error('Unsupported draft archive; original preserved.'); this.drafts = data.drafts; }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  get(id) { return { draft: this.drafts[id] ?? '' }; }
  async save(id, draft) {
    if (typeof draft !== 'string' || draft.length > 32000) throw new Error('Draft must contain at most 32,000 characters.');
    const operation = this.queue.then(async () => {
      const next = { ...this.drafts, [id]: draft }, temp = `${this.path}.${randomUUID()}.tmp`;
      await mkdir(dirname(this.path), { recursive: true }); await writeFile(temp, JSON.stringify({ version: 1, drafts: next }), { mode: 0o600 }); await rename(temp, this.path); this.drafts = next; return { draft };
    });
    this.queue = operation.catch(() => {}); return operation;
  }
}
