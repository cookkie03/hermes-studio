# F7 — Dots linked to Hermes Bots and avatars

<!-- implementation-packet:start -->
## Assignment for the implementation chat

When this feature card is attached as a development assignment, implement and verify **only the F7 frontend/integration**, following the workflow below and this card’s specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before writing code. “Documented/not implemented” statements describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** GUI adaptation and integration with existing Hermes capabilities, not creation of the backend feature. The Fxx split provides ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Change Dot avatars and link UI identities to Hermes Bots/profiles through verified bindings.

**Backend and boundary:** Avatars are UI metadata; Bots, canonical conversations and profiles belong to the Hermes runtime and are distinct from temporary delegates. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** D38: a shared Space linked to the chosen specialist’s profile project; individual memory and no implicit changes to active work. D37: each connected runtime presents its own Bots as Dots through the native roster, without manual recreation; F7 owns this. Also apply D36 below: a side panel for temporary children; persistent Dots in their own chat, attributed messages and runtime-confirmed activity. Create/Edit Dot includes a picker for the four OpenDots avatars; the header shows Bot/Space/host/model/effort without attributing a global default to an individual bot. Reading the [shared GUI requirements](gui-context-and-references.md) is mandatory; apply the requirements assigned here and leave other functions to their respective owners.

**Dependencies and additional reading:** A: independent local avatars; B: bindings require F1 and a verified roster. F6/F2 own Space/session context; do not derive it from the Dot name. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills section and gates. Verify actual files, methods and version; future paths are not already existing APIs.

**Mandatory specific tests for the relevant increment:** Invalid/legacy/restart avatars, namesakes, stale roster, offline bots, different profiles, selection changes with late events and no copies of personal memories. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** Working increment code, relevant tests with recorded commands/results, typecheck/build of the changed dependency graph and a proportionate .app smoke test. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the specification/principles, fix identified issues, and update status/gates in this card and MEMORY/STATUS/WORKLOG. Declare unperformed tests and external blockers; completion requires proven increment gates. Git: select only your own files after inspecting diff/index/secrets; push/publish according to current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with this card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


<!-- feature-guidance:start -->
## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) preserves all collections; load skill bodies only when relevant.

### Specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | If upstream schemas/events are uncertain: documented primary-source research |
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | When domain identities, states or terms change |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — conditional | If a reproducible connection or lifecycle error emerges |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — conditional | React components and renderer state |

### Entry points to read

- [docs/research/hermes-desktop-reference.md](<../../docs/research/hermes-desktop-reference.md>): Identity and runtime map.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Current owned binding.
- [desktop/upstream/src/server/workspace.ts](<../../desktop/upstream/src/server/workspace.ts>): Local Dots.
- [desktop/upstream/src/client/WorkspaceDialog.tsx](<../../desktop/upstream/src/client/WorkspaceDialog.tsx>): Local configuration.
- [Hermes: tools/bot_mode_dm.py](</Users/luca/.hermes/hermes-agent/tools/bot_mode_dm.py>): Canonical Bots and gating; source reading at the pinned version, not a live test.
- [docs/features/F1-runtime-connection.md](<../../docs/features/F1-runtime-connection.md>): Connection scope.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Evidence boundary

Status: **documented, not implemented** (2026-10-04). This specification describes a future Hermes Studio slice; available upstream code does not mean the capability is connected in the app. Evidence: source checkout reading at `/Users/luca/.hermes/hermes-agent`, not live execution, with no personal prompts/configuration/databases. Authoritative reference: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). The remote version may change: pin the SHA and repeat contract tests before implementation.

First read `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` and `desktop/hermes/README.md`. The user chose OpenDots UI; Hermes remains the only executor. The Studio endpoints described below are **proposals**, not existing APIs.

## D26 — Selectable OpenDots avatar

Confirmed request: choose the desired avatar and see a preview in the Create Dot and Edit Dot dialogs. **F7-A** increment, local and selectable independently of the F7-B Hermes binding; it does not require a connection, a new profile or runtime credentials.

Studio source evidence: `public/dots/` contains four OpenDots images (`blue.png`, `mint.png`, `orange.png`, `purple.png`). Mascot.tsx currently selects the character from an identity hash; WorkspaceDialog does not expose avatar selection. No other avatar images were found in this snapshot. Use the complete local catalog of available assets; navigation icons/favicons are not automatically characters. Extra assets, uploads or generated avatars are future work, not required by the first slice.

Form: grid with four previews and readable names, selection visible without color, preview alongside name/role. Explicit save together with Dot data; Cancel does not persist. In Edit, load the previously saved choice. Sidebar/header/chat/team reuse the same avatar. If an image is missing, use a stable, readable fallback, never a random change on every render.

Data proposal: `avatarId` with an allowlist and stable ID, distinct from dotId, Hermes profile and activity state. Do not accept arbitrary paths/URLs as avatarId. Existing Dots without the field retain their current deterministic character until the user chooses. Changing the avatar does not recreate sessions, change role/tools/permissions or implicitly modify runtime `profiles.set_asset`.

