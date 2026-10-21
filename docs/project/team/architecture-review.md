# Architecture review: integration boundaries and next increment

Date: 2026-10-22. Owner: Tech Lead / Architect. Task: `t_57eb7157`.
Reviewed baseline: `2f8bd5604821e364e37078f431e026c598faf9f7`, branch `wt/t_57eb7157`.
Scope: architecture inspection and executed local gates, not product implementation or release certification. The report commit SHA is supplied in the Kanban completion handoff (a commit cannot contain its own SHA).

## Decision

Keep Electron/React, the existing Hono adapter and the metadata build graph. Select the two bounded F13 increments below, in order, before expanding product scope. No Effect migration, SwiftUI rewrite, new executor, new dependency or Hermes Agent source changes are justified by these findings.

The current kickoff supersedes historical manual selection/relay policy, not protected F0–F3 behavior. F3 is not certified complete. This task changes only this report; Engineering Director owns updates to MEMORY, STATUS, WORKLOG and product tracker. Read sources: AGENTS, ask-matt router, glossary, kickoff, project memory/status/decisions, catalog, feature workflow, architecture principles/boundaries, ADR0005/0006 and F13. Other feature observations below are code evidence, not authorization to implement those features.

## Actual integration map

| Boundary | Observed implementation | Contract to preserve |
|---|---|---|
| Electron main -> UI service | `desktop/electron/main.cjs:15,31` generates an owner token and calls `startInterfaceServer`; `backend-bootstrap.cjs:6-38` forks `hermes/server.mjs` as a utility process with loopback host, dynamic port, private app data and a bounded ready handshake. | Ready message is `{type:'ready',port}` with valid integer port. Main owns the UI child, not the Hermes daemon. Environment filtering removes names matching API_KEY/TOKEN/SECRET/PASSWORD suffixes; it is not proof that every possible secret is filtered. |
| Renderer -> privileged boundary | `main.cjs:51-86` injects bearer authorization for same-origin API calls; renderer has sandbox/context isolation, no Node integration. `preload.cjs:4-18` exposes product metadata and narrowly scoped browser mount/unmount, plus trusted-click external navigation. | Do not expose generic IPC, filesystem, shell or token to renderer. Browser IPC validates sender and origin. Service enforces API host/origin, timing-safe bearer equality, JSON writes and body limits (`server.mjs:79-93`). |
| Studio -> Hermes runtime | `connections.mjs:18-65` owns per-connection bridge slots and persisted thread bindings; `gateway.mjs` uses HTTP plus WebSocket RPC. `host-backend.mjs` discovers endpoints or invokes host bootstrap; `ssh.mjs:2,17` uses OS OpenSSH via subprocess, not ssh2. | Preserve F1 connection/authentication ownership. Native service discovery/start through supervisor is separate from UI-service lifetime; no parallel OpenDots executor. Closing UI or transport is not cancellation of runtime work. |
| Conversation -> native operation | `native-scope.mjs:1-17` resolves thread, gateway, runtime session, profile and transport generation and rejects stale owners; `server.mjs:114-145` validates thread ownership for history, sends and events. | Reuse existing session ownership seam where applicable; do not infer identity from visible names. Not every feature uses this helper: memory/routines use explicit connection/profile contracts. This inspection is not a blanket security certification. |
| Studio metadata -> package | `server.mjs:8-11,27-28` imports generated Store/WorkspaceStore/createApp/routes; `scripts/metadata-manifest.cjs:5-30` traverses four entrypoints and allowlists runtime packages. Builder includes only that generated metadata manifest plus renderer/adapter assets. | Keep Studio workspace metadata distinct from Hermes memory/session storage. Keep legacy executor exclusion. A source-only typecheck does not generate required test imports. |

The architecture has three main application roles (main, utility service, renderer), plus Hermes and any native browser contents; it is not a single process or a second agent runtime. `main.cjs:93` shuts down its owned UI service. No live daemon was contacted deliberately in this review.

