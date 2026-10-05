# F8 — Hermes capability and memory visibility

<!-- implementation-packet:start -->
## Assignment for the implementation chat

When this feature card is attached as a development assignment, implement and verify **only the F8 frontend/integration**, following the workflow below and this card’s specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before writing code. “Documented/not implemented” statements describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** GUI adaptation and integration with existing Hermes capabilities, not creation of the backend feature. The Fxx split provides ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Expose native Hermes capabilities, memory and updates while preserving backend authority and scopes.

**Backend and boundary:** review.summary and read-only memory/capability contracts at the verified version; memory/procedures remain in Hermes. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** Persistent post-turn notes in the correct chat; scoped viewer; coverage of Computer Use F16, browser F12, commands/skills F11 and actual settings with explicit gaps. Reading the [shared GUI requirements](gui-context-and-references.md) is mandatory; apply the requirements assigned here and leave other functions to their respective owners.

**Dependencies and additional reading:** A notes, B viewer, C map: select one; F2 timeline/F1 routing/F7 profile. Assign discovered native functions to their owners rather than implementing all of them in F8. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills section and gates. Verify actual files, methods and version; future paths are not already existing APIs.

**Mandatory specific tests for the relevant increment:** Review after turn completion, pending versus applied, notifications off, dedup/replay/restart, events from another session, changed profile and a status API without content. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** Working increment code, relevant tests with recorded commands/results, typecheck/build of the changed dependency graph and a proportionate .app smoke test. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the specification/principles, fix identified issues, and update status/gates in this card and MEMORY/STATUS/WORKLOG. Declare unperformed tests and external blockers; completion requires proven increment gates. Git: select only your own files after inspecting diff/index/secrets; push/publish according to current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with this card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: documented D30, 2026-10-04; new card for a dedicated chat, no implementation selected. The user wants to preserve all Hermes backend functions and see/use them from Studio, as in the official desktop. Memory remains in Hermes: this feature designs its presentation, not a new engine or memory archive.

## Autonomous continuity requested in F1 — D33

