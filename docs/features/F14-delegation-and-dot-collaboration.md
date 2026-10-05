# F14 — GUI for delegation and collaboration between Hermes Bots

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the F14 frontend/connection**, following the workflow below and the card’s specific sections. The attachment is the entry point: open linked workspace files and SKILL.md files before coding. “Documented/not implemented” labels describe the baseline; they do not require stopping at a plan in the assigned chat.

**Type of work:** GUI adaptation and connection to existing Hermes capabilities, not creation of the feature in the backend. The Fxx separation supports ownership, implementation, and verification in separate chats: the product remains a single OpenDots-style Hermes GUI.

**Outcome:** Present delegations and messages between Hermes bots with sender/recipient, receipts, and traceable results.

**Backend and boundary:** delegate_task, message_agent/bot relay/groups only if actually supported; persistent bot distinct from temporary subagent. Studio is a Hermes frontend/adapter: names and GUI may change, while agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** D38: shared Space linked to the project in the selected specialist’s profile; individual memory and no implicit change to active work. Also apply D36 below: side panel for temporary children; persistent Dots in their own chat, attributed messages and runtime-confirmed activity. Show Space and host for delivery and each collaborator; explicit shared context and scoped files/ranges, not access to the entire project through membership. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements specified here, leaving other functions to their respective owners.

**Dependencies and additional readings:** F7 bot/F2 transcript/F3 grants/F5-F6 references. No alternative orchestrator or messaging backend in Studio. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Mandatory specific checks for the relevant increment:** Two bots/profiles, identical names, ack versus reply, recall, offline/timeout, duplicate/replay, canceled delegation, and denied file/memory access. Use synthetic profiles and data; exercise the real interface. Fixtures, builds, handshakes, and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified dependency graph, and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility, and Reduced Motion. Review the diff against the specification/principles, fix issues found, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare unperformed checks and external blockers; completion requires evidence for the increment’s gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


<!-- feature-guidance:start -->

## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial readings, implementation/review skills, and exit criteria. Then read the feature-specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | If upstream schema/events are uncertain: documented primary-source research |
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | When identity, state, or domain terms change |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) — conditional | Separate Delegation, Message, and Group |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — conditional | If a reproducible connection or lifecycle error emerges |

### Entry points to read

- [docs/features/F7-bots-and-identities.md](<../../docs/features/F7-bots-and-identities.md>): Canonical identity.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Authorization and stale requests.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Owned transport.
- [Hermes: tools/delegate_tool.py](</Users/luca/.hermes/hermes-agent/tools/delegate_tool.py>): Temporary delegation; source reading at the pinned version, not a live test.
- [Hermes: tools/bot_mode_dm.py](</Users/luca/.hermes/hermes-agent/tools/bot_mode_dm.py>): Messages between bots; source reading at the pinned version, not a live test.
- [Hermes: tools/session_search_tool.py](</Users/luca/.hermes/hermes-agent/tools/session_search_tool.py>): History retrieval; source reading at the pinned version, not a live test.
- [Hermes: tui_gateway/contracts/groups_bot_relay.py](</Users/luca/.hermes/hermes-agent/tui_gateway/contracts/groups_bot_relay.py>): Relay/groups and scope; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. These readings do not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Evidence boundary

Status: **documented, not implemented** (2026-10-04). This specification describes a future Hermes Studio slice; available upstream code does not mean a capability is connected in the app. Evidence: reading the source checkout `/Users/luca/.hermes/hermes-agent`, not live execution, no personal prompt/configuration/database. Authoritative reference: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). The remote version may change: pin the SHA and repeat contract tests before implementing.

First read `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md`, and `desktop/hermes/README.md`. The user chose the OpenDots UI; Hermes remains the only executor. The Studio endpoints described below are **proposals**, not existing APIs.

## Goal and use cases

User priority: bots that collaborate, exchange messages, and retrieve relevant conversations. Expose recipient, responsibility, scope, and provenance: ask a persistent colleague for a result, follow a temporary delegation, resume a previous discussion, coordinate a group without duplicating work after a disconnection.

## Three distinct verified contracts