### Preserved SwiftUI baseline

`Package.swift:4-10` defines HermesCore, HermesDesktop and core tests with macOS 14 minimum. `Sources/HermesDesktop/HermesApp.swift:4-23` mounts ShellView/SettingsView. `WorkspaceStore.swift:12-20,61-64` stores its historical workspace separately in HermesDesktop-Development and preserves load/write errors. `Sources/HermesCore/HermesRuntimeClient.swift:83-107,128-198` contains an actor-based attach-first URLSession/WebSocket client with generation-bound disconnect handling.

ADR0005 selects the Electron product while preserving this baseline. The current Electron scripts do not build the Swift package. No Swift build or macOS execution was attempted here. Do not confuse the Swift macOS 14 deployment target with the Electron manifest's claimed macOS 13 support, or migrate either store implicitly.

## Docs-to-code gaps and release risks

### 1. Clean checkout cannot reach existing release gates in their current order (release blocker)

Observed: after fresh `npm ci` and successful typecheck, `npm test` exits 1 with `ERR_MODULE_NOT_FOUND` for `desktop/upstream/dist/server/server/store.js`, imported by `hermes/server.mjs`. After `npm run build`, the same suite exits 0. `build:metadata` is the relevant prerequisite; rebuilding the renderer solely for Node imports is unnecessary.

`.github/workflows/release.yml:35-53` installs, typechecks and runs those Node tests BEFORE `package:dmg` runs the build. This is a source-derived CI failure risk backed by local reproduction, not an observed GitHub run. A warm checkout passing tests does not certify fresh CI. `verify:release` also starts with `npm run test` (`desktop/package.json:27`).

### 2. Manifest generation is descriptive, not a fail-closed release gate (release blocker)

`desktop/scripts/release-manifest.cjs:16-49` selects the first `.dmg`, checks size, hashes it, and catches codesign failure without failing the script. A missing `.app` leaves `not_verified`; the script still writes a manifest and prints PASS (`:93-101`). The development signing hook does fail on codesign errors, but standalone manifest generation can consume stale/unrelated output. The app checked beside the DMG is not proof of the app actually inside that DMG.

`.github/workflows/release.yml:95-112` derives publication tag from `GITHUB_REF_NAME`; a manual dispatch on a branch supplies a nonempty branch name, so the fallback does not establish a version tag. Notes are hardcoded to v0.1.0. No explicit `--target`/tag-to-built-SHA validation is present. Keep publication blocked until artifact, manifest, version, tag and source SHA agree.

### 3. Local smoke failure is not a macOS product failure or Linux support promise

Executed `test:packaged-ui` and `test-packaged-connections.cjs` both exit 1 at `/private/tmp` creation on Debian. Five smoke harnesses still use this path: packaged UI, connections, approvals, conversations and native browser; `verify-local-attach.mjs` also uses it. Commit `f3f1bf3` changed selected Node fixtures/SSH, not all scripts.

More importantly, `test-packaged-ui.cjs:7` and `test-packaged-connections.cjs:11-18` launch `release/mac-arm64/Hermes Studio.app/Contents/MacOS/Hermes Studio`. Replacing tmp paths alone will NOT make these macOS packaged tests runnable on Linux. They require the built app and macOS graphical environment. Keep cross-platform unit/build gates separate from macOS artifact gates. Do not weaken a failed smoke into an unexplained successful skip.

### 4. Catalog status is neither absence-of-code nor proof of completion

Catalog labels such as F8 'not implemented' and F10 'to select' are not an accurate inventory of all source artifacts. `HermesObservabilityView.tsx:10-48`, `memory.mjs:68-92` and `f8-observability.test.tsx` already exist. Search for `HermesObservabilityView` under upstream finds only its definition and test import/render: no production mount was found. The native adapter reads `/api/memory?profile=...`, resolves profile paths via `profiles.list`, then optionally reads native memory files and soul metadata. Do not invent `memory_list` RPC or a replacement MemoryViewer component.

