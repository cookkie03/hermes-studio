> Piano storico della baseline SwiftUI, superato per il prodotto da ADR0005/0006. Non eseguire le istruzioni sotto automaticamente. [Piano corrente](../../project/feature-development-plan.md), una feature selezionata per chat.

# Hermes Native Shell Implementation Plan

> For agentic workers: implementation directly in this session, explicitly requested by the user. User direction takes precedence over an additional plan approval cycle.

**Goal:** Build a launchable macOS Hermes shell with native navigation and durable local drafts.
**Architecture:** SwiftUI App owns an Observable store. A Foundation-only repository persists a versioned workspace atomically; UI never invents runtime state.
**Tech Stack:** Swift 6, SwiftUI, Observation, Foundation, SwiftPM; macOS 14+, glass gated macOS 26.
**Spec:** .scratch/hermes-desktop/spec.md; first increment narrowed in docs/design/native-reorientation.md.

## Global Constraints

- Personal runtime and credentials remain untouched.
- Runtime unconfigured is visible; no send, stop, pause or approvals without capability verification.
- Keep documents current after significant blocks.
- Preserve unreadable or newer-version data rather than silently resetting.

## Review Focus

- Relaunch restores draft and selection.
- Switching chat preserves each draft.
- Corrupt JSON and unknown schema cannot be overwritten by UI.
- Narrow windows retain access to navigation and composer.
- Without runtime, typing is allowed but sending is disabled and explained.

### Task 1: Durable workspace

Files: Package.swift, Sources/HermesCore/Workspace.swift, Sources/HermesCore/WorkspaceRepository.swift, Tests/HermesCoreTests/WorkspaceTests.swift.
Interface: WorkspaceRepository.load() throws -> Workspace; save(_ workspace: Workspace) throws. Workspace contains conversations, selection, stable identities and draft text.
- [ ] Verify roundtrip including multiline draft and selected conversation using a temporary directory.
- [ ] Implement atomic writes and schema validation; verify corrupt/newer-version rejection preserves original bytes.

### Task 2: Native UI

Files: Sources/HermesDesktop/HermesApp.swift, WorkspaceStore.swift, ShellView.swift, ConversationView.swift, SettingsView.swift.
Interface: main-actor Observable WorkspaceStore owns workspace and surfaced persistence error. Mutations create/select/update conversations. No runtime transport in this slice.
- [ ] Build sidebar, native toolbar, inspector, composer, Settings and Cmd+N.
- [ ] Verify compilation with SDK, meaningful persistence tests, initial launch and navigation.

### Task 3: Reviewable bundle

Files: scripts/build-app.sh, docs/project/native-shell.md.
- [ ] Build .app with Info.plist and ad hoc local signature.
- [ ] Launch .app and inspect UI. Record tested behavior and remaining integration work.
- [ ] Update status, worklog, skill workflow and architecture decision; no implicit M1 completion.

### Incremento confermato: spazio ricerca/scrittura

- [ ] Aggiungere documento Markdown persistente con decode compatibile degli archivi v1 precedenti.
- [ ] TeamHome con avatar illustrato Hermes, brief locale e stato non collegato.
- [ ] ToolPanel con browser WebKit manuale, elenco documento locale, editor e anteprima Markdown.
- [ ] Navigazione workspace/conversazioni; build e verifica compatibilità archivio precedente.
