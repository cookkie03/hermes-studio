import { pageRoutes } from './page-routes.js';
import { fileRoutes } from './file-routes.js';
import { Hono } from 'hono';
import { z } from 'zod';
import type { MetadataBackend } from './metadata-contracts.js';
import { VoiceService } from './voice.js';
import {
  learningContainerIdSchema,
  validateLearningSettings,
} from '../shared/learning.js';
const dotSchema = z
  .object({
    name: z.string().trim().min(1).max(40),
    instructions: z.string().trim().min(3).max(2000),
    researchAllowed: z.boolean(),
    memoryAllowed: z.boolean(),
    learningContainerId: learningContainerIdSchema.optional(),
    skillDeliveryEnabled: z.boolean().optional(),
    avatarId: z.string().nullable().optional(),
    spaceIds: z.array(z.string().min(1)).min(1).max(100).optional(),
    spaceId: z.string().min(1).optional(),
  })
  .strict();
export function workspaceRoutes(platform: MetadataBackend, voice: Pick<VoiceService, 'begin' | 'activate' | 'compute' | 'end'>) {
  const app = new Hono();
  app.route('/', pageRoutes(platform));
  app.route('/', fileRoutes(platform.workspace.files));
  app.get('/workspace', (c) =>
    c.json({
      spaces: platform.workspace.spaces(),
      dots: platform.workspace.dots(),
      conversations: platform.workspace.conversations(),
      setup: platform.setup(),
      calls: platform.workspace.calls(),
      folderBindings: platform.workspace.folderBindings(),
    }),
  );
  app.get('/spaces/:spaceId/folders', (c) => {
    const spaceId = c.req.param('spaceId');
    return c.json(platform.workspace.folderBindings(spaceId));
  });
  app.post('/spaces/:spaceId/folders', async (c) => {
    const spaceId = c.req.param('spaceId');
    const folderSchema = z
      .object({
        rootId: z.string().optional(),
        host: z.string().trim().min(1),
        name: z.string().trim().min(1).max(100),
        path: z.string().trim().min(1),
        isReadOnly: z.boolean().optional(),
      })
      .strict();

    const parse = folderSchema.safeParse(await c.req.json());
    if (!parse.success) {
      return c.json({ error: 'Invalid folder binding data.' }, 400);
    }
    try {
      const binding = platform.workspace.linkFolder(spaceId, parse.data);
      return c.json(binding, 201);
    } catch (e) {
      return c.json({ error: e instanceof Error ? e.message : 'Could not link folder.' }, 400);
    }
  });
  app.delete('/spaces/:spaceId/folders/:bindingId', (c) => {
    const spaceId = c.req.param('spaceId');
    const bindingId = c.req.param('bindingId');
    const success = platform.workspace.unlinkFolder(spaceId, bindingId);
    if (!success) {
      return c.json({ error: 'Folder binding not found.' }, 404);
    }
    return c.json({ success: true });
  });
  app.get('/spaces/:spaceId/memory', (c) => {
    const spaceId = c.req.param('spaceId');
    const config = platform.workspace.spaceMemoryConfig(spaceId);
    if (!config) {
      return c.json({ config: null, file: null });
    }
    try {
      const file = platform.workspace.files.readFile(config.rootId, config.relativePath);
      return c.json({ config, file });
    } catch (e) {
      return c.json({
        config,
        file: null,
        error: e instanceof Error ? e.message : 'Could not read memory file.',
      });
    }
  });
  app.post('/spaces/:spaceId/memory', async (c) => {
    const spaceId = c.req.param('spaceId');
    const space = platform.workspace.spaces().find((s) => s.id === spaceId);
    if (!space) return c.json({ error: 'Space not found.' }, 404);

    const schema = z
      .object({
        rootId: z.string().min(1),
        relativePath: z.string().trim().min(1),
        policy: z.enum(['manual', 'milestones']).default('manual'),
        createIfNotExists: z.boolean().optional(),
      })
      .strict();

    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Invalid space memory configuration.' }, 400);
    }

    const { rootId, relativePath, policy, createIfNotExists } = parsed.data;
    const root = platform.workspace.files.getRoot(rootId);
    if (!root) return c.json({ error: 'Folder root not found.' }, 404);

    let fileExists = false;
    try {
      platform.workspace.files.readFile(rootId, relativePath);
      fileExists = true;
    } catch {
      fileExists = false;
    }

    if (!fileExists && createIfNotExists) {
      if (root.isReadOnly) {
        return c.json(
          { error: `Cannot create memory file in read-only folder root '${root.name}'.` },
          400,
        );
      }
      const defaultContent = `# ${space.name} — Space Memory\n\n## Context & Goals\n${space.description || 'Goals and context for this Space.'}\n\n## Key Decisions\n- Initialized Space Markdown Memory.\n\n## Significant Milestones & Outcomes\n\n`;
      const writeResult = platform.workspace.files.writeFile({
        rootId,
        relativePath,
        content: defaultContent,
        toolName: 'space_memory_init',
      });
      platform.workspace.setSpaceMemoryConfig(spaceId, {
        rootId,
        relativePath,
        policy,
      });
      platform.workspace.updateSpaceMemoryStatus(spaceId, {
        lastConfirmedWrite: Date.now(),
        lastRevision: writeResult.newRevision,
        lastOutcome: 'success',
        lastError: null,
      });
    } else {
      platform.workspace.setSpaceMemoryConfig(spaceId, {
        rootId,
        relativePath,
        policy,
      });
    }

    const config = platform.workspace.spaceMemoryConfig(spaceId);
    let file = null;
    try {
      file = platform.workspace.files.readFile(rootId, relativePath);
    } catch {}

    return c.json({ config, file });
  });
  app.post('/spaces/:spaceId/memory/write', async (c) => {
    const spaceId = c.req.param('spaceId');
    const config = platform.workspace.spaceMemoryConfig(spaceId);
    if (!config) return c.json({ error: 'Space memory is not configured.' }, 400);

    const schema = z
      .object({
        content: z.string(),
        expectedRevision: z.string().optional(),
        mode: z.enum(['replace', 'append']).default('replace'),
        appendHeading: z.string().optional(),
      })
      .strict();

    const parsed = schema.safeParse(await c.req.json());
    if (!parsed.success) {
      return c.json({ error: 'Invalid write payload.' }, 400);
    }

    const { content, expectedRevision, mode, appendHeading } = parsed.data;
    let finalContent = content;

    if (mode === 'append') {
      try {
        const existing = platform.workspace.files.readFile(config.rootId, config.relativePath);
        const heading = appendHeading ? `\n\n### ${appendHeading}\n` : '\n\n';
        finalContent = existing.content.trimEnd() + heading + content + '\n';
      } catch {
        return c.json({ error: 'Failed to read existing file for appending.' }, 400);
      }
    }

    try {
      const res = platform.workspace.files.writeFile({
        rootId: config.rootId,
        relativePath: config.relativePath,
        content: finalContent,
        expectedRevision,
        toolName: 'space_memory_editor',
      });

      if (res.receipt.outcome === 'conflict') {
        platform.workspace.updateSpaceMemoryStatus(spaceId, {
          lastOutcome: 'conflict',
          lastError: 'Conflict: Memory file modified externally.',
        });
        return c.json(
          {
            outcome: 'conflict',
            receipt: res.receipt,
            config: platform.workspace.spaceMemoryConfig(spaceId),
          },
          409,
        );
      }

      platform.workspace.updateSpaceMemoryStatus(spaceId, {
        lastConfirmedWrite: Date.now(),
        lastRevision: res.newRevision,
        lastOutcome: 'success',
        lastError: null,
      });

      return c.json({
        outcome: 'success',
        receipt: res.receipt,
        newRevision: res.newRevision,
        config: platform.workspace.spaceMemoryConfig(spaceId),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to write memory file.';
      platform.workspace.updateSpaceMemoryStatus(spaceId, {
        lastOutcome: 'error',
        lastError: message,
      });
      return c.json({ error: message }, 400);
    }
  });
  app.delete('/spaces/:spaceId/memory', (c) => {
    const spaceId = c.req.param('spaceId');
    platform.workspace.deleteSpaceMemoryConfig(spaceId);
    return c.json({ success: true });
  });
  app.post('/spaces', async (c) => {
    const data = z
      .object({
        name: z.string().trim().min(1).max(60),
        description: z.string().max(500).default(''),
      })
      .strict()
      .safeParse(await c.req.json());
    if (!data.success)
      return c.json(
        { error: 'Enter a Space name (up to 60 characters).' },
        400,
      );
    return c.json(
      platform.workspace.createSpace(data.data.name, data.data.description),
      201,
    );
  });
  app.post('/dots', async (c) => {
    const data = dotSchema
      .extend({ spaceId: z.string() })
      .safeParse(await c.req.json());
    if (!data.success)
      return c.json(
        {
          error:
            'Provide a name, role instructions, and explicit tool permissions.',
        },
        400,
      );
    try {
      validateLearningSettings(
        data.data.learningContainerId ?? null,
        data.data.skillDeliveryEnabled ?? false,
      );
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Invalid Learning settings.',
        },
        400,
      );
    }
    return c.json(
      platform.workspace.createDot(
        data.data.spaceId,
        data.data.name,
        data.data.instructions,
        data.data.researchAllowed,
        data.data.memoryAllowed,
        data.data.spaceIds,
        data.data.learningContainerId,
        data.data.skillDeliveryEnabled,
        data.data.avatarId,
      ),
      201,
    );
  });
  app.put('/dots/:id', async (c) => {
    const data = dotSchema.safeParse(await c.req.json());
    if (!data.success)
      return c.json({ error: 'Invalid specialist settings.' }, 400);
    const current = platform.workspace.dot(c.req.param('id'));
    if (!current) return c.json({ error: 'Dot not found.' }, 404);
    try {
      validateLearningSettings(
        data.data.learningContainerId === undefined
          ? (current.learningContainerId ?? null)
          : data.data.learningContainerId,
        data.data.skillDeliveryEnabled ?? current.skillDeliveryEnabled ?? false,
      );
    } catch (error) {
      return c.json(
        {
          error:
            error instanceof Error
              ? error.message
              : 'Invalid Learning settings.',
        },
        400,
      );
    }
    return c.json(platform.workspace.updateDot(c.req.param('id'), data.data));
  });
  app.post('/conversations', async (c) => {
    const data = z
      .object({
        dotId: z.string(),
        title: z.string().trim().min(1).max(120).default('A new thought'),
      })
      .strict()
      .safeParse(await c.req.json());
    if (!data.success)
      return c.json({ error: 'Select a Dot and a conversation title.' }, 400);
    if (platform.setup().missing.length)
      return c.json(
        { error: `Setup required: ${platform.setup().missing.join(', ')}.` },
        503,
      );
    return c.json(
      await platform.createConversation(data.data.dotId, data.data.title),
      201,
    );
  });
  app.get('/conversations/:id/capture', (c) =>
    c.json(platform.workspace.capture(c.req.param('id'))),
  );
  app.post('/voice/calls', async (c) => {
    const data = z
      .object({ threadId: z.string(), sdp: z.string().max(100000) })
      .strict()
      .safeParse(await c.req.json());
    if (!data.success)
      return c.json(
        { error: 'A conversation and audio SDP offer are required.' },
        400,
      );
    return c.json(
      await voice.begin(data.data.threadId, data.data.sdp, c.req.raw.signal),
      201,
    );
  });
  app.get('/voice/calls/:id', (c) =>
    c.json(platform.workspace.call(c.req.param('id'))),
  );
  app.post('/voice/calls/:id/active', (c) =>
    c.json(voice.activate(c.req.param('id'))),
  );
  app.post('/voice/calls/:id/compute', async (c) => {
    const data = z
      .object({
        toolCallId: z.string().min(1).max(200),
        request: z.string().trim().min(1).max(4000),
        transcript: z.string().max(12000).default(''),
      })
      .strict()
      .safeParse(await c.req.json());
    if (!data.success)
      return c.json(
        { error: 'A bounded compute request and tool call ID are required.' },
        400,
      );
    return c.json({
      text: await voice.compute(
        c.req.param('id'),
        data.data.toolCallId,
        `${data.data.request}\n\nUntrusted current-call transcript for context:\n${data.data.transcript}`,
      ),
    });
  });
  app.post('/voice/calls/:id/end', async (c) => {
    const data = z
      .object({
        transcript: z.string().max(20000),
        anchorMessageId: z.string().max(200).optional(),
      })
      .strict()
      .safeParse(await c.req.json());
    if (!data.success)
      return c.json(
        { error: 'Transcript exceeds the 20,000 character limit.' },
        400,
      );
    platform.workspace.anchorCall(c.req.param('id'), data.data.anchorMessageId);
    return c.json(await voice.end(c.req.param('id'), data.data.transcript));
  });
  app.all('/copilotkit/*', (c) => platform.handle(c.req.raw));
  app.onError((error, c) => {
    const text = error.message;
    const known =
      /^(Setup|Voice setup|Dot |Space |Specialist |Conversation |Call |This call|End the current|Voice provider|An audio|Intelligence could not)/.test(
        text,
      );
    return c.json(
      {
        error: known
          ? text
          : 'The service request failed. Check the server configuration and try again.',
      },
      503,
    );
  });
  return app;
}