F10 already has `RoutinesView`, `RoutineEditor`, `RoutineRunHistory`, native HTTP adapter and tests. `App.tsx:41,797` actually imports/mounts RoutinesView; `routines.mjs:62-65` reads `/api/cron/jobs` scoped by profile. Do not create a parallel RoutinesPanel or claim the UI is absent. Fixture success does not establish compatibility with a connected live runtime or all acceptance criteria.

`capability-matrix.mjs:164-182` overrides static catalog status using connected discovery; static `verified_studio` strings are not native capability verification. PM should map code, exposure, synthetic tests and live evidence separately, retaining protected F0–F3 status constraints.

### 5. Distribution claims remain unverified here

`package.json` targets arm64 macOS; `scripts/sign-development.cjs:4-11` applies and verifies ad-hoc signing to the generated app, not Developer ID/notarization. The manifest declares macOS 13+, but this Debian review cannot validate that floor, installation, quarantine/Gatekeeper behavior, Intel, VoiceOver or a DMG's contents. F13 explicitly prohibits bypassing Gatekeeper; keep a labeled development/draft channel until appropriate signing credentials and actual platform acceptance exist. Do not prescribe quarantine removal as the release solution. No automatic updater or universal-build migration is needed for these increments.

## Recommended next increments: exact ownership and contracts

Both are within the already selected F13 release track. These are recommended work packets for the existing Director/DevOps lane, NOT new implementation tasks created by this review. Director should deduplicate against sibling work before assigning.

### A. Fresh-checkout test gate through a verified candidate app

Owner: `devops-engineer`, independent verification by `qa-tester`.

Files permitted: `desktop/package.json`, `.github/workflows/release.yml`, `desktop/README.md`. No adapter, F0–F3 behavior, runtime installation or dependency changes. If adding a separate PR gate is needed, proposed new `.github/workflows/ci.yml` is F13-owned; it does not exist at this baseline.

Contract/design decision: compile metadata before any `hermes/*.test.mjs` import in both local npm test and CI. Put the prerequisite in the shared npm test entry (pretest or explicit command prefix; no new wrapper), then have CI use that entry instead of duplicating its component commands. Preserve all existing typecheck, Node, Vitest, bootstrap and external-link gates. Keep build/verify/package/smoke before artifact upload and publication. Do not count a Mac smoke skip on Debian as a pass.

Acceptance: from a new isolated checkout with no `upstream/dist`, `npm ci --no-audit --no-fund && npm test` succeeds; `npm run build && npm run verify:package` succeeds. Record expected Node skip reason. On macOS arm64, build DMG and run existing packaged UI/connections smoke with synthetic data and auto-connect disabled, then verify mounted/copied app according to F13. Failure blocks downstream publication. Linux validates source/build, not DMG installation. No product/runtime prerequisite beyond existing scripts; macOS execution is an external platform requirement.

### B. Bind manifest and draft publication to the exact verified artifact

Owner: `devops-engineer`, security review by `security-engineer`, acceptance by `qa-tester`.

Files permitted: `desktop/scripts/release-manifest.cjs`, proposed new `desktop/scripts/release-manifest.test.cjs`, `desktop/package.json` (only wire the manifest test), `.github/workflows/release.yml`, `docs/releases/release-notes-v0.1.0.md`. Do not alter signing identity or introduce certificates. `sign-development.cjs` is a read-only reference unless a concrete separately reviewed defect requires it.

Contract/design decision: retain the existing manifest shape, but require exactly one intended DMG and its matching app; reject missing/ambiguous artifacts, unknown source SHA, failed codesign and mismatched requested version/tag. Distinguish signature verification from notarization; never label ad-hoc success as Developer ID acceptance. Bind release tag to the verified build commit, not branch name/default branch. Manual draft flow must receive/validate a version tag matching package version; existing tags must resolve to the built SHA. Do not silently overwrite a mismatched release. Preserve build/verify vs publish separation and grant contents-write only to publication where possible.

