# F11 — Hermes plugins, skills and capabilities GUI

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the frontend/integration F11**, following the workflow below and the card-specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before coding. The “documented/not implemented” labels describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** GUI adaptation and integration with existing Hermes capabilities, rather than creating the feature in the backend. The Fxx separation establishes ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Make the skills, commands, toolset/plugin/MCP catalogs actually exposed by Hermes visible and manageable.

**Backend and boundary:** Scoped Hermes registries/APIs; commands.catalog read in the source, tool catalog/direct execution to be verified, no invented generic RPCs. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** / opens Commands/Skills/Tools categories with progressive filtering, description, availability and scope. Selection inserts context or invokes a supported action, with explicit behavior. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements identified here and leave other functionality to its respective owners.

**Dependencies and additional reading:** F1/F3, F2 composer, F4 popover/F8 notes. The Hermes catalog is not this chat’s Codex skill catalog. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Required specific tests for the relevant increment:** Host/profile changes during fetch, stale/offline catalog, skill updated after the turn, disabled/read-only, invalid parameters and no installation/enabling through selection alone. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified graph and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the spec/principles, fix discovered issues, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare tests not performed and external blockers; completion requires proven increment gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within actual authorizations and capabilities, without another general interview.
<!-- implementation-packet:end -->


<!-- feature-guidance:start -->

## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Separate tool/plugin/skill contracts |
| [find-skills](<../../.agents/skills/find-skills/SKILL.md>) | Discovery of skills needed for the work, if a capability is missing |
| [skill-installer](</Users/luca/.codex/skills/.system/skill-installer/SKILL.md>) — conditional | Only installation of necessary, authorized development skills; not a Hermes plugin installer |
| [skill-creator](</Users/luca/.codex/skills/.system/skill-creator/SKILL.md>) — conditional | If a new development skill is requested |
| [security-diff](</Users/luca/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.31/skills/security-diff-scan/SKILL.md>) — conditional | If the chat requests review of a diff that changes privileges/installation |

### Entry points to read

- [docs/agents/skills-catalog.md](<../../docs/agents/skills-catalog.md>): Inventory of development skills versus Hermes runtime skills.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Authorization gates.
- [desktop/hermes/gateway.mjs](<../../desktop/hermes/gateway.mjs>): Allowlist and transport.
- [Hermes: tui_gateway/contracts/tools_mcp_plugins.py](</Users/luca/.hermes/hermes-agent/tui_gateway/contracts/tools_mcp_plugins.py>): Registry, plugins and MCP; source reading at the pinned version, not a live test.
- [Hermes: apps/desktop/src/contrib/plugins.ts](</Users/luca/.hermes/hermes-agent/apps/desktop/src/contrib/plugins.ts>): Desktop reference; source reading at the pinned version, not a live test.
- [Hermes: apps/desktop/src/contrib/plugins-store.ts](</Users/luca/.hermes/hermes-agent/apps/desktop/src/contrib/plugins-store.ts>): Official plugin store; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Evidence boundary

Status: **documented, not implemented** (2026-10-04). This spec describes a future Hermes Studio slice; available upstream code does not mean the capability is integrated into the app. Evidence: reading the source checkout `/Users/luca/.hermes/hermes-agent`, not live execution, with no personal prompts/configuration/database used. Authoritative reference: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). The remote version may change: pin the SHA and repeat contract tests before implementation.

First read `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` and `desktop/hermes/README.md`. The user selected the OpenDots UI; Hermes remains the only executor. The Studio endpoints described below are **proposals**, not existing APIs.

## Goal and use cases

Know which tools the bot can use now, why a plugin is missing and what changes when it is enabled. Discover deferred tools and skills without configuring a second CopilotKit ecosystem. Plugin management is initially read-only; install/update/remove are explicit increments.

## Verified runtime contract

