# DevOps findings and release-engineering increment

## 1. Summary of changes

Implemented a two-tier, gated validation and draft pipeline for Hermes Studio under exclusive DevOps ownership:
- `.github/workflows/ci.yml`: Linux PR/main gate with commit-pinned actions, locked `npm ci`, full `npm test`, production `npm run build`, input verification, and reusable call to macOS package validation.
- `.github/workflows/release.yml`: Refactored with least permissions (`contents: read` during build/verify; `contents: write` isolated in a dedicated draft job gated behind `environment: macos-release`, manual dispatch with `create_draft: true`, tag targeting and commit verification). Includes `codesign --verify --deep --strict`, `hdiutil verify`, synthetic packaged UI/connections/conversation tests, manifest generation and independent checksum/source/version verification.
- `docs/releases/verify-artifacts.cjs` and `verify-artifacts.test.cjs`: Independent verifier enforcing SHA256/SHA512, file size, source commit, version, tag, platform/architecture and explicit ad-hoc signature status before artifact upload/draft. Its 15 tests use synthetic bytes and are not DMG evidence.
- `docs/releases/ci-release-runbook.md`: Operations guide for release gates, security boundaries, ad-hoc limitations and required remote protections.

## 2. Verification evidence

Local Linux, under Node v24.22.0:
- `npm ci --no-audit --no-fund`: passed (before tests; no tracked lock/package changes).
- `npm test`: passed (typecheck, Node adapter tests, selected Vitest suites, bootstrap, external links).
- `npm run build`: passed (production Vite client and metadata build).
- `npm run verify:package`: passed (packaged entrypoint, adapter, MIT notice, pinned Electron).
- `node --test docs/releases/verify-artifacts.test.cjs`: 15/15 tests passed.
- `actionlint .github/workflows/ci.yml .github/workflows/release.yml`: passed without warnings/errors.
- `git diff --check`: passed.

`npm run package:dmg`, codesign, hdiutil and packaged-app smoke cannot run on this Linux host; only the GitHub macOS arm64 job can validate them. No such remote run has been triggered by this task.

## 3. Scope and boundaries

No edits to `desktop/package.json`, lockfile, electron-builder configuration or software-owned `desktop/scripts/verify-package*`. No push, tag, release publication, secret change or personal runtime modification. The workflow does not claim Apple Developer ID signing, notarization, Intel support or certified installation behavior.

## 4. Pending integration and remote checks

- Director reviews and integrates this commit into the authorized PR; exact-head CI must pass remotely.
- After the first PR run, configure required status checks using the actual Linux and macOS job names; YAML does not configure branch protection.
- Configure `macos-release` environment with required human reviewers and tag restrictions. Naming an environment alone does not enforce approval.
- Inspect mounted-image install/first launch, quarantine/Gatekeeper behavior and minimum macOS coverage separately; synthetic packaged tests exercise the built app, not image installation.
- Review existing version-specific release-note claims before publication; historical prose is not acceptance evidence.
- Shared MEMORY/STATUS/WORKLOG remain orchestrator-owned; integrate this evidence there without concurrent edits.
