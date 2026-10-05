# F6 — Spaces linked to Hermes projects and folders

<!-- implementation-packet:start -->
## Assignment for the implementation chat

When this feature card is attached as a development assignment, implement and verify **only the F6 frontend/integration**, following the workflow below and this card’s specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before writing code. “Documented/not implemented” statements describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** GUI adaptation and integration with existing Hermes capabilities, not creation of the backend feature. The Fxx split provides ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Present Hermes projects as Spaces with associated folders, documents and conversations, preserving runtime identity.

**Backend and boundary:** projects.* scoped to backend/profile and session working directory; Space is a UI name/mapping, not a new distributed project service. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** D38: a shared Space linked to the chosen specialist’s profile project; individual memory and no implicit changes to active work. Current Space always visible in the chat/bot and sidebar; @ limited to authorized project folders. Folder host distinct from conversation host. Reading the [shared GUI requirements](gui-context-and-references.md) is mandatory; apply the requirements assigned here and leave other functions to their respective owners.

**Dependencies and additional reading:** F1 hosts, F5 roots/revisions, F2 chat association; multi-host cardinality bounded by Hermes capabilities, no invented cross-host access. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills section and gates. Verify actual files, methods and version; future paths are not already existing APIs.

**Mandatory specific tests for the relevant increment:** Namesake projects across two hosts/profiles, multiple folders, offline backend, no Space, archive/unlink without deleting files, session.cwd differing from the project and denied grants. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** Working increment code, relevant tests with recorded commands/results, typecheck/build of the changed dependency graph and a proportionate .app smoke test. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the specification/principles, fix identified issues, and update status/gates in this card and MEMORY/STATUS/WORKLOG. Declare unperformed tests and external blockers; completion requires proven increment gates. Git: select only your own files after inspecting diff/index/secrets; push/publish according to current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with this card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: specification updated D25, 2026-10-04; not implemented. The F0 baseline still uses metadata pages. The new request replaces the Space model as merely a container for internal pages; preserve existing data.

<!-- feature-guidance:start -->
## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) preserves all collections; load skill bodies only when relevant.

### Specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md) | Distinguish Spaces, file-backed documents and legacy pages |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | React components and renderer state |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | File revisions and Space/FolderBinding ownership |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — conditional | Packaged UI verification with synthetic data and actually available tools |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — conditional | If autosave or conflicts fail to preserve the draft |

### Entry points to read

- [docs/adr/0007-folder-backed-spaces.md](../adr/0007-folder-backed-spaces.md): filesystem and migration decision.
- [docs/features/F5-files-and-artifacts.md](F5-files-and-artifacts.md): shared filesystem contract.
- [desktop/upstream/src/client/SpaceWorkspace.tsx](../../desktop/upstream/src/client/SpaceWorkspace.tsx): Space container.
- [desktop/upstream/src/client/WorkspaceDialog.tsx](../../desktop/upstream/src/client/WorkspaceDialog.tsx): explicit selection of folders to add.
- [desktop/upstream/src/client/PageDocument.tsx](<../../desktop/upstream/src/client/PageDocument.tsx>): Document.
- [desktop/upstream/src/client/editor/use-page-autosave.ts](<../../desktop/upstream/src/client/editor/use-page-autosave.ts>): Autosave cycle.
- [desktop/upstream/src/client/SaveToSpaceReview.tsx](<../../desktop/upstream/src/client/SaveToSpaceReview.tsx>): Explicit review and save.
- [desktop/upstream/src/server/page-routes.ts](<../../desktop/upstream/src/server/page-routes.ts>): Metadata contract.
- [desktop/upstream/src/server/pages.ts](<../../desktop/upstream/src/server/pages.ts>): Page persistence.
- [docs/features/F9-memory.md](<../../docs/features/F9-memory.md>): Boundary with separate memory.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Requested outcome

A Space links one or more actual folders selected by the user: an Obsidian vault, a software project or another working directory. Users see the structure and text files, open/edit documents, and specialists can work on the same folders within the authorized scope. Adding a folder means linking it, without copying or importing everything into a Studio database.

The filesystem is the source of content. Studio stores links, selections, recoverable drafts and receipts; saved text is the actual file. The UI retains the OpenDots language while content organization follows the requested folder/project model. Agent memory belongs to F9.

## Flow and components

