# F18 — Codex specialists through Hermes integration — future

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the F18 frontend/connection**, following the workflow below and the card’s specific sections. The attachment is the entry point: open linked workspace files and SKILL.md files before coding. “Documented/not implemented” labels describe the baseline; they do not require stopping at a plan in the assigned chat.

**Type of work:** future external integration idea, subject to an available Hermes contract. The Fxx separation supports ownership, implementation, and verification in separate chats: the product remains a single OpenDots-style Hermes GUI.

**Outcome:** Retain the future idea of Codex specialists and, only upon explicit selection, verify a supported native Hermes path.

**Backend and boundary:** The Hermes backend remains responsible for the assignment; external integration and account/communication authorization must already have a verified contract. Studio is a Hermes frontend/adapter: names and GUI may change, while agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** Task/result/Space/host/provenance distinct from the bot and human Codex chat; no fabricated collaboration inferred from a thread created without an outcome. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements specified here, leaving other functions to their respective owners.

**Dependencies and additional readings:** F14/F3 and docs/future; if supported Hermes integration is missing, deliver the gap and do not create a new service/backend to implement the idea. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Mandatory specific checks for the relevant increment:** Synthetic repository, change ownership, timeout/uncertain, verified results/diffs, no credential leaks, and respected message scope. Use synthetic profiles and data; exercise the real interface. Fixtures, builds, handshakes, and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified dependency graph, and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility, and Reduced Motion. Review the diff against the specification/principles, fix issues found, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare unperformed checks and external blockers; completion requires evidence for the increment’s gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: future/documented. Read ../future/codex-specialists.md. Do not create tasks/threads or use credentials for this feature now.

Goal: a Dot can assign a bounded task to a Codex specialist through an explicit contract and report result/provenance, without confusing internal Hermes agents with human Codex chats. F14 delegation/routing + F3 authorization are prerequisites.

Define repository/worktree scope, change ownership, quota/model/config, events and artifact receipts, cleanup, and cancellation. Receiving a message from an agent does not authorize messages to other chats/apps. Do not introduce account integration or a generic privileged CLI in the renderer.

Gates: isolated synthetic task, merge/conflict ownership, timeout/uncertain/verified result, no unauthorized push/publication, and credentials excluded from logs. Start/running/success must come from the actual capability; approval is not completion.


<!-- feature-guidance:start -->

## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial readings, implementation/review skills, and exit criteria. Then read the feature-specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Verify external delegate contracts |
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | Identity and responsibility across runtimes |
| [cdx](</Users/luca/.codex/skills/personal/cdx/SKILL.md>) — conditional | If delegation to Codex CLI is authorized |
| [hermes](</Users/luca/.codex/skills/personal/hermes/SKILL.md>) — conditional | If delegation to Hermes CLI is authorized |
| [agy](</Users/luca/.codex/skills/personal/agy/SKILL.md>) — conditional | Only if Antigravity is explicitly selected |

### Entry points to read

- [docs/future/codex-specialists.md](<../../docs/future/codex-specialists.md>): Future idea and limitations.
- [docs/features/F14-delegation-and-dot-collaboration.md](<../../docs/features/F14-delegation-and-dot-collaboration.md>): Delegation vs durable bot.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Authorization.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Current runtime binding and provenance.

Verify paths and version before working; coordinate shared files. These readings do not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Updated file scope — D25

A Space links real F6/F5 folders; specialists receive only authorized roots/files and reachable hosts. No Second Brain copy/import or implicit permission from team membership. Review/save and conflicts shared with F5; update F9 Space memory after verified results, not as a duplicate journal in the store.

## Prompt for a new chat

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Work only on F18 after verifying prerequisites and source code for the selected integration. Use an isolated test repository/worktree and explicit authorization to communicate with Codex chats. Deliver verified results and limitations; do not implement Bots/routines/voice in this chat. Also follow F18’s Assignment for the implementing chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
