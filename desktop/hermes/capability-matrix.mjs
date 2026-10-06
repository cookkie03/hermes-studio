export const HERMES_CAPABILITY_CATALOG = [
  {
    id: 'f1-runtime-connections',
    name: 'Runtime Connections & Hosts',
    category: 'core',
    owningCard: 'F1',
    surface: 'Settings / Connection Dialog',
    status: 'verified_studio',
    nativeContract: 'RuntimeConnections (local / SSH)',
    evidence: 'Host lifecycle, SSE/WS transport, multi-node and auto-connect verified in F1.',
  },
  {
    id: 'f2-conversations-timeline',
    name: 'Conversations & Native Timeline',
    category: 'core',
    owningCard: 'F2',
    surface: 'Chat View / Message Timeline',
    status: 'verified_studio',
    nativeContract: 'session.events / message streaming / review.summary',
    evidence: 'Turn execution, tool call display, interruption, and persistent review notes verified in F2.',
  },
  {
    id: 'f3-permissions-approvals',
    name: 'Permissions & Security Approvals',
    category: 'security',
    owningCard: 'F3',
    surface: 'Approval Cards / Decision Modals',
    status: 'verified_studio',
    nativeContract: 'request.approval (once / session / always / deny)',
    evidence: 'Ephemeral decisionId, RPC deduplication, lease expiry, and double-submit protection verified in F3.',
  },
  {
    id: 'f4-workspace-shell',
    name: 'Workspace Shell & Navigation',
    category: 'core',
    owningCard: 'F4',
    surface: 'App Sidebar / Topbar / Layout',
    status: 'verified_studio',
    nativeContract: 'Studio OpenDots Responsive Shell',
    evidence: '900px/1360px layout, keyboard navigation, Reduced Motion, and view switching verified in F4.',
  },
  {
    id: 'f5-file-workspace',
    name: 'File Workspace & Mentions',
    category: 'tools',
    owningCard: 'F5',
    surface: 'Computer Panel / Composer @ File Mentions',
    status: 'verified_studio',
    nativeContract: 'FileService / File Roots / Diff Receipts',
    evidence: 'Live directory scanning, file diff inspection, @ mention autocomplete, and path references verified in F5.',
  },
  {
    id: 'f6-spaces-documents',
    name: 'Folder-Backed Spaces & Documents',
    category: 'core',
    owningCard: 'F6',
    surface: 'Space Workspace / Page Editor',
    status: 'verified_studio',
    nativeContract: 'WorkspaceStore / SpaceNav / Markdown Pages',
    evidence: 'Folder bindings, page hierarchy, auto-save, and save conversation to space verified in F6.',
  },
  {
    id: 'f7-bots-identities',
    name: 'Bots & Profile Bindings',
    category: 'core',
    owningCard: 'F7',
    surface: 'Dots Directory / Persona Editor',
    status: 'supported_connected',
    nativeContract: 'profile.binding / Bot persona metadata',
    evidence: 'Studio Dot roles and native profile mapping supported; full multi-profile switcher in progress.',
  },
  {
    id: 'f8-memory-observability',
    name: 'Memory Observability & Capability Matrix',
    category: 'memory',
    owningCard: 'F8',
    surface: 'Memory View / Observability Dashboard',
    status: 'verified_studio',
    nativeContract: 'memory.inspect / tools.list / review.summary',
    evidence: 'Read-only profile memory inspection, character budget gauges (1,375/2,200), byte-size gap explanation, and capability matrix verified in F8.',
  },
  {
    id: 'f9-space-memory',
    name: 'Space Local Context & Documents',
    category: 'memory',
    owningCard: 'F9',
    surface: 'Space Local Context / Reference Notes',
    status: 'verified_studio',
    nativeContract: 'Workspace Pages / Local Notes (non-injected)',
    evidence: 'Space context clearly separated from Hermes native profile memory per D38.',
  },
  {
    id: 'f10-routines-scheduler',
    name: 'Routines & Cron Scheduler',
    category: 'routines',
    owningCard: 'F10',
    surface: 'Routines View / Routine Editor / Run History',
    status: 'verified_studio',
    nativeContract: 'cron.manage / cron.trigger / cron.list / cron.runs',
    evidence: 'Cron job CRUD, pause/resume, manual trigger, run history inspection, and delivery target mapping verified in F10.',
  },
  {
    id: 'f11-skills-tools-plugins',
    name: 'Skills, Toolsets & MCP Plugins',
    category: 'skills',
    owningCard: 'F11',
    surface: 'Capabilities View / Skills Browser',
    status: 'supported_connected',
    nativeContract: 'tools.list / tools.show / skills.manage / plugins.manage',
    evidence: 'Native tools inspection, skills listing, and plugin configuration supported via CapabilitiesManager.',
  },
  {
    id: 'f12-browser-automation',
    name: 'Shared Browser & Automation',
    category: 'tools',
    owningCard: 'F12',
    surface: 'Computer Panel / Browser Tab',
    status: 'supported_connected',
    nativeContract: 'browser_exec / aside-browser / Defuddle',
    evidence: 'Headless / local browser execution supported with screenshot feedback and text extraction.',
  },
  {
    id: 'f14-subagents-delegation',
    name: 'Subagent Delegation & Parallel Runs',
    category: 'collaboration',
    owningCard: 'F14',
    surface: 'Agent Team / Subagent Task List',
    status: 'supported_connected',
    nativeContract: 'delegate_task / subagent lifecycle',
    evidence: 'Subagent dispatch and background task monitoring supported via native runtime contracts.',
  },
  {
    id: 'f15-terminal-execution',
    name: 'Terminal & Command Execution',
    category: 'tools',
    owningCard: 'F15',
    surface: 'Computer Panel / Shell Output Cards',
    status: 'verified_studio',
    nativeContract: 'terminal / process_manage',
    evidence: 'Shell command execution, output streaming, and exit code capture verified in Studio.',
  },
  {
    id: 'f16-computer-use',
    name: 'Computer Use & Screen Actions',
    category: 'tools',
    owningCard: 'F16',
    surface: 'Computer Panel / Screen Capture View',
    status: 'supported_connected',
    nativeContract: 'computer_use / screenshot / mouse / keyboard',
    evidence: 'Screen capture, coordinate clicking, and approval gating supported via ComputerManager.',
  },
  {
    id: 'f17-voice-conversation',
    name: 'STT/TTS & Voice Interaction',
    category: 'voice',
    owningCard: 'F17',
    surface: 'Voice Modal / Audio Composer',
    status: 'supported_connected',
    nativeContract: 'OmniRoute STT (best-stt) / Text-to-Speech',
    evidence: 'Server-side audio transcription and TTS playback supported with chunking and fallback.',
  },
];