Testing contract: use node:test and isolated synthetic files/process seams (no new test dependency). Exercise missing app, zero/multiple DMGs, too-small artifact, failed codesign, unknown SHA, mismatched tag/version, and successful SHA256/size/filename consistency. A stubbed codesign result is only a unit test. On macOS independently verify the real DMG (`hdiutil verify`, read-only mount), inspect and verify the contained app signature and architecture, then run the same packaged smoke after copying from the image. Match the emitted checksum and manifest commit to uploaded artifact bytes and release tag. Exercise dispatch-on-branch rejection/explicit-tag validation without publishing during unit tests.

Dependencies: A's exact-head gate and a macOS runner. Production Developer ID/notarization needs securely supplied credentials and separate acceptance; lack of those does not justify inventing a signed release. Director authorizes publication only after independent artifact verification. No new product feature is a prerequisite.

Shared ownership warning: A and B both touch `desktop/package.json` and `.github/workflows/release.yml`; use one DevOps owner and serialize B after A. This report does not edit either file. Director owns shared logs and final integration, avoiding parallel writes from the eight review lanes.

## Executed evidence

Commands ran in this isolated worktree, with Node v26.5.1 and npm 11.17.0 on Debian. No push, tag, publish, real user prompt, personal runtime modification or product code edit occurred.

| Command | Actual result |
|---|---|
| `git status --short`, `git branch --show-current`, `git rev-parse HEAD` | Initially clean; `wt/t_57eb7157`; baseline SHA above. |
| `npm ci --no-audit --no-fund` in desktop | Exit 0; 1,267 packages installed from lockfile. Deprecation and pending install-script warnings surfaced; no dependencies upgraded and no blanket script approval. |
| `npm run typecheck` | Exit 0, renderer and metadata strict checks. |
| `npm test` before build | Exit 1; generated `upstream/dist/server/server/store.js` missing. |
| `npm run build` | Exit 0; Vite transformed 2,249 modules; chunk-size warning; metadata manifest reports 16 reachable modules, legacy executor excluded. |
| `npm test` after build (also repeated with saved output) | Exit 0; Node: 95 tests, 94 pass, 0 fail, 1 skipped; Vitest: 24 files / 110 tests pass; bootstrap and external-link checks PASS. |
| `npm run verify:package` | Exit 0; production entrypoint/assets/adapter/MIT/pinned Electron check PASS. This checks package inputs, not a DMG. |
| `npm run test:packaged-ui` | Exit 1, ENOENT creating `/private/tmp/hermes-studio-flow-*`; no app launched. |
| `node scripts/test-packaged-connections.cjs` | Exit 1, ENOENT creating `/private/tmp/hs-connections-ui-*`; no app launched. |

The repeated test log is `/home/luca/.hermes/profiles/tech-lead/cache/scratch/t_57eb7157-npm-test.log` (ephemeral local execution evidence, not a release artifact). A tracked evidence copy accompanies this review at `docs/project/team/evidence-t_57eb7157-npm-test.txt`; its single Node skip is `owned native-command service survives client closure and restarts a crashed backend`. macOS packaging/smoke, live runtime acceptance, remote GitHub CI and Swift builds were not run. No readiness claim is based solely on a fixture or an old document.

## Director handoff

Inspect this report's commit before integration. Prioritize A (reproduced clean-checkout failure), then B (fail-closed artifact/tag binding); coordinate with existing DevOps findings rather than creating duplicate lanes. Carry the observed before/after build results, smoke limitations and F8/F10 inventory discrepancies into the shared project logs/requirements map. Keep protected F0–F3 untouched and expose missing live/platform evidence honestly. The pre-created integration child `t_22d9960a` is the continuation; this review's completion releases that dependency, not a product release approval.