1. `delegate_task`: children with isolated contexts, `tasks:[{goal,context?,output_schema?,images?,group?}]`; `action` spawn/list/steer/stop, `subagent_id`, `message`. Requires parent agent context and runtime depth/concurrency limits. RPC `subagent.list`, `.tail`, `.interrupt` require the owning session; tail max16KB. These children **are not automatically Dots or durable Bot Chats**. Sources `tools/delegate_tool.py:474,683–760`, `tui_gateway/contracts/profiles_vault_complete_foreign_subagents.py:642–674`.
2. `message_agent {target,message}`: tool **injected only** into the managed canonical Bot Chat, not a global toolset. Target validated against the roster: local profile, peer/agent, handle@connection. Body max16,000 characters; attribution added server-side. Ack `queued`+delivery_id is a handoff, not a receipt; reply/failure arrives from the asynchronous process, with any `reply_delivery=poll` respected. The runtime checks the gate again; the UI must not enable it in an ordinary chat by changing its title. Source `tools/bot_mode_dm.py:1–130`. Cross-connection `bot_relay.roster.sync`, `.outbox.drain`, `.deliver {profile,message,from_*?}` (blocking reply), `.reply {id,reply?,error?,reason?}` require an owned relay, not improvised browser fanout. Contract sources `groups_bot_relay.py:508–570` and `methods_bot_relay.py`.
3. Persistent groups: `groups.capabilities`, `.create {room_id,name,members}`, `.send {room_id,event_id?,payload}`, `.log {room_id,since_seq?,limit?}`, `.state`, `.stop`, `.approve`, `.retry`. The log contains seq/event_id and gateway/epoch authority; explicit retry, disband tombstone, do not recreate uncertain tasks. Source `tui_gateway/contracts/groups_bot_relay.py:150–360`.

Recall: `session_search` searches/reads real messages (FTS5), not invented summaries: query/limit/sort/detail, or session_id/around_message_id/window; optional `profile` allows reading another profile. The `@session:<profile>/<id>` link preserves scope. This is not a verified tool named “bot_recall”. The description and session_id field have partially different wording: test read-alone and scrolling with an anchor on the pinned version. Source `tools/session_search_tool.py:651–779`.

## Domain, UX, and states

Separate DelegationRun, BotMessageDelivery, HostedRoom, and RecallResult. UI states: composing, queued, admitted, working, awaiting reply, reply received, declined, failed, delivery uncertain; “sent” only with a receipt. A Sub-agent side panel shows temporary children of the parent chat; each Dot’s conversation timeline shows messages between persistent bots, and a recall result shows profile/thread/message anchor. Initial recall scope: own chat + selected shared sources; extend to personal profiles only upon explicit choice. An approval notification on another thread must allow navigation.

## Seam, ownership, and dependencies

Depends on F7/F1 for identity and connection, F2 for history, and F3 for approvals. F11 is relevant only if the capability registry is expanded. New `desktop/hermes/collaboration.mjs`, `collaboration.test.mjs`, `CollaborationPanel.tsx`, `RecallResults.tsx`; agree on bridge/server/shared types. First slice observes real delegations and messages from two isolated bots. Second introduces a relay with single-owner claim and receipts; third groups/log replay. No parallel OpenDots executor. Proposed scoped Studio endpoints `/bots/:identity/messages`, `/collaboration/:room/log`, `/recall`; none currently exists.

## Privacy, migration, and non-goals

Never forward an entire private chat or spoof the sender; runtime target/author is authoritative. Scope and grants precede cross-profile reading. Preserve event_id/cursor/authority, receipts, and origin links without confusing session pins. Do not convert historical toolEvents into sent messages. Do not promise exactly-once with HTTP deduplication alone; remote networking and advanced group failover come later.

## Folder-based Space scope — D25

Collaborators work on real authorized F6/F5 Space files, with host/root/revision in handoffs. Membership does not grant access to other bots’ vaults or memory profiles; a message/delegation does not create a mount or copy a folder. Concurrent writes use the shared F5 writer and conflict handling. F9 project memory is distinct from each profile’s USER/MEMORY.

## D36 — Two distinct surfaces: subagents and Dots

**Temporary subagents:** control in the parent chat and a Codex-style side panel, with a list of session children and selectable detail. Show identity/assignment, actual state, Space/host/model/effort when supplied by runtime, authorized activity/output, and results. `subagent.list`/`subagent.tail`/`subagent.interrupt` are already cited source contracts, to verify in the connected backend; a bounded tail does not imply a full transcript or hidden reasoning. Steer/stop only through a supported native capability and relevant gates. Temporary children do not become persistent Dots.