Additional skills for F7-A: [frontend-design](../../.agents/skills/frontend-design/SKILL.md), [axiom-accessibility](../../.agents/skills/axiom-accessibility/SKILL.md) for keyboard/focus/labels, React and UI-test already listed above. Read [Mascot.tsx](../../desktop/upstream/src/client/Mascot.tsx), [WorkspaceDialog.tsx](../../desktop/upstream/src/client/WorkspaceDialog.tsx), [types.ts](../../desktop/upstream/src/shared/types.ts), [workspace.ts](../../desktop/upstream/src/server/workspace.ts), [workspace-routes.ts](../../desktop/upstream/src/server/workspace-routes.ts) and [PROVENANCE](../../desktop/upstream/PROVENANCE.md). Preserve asset licensing.

F7-A gates: every asset selectable; create/edit/save/reopen/restart persist the same choice; Cancel and failed saves preserve the previous identity; legacy fallback and missing assets; keyboard/radiogroup/focus; invalid IDs rejected server-side. No Hermes call required. Completing F7-A does not complete F7-B.

## Goal and use cases

User priority: recognize persistent bots, open their correct conversation and use them in projects. Distinguish a local Dot with role guidance from an actual Hermes profile; associate a Dot with an explicitly chosen bot; recognize namesakes on different hosts; recover Bot Chat after compression or restart. Do not confuse Hermes bots with Telegram bots or an always-running process.

## Domain and verified runtime contract

`profiles.list {include_sessions:true}` returns `profiles`, `bot_mode_protocol`, `install_id`; each row may have `canonical_session`, `worker_session`, assets and metadata. `profiles.describe`, `profiles.configure`, `profiles.create`, `profiles.get_asset/set_asset` are distinct RPCs. Creating a profile may copy credentials by default (`mirror_credentials`): do not treat creation as a harmless avatar change.

The upstream desktop defines canonical Bot Chat by **profile + exact title `Bot Chat`**, searches `session.list {title,include_hidden:true}` and the canonical registry; it does not choose the most recent session or maintain a simple pinned ID as authority. Compression may change the tip. A side chat does not replace Bot Chat. Bot Mode must be confirmed by the runtime, not activated by renaming a Studio conversation.

Primary sources: `tui_gateway/contracts/profiles_vault_complete_foreign_subagents.py:150–225`; `apps/desktop/src/AGENTS.md` Bot Mode section; `apps/desktop/src/plugins/hermes-bots/routing.ts`, `roster-actions.ts`, tests `bot-row-opens-canonical-chat.test.ts` and `reclaim-refresh-in-place.test.ts`. Connection/profile contract: `apps/desktop/src/sdk/profile-routing.test.ts`.

## UX and states

Dots list with visible type “Local Dot” or “Hermes Bot”, identity `{connectionId,installId,profile}`, role/avatar and documented state. “Connect bot” shows the authorized roster; preview does not open/transmit history. States: disconnected, discovering, available, resolving canonical chat, connected, capability unavailable, stale route, identity conflict. Repeated clicks adopt the same chat; no automatic Studio intro prompt during discovery.

## Seam, ownership and dependencies

For F7-B, implement a read-only identity adapter in new `desktop/hermes/bots.mjs`, contracts in `bots.test.mjs` and UI in `BotBindingDialog.tsx`; agreed changes to bridge/server, shared types and WorkspaceDialog. Separate, versioned Studio mapping, `{dotId,connectionId,installId,profile,kind}`; do not overwrite Hermes config/profile. F7-B depends on F1 connection/profile routing and F2 conversations; F7-A avatars depend only on the local baseline and F4; enables F14/F10. Bot creation/configuration is a separate increment after the roster and canonical resolver.

## Privacy, migration and non-goals

Showing the roster does not authorize importing all chats or cloning credentials. Migrate existing Dots as local, without automatic conversion. An unconfirmed binding remains inactive; explicit import of external chats requires a different gate from the current owned whitelist. Do not manage Telegram channels, SOUL/MEMORY copies or profile deletion in this slice.

## Acceptance and DoD

Fixture with two hosts/namesake profiles: no collisions; correct hidden canonical session and lineage; newer side chat not adopted; backend disconnect preserves metadata; double-click race does not create two chats; unknown profile rejected. A subsequent isolated test demonstrates canonical resume without reading other archives. DoD: UI+adapter+reversible schema migration, ownership/routing tests, packaged build, documentation and updated STATUS/WORKLOG; capability shown only after a runtime response.

## Shared requirement: Hermes context and composer

Read [visible context, Spaces/projects, @ files/lines and / skills/tools](gui-context-and-references.md). The header identifies the chat/bot’s actual Space, host, model and effort. Capabilities and mutations remain in the Hermes backend; do not simulate unsupported values or actions. Specific ownership is in the cross-feature card.

## D36 — Activity and messages in the Dot’s conversation

Each persistent Dot shows activity in the sidebar and its own header when Hermes confirms it is working. Distinguish inactive, queued, running, awaiting approval, completed, failed and unknown/stale states within the limits of actually exposed data. Do not infer Working from sending a message or a queued ack.

