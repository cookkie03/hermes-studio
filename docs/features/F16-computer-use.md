# F16 — Hermes Computer Use and Bot Screen GUI

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the F16 frontend/connection**, following the workflow below and the card’s specific sections. The attachment is the entry point: open linked workspace files and SKILL.md files before coding. “Documented/not implemented” labels describe the baseline; they do not require stopping at a plan in the assigned chat.

**Type of work:** GUI adaptation and connection to existing Hermes capabilities, not creation of the feature in the backend. The Fxx separation supports ownership, implementation, and verification in separate chats: the product remains a single OpenDots-style Hermes GUI.

**Outcome:** Use native Hermes Computer Use from Studio with captures/actions/approvals; live Bot Screen as a separate increment.

**Backend and boundary:** computer_use/cua-driver and Hermes Bot Screen lease; bot host/display or sandbox, not implicitly the client Mac. Studio is a Hermes frontend/adapter: names and GUI may change, while agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** Dedicated Computer Use view with AX/SOM/vision, target/host/Space/timestamp and outcomes; explicit screen unchanged and stale capture states, only verified native takeover. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements specified here, leaving other functions to their respective owners.

**Dependencies and additional readings:** F1/F3/F2/F11 and Computer Use audit; A captures/B agent use/C Bot Screen, no alternative Studio CUA/VNC executor. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Mandatory specific checks for the relevant increment:** Capture→approved action→postcondition capture, denial/missing driver/display, stale coordinate range, payload >64KiB/replay, wrong host, and human_has_control. Use synthetic profiles and data; exercise the real interface. Fixtures, builds, handshakes, and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified dependency graph, and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility, and Reduced Motion. Review the diff against the specification/principles, fix issues found, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare unperformed checks and external blockers; completion requires evidence for the increment’s gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


<!-- feature-guidance:start -->

## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial readings, implementation/review skills, and exit criteria. Then read the feature-specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Computer use schema and supported host |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Distinct target and action receipt |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — conditional | React components and renderer state |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — conditional | Verify packaged UI with synthetic data and actually available tools |
| [security-diff](</Users/luca/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.31/skills/security-diff-scan/SKILL.md>) — conditional | If a diff review of privileges or targeting is requested |

### Entry points to read

- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Approvals.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Shared surface.
- [desktop/electron/preload.cjs](<../../desktop/electron/preload.cjs>): Exposed privileges.
- [Hermes: tools/computer_use/schema.py](</Users/luca/.hermes/hermes-agent/tools/computer_use/schema.py>): Target and actions; source reading at the pinned version, not a live test.
- [Hermes: tools/computer_use_tool.py](</Users/luca/.hermes/hermes-agent/tools/computer_use_tool.py>): Tool registration; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. These readings do not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Evidence boundary

Status: **documented, not implemented** (2026-10-04). This specification describes a future Hermes Studio slice; available upstream code does not mean a capability is connected in the app. Evidence: reading the source checkout `/Users/luca/.hermes/hermes-agent`, not live execution, no personal prompt/configuration/database. Authoritative reference: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). The remote version may change: pin the SHA and repeat contract tests before implementing.

First read `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md`, and `desktop/hermes/README.md`. The user chose the OpenDots UI; Hermes remains the only executor. The Studio endpoints described below are **proposals**, not existing APIs.

## Goal and use cases

Observe and authorize real actions on applications, windows, files, and terminal through Hermes, keeping host/destination and foreground/background mode clear. A tools panel does not imply a remote desktop session or available takeover.

## Explicit requirement — Native Computer Use usable from Studio

