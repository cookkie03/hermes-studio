import type { Conversation, SetupStatus } from '../shared/types.js';
import type { WorkspaceStore } from './workspace.js';
import type { Store } from './store.js';
import type { PageService } from './page-service.js';
import type { PlatformConfig } from './platform-config.js';
import type { ComputerService } from './computer-service.js';

/** Local metadata routes require ownership/revision checks in WorkspaceStore.
 * Creating a local conversation never implies admission to an agent runtime.
 * Page operations must reject revoked access and stale revisions before writing.
 * Both Studio's Hermes adapter and the historical executor implement this seam.
 */
export interface MetadataBackend {
  readonly workspace: WorkspaceStore;
  readonly pages: Pick<PageService, 'conversation' | 'saveConversation'>;
  setup(): SetupStatus;
  createConversation(dotId: string, title: string): Promise<Conversation>;
  handle(request: Request): Response | Promise<Response>;
}

/** Historical optional capabilities; metadata does not import their executor. */
export interface VoiceBackend {
  readonly workspace: WorkspaceStore;
  readonly store: Store;
  readonly config: PlatformConfig;
  requireReady(): void;
  setup(): SetupStatus;
  history(threadId: string): Promise<string>;
  turn(threadId: string, prompt: string, signal: AbortSignal,
    metadata?: Record<string, unknown>): Promise<string>;
}

export interface AppBackend extends MetadataBackend, VoiceBackend {
  readonly computers: ComputerService;
}
