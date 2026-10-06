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
export interface Space {
  id: string;
  name: string;
  description: string;
  createdAt: number;
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