The `computer_use` tool already in Hermes must be usable by Dots in Studio chats on their respective authorized host/display, with visible captures, actions, approvals, and results. Listing it among capabilities is not enough. [Source verification and Studio gaps](../research/hermes-computer-use-integration.md), SHA e1e82d7; [official documentation](https://hermes-agent.nousresearch.com/docs/user-guide/features/computer-use/).

### Selectable increments

- **F16-A — Observation:** Computer Use surface in the panel, target/host/sandbox, SOM/vision/AX capture, screenshot and timestamp, actions and outcomes in the chat. The current Browser/Files/Terminal panel does not implement it. Support JSON and multimodal results; verify large payloads and replay, because the bridge archives only a textual fallback above 64 KiB.
- **F16-B — Complete agent path:** toolset and driver on the selected backend, chat request → capture → approved action → verification capture. Hermes executes the action and applies policy; Studio displays the choice and result, including denied/uncertain outcomes. An available probe does not imply an operational driver/display/permissions.
- **F16-C — Live Bot Screen and human control:** reuse the native [Bot Screen](https://hermes-agent.nousresearch.com/docs/user-guide/features/bot-screen/) feature after verifying stream/input/lease contracts for the connected version. A screenshot alone does not promise a stream; no second executor or parallel desktop. Respect `human_has_control`, actual takeover and return of control, with isolated tests.

The computer belongs to the bot: local gateway or terminal backend sandbox/display. Connecting an SSH host does not grant access to the Studio Mac. On macOS, verify driver permissions, distinct from Electron permissions. Web browser/authenticated profiles remain F12 and Hermes browser tools; F16 does not replace them.

## Verified runtime contract

`computer_use` is registered by `tools/computer_use_tool.py`, with its schema in `tools/computer_use/schema.py`. Actions capture/click/double_click/right_click/middle_click/drag/scroll/type/key/set_value/wait/list_apps/list_windows/focus_app; modes som/vision/ax. Targeting parameters include app/window/element/coordinates and foreground/background delivery according to the schema. Capture is read-only. The schema generally describes approvals for other actions, but the handler applies the shared gate to mutations/focus, while wait/list are read-only: preserve actual policy, Hermes hard-block and lease without inventing Studio whitelists or autoapproval.

Accessibility/screenshot output and capabilities vary by host and backend. Tool start/complete already pass through the owned bridge; Studio does not yet have a computer backend/live desktop stream, takeover, or per-Dot ACL. First integrate scoped events/results, then consider a controller if an official API exists and is tested; do not call arbitrary APIs from the renderer. Sources `tools/computer_use/schema.py:18–203`, `tools/computer_use_tool.py:1–20`, package `tools/computer_use/`; `apps/desktop` UI/bridge as reference, without attributing unread features to this build.

## Domain, UX, and states

ComputerTarget {connection,host,profile,app?,window?}, CaptureReceipt, ActionRequest, and Approval are distinct. The UI always shows the target before mutation and distinguishes a received capture from action accepted/working/succeeded/failed/uncertain. The modal explicitly shows command/destination/exact offered choice; request cancellation removes buttons. An old snapshot has a timestamp and does not become current state. “Take control” remains disabled until the contract is available. Foreground focus is visible; pausing Studio does not imply a runtime interrupt.

## Seam, ownership, and dependencies

Depends on F1 routing/identity, F11 capability, and F3 approval, with F2 for turn interruption. New `desktop/hermes/computer.mjs`, fixtures, client `ComputerActivityView.tsx`; ComputerPanel shared with F12, ownership agreed before parallel work. No second shell/OS automation executor. First slice displays captures and target/approvals from Hermes; direct UI actions only through a proven official API, not a generic toolname string.

## Privacy, migration, and non-goals

Test in an isolated profile and synthetic app; do not request/enable Accessibility or Screen Recording on the personal Mac during documentation/tests. macOS permission is separate from action consent and runtime authorization. Capture retention is opt-in, no perpetual full-frame archive by default. Bounded File and Terminal tool outputs with provenance; editor filesystem access distinct from computer use. Do not migrate local permission pills into effective ACLs. Native Bot Screen/takeover is a separate F16-C increment to verify; continuous recording, arbitrary remote desktops, and iPhone control are outside initial scope.

## Acceptance and DoD

Fixtures: AX/vision/SOM capture, app/window mismatch, obsolete coordinates, denied permissions, stale approval, runtime cancellation, native close preserves work and revokes UI leases, foreground focus notification, uncertain delivery with no automatic retry. Isolated test on the actual host executes capture→approved action→capture confirming the postcondition; an ack does not prove success. DoD: backend capability probe, UI target/provenance, meaningful integration fixture + actual isolated test, screenshot/accessibility review, and documented limitations.

## Prompt for a new chat

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Implement only the selected F16-A/B/C, reading docs/research/hermes-computer-use-integration.md and official Computer Use/Bot Screen documentation, using the computer_use runtime schema and owned bridge, starting with receipts/capture/approval target. Do not add a direct executor or assume takeover. Verify actual host+permissions support and delivery mode; test only authorized synthetic apps/profiles. Implement fail-closed scope/stale approval and postcondition verification, complete DoD, and persist results without personal screenshots. Also follow F16’s Assignment for the implementing chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
