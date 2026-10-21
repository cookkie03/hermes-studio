# Release Acceptance Matrix — Hermes Studio macOS DMG

**Target Platform:** macOS 13+ (Ventura, Sonoma, Sequoia) — Apple Silicon (arm64) & Intel (x64)  
**Distribution Channel:** Standalone `.dmg` release artifact (Signed & Notarized)  
**Owner:** QA Tester (`@qa-tester`)  
**Status:** PROPOSED FOR RELEASE CERTIFICATION

---

## 1. Release Gate Taxonomy

Release readiness is partitioned across 5 mandatory certification levels:

```
[Level 1: Build & Source Gate]  --> Debian/CI Host
       ↓
[Level 2: Packaging & Integrity Gate]  --> macOS Builder / CI
       ↓
[Level 3: macOS Installation & System Integrity]  --> Real macOS Host
       ↓
[Level 4: Functional Smoke & Connectivity]  --> Real macOS Host (Packaged App)
       ↓
[Level 5: Resilience, Offline & Cleanup]  --> Real macOS Host
```

---

## 2. Minimal Certification Matrix

| ID | Test Area | Check / Assertion | Execution Environment | Gate Type | Verification Tool / Command |
|---|---|---|---|---|---|
| **L1.1** | Code Quality | TypeScript strict compile (renderer + metadata) | Linux / CI | BLOCKING | `npm run typecheck` (exit 0) |
| **L1.2** | Unit / Integration | Native node backend tests + Vitest renderer store | Linux / CI | BLOCKING | `npm test` (all green) |
| **L1.3** | Package Pre-check | Packaged assets, pinned Electron, manifest match | Linux / CI | BLOCKING | `npm run verify:package` |
| **L2.1** | DMG Build | Clean artifact creation (`Hermes Studio-<ver>-arm64.dmg`) | macOS Runner | BLOCKING | `npm run package:dmg` |
| **L2.2** | Code Signing | Valid Developer ID Application signature | macOS Runner | BLOCKING | `codesign --verify --deep --strict "Hermes Studio.app"` |
| **L2.3** | Notarization & Gatekeeper | Apple Ticket stapled, Gatekeeper assessment pass | macOS Runner | BLOCKING | `spctl --assess --type exec -v "Hermes Studio.app"` & `stapler validate` |
| **L2.4** | Integrity Hash | SHA-256 digest generated and published in manifest | CI / Host | BLOCKING | `shasum -a 256 <artifact>.dmg` vs manifest |
| **L3.1** | DMG Mount / Unmount | DMG attaches without volume corrupted errors; drag-to-Applications layout | macOS Host | BLOCKING | `hdiutil attach`, UI visual inspection |
| **L3.2** | First Launch & Quarantine | Launch without unsigned warning or crash; entitlement check | macOS Host | BLOCKING | Double click from `/Applications` |
| **L3.3** | Microphones / Permissions | Microphone prompt triggered cleanly upon audio feature use | macOS Host | HIGH | Prompt display, TCC approval handling |
| **L4.1** | Standalone Runtime | App window opens with zero devserver/Node dependencies | macOS Host | BLOCKING | System clean of Node/npm; inspect processes |
| **L4.2** | Native Connection | Clean discovery/pairing with local or remote Hermes agent | macOS Host | BLOCKING | UI connection badge, handshake verification |
| **L4.3** | Space / Workspace IO | Create, edit, and autosave documents in local Space | macOS Host | BLOCKING | Document persistence check on disk |
| **L4.4** | UI Smoke & Navigation | Switching between Spaces, Dots, Memory, Settings without crash | macOS Host | HIGH | Manual smoke traversal |
| **L5.1** | Offline Graceful State | Network disconnection displays offline badge without unhandled error | macOS Host | HIGH | Disable network; verify UI state |
| **L5.2** | Clean Uninstall | App deletion leaves no orphaned background daemons or locked files | macOS Host | MEDIUM | Check running processes post-quit |

---

## 3. Host Feasibility & Deficit Analysis

- **Automated in Current Environment (Debian):** L1.1, L1.2, L1.3.
- **Requires macOS Runtime / Dedicated macOS Worker:** L2.1 - L5.2.
  - *Current Deficit:* Debian host cannot sign Apple binaries, attach DMGs (`hdiutil`), or execute macOS Cocoa/Electron binaries.
  - *Recommendation:* L2-L5 gates must be certified on macOS (e.g. via GitHub Actions `macos-latest` or developer Mac machine).