export async function buildCapabilityMatrix({ capabilitiesManager, connectionId = 'local', profile = 'default' } = {}) {
  let discoveredTools = [];
  let discoveredSkills = [];
  let discoveredPlugins = [];
  let hostState = 'connected';

  if (capabilitiesManager) {
    try {
      const toolsResult = await capabilitiesManager.showTools({ connectionId, profile }).catch(() => null);
      if (toolsResult?.tools) {
        discoveredTools = toolsResult.tools;
      } else if (Array.isArray(toolsResult)) {
        discoveredTools = toolsResult;
      }
    } catch {
      // Host might be offline or synthetic fixture without tool handler
    }

    try {
      const skillsResult = await capabilitiesManager.listSkills({ connectionId, profile }).catch(() => null);
      if (skillsResult?.skills) {
        discoveredSkills = skillsResult.skills;
      } else if (Array.isArray(skillsResult)) {
        discoveredSkills = skillsResult;
      }
    } catch {
      // Host might be offline
    }

    try {
      const pluginsResult = await capabilitiesManager.listPlugins({ connectionId, profile }).catch(() => null);
      if (pluginsResult?.plugins) {
        discoveredPlugins = pluginsResult.plugins;
      } else if (Array.isArray(pluginsResult)) {
        discoveredPlugins = pluginsResult;
      }
    } catch {
      // Host might be offline
    }
  }

  return {
    connectionId,
    profile,
    gatewayVersion: '0.21.5',
    hostState,
    timestamp: Date.now(),
    items: HERMES_CAPABILITY_CATALOG,
    discoveredTools,
    discoveredSkills,
    discoveredPlugins,
  };
}
