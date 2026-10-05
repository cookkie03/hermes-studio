# F5 — Files, references and artifacts in the Hermes workspace

<!-- implementation-packet:start -->
## Assignment for the implementation chat

When this feature card is attached as a development assignment, implement and verify **only the F5 frontend/integration**, following the workflow below and this card’s specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before writing code. “Documented/not implemented” statements describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** GUI adaptation and integration with existing Hermes capabilities, not creation of the backend feature. The Fxx split provides ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Read/write files within authorized roots and provide precise file, line and selection references with revisions/conflicts.

**Backend and boundary:** For agents and remote hosts, use supported Hermes filesystem/tools; the local editor has IPC limited to the selected root, without implicitly granting tool access. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** @ shows name/root/host/path and filters progressively; a file/range chip reopens the correct location. Visible changes/diffs and save receipts. Reading the [shared GUI requirements](gui-context-and-references.md) is mandatory; apply the requirements assigned here and leave other functions to their respective owners.

**Dependencies and additional reading:** F6 project/root, F2 verified Hermes attachment/context, F3 grant; GUI references adapt to existing contracts, without a new retrieval backend. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills section and gates. Verify actual files, methods and version; future paths are not already existing APIs.

**Mandatory specific tests for the relevant increment:** Namesakes across two roots/hosts, path traversal/symlinks, missing files, stale ranges, drafts differing from disk, large payloads, external conflicts and no blind writes. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** Working increment code, relevant tests with recorded commands/results, typecheck/build of the changed dependency graph and a proportionate .app smoke test. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the specification/principles, fix identified issues, and update status/gates in this card and MEMORY/STATUS/WORKLOG. Declare unperformed tests and external blockers; completion requires proven increment gates. Git: select only your own files after inspecting diff/index/secrets; push/publish according to current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with this card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: documented; the historical SwiftUI tree/editor and partial Electron event preview do not constitute a complete file workspace.


<!-- feature-guidance:start -->

## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) preserves all collections; load skill bodies only when relevant.

### Specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Root/path/revision ownership |
| [research](<../../.agents/skills/research/SKILL.md>) | Verify the Files contract on the host |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — conditional | React components and renderer state |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — conditional | Packaged UI verification with synthetic data and actually available tools |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — conditional | If paths or draft recovery fail |

### Entry points to read

- [docs/project/file-workspace.md](<../../docs/project/file-workspace.md>): Historical filesystem baseline, not a remote contract.
- [docs/features/F6-spaces-documents-memory.md](<../../docs/features/F6-spaces-documents-memory.md>): Page versus file.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Files destination.
- [desktop/electron/preload.cjs](<../../desktop/electron/preload.cjs>): Privilege seam.
- [Hermes: tools/file_tools.py](</Users/luca/.hermes/hermes-agent/tools/file_tools.py>): Actual file tools; source reading at the pinned version, not a live test.
- [Hermes: tools/file_tools_paths.py](</Users/luca/.hermes/hermes-agent/tools/file_tools_paths.py>): Paths and roots; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## D25 — Filesystem shared with Spaces

F6 now links one or more actual folders. F5 provides the shared File workspace module for roots, listing, read/save, conflicts and provenance; avoid a second text store that diverges from Space files. The Files panel and Space editor use the same reference resolution. Old metadata remains legacy/explicit export.

The client can browse selected local folders even offline through restricted native operations; Hermes uses its own file tools only on roots reachable and authorized on its host. Native APIs for the user and runtime tools for the agent share the same file reference and revision, not two copies or a new executor. Mac root ≠ remote server root; missing mappings must be visible.

Leases/grants apply to the Space, folder and relevant identity; symlinks do not expand scope. External changes by Obsidian or specialists update the tree without overwriting drafts. Unlinking a folder removes the link, not the data. No automatic personal import/index/scan. Test multiple roots, nesting, offline volumes, renames, large/binary files, conflicts and out-of-root access using synthetic folders.

Read [ADR0007](../adr/0007-folder-backed-spaces.md) and [updated F6](F6-spaces-documents-memory.md) before defining the contract; coordinate shared types and main/preload/server with their owners.

## Outcome

Files panel with tree/search/preview and results produced by Hermes tools; open Markdown or a document in the Space without confusing Mac files, the Hermes host and a Studio page. Hermes tool registry source: verify read_file/write_file/search_files and actual contracts, researching exact names before implementation.

Actual host files, sandbox roots, symlinks and ACLs are the File workspace module’s responsibility; the UI uses restricted native operations for user files or Hermes tools for agent operations; no generic read/write from the renderer. If the runtime is remote, show remote host and paths. Download/import to the Mac are explicit actions with a clear destination. No automatic personal scans.

## Behavior

Selected root → loading → empty/populated tree → preview → draft → save/conflict/error. Highlight agent/run/tool provenance and confirmed results, not assumptions from text. Dirty edits remain recoverable when switching files/panels. A Space document is the file in the linked folder; legacy metadata-only pages require explicit export/import with a receipt.

## Scope and seam

For local files: F0 baseline and explicit root selection; F1/F3 for agent tools/runtime hosts. F6 uses the F5 writer and is not a prerequisite for listing/read-only: avoid a circular dependency. The File workspace module owns filesystem policy and revisions; preload exposes only IPC limited to authorized operations/roots, while Chat.tsx remains presentation. F15 terminal is separate; F12 browser is not required. First increment: read-only selected root+preview, then writing only in an explicit slice.

## Gates

Root escape, symlinks, huge/binary files, stale revisions, permission denied, offline, host switching, edited drafts and restart. Fixtures with synthetic content, then an isolated runtime operation and UI/keyboard testing. No tests on personal folders, no automatic DELETE. Persisted tool activity does not prove a file still exists: use an authoritative refresh.

## Future multi-host contract requested during F1

F6 requires Spaces with multiple folders, including on different hosts. F5 must identify each root/file by host and path, preserve scope and revisions, and indicate offline hosts. The F1 tunnel to Hermes does not automatically make other hosts’ filesystems available. Revisit the [F6 reminder](F6-spaces-documents-memory.md#progetti-hermes-e-space--promemoria-per-lo-sviluppo-f6) before defining a writer or remote transport; this request does not select any F5 implementation.

## D34 — Changes visible in chat

File changes/diffs received from and verifiable against the runtime must be displayable in chat with host/path/revision and outcome. F5 owns file identity, diffs and receipts; F2 presents the timeline. Text claiming a change is insufficient to certify it; Space linkage and review follow F6. Do not confuse prior approval, proposed changes and an already applied write.



## Handoff

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Implement only F5, starting with an explicit read-only root on the local client or authorized runtime host, according to the selected increment. For the agent, use actual Hermes tools; for the local client, use a native interface restricted to selected roots. Share references and revisions with F6 without copying content. Define the module and path/symlink/conflict tests. Do not develop a terminal or browser; preserve personal data. Also follow the F5 Assignment for the implementation chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
