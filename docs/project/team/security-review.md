# Security Audit & Supply Chain Review: Hermes Studio (v0.1.0)

**Date:** 2026-10-22  
**Auditor Profile:** `security-engineer`  
**Task ID:** `t_2578797a`  
**Scope:** Electron sandbox, preload/IPC surfaces, path grant security, external link sanitization, native runtime isolation, token & secret redaction, GitHub Actions supply chain, artifact integrity, macOS code signing & notarization, and auto-update trust boundaries.  
**Protected Baseline:** F0–F3 preserved intact.

---

## Executive Summary

Hermes Studio demonstrates strong defensive architectural decisions regarding local runtime isolation and desktop sandbox boundaries:
- The main window runs with Electron `sandbox: true`, `contextIsolation: true`, `nodeIntegration: false`, and an isolated session partition (`hermes-studio-ui`).
- Preload scripts (`desktop/electron/preload.cjs`) do not expose Node.js primitives, file system APIs, shells, or unconstrained IPC channels.
- External link handling strictly validates schemes (`http:`, `https:` only) and rejects credentials, loopback private origins, and overly long URLs.
- Child utility processes strip process environment variables ending in `API_KEY`, `TOKEN`, `SECRET`, and `PASSWORD` prior to fork.
- The packaged distribution strictly pins Electron dependencies and forbids legacy executor scripts.

However, several critical release blockers and supply chain vulnerabilities were identified in the GitHub release workflow and packaging pipeline:
1. **GitHub Actions Workflow Over-Privileged & Unpinned Actions (High):** `.github/workflows/release.yml` grants top-level `contents: write` to the build job, uses unpinned third-party actions (`actions/checkout@v4`, `actions/setup-node@v4`, `actions/upload-artifact@v4`), and does not pin runner dependencies.
2. **Missing Checksum Verification in Artifact Publishing (Medium):** The artifact publishing step relies on directory globs rather than strict digest-verified attestations.
3. **Ad-Hoc Signing & Absent Gatekeeper Notarization Story (Release Blocker / Critical for macOS distribution):** Ad-hoc codesigning (`--sign -`) means macOS Gatekeeper will block first launch on macOS Ventura/Sonoma/Sequoia without explicit user quarantine bypass. Clear honest declaration and packaging verification are mandatory.
4. **Vite Client Types Misalignment in TypeScript Renderer Compilation (Low):** Typechecking fails in clean worktrees unless dependency paths or tsconfig paths are correctly mapped.

---

## Finding Details & Evidence

### 1. SEC-01: GitHub Actions Supply Chain & Workflow Permission Hardening
- **Severity:** High
- **Files & Lines:** `.github/workflows/release.yml:15-16`, `.github/workflows/release.yml:24,29,66,83,86`
- **Evidence:**
  ```yaml
  permissions:
    contents: write
  ```
  Top-level write permission is applied to `build-and-verify`. The build step only requires read access (`contents: read`). Only the final `publish-release` job requires `contents: write`.
  Third-party actions use mutable tags (`@v4`) instead of immutable commit SHAs, exposing the release pipeline to tag-mutation supply chain attacks.
- **Impact:** Compromised action dependencies or runner compromise during the test/build phase could lead to arbitrary repository write operations.
- **Safe Reproducible Check:**
  `grep -n "permissions:" .github/workflows/release.yml`
- **Minimal Fix:**
  - Set top-level permissions to `contents: read`.
  - Scope `contents: write` strictly to the `publish-release` job.
  - Pin actions by full commit SHA with inline version comments.

### 2. SEC-02: Ad-Hoc Signing and macOS Gatekeeper Reality
- **Severity:** Release Blocker (macOS Distribution)
- **Files & Lines:** `desktop/scripts/sign-development.cjs:9-11`, `desktop/scripts/release-manifest.cjs:79-80`, `desktop/electron-builder.config.cjs:7`
- **Evidence:**
  `signDevelopment` executes `/usr/bin/codesign --force --deep --sign -`.
  This creates an ad-hoc signature without Apple Developer ID certificates or notarization ticket stapling.
- **Impact:** macOS Gatekeeper flags unnotarized DMG applications as damaged or from an unidentified developer. Users must manually right-click -> Open or run `xattr -cr /Applications/Hermes\ Studio.app`.
- **Honest Release Requirement:**
  - Release manifest (`desktop/scripts/release-manifest.cjs`) and release notes (`docs/releases/release-notes-v0.1.0.md`) already truthfully record this limitation.
  - Ensure packaging scripts do not claim notarization when ad-hoc signing is performed.

