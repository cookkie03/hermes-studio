# F9 — Space Markdown memory and memory integration

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the frontend/integration F9**, following the workflow below and the card-specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before coding. The “documented/not implemented” labels describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** GUI adaptation and integration with existing Hermes capabilities, rather than creating the feature in the backend. The Fxx separation establishes ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Show legacy preferences and Space Markdown memory; any built-in mutations must use supported Hermes interfaces.

**Backend and boundary:** Project files and Hermes memory are separate; no second store is reinjected, and review/curator/scheduler remain runtime-owned. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** Space/profile/file origin, revision and update status are visible; @ can reference the file/range using the same F5 contract. F8 owns the runtime viewer. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements identified here and leave other functionality to its respective owners.

**Dependencies and additional reading:** F5 writer/F6 projects/F3 gates; automatic updates require an already-supported Hermes path and explicit selection, not a Studio learning worker. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Required specific tests for the relevant increment:** Preservation of corrupt legacy data, stale file/range updates, manual sections, restart, pending/overflow/session snapshots, isolated profiles and absence of implicit imports. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified graph and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the spec/principles, fix discovered issues, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare tests not performed and external blockers; completion requires proven increment gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within actual authorizations and capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: documented, not complete; D28/D30 update, 2026-10-04. Local MVP content is preserved. [F8](F8-hermes-native-features-and-observability.md) owns Hermes memory visualization and native notes; this card does not create a second runtime store.

<!-- feature-guidance:start -->

## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | Studio memory separate from Hermes memory |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | React components and renderer state |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — conditional | Packaged UI verification with synthetic data and actually available tools |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) — conditional | Scope and local persistence |
| [research](<../../.agents/skills/research/SKILL.md>) — conditional | Only if runtime memory integration is selected |

### Entry points to read

- [desktop/upstream/src/client/WorkspaceDialog.tsx](<../../desktop/upstream/src/client/WorkspaceDialog.tsx>): Memory surface.
- [desktop/upstream/src/server/workspace.ts](<../../desktop/upstream/src/server/workspace.ts>): Local metadata.
- [desktop/upstream/src/server/store.ts](<../../desktop/upstream/src/server/store.ts>): Persistence.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Context inclusion.
- [Hermes: tools/memory_tool.py](</Users/luca/.hermes/hermes-agent/tools/memory_tool.py>): Reference separate from the Studio client; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Outcome and increments

**F9-A — Local/legacy scopes:** show existing Studio preferences with clear origin and links to Space/runtime sections. No implicit import/migration; preserve unreadable stores. Do not reinject copies of Hermes memory.

**F9-B — Space Markdown memory:** select/create a file in the authorized folder, with readable path, revision, latest outcome and status. Prerequisites F6/F5; the filesystem is authoritative. `MEMORY.md` is a possible name, not an automatic Hermes discovery capability. Avoid collisions with existing files.

**F9-C — Optional built-in management:** any add/replace/remove/pending/approve/reject operations on Hermes profile memories must use a supported backend contract, only if this increment is selected. F8-B remains a read-only viewer. Do not use `/api/memory` status as CRUD or direct writes that bypass gates/locks/format; F1/F3 tests and permissions are required.

The former F9-D (learning/curator) is assigned to **F11 for skill management/maintenance** and **F8 for visibility**. These remain separate future selections, not implicit F9 activities.

## Space file updated during work

Significant events: confirmed decision, saved result, verified milestone and assignment closure. Define the mode in the feature chat: manual with diff/Save or automatic within selected files/scope. The agent prepares changes with source/chat/execution, decisions, status/next step and result links. Show policy, revision and applied outcome; “remembered” text does not prove a write.

Use F5 writer/revision/conflict; preserve manual sections and drafts, and reread the version before saving. External changes are not overwritten. No endless journal: a current summary with links to history. A saved file does not prove an active assignment read it; inclusion/reading per assignment is explicit and versioned. A remote host requires a reachable root/grant, not merely a Mac path in the prompt.

Creating and updating files in a personal vault requires a destination selected in the app: no personal seed/import/scan at startup, no automatic writes to existing files with the same name or AGENTS/SOUL instructions.

## Runtime contracts to consult for F9-C

[Official Persistent Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/) and the [complete overview](../research/hermes-memory-system.md) are the technical references for USER/MEMORY, frozen snapshots, budgets, pending changes, tool format, providers, recall and compaction. [Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator/) and [Memory Providers](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory-providers/) are further reading, not prerequisites for a local Space file.

Preserve Hermes content/profiles without migration: profile memory, SOUL identity, history and project files are separate. Backend gates determine staged/applied; a new session is distinct from resume. The viewer belongs to F8; do not implement skill/provider management merely to activate a Studio checkbox.

## UI, ownership and privacy

Local/Space memory shows origin and path, policy, draft, error/conflict and latest confirmed write. The Profile viewer and post-turn notes belong to F8, and Dot identity to F7. Loading, empty, offline/stale and error states are distinct. Save/Cancel/focus/keyboard/Reduced Motion follow [component-system](../design/component-system.md).

F9 owns the Space/legacy memory workflow and any selected built-in mutations; F5 owns the writer, F6 the editor, F7 binding, F1 transport and F3 grants. [Shared boundaries](../architecture/feature-boundaries.md). No memory text/full prompts in logs/Git; data sent to the runtime may reach the selected provider. No reset, purge or provider installation on opening.

## Definition of done per increment

A: visible origins/scopes, legacy data preserved across restart and errors, no duplicate inclusion or import. B: synthetic folder, creation/update/restart, external conflict and significant event tested; manual content preserved; reading per assignment/version demonstrated. C: mutation actually applied or pending, approve/reject/stale target/overflow, fresh session versus resume, profile isolation and unreadable file without reset. Every increment: packaged UI, focus/keyboard/900px, privacy and no personal data modified by tests.

## Prompt for a new chat

> First follow docs/agents/feature-workflow.md and F9 Files and skills. Implement only the selected F9-A/B/C; Hermes viewers and notes belong to F8, skill maintenance to F11. For Spaces use F5 root/revision/writer and the F6 editor, without copying files into a new store. For any runtime mutations read Persistent Memory and docs/research/hermes-memory-system.md, verify the isolated profile contract/gates, and do not write built-ins directly. Test outcomes/restart/conflict and significant updates with synthetic data. Update the card, STATUS, MEMORY/decisions if direction changes, and WORKLOG; review before committing. Also follow the Assignment for the implementing chat for F9: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions still apply.
