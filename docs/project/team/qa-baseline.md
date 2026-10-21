# QA Baseline Test Report — Hermes Studio

**Date:** 2026-10-22  
**Host Environment:** Debian GNU/Linux (6.12.100+deb13-amd64)  
**Node Version:** v26.5.1  
**npm Version:** 11.17.0  
**Commit SHA:** `2f8bd5604821e364e37078f431e026c598faf9f7`  
**Workspace:** Isolated worktree (`.worktrees/t_2980f926`)

---

## 1. Executive Summary

All core development verification gates passed cleanly in the isolated worktree environment.
Zero fake/mock outputs were used; every gate was independently executed via npm and Node.

| Gate | Command | Result | Duration / Tests |
|---|---|---|---|
| **Typecheck** | `npm run typecheck` | **PASS (exit 0)** | Strict TS: renderer + metadata |
| **Backend Unit / Integration** | `node --test hermes/*.test.mjs` | **PASS (exit 0)** | 95 tests (94 pass, 1 skipped, 0 fail) |
| **Renderer / UI Store Tests** | `npm run test:metadata` (Vitest v4.1.11) | **PASS (exit 0)** | 24 test files, 110 passed |
| **Packaging Inputs Validation** | `npm run verify:package` | **PASS (exit 0)** | Production entrypoint, metadata manifest, MIT notice |
| **Bootstrap Safety Gate** | `npm run test:bootstrap` | **PASS (exit 0)** | Port validation, credential isolation, timeout handling |
| **External Links Security** | `npm run test:external-links` | **PASS (exit 0)** | URL allowlist, private IP/scheme rejection |
| **Full Suite** | `npm test` | **PASS (exit 0)** | All above sequential gates green |

*Note on Skipped Test:* `hermes/server.test.mjs` has 1 deliberately skipped test (`owned native-command service survives client closure and restarts a crashed backend`) due to explicit platform daemon lifecycle constraints.

---

## 2. Gate Execution Evidence

### 2.1 `npm run typecheck`
- `typecheck:renderer` (`tsc --noEmit -p tsconfig.renderer.json`): Exit 0, 0 errors.
- `typecheck:metadata` (`tsc --noEmit -p tsconfig.metadata.json`): Exit 0, 0 errors.

### 2.2 `npm run verify:package`
- Checked production entrypoint (`electron/main.cjs`), preload (`electron/preload.cjs`), bootstrap (`electron/backend-bootstrap.cjs`), server (`hermes/server.mjs`), built renderer assets, metadata manifest, and pinned Electron dependency.
- Result: `PASS: production entrypoint, built renderer, adapter, MIT notice and pinned Electron`.

### 2.3 `npm test` (Full Suite)
- Execution time: ~5.8s total runtime.
- Backend native node test runner: 94 passed, 1 skipped.
- Vitest metadata & renderer suites: 110 passed across 24 test files.
- Scripts: `test-bootstrap.cjs` PASS, `test-external-links.cjs` PASS.

---

## 3. Environment Boundaries & Observations

- **Platform Limitation:** Linux host (Debian amd64). Native macOS desktop smoke tests (`test:packaged-ui`, `test:packaged-connections`, and actual DMG mounting) require macOS Apple Silicon / macOS runtime and cannot be certified on Debian without macOS runner infrastructure.
- **Packaging:** DMG packaging (`npm run package:dmg`) requires `electron-builder` with macOS targets and signing tools (`codesign`, notarization).