### 3. SEC-03: Electron Preload & IPC Boundary Audit
- **Severity:** Low (Hardened / Verified)
- **Files & Lines:** `desktop/electron/main.cjs:20-30,76-86`, `desktop/electron/preload.cjs:4-19`
- **Evidence:**
  - Preload freezes exposed objects (`Object.freeze`).
  - Preload only exposes `platform`, `packaged: true`, and `browser` mount/unmount methods.
  - `window.addEventListener('click', ...)` validates `event.isTrusted`, enforces http/https protocol check, and dispatches external URLs via `hermes:open-source`.
  - IPC handler `hermes:open-source` verifies `event.sender === window.webContents` and `sameOrigin(event.senderFrame?.url)`.
  - `window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }))` denies popup windows.
  - Navigation handlers (`will-navigate`, `will-redirect`) enforce `sameOrigin(url)`.
  - `will-attach-webview` unconditionally calls `event.preventDefault()`.
- **Verdict:** Complies with Electron security best practices.

### 4. SEC-04: Credential & Environment Variable Redaction
- **Severity:** Verified Clean
- **Files & Lines:** `desktop/electron/backend-bootstrap.cjs:14-17`, `desktop/hermes/host-bootstrap.py`, `desktop/hermes/audio.test.mjs`
- **Evidence:**
  ```javascript
  const environment = { ...process.env };
  for (const key of Object.keys(environment)) {
    if (/(?:API_KEY|TOKEN|SECRET|PASSWORD)$/.test(key)) delete environment[key];
  }
  ```
  `utilityProcess.fork` cleans sensitive keys before launching the backend service child.
  In addition, child stdout/stderr are drained without streaming to public log sinks (`desktop/electron/backend-bootstrap.cjs:41-42`).
  Hermes audio endpoints project secret-free profile routes (verified by `audio.test.mjs:16`).

### 5. SEC-05: Local Storage & Path Grant Boundary
- **Severity:** Verified Clean
- **Files & Lines:** `desktop/upstream/src/server/file-service.ts:57-65`, `desktop/upstream/src/shared/file-workspace.ts:161-190`
- **Evidence:**
  `validatePathSecurity` strictly forbids path traversal (`../`, `/..`), null bytes (`\0`), leading slashes, and verifies symlink realpath targets remain inside the authorized root folder.
  `FileWorkspaceService` runs dual validation before reading, listing, and writing.

### 6. SEC-06: External Link Sanitization
- **Severity:** Verified Clean
- **Files & Lines:** `desktop/electron/external-links.cjs:2-9`, `desktop/scripts/test-external-links.cjs:7-9`
- **Evidence:**
  ```javascript
  function sourceURL(value, privateOrigin) {
    if (typeof value !== 'string' || value.length > 8192) return null;
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.origin === privateOrigin) return null;
      return url.href;
    } catch { return null; }
  }
  ```
  Rejects `javascript:`, `file:`, `data:`, embedded credentials (`user:pass@host`), loopback private service addresses, and URL strings over 8192 characters.
  Verified by `test-external-links.cjs` with exit code 0.

---

## Supply Chain & Packaging Verification Evidence

| Check / Test Target | Command / Path | Safe Result / Evidence | Status |
|---|---|---|---|
| External Link Filtering | `node desktop/scripts/test-external-links.cjs` | `PASS: source URL http(s) allowlist; credential, scheme, private-service and malformed URL rejection` | PASS |
| Backend Bootstrap Isolation | `node desktop/scripts/test-bootstrap.cjs` | `PASS: ready-port validation, credential isolation, owned-service timeout and early-exit handling` | PASS |
| Hermes Native Suite | `node --test desktop/hermes/*.test.mjs` | 94 tests PASS, 0 fail, 1 skipped | PASS |
| Packaging Allowlist Check | `node desktop/scripts/verify-package.cjs` | `PASS: production entrypoint, built renderer, adapter, MIT notice and pinned Electron` | PASS |
| GitHub Workflow Permissions | Audit `.github/workflows/release.yml` | Top-level permissions should be restricted to `contents: read` | Identified & Recommended |

---

## Release Blockers & Recommendations

1. **Gatekeeper Notification Requirement:**
   - Because no Apple Developer ID certificate or notarization pipeline exists in the build environment, the release artifacts must be explicitly documented as ad-hoc signed for development/testing.
   - The release notes in `docs/releases/release-notes-v0.1.0.md` and release manifest correctly reflect this. Do not advertise automated Gatekeeper clearance.

2. **GitHub Actions Workflow Hardening:**
   - In `.github/workflows/release.yml`, restrict permissions at workflow root to:
     ```yaml
     permissions:
       contents: read
     ```
   - Only elevate `publish-release` with:
     ```yaml
     permissions:
       contents: write
     ```
   - Pin third-party actions to complete Git commit SHAs.

3. **No Codebase or Protected F0–F3 Modification:**
   - The Electron security model in `main.cjs`, `preload.cjs`, and `backend-bootstrap.cjs` correctly adheres to F0–F3 invariants. No breaking or invasive refactors required.