User principle: Hermes works 24/7 independently of whether Studio is open; Studio facilitates and displays the complete Hermes backend. Routines/cron, heartbeat, bots, tools and memory retain native Hermes ownership. Configuration, host/service state and results must remain observable after reopening, with actual outcomes. No alternative timer/heartbeat/executor in the client and no backend shutdown on closing. This requirement is not yet a duration or post-restart execution test; revisit [F1/D33](F1-runtime-connection.md#principio-cardine--hermes-autonomo-studio-facilitatore-d33) and this card’s specific gates before implementation.

<!-- feature-guidance:start -->
## Files and skills to read and use

First follow the [shared ask-matt workflow](../agents/feature-workflow.md), the [principles](../architecture/principles.md), [F1](F1-runtime-connection.md) and only this card. The [project/global skills catalog](../agents/skills-catalog.md) contains development tools; it is not the user’s Hermes profile skill catalog.

| Skill | Application |
|---|---|
| [ask-matt](../../.agents/skills/ask-matt/SKILL.md) | Select the single increment and reading |
| [codebase-design](../../.agents/skills/codebase-design/SKILL.md) | Small event/projection contract, ownership and resume invariants |
| [documentation-and-adrs](../../.agents/skills/documentation-and-adrs/SKILL.md) | Capability map, version, gaps and evidence |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | UI and updates after turn completion |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — conditional | .app/renderer tests with synthetic data |
| [research](../../.agents/skills/research/SKILL.md) — conditional | Contract gaps not resolvable from pinned sources |
| [diagnosing-bugs](../../.agents/skills/diagnosing-bugs/SKILL.md) — conditional | Reproducible lost/duplicated/misattributed events |

Studio entry points: [gateway.mjs](../../desktop/hermes/gateway.mjs), [bridge.mjs](../../desktop/hermes/bridge.mjs), [Chat.tsx](../../desktop/upstream/src/client/Chat.tsx), [App.tsx](../../desktop/upstream/src/client/App.tsx), [WorkspaceDialog.tsx](../../desktop/upstream/src/client/WorkspaceDialog.tsx), [workspace.ts](../../desktop/upstream/src/server/workspace.ts). Agree on ownership with F2/F11/F1/F9 before coding.

Hermes entry points, public source only: `tui_gateway/contracts/events.py`, `tui_gateway/server.py::_wire_session_agent`, `agent/background_review.py`, `apps/desktop/src/app/session/hooks/use-message-stream/gateway-event/status.ts`, `apps/desktop/src/components/assistant-ui/thread/system-message.tsx`, `apps/desktop/src/api/system.ts`, `apps/desktop/src/api/skills.ts`, `apps/desktop/src/types/hermes.ts`, `hermes_cli/web_routers/ops.py` and `tools_mcp_plugins.py` contracts. Pinned sources and limitations below; do not read personal homes/databases/skills to prepare the feature.
<!-- feature-guidance:end -->

## Product rule

Studio adapts OpenDots/Unsloth/Codex surfaces to the Hermes runtime, preserving its tools, memory, learning, profiles, scheduler and approvals. It does not deliberately restrict the runtime to the subset provided by the OpenDots template. A supported backend function must have a UI destination or an explicit gap in the map, rather than silently disappear.

This is a **functional** parity goal, not a promise that all capabilities are already implemented or an obligation to copy their UI. Progressive disclosure is allowed; absence from the composer must not disable Hermes. Do not alter config/tools/memory/curator to simplify the screen. No automatic memory import or duplication into Studio metadata.

## Initial ownership map, not a complete runtime inventory

| Hermes capability | Studio destination | Owning card |
|---|---|---|
| Sessions, model/effort, context, streaming, commands, tool results, interruption/resume | Chat/composer/activity details | F2/F1; F8 preserves signals and coverage |
| Built-in memory and providers, identity and learning | Profile Memory, origin/budget/pending details; identity in the Dot | F8 viewer, F7 identity, F9 only Space/legacy additions |
| Post-turn memory/skill review | Discreet conversation row, details and link to affected content when resolvable | F8 adapter/receipts; F2 renderer |
| Skills, curator, plugins, MCP/toolsets/deferred tools | Capabilities/Skills, profile state and maintenance | F11 management; F8 notification/state visibility |
| Bots, messaging, delegate task | Dots/chat/team and distinct receipts | F7/F14 |
| Scheduler/routines, executions and delivery | Routines, history and host state | F10 |
| Browser/search, computer use, files/artifacts, terminal | Computer and results with origin | F12/F16/F5/F15 |
| STT/TTS and voice conversation | Composer/voice/playback | F17 |
| Approvals, input requests, grants | Controls associated with actual owner/action | F3 |

In the implementation chat, build a matrix for the **connected version/profile**: feature/tool/event → contract → surface → state (backend-supported, connected, verified, unavailable/gap) → evidence. Dynamic discovery plus a versioned map; do not certify everything from endpoint counts. Each family remains with its card; F8 does not incidentally implement browsers, routines or plugins.

## Runtime memory to observe without copying

The user opens Memory and chooses the associated Dot/profile/host. Show actually readable content, provenance, known updates and verified USER/MEMORY budgets; separate SOUL identity, active provider and recall/skill/curator state where supported. No memories created on first launch and no personal seed read implicitly. A new Dot does not create its own runtime archive without an F7 binding.

Authoritative source: Hermes profile. Any UI caches/snapshots are derived data with provenance and freshness, not memories reinjected into the agent or a second writer. Offline resume indicates the last observation, not current data. F9 Space files and legacy preferences have distinct sections/scopes.

**Verified gap:** `/api/memory` returns provider and file sizes **in bytes**, not full text, character budgets or a mutation list. Do not use it as CRUD or a percentage of the 2,200/1,375-character limit. The viewer must find a supported scoped read-only path (such as learning/detail or a compatible official surface), or document a required adapter; direct remote file access is not implicit. No generic profile filesystem exposure to the renderer.

Preserve every profile’s memory without aggregation: a UI selection does not grant global reads of unauthorized chats/profiles. The built-in snapshot in use and current memory on disk are distinct. F8 does not reset, migrate, delete or change providers; any runtime management belongs to F9-C/F11 with separate contracts and selection.

## Requested example: updates after a response

Public-source evidence SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`, 2026-10-04, no live test:

- The gateway emits **`review.summary`** through `background_review_callback`. Typed payload **`{text: string}`** in the session envelope; it does not include a structured mutation list or guaranteed message/turn ID.
- The official desktop intercepts the event in `status.ts` and adds it as a system message with the `review:` marker; `system-message.tsx` presents it as a memory/learning note. The code avoids relying on a single fleeting toast. This intention alone does not prove durable replay after restart: verify it.
- `background_review.py` summarizes successful tool results, distinguishes staged proposals from applied operations, and avoids inherited results already present. `display.memory_notifications` controls emission (off/on/verbose), not learning itself.
- The post-turn summary concerns **background review/self-improvement**. The curator is separate skill maintenance: do not call every update “Curator” or invent a `curator.updated` event. Curator run/status/report have their own paths and evidence.

UX: after the response text, show a row such as “Skills updated” **only if that is the received outcome**, or “Proposed change: awaiting approval”. A generic summary must remain generic if it contains no names/actions. Expandable details with runtime text, origin/profile and content links only for resolved targets. Do not infer names/files/rollback from localized prose.

A late event remains in its owner’s chat even after turn completion or a selection change. Attach it to an exact response only with supported correlation; otherwise show a timestamped session note, not a badge on an arbitrary latest message. Do not reopen Working for a post-turn notification or create another agent response. If runtime notifications are off, indicate that the memory view is available; do not invent updates or secretly reactivate notifications.

## Proposed Studio contract and resilience

F1 delivers authenticated/scoped events to the F8 projection; F2 displays receipts and notes, F11/F9 refresh relevant views. Proposed derived record with origin, connection/profile/session, type, permitted payload, timestamp and correlation/revision when actually present. This is not an existing backend schema. Preserve original text as text, not arbitrary HTML/links/file actions.

The subscription does not end when the response ends: review may finish later. No global listener forwarding events from unassociated personal sessions. Persist UI notes/receipts where specified; do not write Hermes memories to retain a notification. Dedup/replay uses backend IDs/checkpoints when available; without reliable identity, define limitations and do not promise exactly-once. Recovery must reconcile state/snapshots, not rerun reviews, skill writes or prompts.

Unrecognized new events: redacted diagnostics/counters for the map, not private dumps or automatic rendering of arbitrary payloads. Incompatible versions show gaps without losing already connected capabilities. Nothing in parity authorizes generic RPC calls, memory resets, curator runs, installations or automatic provider management.

## Increments to select

- **F8-A — Post-turn summaries:** adapt scoped `review.summary`, chat note, details and verified persistence/resume; no new memory archive required.
- **F8-B — Hermes memory viewer:** supported read-only profile/content access, freshness/budget/origin and refresh after events; explicit adapter gaps.
- **F8-C — Native feature coverage:** version/profile matrix, discovery and destinations; pass gaps to owning cards instead of implementing them all.

Dependencies A: F1 events + F2 timeline/owner; B: F1/F7 and a read-only contract, with F11/F9 links; C: F11/F1 capability discovery. UI component-system; keyboard/focus/details/Reduced Motion. Creating this card alone selects no increment.

## Definition of done

A: a fixture emits a summary after response completion and after switching chats; note only in its owner, not lost on panel closing/reopen/restart according to the contract; duplicate/replay/late event/disconnect/malformed handled. Isolated Hermes test of successful review distinguished from staging/failure; notifications off without false updates. Missing id/turn explained in limitations.

B: show synthetic memory already present in the backend without changing it, using two profiles and isolation; refresh/fresh session versus snapshot, bytes versus characters, offline stale and permission denied. Verify that opening Studio does not alter files/providers and that there is no second injection/duplicated memory. External sources not read without supported access.

C: every in-scope capability has a surface or tracked gap and ownership; deferred tools are not excluded merely because they are absent from the composer. Availability is proven, not inferred from names. A read-only gate does not prove management. Each increment: packaged UI, focus/accessibility, privacy, zero memory/credential logging, and evidence distinct from build/handshake.

## Sources

[Persistent Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/), [Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator/), [memory analysis](../research/hermes-memory-system.md). Pinned source: [events](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tui_gateway/contracts/events.py#L247), [gateway wiring](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tui_gateway/server.py#L1042), [review](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/background_review.py#L730), [desktop handler](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/apps/desktop/src/app/session/hooks/use-message-stream/gateway-event/status.ts#L175), [UI row](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/apps/desktop/src/components/assistant-ui/thread/system-message.tsx), [memory status](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/hermes_cli/web_routers/ops.py#L491).

## D34 — Chat coverage and native settings

Explicitly map all Hermes/TUI chat components: streaming, exposed thinking, tools, code/commands/output, changes, approvals/validation and chat controls. For each item, indicate contract/version, owning destination and evidence/gap. Also map all Hermes settings in the dedicated Hermes Settings section, per host/profile, distinct from Hermes Studio Settings. F4 owns the container and navigation; F8 coverage/provenance, not a generic configuration writer. Each mutation passes through the owning feature and F3 policy. No native function removed to adapt the template.


## User screenshot 2026-10-05 — Self-improvement review

Visual evidence supplied by the user: a persistent “Self-improvement review” notice beneath the response, with a proposed but unapplied memory replacement and `/memory pending` instruction for approve/discard. The screenshot proves the surface in Hermes desktop, not Studio integration or the proposal’s outcome. Local source verified at e1e82d782f: `apps/desktop/src/app/session/hooks/use-message-stream/gateway-event/status.ts` handler for `review.summary`, `components/assistant-ui/thread/system-message.tsx` renderer. F8-A adapts this native event; it does not build frontend self-improvement.

Studio must show a persistent note in the originating conversation, readable even if it arrives after turn completion or while another chat is selected. Present the original summary and runtime/profile/session scope; link to a turn only if proven by the contract. Do not rely only on toasts. Do not reactivate Working for the note.

Required cases: proposed memory **awaiting approval**, applied memory, a created or updated skill when confirmed by Hermes data. `review.summary` exposes text and does not guarantee structured mutations: preserve text without inferring success from keywords, tool names or a proposal. Do not label every review Skill Curator: curator and background review are distinct.

For pending, show the native `/memory pending` instruction. A “Review proposal” GUI action may open the F3/F8 surface only when the connected backend exposes a supported path; approve/discard require an explicit choice and runtime receipt, with no automatic application. Do not invent RPCs or treat notice text as authorization. If the command is not integrated, preserve the instruction and declare the limitation.

Gates: late note in the correct session, pending distinguished from applied, confirmed skill creation/updates, discarded/failed proposals, offline/replay without duplicates, restart with verified persistence and no arbitrary correlation to the latest response. Accessible, discreet UI with text in addition to color. This request updates specifications; selected F8-A implementation remains to be built/verified.

## Prompt for a new chat

> First follow docs/agents/feature-workflow.md and F8 Files and skills. Implement only selected F8-A/B/C: preserve Hermes capabilities and memory and present them in Studio, without a second archive/engine. Verify contracts/version and compare the official desktop handler. For A, use scoped review.summary even after turn completion, a persistent note and correlation only when proven; do not call everything curator or applied. For B, only supported reading of the selected profile, no import/reset/config change or reinjection. Map gaps to owning features rather than implementing them incidentally. Synthetic/isolated tests and packaged UI; update the card, MEMORY/STATUS/WORKLOG and review before committing. Also follow the F8 Assignment for the implementation chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
