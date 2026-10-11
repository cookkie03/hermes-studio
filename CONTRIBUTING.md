# Contributing to Hermes Studio

## Development Setup

### Prerequisites
- macOS 13+ (Apple Silicon recommended)
- Node.js 24+
- npm (comes with Node)

### Clone & Install
```bash
git clone https://github.com/cookkie03/hermes-studio.git
cd hermes-studio/desktop
npm ci
```

### Build & Run (Development)
```bash
npm run build
npm start
```

### Verify & Test
```bash
npm run typecheck          # Strict TypeScript typecheck
npm run test               # Full test suite
npm run test:packaged-ui   # Packaged app smoke test
npm run test:packaged-connections
```

### Package Local DMG
```bash
npm run package:dmg
# Output: desktop/release/Hermes Studio-<version>-arm64.dmg
```

### Full Release Verification
```bash
npm run verify:release
# Runs: test → package:dmg → release:manifest → test:packaged-ui → test:packaged-connections
```

---

## Project Structure

```
hermes-studio/
├── AGENTS.md              # Agent workflow & conventions
├── GLOSSARY.md            # Domain terminology
├── docs/
│   ├── architecture/      # ADRs, feature boundaries, principles
│   ├── agents/            # Workflow docs (feature-workflow.md, issue-tracker.md)
│   ├── design/            # OpenDots design references
│   ├── features/          # Feature cards (F0-F18)
│   ├── project/           # MEMORY, STATUS, WORKLOG, decisions
│   └── releases/          # Release notes, development artifacts
├── desktop/
│   ├── electron/          # Electron main/preload/bootstrap
│   ├── hermes/            # Hermes adapter & gateway (server.mjs, gateway.mjs)
│   ├── scripts/           # Build, verify, test, sign, manifest scripts
│   ├── upstream/          # OpenDots React renderer (MIT-licensed copy)
│   │   ├── src/client/    # React components (App, SpaceWorkspace, etc.)
│   │   ├── src/shared/    # Shared types
│   │   └── tests/         # Vitest/Playwright tests
│   ├── package.json
│   ├── electron-builder.config.cjs
│   └── tsconfig*.json
├── .github/workflows/     # CI/CD pipelines
└── .agents/skills/        # Agent skills
```

---

## Architecture & Boundaries

- **Hermes Agent is the authoritative backend.** Studio is a GUI adapter only — no duplicated executor, scheduler, or runtime logic.
- **Feature ownership** is documented in `docs/architecture/feature-boundaries.md`.
- **F0–F3** are protected baselines — do not modify without explicit user request.
- **One feature per chat** — follow `docs/agents/feature-workflow.md`.

---

## Code Style & Conventions

- TypeScript strict mode (`tsconfig.renderer.json`, `tsconfig.metadata.json`).
- ESLint + Prettier (`npm run lint` if available).
- Electron `utilityProcess` for the interface service; no Node.js integration in the renderer (`contextIsolation: true`, `nodeIntegration: false`).
- Ad-hoc `codesign --sign -` for development; release signing requires Apple Developer credentials in secure CI.
- **Synthetic fixtures only** in packaged tests — no personal profiles, keys, or live model calls.

---

## Pull Requests & Review

1. Open a PR against `main` with a clear scope matching a single feature card (F4–F18).
2. Include test results (`npm run test` + `npm run verify:release`).
3. Follow `docs/agents/feature-workflow.md` → `ask-matt` → `grill-with-docs` if requirements are unclear.
4. `security-diff` scan if workflow/diff review is requested.

---

## License & Provenance

- New code in this repository: **MIT License**.
- Reused OpenDots React renderer: MIT License — notice and pinned SHA in `upstream/LICENSE` and `upstream/PROVENANCE.md`.

---

## Release Checklist (Maintainers)

- [ ] `npm run verify:release` passes on clean runner
- [ ] Release manifest (`release-manifest.json`) + SHA256 checksum generated
- [ ] DMG mounts cleanly; `.app` launches with ad-hoc signature verified
- [ ] Release notes updated (`docs/releases/release-notes-vX.Y.Z.md`)
- [ ] GitHub release draft created with artifacts attached
- [ ] Explicit chat authorization before publishing (not just builder exit 0)