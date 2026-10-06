import { Hono } from 'hono';
import { z } from 'zod';
import type { FileWorkspaceService } from './file-service.js';

export function fileRoutes(fileService: FileWorkspaceService) {
  const app = new Hono();

  app.onError((error, c) =>
    c.json(
      {
        error:
          error instanceof z.ZodError
            ? 'Invalid file workspace request.'
            : error.message,
      },
      400
    )
  );

  app.get('/files/roots', (c) => c.json(fileService.getRoots()));

  app.get('/files/tree', (c) => {
    const rootId = c.req.query('rootId');
    const subPath = c.req.query('subPath') || '';
    if (!rootId) return c.json({ error: 'Parameter rootId is required.' }, 400);

    try {
      const items = fileService.listFiles(rootId, subPath);
      return c.json(items);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Error listing files.' }, 400);
    }
  });

  app.get('/files/read', (c) => {
    const rootId = c.req.query('rootId');
    const path = c.req.query('path');
    if (!rootId || !path) {
      return c.json({ error: 'Parameters rootId and path are required.' }, 400);
    }

    try {
      const result = fileService.readFile(rootId, path);
      return c.json(result);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Error reading file.' }, 400);
    }
  });

  app.post('/files/write', async (c) => {
    const bodySchema = z
      .object({
        rootId: z.string().min(1),
        relativePath: z.string().min(1),
        content: z.string(),
        expectedRevision: z.string().optional(),
        toolName: z.string().optional(),
      })
      .strict();

    const parse = bodySchema.safeParse(await c.req.json());
    if (!parse.success) {
      return c.json({ error: 'Invalid write payload.' }, 400);
    }

    try {
      const res = fileService.writeFile(parse.data);
      if (res.receipt.outcome === 'conflict') {
        return c.json(
          {
            error: res.receipt.error,
            receipt: res.receipt,
            newRevision: res.newRevision,
          },
          409
        );
      }
      return c.json(res);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Error writing file.' }, 400);
    }
  });

  app.get('/files/search', (c) => {
    const rootId = c.req.query('rootId');
    const query = c.req.query('query') || '';
    if (!rootId) return c.json({ error: 'Parameter rootId is required.' }, 400);

    try {
      const matches = fileService.searchFiles(rootId, query);
      return c.json(matches);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Error searching files.' }, 400);
    }
  });

  app.get('/files/receipts', (c) => c.json(fileService.getReceipts()));

  return app;
}
