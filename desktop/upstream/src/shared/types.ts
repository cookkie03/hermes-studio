export type Status =
  'queued' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
export interface Settings {
  name: string;
  paused: boolean;
  researchAllowed: boolean;
  memoryAllowed: boolean;
}
export interface Task {
  id: string;
  prompt: string;
  status: Status;
  intervalSeconds: number | null;
  nextRunAt: number | null;
  createdAt: number;
  updatedAt: number;
  error: string | null;
  lease: string | null;
  leaseUntil: number | null;
}
export interface Source {
  title: string;
  url: string;
  excerpt: string;
}
export interface Result {
  text: string;
  sources: Source[];
  sample: boolean;
  screenshot?: string;
}
export interface Run {
  id: string;
  taskId: string;
  status: string;
  startedAt: number;
  finishedAt: number | null;
  result: Result | null;
  error: string | null;
}
export interface TaskEvent {
  id: number;
  taskId: string;
  runId: string | null;
  text: string;
  createdAt: number;
}
export interface Memory {
  id: string;
  text: string;
  createdAt: number;
}
export interface Detail {
  task: Task;
  runs: Run[];
  events: TaskEvent[];
}
export interface State {
  settings: Settings;
  tasks: Task[];
  memories: Memory[];
  mode: 'sample' | 'live';
  configured: boolean;
}
export type Action = 'run' | 'pause' | 'cancel';
export interface SpaceMemoryConfig {
  spaceId: string;
  rootId: string;
  relativePath: string;
  policy: 'manual' | 'milestones';
  lastConfirmedWrite?: number | null;
  lastRevision?: string | null;
  lastOutcome?: 'success' | 'conflict' | 'error' | 'idle' | null;
  lastError?: string | null;
}

export interface Space {
  id: string;
  name: string;
  description: string;
  createdAt: number;
  memoryConfig?: SpaceMemoryConfig | null;
}
export interface FolderBinding {
  id: string;
  spaceId: string;
  rootId: string;
  host: string;
  name: string;
  path: string;
  isReadOnly?: boolean;
  createdAt: number;
}
export interface Dot {
  id: string;
  /** Default destination for saved pages, not ownership. */
  spaceId: string;
  spaceIds: string[];
  name: string;
  instructions: string;
  researchAllowed: boolean;
  memoryAllowed: boolean;
  createdAt: number;
  learningContainerId?: string | null;
  skillDeliveryEnabled?: boolean;
  avatarId?: 'blue' | 'mint' | 'orange' | 'purple' | string;
}
export interface Conversation {
  id: string;
  dotId: string;
  ownerId: string;
  title: string;
  createdAt: number;
  /** Frozen at creation; null means this conversation does not participate. */
  learningContainerId?: string | null;
}
export interface CallReceipt {
  anchorMessageId?: string | null;
  id: string;
  threadId: string;
  startedAt: number;
  endedAt: number | null;
  status: 'connecting' | 'active' | 'ended' | 'failed';
  transcript: string;
  error: string | null;
}
export interface SetupStatus {
  intelligence: boolean;
  model: boolean;
  browser: boolean;
  voice: boolean;
  slack: string;
  missing: string[];
}
export interface WorkspaceState {
  spaces: Space[];
  dots: Dot[];
  conversations: Conversation[];
  setup: SetupStatus;
  calls: CallReceipt[];
  folderBindings?: FolderBinding[];
}

export interface RoutineSchedule {
  expr?: string;
  kind?: string;
  display?: string;
  tz?: string;
}

export interface RoutineJob {
  id: string;
  name?: string | null;
  prompt: string;
  schedule?: RoutineSchedule | string | null;
  schedule_display?: string | null;
  enabled: boolean;
  state?: string | null;
  deliver?: string | null;
  failure_deliver?: string | null;
  model?: string | null;
  provider?: string | null;
  connectionId?: string;
  profile?: string | null;
  spaceId?: string | null;
  dotId?: string | null;
  last_run_at?: string | number | null;
  next_run_at?: string | number | null;
  last_error?: string | null;
  created_at?: string | number | null;
  updated_at?: string | number | null;
}

export interface RoutineRun {
  id: string;
  jobId: string;
  sessionId?: string | null;
  connectionId?: string;
  profile?: string | null;
  startedAt: number | string;
  completedAt?: number | string | null;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'interrupted' | 'unknown';
  deliveryStatus?: 'delivered' | 'delivery-failed' | 'local-saved' | 'none';
  deliveryTarget?: string | null;
  deliveryError?: string | null;
  resultSummary?: string | null;
  error?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number | null;
}

export interface RoutineDeliveryTarget {
  id: string;
  name: string;
  home_target_set: boolean;
  home_env_var?: string | null;
}

export type SubagentStatus =
  | 'queued'
  | 'working'
  | 'awaiting_reply'
  | 'completed'
  | 'failed'
  | 'interrupted';

export interface SubagentTask {
  id: string;
  parentId: string;
  subagentId: string;
  goal: string;
  context?: string;
  outputSchema?: Record<string, unknown> | string;
  status: SubagentStatus;
  model?: string;
  effort?: string;
  spaceId?: string;
  host?: string;
  output: string;
  createdAt: number;
  updatedAt: number;
  result?: string | null;
}

export type BotMessageStatus =
  | 'queued'
  | 'admitted'
  | 'working'
  | 'awaiting_reply'
  | 'reply_received'
  | 'declined'
  | 'failed'
  | 'uncertain';

