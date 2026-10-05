# F10 — Hermes routines and cron GUI

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the frontend/integration F10**, following the workflow below and the card-specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before coding. The “documented/not implemented” labels describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** GUI adaptation and integration with existing Hermes capabilities, rather than creating the feature in the backend. The Fxx separation establishes ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Configure and observe native Hermes routines with runs/delivery/results after Studio closes.

**Backend and boundary:** Hermes cron/heartbeat/scheduler: the client presents configuration and outcomes, without replacement timers/executors. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** A routine shows its Space/project if actually associated, host/profile/recipient and the job’s effective model/effort configuration; no values inherited from the open chat. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements identified here and leave other functionality to its respective owners.

**Dependencies and additional reading:** F1 lifecycle, F3 permissions, F7 if a Bot is the recipient; 24/7 is a requirement, with duration testing distinct from health/job creation. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Required specific tests for the relevant increment:** Closed client, offline/suspended host, late run, distinct job/run/delivery, next event/timezone, duplicates/replay, delivery error and explicit stop. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified graph and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the spec/principles, fix discovered issues, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare tests not performed and external blockers; completion requires proven increment gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within actual authorizations and capabilities, without another general interview.
<!-- implementation-packet:end -->


## Autonomous continuity required in F1 — D33

User principle: Hermes works 24/7 regardless of whether Studio is open; Studio facilitates and visualizes the full Hermes backend. Routines/cron, heartbeat, bots, tools and memory retain native Hermes ownership. Configuration, host/service status and results must remain observable after reopening, with actual outcomes. No alternative timer/heartbeat/executor in the client and no backend shutdown on closing. This requirement is not yet a duration or post-restart execution verification; revisit [F1/D33](F1-runtime-connection.md#principio-cardine--hermes-autonomo-studio-facilitatore-d33) and the card-specific gates before implementation.

<!-- feature-guidance:start -->

## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | If upstream schema/events are uncertain: documented primary-source research |
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | When domain identities, states or terms change |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — conditional | If a reproducible connection or lifecycle error arises |
| [wizard](<../../.agents/skills/wizard/SKILL.md>) — conditional | Only for host/account prerequisites that genuinely require human input |

### Entry points to read

- [docs/features/F1-runtime-connection.md](<../../docs/features/F1-runtime-connection.md>): Host and profile.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Authorizations.
- [desktop/hermes/server.mjs](<../../desktop/hermes/server.mjs>): The current tasks route is not a scheduler.
- [Hermes: tools/cronjob_tools.py](</Users/luca/.hermes/hermes-agent/tools/cronjob_tools.py>): Scheduling actions; source reading at the pinned version, not a live test.
- [Hermes: apps/desktop/src/api/cron.ts](</Users/luca/.hermes/hermes-agent/apps/desktop/src/api/cron.ts>): Desktop REST client; source reading at the pinned version, not a live test.
- [Hermes: hermes_cli/web_routers/cron.py](</Users/luca/.hermes/hermes-agent/hermes_cli/web_routers/cron.py>): Owner, run and delivery; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Evidence boundary

Status: **documented, not implemented** (2026-10-04). This spec describes a future Hermes Studio slice; available upstream code does not mean the capability is integrated into the app. Evidence: reading the source checkout `/Users/luca/.hermes/hermes-agent`, not live execution, with no personal prompts/configuration/database used. Authoritative reference: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). The remote version may change: pin the SHA and repeat contract tests before implementation.

First read `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` and `desktop/hermes/README.md`. The user selected the OpenDots UI; Hermes remains the only executor. The Studio endpoints described below are **proposals**, not existing APIs.

## Goal and use cases

User priority: reliable routines associated with a bot/project. Create “research and prepare a page every morning”, pause/resume, run now, inspect runs and delivery, and retrieve results after closing the app. The routine is persistent; each run has its own session/outcome. Closing the client must not cause cancellation, but host/scheduler availability does affect execution.

## Verified runtime contract

