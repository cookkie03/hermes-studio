# macOS Distribution and Native Runtime Compatibility Research

*Date: October 2026*  
*Role: Research Engineer (`research-engineer`)*  
*Task ID: `t_5bbf9831`*  
*Target: Hermes Studio (`cookkie03/hermes-studio`)*

---

## 1. Executive Summary

This research establishes verified macOS deployment targets, toolchain constraints, GitHub Actions runner viability, and Hermes Agent runtime compatibility for Hermes Studio.

### Core Conclusions
1. **Minimum Supported macOS Version**: **macOS 13.0 (Ventura)**.
   - Electron upstream explicitly bounds platform support to **macOS (Ventura and up)** for current releases (`macOS 13+`).
   - Node.js 24 builds with Xcode 16+ targeting macOS 13+.
   - Studio release manifest and packaging scripts target macOS 13.0.
2. **Honest Architecture Support**:
   - **Apple Silicon (`arm64`)**: Fully supported, configured in toolchains, and verified across packaging pipelines.
   - **Intel (`x64`)**: Not configured, unbuilt in existing workflows, unverified, and Tier-2 / legacy upstream. Studio cannot claim universal "any MacBook" support without explicit cross-compilation and native x64 validation.
3. **GitHub macOS Runners**:
   - The release workflow `.github/workflows/release.yml` currently runs on `macos-14` (Apple Silicon M1 runner).
   - Official GitHub Actions runner schedules document that `macos-14` began deprecation in July and will be fully retired by November 2. The standard default runners are now `macos-15` and `macos-26` (`arm64`). Upgrading the runner to `macos-15` or `macos-latest` (which resolves to `macos-15` or newer arm64) is an actionable DevOps prerequisite.
4. **Hermes Native Runtime Boundary**:
   - Studio's Electron wrapper does **not** install, bundle, or modify the Python Hermes Agent runtime.
   - Studio acts as a client/adapter connecting to an external Hermes runtime (local HTTP daemon on [IP_REDACTED] or remote host via SSH/gateway).
   - Hermes Agent upstream Tier-1 macOS support is **Apple Silicon only**. Hermes CLI on Intel Macs requires manual source/curl installation without desktop bundles.

---

## 2. Cited Evidence and Manifest Sources