1. Create Space: name and Add folder with explicit directory selection; list of linked folders and visible host.
2. Open Space: distinct roots, folder/file tree, name search; progressive loading without recursively scanning the entire vault on opening.
3. Selected text file: relative path, editor/source and Markdown preview where relevant, Modified/Saving/Saved/conflict status.
4. New file: root/path selection and explicit creation; research results can be saved as `.md` in the selected destination.
5. Specialist: active Space and accessible folders visible in context; precise file references, not implicit transmission of the entire vault.
6. Manage folders: add/unlink, rebind a moved directory; unlinking does not delete or move any files.

A Space may exist before linking, but until it has folders it shows Add folder: do not create fictional content. Roots with identical names keep their host/path distinguishable. Detect nested or already linked roots to avoid duplicates and unintentionally expanded permissions.

## Multi-host requirement confirmed during F1

A Space must support linking multiple folders, including across different hosts; each folder retains its own host and conversations retain their execution host. Design the mapping to Hermes projects in F6 based on the upstream contracts below. Cross-host access, mounts/sync and turning a Space into a Hermes project are not implicit; this interview did not initiate any F6 implementation.

<a id="progetti-hermes-e-space--promemoria-per-lo-sviluppo-f6"></a>
## Hermes projects and Spaces — reminder for F6 development