When another Bot sends it a message, the recipient retains its canonical conversation: selecting that Dot shows the incoming message, attributed to the sender, and the recipient’s work. The unread badge indicates an actually available message and remains independent of activity. Identity is scoped to connection/profile/session, not avatar name. Do not turn a delegate_task child into a persistent Dot or show Dots in the sub-agent panel.

Gates: A sends to B, B receives and works; switching to B shows the correct message and state, without events from A or a namesake Bot on another host. If receipt or execution is unconfirmed, show the limitation; an active Dot is not marked read merely because it started working.

## D37 — Each runtime brings its own Bots into Studio

When a Hermes runtime is connected, Studio discovers and presents all its authorized Bots as Dots, preserving native identity. Do not require manual recreation of every Bot or creation of a local Dot before it can be seen. Discovery uses the verified native roster (see contracts and sources in [F7](F7-bots-and-identities.md)), not a list invented by the frontend. A profile not confirmed as a Bot is not automatically promoted to Bot.

Identity is scoped to connection/runtime, installation and profile: namesake Bots on different hosts remain distinct, with recognizable host/origin. Selecting a Dot opens that runtime’s canonical Bot Chat according to F7/F2, preserving native session and continuity; it does not create a substitute chat or send introductory prompts. Space, model and effort show the actual available context without associations inferred from names.

Roster discovery does not import all conversations, clone Bots, credentials or memories, or start work. Local metadata/avatars remain presentation. Reconnection refreshes the roster without duplicates; an offline backend shows known Bots as offline/stale, without hiding their origin or attributing activity. Additions/removals follow runtime-confirmed data; disconnecting Studio does not delete Bots or backend work. Temporary delegate_task children remain in the D36 sub-agent panel, not the persistent roster.

**Ownership:** F1 supplies connection and runtime identity; F7 discovers/maps/presents the roster and resolves Bot Chat; F2 presents conversations and events; F4 makes Dots and hosts navigable; F14 connects native messages and activity. Verify capabilities/schema in the connected runtime; a missing contract is a visible limitation, not authorization for an alternative backend.

**Gates:** connect two synthetic runtimes with namesake Bots and different rosters; all authorized Bots appear without manual creation, with correct identities and canonical chats. Refresh/reconnect does not duplicate rows; additions/removals, non-Bot profiles, denied scope, offline and host changes during discovery do not contaminate the roster. No prompts, cloning or global history import merely from connecting. Source contracts are documentary evidence, not live proof.

## D38 — One shared Space, multiple specialists and profile projects

Vision confirmed by the user on 2026-10-05: Studio shows a single Finance Space; choosing Product Manager or CTO resolves the Hermes project of the respective profile. Specialists are not permanently tied to one Space: specialist + Space selection concerns the current work/chat. The same specialist retains identity and memory when switching to Maintenance.

A Hermes project is scoped to its profile (`HERMES_HOME/projects.db`), not a global project shared by all Bots. The Studio Space stores explicit associations to native projects identified by connection/runtime, profile and projectId; multiple associations may point to the same files on the same host. Do not merge projects by name, duplicate files or create a distributed backend.

If the chosen specialist has no link, propose selecting an existing project from their profile or registering the folders through supported Hermes APIs, after an explicit choice. Present profile/host/folders before confirmation; no hidden creation/configuration. The link is confirmed only after the runtime result. The catalog may be partial/offline: show the limitation rather than recreating projects.

SOUL, MEMORY and USER remain owned by each Hermes profile; a shared USER is not required. Personal memory and procedures are not merged on entering a Space. Shared project files and project skills discovered by the runtime in the actual context are distinct from Bot memories; membership or a message does not grant access to other profiles’ files, memories or tools.

F6 owns Space/project associations; F7 Bot identities; F2 chat selection and context; F14 cross-profile collaboration. For the canonical Bot Chat, verify how to apply project/cwd while preserving Bot Mode capabilities: do not promise independent parallel sessions of the same Bot or change an active turn’s context. If necessary, block/defer the switch with an explicit state. Calling the CTO does not automatically assign the PM’s Space: resolve the CTO’s link and verify context/grants before declaring shared work. Different hosts do not imply a shared filesystem.

**Gates:** one Finance Space and two PM/CTO profiles, distinct native projects pointing to the same files; both open the correct context with their own memory and confirmed Space/host/model/effort headers. The CTO switches to Maintenance without losing identity or moving ongoing Finance work. Missing links with explicit proposals, unsupported APIs, namesake projects, offline/reconnect, denied grants, switching during fetch/turns and collaboration without implicit access. No file copies, no profile merges, no Hermes changes solely from UI selection. Accepted requirement; implementation and runtime tests remain pending.

## Ready-to-use prompt for a new Codex chat

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section. Implement only the selected increment: F7-A local avatars or F7-B bot binding. For F7-A, use all four available OpenDots assets, a picker in Create/Edit Dot, validated and persistent avatarId, a stable legacy fallback and consistent rendering everywhere. Preserve identities/sessions/permissions and do not configure Hermes for a cosmetic change. For F7-B, follow the roster/canonical resolver and isolated tests described below. No other automatic increment; update gates and documentation. Also follow the F7 Assignment for the implementation chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
