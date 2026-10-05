# F15 — Hermes output and terminal view

<!-- implementation-packet:start -->
## Assignment for the implementing chat

Terminal means the Studio surface for output from commands executed by Hermes and, when the backend provides the contract, an interactive session on its host. First slice: output/tool cards in the chat or panel. It is not a new terminal tool, an independent shell, or an alternative local executor.

When this card is attached as a development assignment, implement and verify **only the F15 frontend/connection**, following the workflow below and the card’s specific sections. The attachment is the entry point: open linked workspace files and SKILL.md files before coding. “Documented/not implemented” labels describe the baseline; they do not require stopping at a plan in the assigned chat.

**Type of work:** GUI adaptation and connection to existing Hermes capabilities, not creation of the feature in the backend. The Fxx separation supports ownership, implementation, and verification in separate chats: the product remains a single OpenDots-style Hermes GUI.

**Outcome:** Display and, if supported, interact with the Hermes terminal for the correct session/host.

**Backend and boundary:** Output, stdin/resize/interrupt/PTY only through proven native Hermes contracts; no parallel shell in the renderer. Studio is a Hermes frontend/adapter: names and GUI may change, while agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** Actual output/code/status and outcome, visible host/cwd/Space; shared F5 file/line links where supported. Working does not mean a command succeeded. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements specified here, leaving other functions to their respective owners.

**Dependencies and additional readings:** F1/F3/F2; output-only slice distinct from an interactive terminal, with capability availability confirmed before enabling controls. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Mandatory specific checks for the relevant increment:** Incremental/large output, ANSI/untrusted content, nonzero command exit, disconnect/reconnect, resize, different session, and uncertain input delivery. Use synthetic profiles and data; exercise the real interface. Fixtures, builds, handshakes, and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified dependency graph, and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility, and Reduced Motion. Review the diff against the specification/principles, fix issues found, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare unperformed checks and external blockers; completion requires evidence for the increment’s gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: documented; tool output in the UI is not an interactive PTY session.


<!-- feature-guidance:start -->
## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial readings, implementation/review skills, and exit criteria. Then read the feature-specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | PTY contract distinct from a shell tool |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Session, backpressure, and owned process |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — conditional | React components and renderer state |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — conditional | Verify packaged UI with synthetic data and actually available tools |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — conditional | If output/lifecycle fails |

### Entry points to read

- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Authorizations.
- [desktop/upstream/src/client/ComputerToolCard.tsx](<../../desktop/upstream/src/client/ComputerToolCard.tsx>): Current tool output.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Terminal destination.
- [desktop/electron/preload.cjs](<../../desktop/electron/preload.cjs>): Privileges.
- [Hermes: tools/terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/terminal_tool.py>): Terminal tool; source reading at the pinned version, not a live test.
- [Hermes: tools/read_terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/read_terminal_tool.py>): Output and continuity; source reading at the pinned version, not a live test.
- [Hermes: tools/close_terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/close_terminal_tool.py>): Closing distinct from display; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. These readings do not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Scope

Display Hermes commands and output associated with an execution; optional interactive PTY only after verifying the official desktop contract. Separate tool-shell results from a terminal session; do not invent a console that sends text to the model as though it were a shell.

Host/session/cwd/status/permissions always clear. Empty console, opening, connected, command started, output, exit code, interrupted, offline. Exit 0 does not mean the goal is complete; clearing the display does not cancel the process. New-command input is disabled without capability/authorization.

Module Terminal owns PTY/tool identity, transport/backpressure, resize, detach/attach, and process ownership. The renderer displays the stream; preload does not provide generic exec. Existing personal sessions are not imported by default. Output may contain secrets: limit persistent logs and require explicit clipboard/export actions.

Dependencies F1+F3. Verify Hermes desktop terminal adapter source and actual endpoints before designing the interface. First increment: confirmed tool output and history; interactive PTY is a separate slice selected in the chat, with local/remote host explicitly stated.

Gates: stdout/stderr ordering, large output/backpressure, exit code, disconnect without automatic termination, resize, explicit interruption, and restart. Test isolated synthetic processes, no personal/destructive commands. Panel keyboard/focus and accessibility; distinguish terminal CtrlC from composer cancellation.

## D34 — Code and commands visible from the chat

The chat must be able to present actually executed code/commands and output received from Hermes, with host, tool/session, and status. F2 owns the timeline and F15 the terminal surface; response snippets and executed commands have distinct provenance. A tool card alone does not demonstrate interactivity/PTY. Gating and runtime outcome remain necessary.


## Handoff

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Work only on F15; choose tool output or PTY and verify the official Hermes contract. Use isolated test processes, explicit ownership, and F3 permissions. Do not add a generic Electron shell or develop Files/browser. Document outcomes and limitations. Also follow F15’s Assignment for the implementing chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