Source research, not a runtime test: [verified contracts and limits](../research/hermes-projects-and-space-hosts.md), SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`. A Hermes Project supports multiple folders but is scoped to a backend/profile; folders contain path/label and no host. Sessions have a working directory; `session.workspace.move` changes the directory, not the runtime/host.

Proposal to select in F6: Space as a Studio container aggregating folders across multiple hosts and references to Hermes projects scoped at least by connection/host, profile and projectId. Always resolve paths together with the host; identical paths on two machines remain distinct folders. A single Hermes Project does not represent all folders of a multi-host Space.

Decisions to revisit in the F6 chat: link existing Hermes projects or explicitly create them; Space/project cardinality for each host; host and working-folder selection when creating a conversation; agent access to folders on other hosts and offline-folder behavior. No implicit project creation/import, copy/sync or mounts. F1 supplies stable connections and routing; F2 binds conversations to their respective hosts; F5 resolves files/folders; F6 owns associations and the Space UI. Record contracts and ownership before shared edits.

## Domain and data ownership

Technical proposal to refine: `Space`, `FolderBinding` (stable identity, host, selected root, access state), `WorkspaceFile` (folderId, relative path, type, version), `DocumentDraft` and `SaveReceipt`. The Space’s display name is not a path. A folder is not a Hermes profile or session.

F5 owns root resolution, listing, reading/writing and change detection. F6 owns Space organization, folder selection, editor and review. Native actions cross a restricted interface: no generic filesystem in the renderer. Define the shared contract before changing shared types/server/preload.

For remote runtimes, distinguish Mac roots from Hermes host roots. A Mac path does not become accessible to the server merely by being inserted into the prompt. If mapping/authorization is missing, show Unavailable to agent; remote mount/sync/import is an explicit increment, not an implicit F6 requirement.

## Saving and external changes

Edits remain drafts until the file write succeeds. Verify the read version before saving; an Obsidian or specialist edit produces a conflict, not a silent overwrite. Select the concrete strategy (hash/revision, directory observation, atomic writes) in F5 and share it with the editor.

An external refresh does not replace a dirty draft. Permission denied, disconnected volumes, renamed or unavailable files preserve text and links. For binary/large files, show an honest limitation instead of forcing the editor. Preserve supported encodings and newlines; declare excluded formats. Cmd+S, focus restoration, scroll, IME and Reduced Motion follow component-system.

## Specialist work

F1/F2 supply connection and conversation; F7/F14 identity and collaboration; F3 controls scope. The specialist receives references and instructions relevant to the selected folders. Linking a Space does not authorize all sessions or all bots to read/write. The runtime uses its own file tools on the same reachable files; the client presents confirmed results and revisions.

Before sending a document, save it or explicitly choose how to handle the draft. Reading/version/provenance must match the actual file; do not use an old SQLite page snapshot as current content. Parallel work on the same file requires detectable conflicts and traceable responsibility.

## Reviewing a result

Review selects Space, folder, path, filename and behavior if the file exists. The card can edit the draft; no write on opening. Success only after a filesystem receipt, with actual destination and version. After a lost response, verify the outcome before retrying and prevent duplicate files.

Historical baseline: `/conversations/:threadId/reviewed-page` saves a metadata page with receipt `manual-review-UUID`. This is not already a file-write contract. Adapt it in the review slice, preserving idempotency and drafts; historical title/content limits do not automatically become filesystem limits.

## Migration and compatibility

Existing pages remain recoverable as legacy documents; no automatic deletion or bulk export. To transfer them into folders, propose explicit export with a destination, collisions and verifiable receipts. Do not add `.obsidian`, `.git` or Studio metadata inside an existing vault without a specific choice. Preserve existing Markdown links and structure; opening `.md` files alone does not justify promising all Obsidian semantics (plugins, embeds, wikilinks).

## Dependencies and increment

F4 shell; F5 minimal read-only/folder contract and later saving; F3 scope. F1/F2 support remote work, not reading local documents offline. F7/F14/F18 concern specialists and are not prerequisites for linking a folder.

First slice: link a synthetic folder → tree → open text → restart and recover binding/file. Second: editing, external conflicts and review-to-file. F6/F5 can be agreed as two chats with a shared contract; this card does not authorize implementing both automatically.

Existing entry files: SpaceWorkspace, SpaceLibrary, SpaceNav, WorkspaceDialog, PageDocument/editor, page/store/routes and Electron main/preload. The old page store provides compatibility, not a new source for files.

## Definition of done

Synthetic folder with `.md`, `.txt` and code: link without copying; two distinguishable roots; read actual bytes; add/unlink without destruction; recover moved/offline roots; save and restart; external edits preserve drafts; symlink/root escape and denied access tested through F5/F3. No tests on the personal Second Brain. Separate specialist gate: an isolated Hermes tool reads/edits a file in the authorized root and the UI reflects the outcome; access outside the root is denied. Fixtures do not prove live runtime access.

## Updated user requirement — Hermes context and frontend

[Cross-feature specification](gui-context-and-references.md): Space is the presentation/association of scoped Hermes projects, not a new project backend. Space/host/model/effort always recognizable; @ for versioned file and range/text references, / for actual skill/tool catalogs. This request clarifies the project mapping previously described as a proposal; multi-host remains restricted to actual contracts, with no invented distributed Project or implicit cross-host access. No automatic implementation.

## D38 — One shared Space, multiple specialists and profile projects

Vision confirmed by the user on 2026-10-05: Studio shows a single Finance Space; choosing Product Manager or CTO resolves the Hermes project of the respective profile. Specialists are not permanently tied to one Space: specialist + Space selection concerns the current work/chat. The same specialist retains identity and memory when switching to Maintenance.

A Hermes project is scoped to its profile (`HERMES_HOME/projects.db`), not a global project shared by all Bots. The Studio Space stores explicit associations to native projects identified by connection/runtime, profile and projectId; multiple associations may point to the same files on the same host. Do not merge projects by name, duplicate files or create a distributed backend.

If the chosen specialist has no link, propose selecting an existing project from their profile or registering the folders through supported Hermes APIs, after an explicit choice. Present profile/host/folders before confirmation; no hidden creation/configuration. The link is confirmed only after the runtime result. The catalog may be partial/offline: show the limitation rather than recreating projects.

SOUL, MEMORY and USER remain owned by each Hermes profile; a shared USER is not required. Personal memory and procedures are not merged on entering a Space. Shared project files and project skills discovered by the runtime in the actual context are distinct from Bot memories; membership or a message does not grant access to other profiles’ files, memories or tools.

F6 owns Space/project associations; F7 Bot identities; F2 chat selection and context; F14 cross-profile collaboration. For the canonical Bot Chat, verify how to apply project/cwd while preserving Bot Mode capabilities: do not promise independent parallel sessions of the same Bot or change an active turn’s context. If necessary, block/defer the switch with an explicit state. Calling the CTO does not automatically assign the PM’s Space: resolve the CTO’s link and verify context/grants before declaring shared work. Different hosts do not imply a shared filesystem.

**Gates:** one Finance Space and two PM/CTO profiles, distinct native projects pointing to the same files; both open the correct context with their own memory and confirmed Space/host/model/effort headers. The CTO switches to Maintenance without losing identity or moving ongoing Finance work. Missing links with explicit proposals, unsupported APIs, namesake projects, offline/reconnect, denied grants, switching during fetch/turns and collaboration without implicit access. No file copies, no profile merges, no Hermes changes solely from UI selection. Accepted requirement; implementation and runtime tests remain pending.

## Prompt for a new chat

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section. Implement only the selected slice of F6 updated D25: Spaces linked to actual folders, such as vaults/projects. Define root/list/read/save with F5 and scope with F3 before shared edits. Start with a synthetic read-only folder and persistent linking; authoritative content lives in the filesystem and legacy pages are preserved. Adding/unlinking neither copies nor deletes files. Do not scan personal vaults or automatically activate specialists/remote mappings. Test restart, errors and external changes; update documentation and gates with evidence. Also follow the F6 Assignment for the implementation chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