export interface BotMessage {
  id: string;
  deliveryId: string;
  fromProfile: string;
  toProfile: string;
  fromDotId: string;
  toDotId: string;
  threadId: string;
  content: string;
  status: BotMessageStatus;
  createdAt: number;
  reply?: string | null;
  error?: string | null;
}

export interface HostedRoom {
  roomId: string;
  name: string;
  members: string[];
  state: 'active' | 'disbanded' | 'stopped';
  createdAt: number;
}

export interface RoomLogEvent {
  seq: number;
  eventId: string;
  roomId: string;
  fromProfile: string;
  payload: Record<string, unknown> | string;
  timestamp: number;
  error?: string | null;
}

export interface RecallResult {
  sessionId: string;
  profile: string;
  threadId: string;
  messageId: string;
  snippet: string;
  timestamp: number;
  score?: number;
}

export interface SpaceProfileLink {
  spaceId: string;
  profile: string;
  projectId?: string | null;
  host?: string | null;
  status: 'linked' | 'missing' | 'unsupported';
}

export interface ComputerTarget {
  connectionId: string;
  host: string;
  profile?: string;
  app?: string;
  window?: string;
  driverStatus: 'available' | 'missing_driver' | 'denied_permissions' | 'no_display';
  modes: ('som' | 'vision' | 'ax')[];
  humanHasControl: boolean;
  botScreenStreamAvailable: boolean;
}

export interface CaptureElement {
  id: string;
  label: string;
  role?: string;
  bounds?: [number, number, number, number];
}

export interface CaptureReceipt {
  id: string;
  timestamp: number;
  mode: 'som' | 'vision' | 'ax';
  targetApp?: string;
  targetWindow?: string;
  imageUrl?: string | null;
  base64?: string | null;
  textSummary?: string | null;
  elements?: CaptureElement[];
  stale: boolean;
}

export interface ComputerActionRequest {
  id: string;
  toolId?: string;
  action: string;
  args: Record<string, unknown>;
  target: ComputerTarget;
  status: 'pending_approval' | 'approved' | 'working' | 'succeeded' | 'failed' | 'uncertain' | 'denied';
  createdAt: number;
  approvedAt?: number;
  completedAt?: number;
  preCapture?: CaptureReceipt;
  postCapture?: CaptureReceipt;
  resultSummary?: string;
  error?: string;
  payloadTruncated?: boolean;
}

export interface BotScreenLease {
  active: boolean;
  leasedBy: 'agent' | 'human';
  humanHasControl: boolean;
  expiresAt?: number;
}

// F8 — Hermes capability and memory observability types
export interface HermesMemoryBudget {
  category: 'user' | 'memory';
  label: string;
  charLimit: number;
  currentChars: number;
  percentage: number;
  rawSizeBytes?: number;
}

export interface HermesMemoryEntry {
  id: string;
  category: 'user' | 'memory' | 'soul' | 'custom';
  content: string;
  provenance?: string;
  updatedAt?: number;
}

export interface HermesPendingReviewSummary {
  id: string;
  text: string;
  timestamp: number;
  session_id?: string;
  status: 'pending' | 'applied' | 'discarded';
  nativeInstruction: string;
}

export interface HermesNativeMemoryStatus {
  connectionId: string;
  profile: string;
  activeProvider: string;
  budgets: HermesMemoryBudget[];
  entries: HermesMemoryEntry[];
  soulPrompt?: string | null;
  curatorStatus?: {
    enabled: boolean;
    lastRunAt?: number | null;
    statusText?: string;
  };
  pendingReviews: HermesPendingReviewSummary[];
  snapshotTimestamp: number;
  isStale: boolean;
  isOffline: boolean;
  byteSizeGapExplanation: string;
}

export type CapabilityStatus =
  | 'supported_connected'
  | 'verified_studio'
  | 'pending_owner'
  | 'unavailable_gap';

export interface HermesCapabilityMatrixItem {
  id: string;
  name: string;
  category: 'core' | 'memory' | 'tools' | 'skills' | 'plugins' | 'collaboration' | 'routines' | 'voice' | 'security';
  owningCard: string;
  surface: string;
  status: CapabilityStatus;
  nativeContract: string;
  evidence: string;
  discoveredDetails?: Record<string, unknown>;
}

export interface HermesCapabilityMatrix {
  connectionId: string;
  profile: string;
  gatewayVersion?: string;
  hostState: 'connected' | 'offline' | 'unreachable';
  timestamp: number;
  items: HermesCapabilityMatrixItem[];
  discoveredTools?: Array<{ name: string; description?: string; enabled?: boolean; toolset?: string }>;
  discoveredSkills?: Array<{ name: string; description?: string; installed?: boolean }>;
  discoveredPlugins?: Array<{ name: string; description?: string; enabled?: boolean }>;
}

export interface ToolsetRow {
  name: string;
  description: string;
  tool_count: number;
  enabled: boolean;
  tools?: string[];
}

export interface ToolShowItem {
  name: string;
  description: string;
}

export interface ToolShowSection {
  name: string;
  tools: ToolShowItem[];
}

export interface PluginServerRow {
  name: string;
  state: string;
  sentence?: string;
}

export interface AgentPluginRow {
  name: string;
  key: string;
  version: string;
  description: string;
  source: string;
  status: string;
  portable?: boolean;
  install_dir?: string;
  has_desktop_half?: boolean;
  servers: PluginServerRow[];
  update_available?: boolean;
  catalog_name?: string;
  catalog_version?: string;
}

export interface CapabilityDelta {
  [surface: string]: string[];
}