| Domain | Source / Reference | Verified Factual Finding |
|---|---|---|
| **Electron Toolchain** | `desktop/package.json`<br>`desktop/package-lock.json` | Pinned Electron version is `44.5.1`. Dependency `electron-builder` is `26.15.3`. Engines declaration requires Node `>=24.0.0`. |
| **Electron Platform Policy** | [Electron Platform Support](https://github.com/electron/electron/blob/main/README.md#platform-support) | *"macOS (Ventura and up): Electron provides 64-bit Intel and Apple Silicon / ARM binaries for macOS."* macOS 12 (Monterey) and older are unsupported. |
| **Packaging Configuration** | `desktop/electron-builder.config.cjs`<br>`desktop/package.json:9-10,97-139` | Packaging targets `--mac dmg --arm64`. Product ID: `com.cookkie03.hermes-studio`. Target category: `public.app-category.productivity`. Signing is ad-hoc development (`sign-development.cjs`). |
| **Release Manifest Contract** | `desktop/scripts/release-manifest.cjs:82-90` | Explicitly declares:<br>- `prerequisites.os`: `"macOS 13.0 or higher (arm64 Apple Silicon)"`<br>- `prerequisites.runtime`: External Hermes Agent required for AI turns; local spaces/notes offline.<br>- `limitations`: Ad-hoc signed (Gatekeeper allowance required), arm64 only, no auto-updater. |
| **Node.js 24 Toolchain** | Node.js 24 Release Specifications & `desktop/package.json:84-86` | Studio strictly enforces `node >= 24.0.0`. Node.js 24 requires macOS 13 SDK / deployment target. |
| **GitHub Actions macOS Runners** | `.github/workflows/release.yml:21`<br>[GitHub Actions Runner Images](https://github.com/actions/runner-images/blob/main/README.md) | Workflow pins `runs-on: macos-14`. GitHub runner schedules announce `macos-14` retirement by November 2; standard arm64 runners are `macos-15` and `macos-26`. |
| **Hermes Agent Platform Support** | [Hermes Agent Docs: Platform Support](https://hermes-agent.nousresearch.com/docs/getting-started/platform-support/) | Tier 1 support includes **macOS (Apple Silicon)** via installer script and desktop. Stable releases build desktop bundles for `arm64` only. Intel (`x64`) bundles are Tier 2 / legacy (`release.py --with macos-intel`). |
| **Hermes Runtime Lifecycle & Autonomy** | `docs/research/hermes-runtime-autonomy.md`<br>`desktop/electron/backend-bootstrap.cjs` | Studio packaged interface server only runs the local Node/Hono UI service (`hermes/server.mjs`). It does not spawn or manage the Hermes Python runtime process. Connection happens over HTTP/WebSocket via `HermesGateway`. |

---

## 3. Compatibility Matrix: Supported, Proposed, and Unverified

| Feature / Dimension | Verified Supported | Proposed / Candidate | Unverified / Unsupported |
|---|---|---|---|
| **macOS OS Versions** | **macOS 13.0 (Ventura), macOS 14 (Sonoma), macOS 15 (Sequoia)** | Support testing on upcoming macOS 26 | macOS 12 (Monterey) and below (Electron & Node 24 toolchain incompatibility) |
| **Hardware Architectures** | **Apple Silicon (`arm64`: M1, M2, M3, M4)** | Universal Binary (`x64` + `arm64` fat binary) via electron-builder target `universal` | Intel (`x86_64`) Macs (not packaged in `.github/workflows/release.yml`, unverified on physical hardware) |
| **CI / Runner Infrastructure** | GitHub Actions `macos-14` (arm64, currently active in repo) | Transition `.github/workflows/release.yml` to `macos-15` | Self-hosted runners, Linux cross-compiling macOS DMG with notarization |
| **Distribution Format** | Unnotarized DMG with ad-hoc code signature (`sign-development.cjs`) | Apple Developer ID signed & notarized DMG with stapled ticket | Mac App Store, Homebrew Cask, auto-updater feed |
| **Runtime Prerequisites** | External Hermes Agent reachable at `[IP_REDACTED]:<port>` or SSH | Automated guided onboarding / install command pointer in GUI | Embedded Python / Hermes Agent bundled inside Studio .app |
| **Native GUI Baseline** | Electron / React with OpenDots UI (F0–F2 baseline) | Native SwiftUI client (historical baseline preserved in `Sources/`) | Rewriting production frontend in SwiftUI without user approval |

---

## 4. Analysis of "Any MacBook" Requirement

The user prompt mentions "any MacBook". From an engineering and platform support standpoint:
1. **Intel Macs (Pre-2020)**:
   - Hermes Studio build configurations explicitly pass `--arm64`. An Intel MacBook attempting to run this DMG will fail with an executable architecture mismatch error (`Bad CPU type in executable`).
   - The upstream Hermes Agent also treats Intel macOS as Tier 2 and does not build Intel desktop DMGs by default.
   - While Electron and Node.js support `x64` builds, creating an Intel or Universal DMG requires adding an `x64` build target to `package:dmg`, doubling CI packaging time, and verifying native dependencies (e.g., `ssh2` optional binaries).
2. **Older macOS Releases (< macOS 13)**:
   - MacBooks running macOS 12 (Monterey), 11 (Big Sur), or 10.15 (Catalina) cannot run Electron 44 / Node 24.
   - Forcing compatibility with older macOS versions would require downgrading Electron and the runtime baseline, violating protected project foundations.
3. **Recommendation**:
   - Reject the assumption of "any MacBook" without qualification.
   - Accurately and honestly state in all release documentation, README, and GUI banners that Hermes Studio supports **Apple Silicon MacBooks (M1 or later) running macOS 13.0+**.
   - If Intel support is prioritized later, schedule a dedicated spike to evaluate universal binaries.

---

## 5. Concrete Decision Blockers & Actionable Recommendations

### Blocker 1: GitHub Runner Deprecation (`macos-14`)
- **Issue**: `.github/workflows/release.yml` is hardcoded to `runs-on: macos-14`. GitHub has scheduled sunset of `macos-14` by November 2.
- **Action**: DevOps Engineer should patch `.github/workflows/release.yml` to `runs-on: macos-15`.

### Blocker 2: Code Signing and Gatekeeper Quarantine
- **Issue**: DMG builds use `sign-development.cjs` which performs ad-hoc signing (`/usr/bin/codesign --force --deep --sign -`). macOS Gatekeeper marks downloads from GitHub releases with `com.apple.quarantine`, blocking normal double-click launch.
- **Action**: 
  - Release notes and DMG window must clearly document the Gatekeeper workaround (Right-Click -> Open, or running `xattr -d com.apple.quarantine "/Applications/Hermes Studio.app"`).
  - Acquiring an Apple Developer ID Application certificate and configuring `APPLE_ID` / `APPLE_APP_SPECIFIC_PASSWORD` in GitHub secrets remains the only path to zero-friction distribution.

### Blocker 3: Architecture Limitation Boundary
- **Issue**: User expectation of "any MacBook" conflicts with actual build artifacts (`arm64` only).
- **Action**: Product Manager and Engineering Director must confirm that the initial F13 release is explicitly scoped to Apple Silicon (`arm64`), leaving Intel support as a documented post-v0.1 backlog item.