RPC `tools.list {session_id?}` returns toolsets with tools/enabled; `toolsets.list` summary, `tools.show` includes deferred tool_search. `tools.configure {action:enable|disable,names,session_id?,profile?}` **persists configuration and rebuilds the agent**, rather than being a simple UI preference. `plugins.list` and `plugins.manage {profile?,action,key?,name?,...}`: actions list/toggle/install/update/remove/settings/onboarding. Update may require `accept_capabilities` for an authorization delta; settings values use a non-secret schema. `skills.manage`, `skills.reload` and MCP catalog/server contracts remain distinct. Source `tui_gateway/contracts/tools_mcp_plugins.py:1–100,203–235,566–771`; implementation `methods_tools.py`.

Desktop reuses `apps/desktop/src/contrib/plugins.ts`, `contrib/plugins-store.ts`, the profile routing SDK and Hermes Bots plugin UI. Upstream slash discovery `commands.catalog` and `complete.slash` includes skill/user quick commands; do not hide all extensions to curate the palette. Source `apps/desktop/src/AGENTS.md` Slash commands.

## Domain and UX

CapabilitySnapshot identified by connection/profile/session/revision; PluginInstall, PluginActivation and SecretRequirement are distinct. States unavailable/discovering/installed/disabled/activating/active/needs credentials/restart required/update requires review/failed. “Installed” does not mean an active MCP server or enabled tool. The change dialog shows the actual recipient, delta and effect on sessions; apply only after concrete confirmation. Credentials do not belong in the renderer or metadata.

## Seam, ownership and dependencies

New `desktop/hermes/capabilities.mjs`, `capabilities.test.mjs`, `CapabilitiesPanel.tsx`; the bridge allows only scoped allowlisted RPCs, never an arbitrary request(method) endpoint. Depends on F1 for scope/connection, F7 if associated with a Bot and F3 for approvals; unlocks F12/F16 and F14 diagnostics. Start with read-only snapshot+refresh+errorreason; then persistent management with per-profile serialization and rollback/outcome. Reuse upstream manifests, not unverified generic catalogs.

## Privacy, migration and non-goals

Do not read `.env`, tokens or plaintext vaults to populate the UI. Do not transfer local Dot toggles to tools.configure: researchAllowed/memoryAllowed fields were not runtime ACLs. Migration labels them as context or retires them through a choice, without changing Hermes. Do not install updates automatically or interpret documents/tool results as authorization.

## Acceptance and DoD

Fixtures for enabled tool versus inactive server, unknown/deferred tools, profile collision, capability update denial, widened update delta, rejected secret settings, stale session rebuild and restart failure. Read-only DoD: UI capability gating used by other features, scoped contract tests and packaged smoke; additional management DoD includes isolated installation/reversibility and runtime consent. Record provenance/version; no available label before a live check.

## D30 — Hermes catalog parity and learning visibility

[F8](F8-hermes-native-features-and-observability.md) maps native capabilities/outcomes to the UI. F11 preserves the Hermes profile’s skill/plugin/toolsets catalog and authorized management; no parallel Studio library. Received skill/review/curator updates can refresh the view with freshness and origin, rather than triggering installations/runs. Do not hide deferred tools to match the OpenDots template. Post-turn chat signals belong to F8-A/F2.

## D34 — Runtime settings in the Hermes section

Toolsets, plugins, skills and MCP must be reachable from Hermes settings for the correct host/profile when supported. F11 maintains schema, authorization and receipts for these mutations; F4 organizes the dedicated section, F8 documents coverage/gaps. Do not mix Hermes settings with standalone Studio preferences or duplicate configuration in the client.


## New chat prompt

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Implement F11 read-only capabilities with a scoped allowlist, using contracts/tools_mcp_plugins and desktop contrib/plugins. Start with toolsets/tools/plugins and installed≠active states. Do not install plugins or modify personal configuration during tests. If extending to management, prepare a concrete diff/review for capability deltas, vault-safe settings and rollback. Complete DoD and update docs; preserve deferred Hermes tools. Also follow the Assignment for the implementing chat for F11: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions still apply.