Tool `cronjob_manage`, actions create/list/update/pause/resume/remove/run; create requires schedule and prompt. Schedule distinguishes recurring `30m` from one-shot `in 30m` and supports natural day/time, cron and ISO timestamps. `deliver` can be local, bot-chat[:profile], all or platform:chat:thread; failure_deliver is separate. Each run starts in a fresh session: no implicit chat context. Pin the model only if explicitly requested. Source `tools/cronjob_tools.py:1047–1137`.

Desktop uses REST: GET/POST `/api/cron/jobs`, GET/PUT/DELETE `/api/cron/jobs/:job_id`, POST pause/resume/trigger, GET runs?limit, GET `/api/cron/delivery-targets`; create/update use typed payloads, update `{updates}`. Trigger is a long synchronous upstream operation (24h timeout in the client): the initial HTTP response must not be reinterpreted as a completed run. The profile is the owner, and list may default to all: Studio must initially pass a concrete scope. `cron.changed` signals a refetch. Sources `apps/desktop/src/api/cron.ts`, `hermes_cli/web_routers/cron.py:668–739`, `hermes_cli/web_server_cron.py`, `tui_gateway/contracts/events.py:727`.

## Domain, UX and states

Routine `{connectionId,profile,jobId}` and Run `{sessionId,runId?,startedAt,status,result,delivery}` are distinct. Form: name, bot, self-contained instruction, readable schedule/timezone, destination and failure policy; next-run preview verified by the backend. List states planned/paused/host unavailable; run states queued/running/interrupted/failed/succeeded/unknown, with delivery separate. Show a concrete warning if the scheduler is inactive; an outcome without an authoritative run does not become succeeded. Delete operations have clear scope and must not be confused with pause.

## Seam, ownership and dependencies

Depends on F1 for connection and host, F3 for authorizations; F7 only for Bot destinations and F6 if the result becomes a document. Run history belongs to this feature. New `desktop/hermes/routines.mjs`, `.test.mjs`, client `RoutinesView.tsx`/`RoutineEditor.tsx`; replace the Studio tasks501 route only after confirming the contract. Do not create a parallel macOS cron or Electron timer; Hermes is the only scheduler. Gateway/scheduler configuration requires a separate gate, with no changes in this spec.

## Privacy, migration and non-goals

Default destination local/app if supported; all/shared platform requires explicit selection. Include only authorized references/sources in the self-contained prompt; secrets remain in the runtime vault. No automatic import of all personal routines. OpenDots task metadata does not become an actual cronjob; mapping remains nullable until confirmed. Do not guarantee 24h operation or waking the Mac without duration testing and a host policy.

## Acceptance and DoD

Fixtures for create/update/pause/resume/remove, one-shot versus recurring, timezone/DST, identical jobId collisions across profiles, stale refresh, trigger timeout without automatic retry, failed delivery distinct from run, and reopening runs on the owning connection. A brief isolated test performs two reactivations and retrieves runs/results with the client closed; do not claim 24h duration. DoD: scoped backend adapter, UI and reversible schema, real run/delivery logs, verified scheduler ownership and packaged smoke; updated STATUS/WORKLOG.

## File destination and memory — D25/D28

A routine can reference a document in the Space folder with verified root/host/path and durable grant; Space metadata does not guarantee folder availability when the client is closed. File updates are confirmed by F5 revision/outcome; F9 Space memory is updated only within the selected policy. Runtime memory/skill curator are not the scheduler; textual delivery alone does not save to the vault.

## Ready-to-use prompt for a new chat

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Implement F10 by reading the spec and upstream reference apps/desktop/api/cron.ts. Routine priority: start with scoped list+run history, then creation/pause/trigger with fixtures and an isolated Hermes scheduler. No alternative timers, external messages or changes to personal routines. Show verified next run and host availability, separate run from delivery and do not retry uncertain outcomes. Complete schedule/timezone/relaunch tests, DoD and documentation. Also follow the Assignment for the implementing chat for F10: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions still apply.