**Persistent Dots:** remain in the sidebar and their own conversation, without a window or section in the subagent panel. In the sender’s chat, show a “message to [Dot]” event, permitted content, recipient, delivery ID, and actual state. On the recipient, distinguish the unread-message badge from the working indicator. Opening that Dot shows the received message with attribution and its canonical session’s activity. `message_agent` is available only in managed Bot Chats that expose it; no parallel chat created by the frontend.

**Semantics:** queued/ack does not confirm receipt, activation, or reply. Enable the Working indicator only with a proven Hermes state/event; if the contract is missing, document the gap and show an unverified state. Awaiting approval, failed, interrupted, and completed have distinct labels. No automatic retry on uncertain delivery. Concise indicators with accessible text; subtle motion only during confirmed activity and a Reduced Motion alternative.

**UI/runtime gates:** two synthetic Bots A→B→reply; verify sender timeline, message in recipient chat, and Working indicator from an actual event; ack without execution does not enable Working. Multiple children and multiple active Dots without mixing them; panel open/close, keyboard/focus, approval, failure/interruption, reconnect/replay, and chat/host switching during tail without contamination. Unread changes after actual viewing, not after execution. Verify state contracts in runtime before declaring the path working.

## D38 — One shared Space, multiple specialists and profile projects

Vision confirmed by the user on 2026-10-05: Studio shows one Finance Space; selecting Product Manager or CTO resolves the Hermes project in the respective profile. Specialists are not permanently bound to a Space: specialist + Space selection concerns the current work/chat. The same specialist retains identity and memory when moving to Maintenance.

A Hermes project is profile-scoped (`HERMES_HOME/projects.db`), not a global project shared by all Bots. A Studio Space retains explicit associations with native projects identified by connection/runtime, profile, and projectId; multiple associations may point to the same files on the same host. Do not merge projects by name, duplicate files, or create a distributed backend.

If the selected specialist’s link is missing, propose selecting an existing project in that profile or registering folders through supported Hermes APIs, after explicit choice. Present profile/host/folders before confirmation; no hidden creation/configuration. The link is confirmed only after a runtime outcome. The catalog may be partial/offline: show the limitation rather than recreating projects.

SOUL, MEMORY, and USER remain specific to each Hermes profile; a shared USER is not required. Personal memory and procedures are not merged upon entering a Space. Shared project files and project skills discovered by runtime in the actual context are distinct from Bot memories; membership or a message does not grant access to other profiles’ files, memories, or tools.

F6 owns Space/project associations; F7 Bot identities; F2 chat selection and context; F14 collaboration between profiles. For the canonical Bot Chat, verify how to apply project/cwd while preserving Bot Mode capabilities: do not promise independent parallel sessions of the same Bot or change an active turn’s context. If necessary, block/defer the change with explicit status. Calling the CTO does not automatically assign the PM’s Space to it: resolve its link and verify context/grants before declaring shared work. Different hosts do not imply a shared filesystem.

**Gates:** one Finance Space and two PM/CTO profiles, distinct native projects on the same files; both open the correct context with their own memory and a confirmed Space/host/model/effort header. CTO moves to Maintenance without losing identity or shifting ongoing Finance work. Missing link with explicit proposal, unsupported API, identical project names, offline/reconnect, denied grant, switching during fetch/turn, and collaboration without implicit access. No file copying, no profile merging, no Hermes changes solely from UI selection. Requirement accepted; implementation and runtime tests still pending.

## Acceptance, DoD, and prompt for a new chat

Two isolated bots: ack ≠ reply, delay/error/offline, identical names and correct peer routes, replay without duplicates, stale cancellation, callback after UI closure, recall with anchor and denied scope; a temporary delegate does not appear as a durable bot. DoD: explicit transport ownership and permissions, fixture and isolated DM+reply+recall test, persisted receipts/reopen, packaged UI, no personal data leakage; update docs.

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Implement F14 with collaboration and messages/recall as priorities. First verify delegate_task, canonical message_agent, bot_relay, and groups.* in Hermes apps/desktop source at the pinned version. Choose a traceable slice (two isolated bots DM→reply→recall), rather than combining them into a false generic tool. Define scope/identity/receipts and ownership, test uncertain/offline/replay, complete DoD, and persist outcomes. Do not use personal archives or send real messages without specific authorization. Also follow F14’s Assignment for the implementing chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
