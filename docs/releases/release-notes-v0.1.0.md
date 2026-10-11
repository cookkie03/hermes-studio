# Hermes Studio v0.1.0 Release Notes

**Release Version:** v0.1.0  
**Target Platform:** macOS 13.0+ (Ventura, Sonoma, Sequoia)  
**Architecture:** Apple Silicon (arm64)  
**Packaging Format:** DMG installer with drag-to-Applications link  
**Signing Identity:** Ad-hoc local development signature (no Apple Developer ID notarization)

---

## Overview

Hermes Studio is an OpenDots-inspired native macOS desktop client for **Hermes Agent**. It provides a workspace for conversations, file workspaces, folder-backed spaces, and agent routine automation, connecting seamlessly to your local or remote Hermes backend while functioning offline for document editing and local workspace management.

---

## Included Features Baseline

- **F0 — OpenDots Desktop Shell & Resilience:**
  - Responsive layout (tested at 900px and 1360px).
  - Full keyboard focus navigation and Reduced Motion compliance.
  - Graceful cold resume, offline state notification, and crash recovery.
  - Isolated embedded UI service with strict origin isolation and zero secret inheritance.

- **F1 — Hermes Connection & Host Management:**
  - Attach-only connection management to local Hermes instances (`http://127.0.0.1:8000`) or remote instances over SSH.
  - Automatic loopback candidate probing without unsolicited prompt dispatches.

- **F2 — Conversational Workflow & Native Context:**
  - Conversation threads, message timeline, and streaming tool executions.
  - Multi-thread draft persistence across restarts and origin updates.

- **F3 — Security Approvals & Grants Lifecycle:**
  - In-app approval prompts for sensitive tool execution.
  - Explicit grant scoping, cancellation, and timeout resilience without bypassing human consent.

- **F4 — Workspace Shell Navigation:**
  - Sidebar navigation for Spaces, Dots (personas), and Settings.
  - Honest live connection badge (Connected / Disconnected / Local workspace available).

- **F5 — Desktop File Workspace:**
  - File tree explorer for linked directories.
  - In-app text/markdown file viewer and editor.
  - External modification detection and conflict resolution (`Reload from disk`).

- **F6 — Folder-Backed Spaces:**
  - Link local directory paths directly to named Spaces.
  - Unified view of space folders, files, and legacy documents.

- **F7-A — Selectable OpenDots Avatars:**
  - Local illustrated avatar selection for AI personas and Dots.

- **F10 — Native Routines & Cron Automation GUI:**
  - Management of scheduled routines (interval and cron syntax).
  - Routine editor with frequency selector and parameter configuration.
  - Historical routine run logs and execution status viewer.

- **F13 — macOS Packaging & Distribution:**
  - Self-contained `.app` and DMG distribution.
  - Embedded Node/Electron runtime: no Node, npm, or devserver required on the target machine.
  - Verified package manifest, SHA-256 checksums, and strict deep codesign validation.

---

## Prerequisites & Architecture Requirements

1. **Hardware / OS:**
   - Apple Silicon Mac (M1, M2, M3, M4 series).
   - macOS 13.0 or later.
   - *Intel (x64) is not officially supported or verified in this release.*

2. **Backend Runtime:**
   - Hermes Studio is an interface client. To execute AI conversation turns or trigger automated agent tasks, an active Hermes Agent daemon is required (running locally on port 8000 or accessible via network/SSH).
   - Local notes, document writing, space configuration, and routine inspection remain fully usable offline without a connected runtime.

---

## Installation, Gatekeeper & Upgrades

### Installation
1. Download `Hermes Studio-0.1.0-arm64.dmg` from the GitHub Release.
2. Double-click the DMG to open it.
3. Drag **Hermes Studio** into your **Applications** folder.

### Gatekeeper First Launch (Ad-hoc Signature)
Because this release is built for development distribution and does not currently carry an Apple Developer Team notarization ticket, macOS Gatekeeper may show an alert on first open ("Hermes Studio cannot be opened because it is from an unidentified developer"):
- **Option A:** Right-click (or Control-click) `Hermes Studio.app` in `/Applications`, select **Open**, and click **Open** in the confirmation dialog.
- **Option B (Terminal):** Clear the quarantine attribute:
  ```bash
  xattr -d com.apple.quarantine "/Applications/Hermes Studio.app"
  ```

### Upgrades & Data Preservation
- To update, download the new DMG and drag the application to `/Applications`, replacing the previous version.
- **User data is completely preserved:** All spaces, documents, local settings, and drafts are stored in standard macOS Application Support:
  `~/Library/Application Support/Hermes Studio`
- Quitting or replacing the application never clears or resets user data or Hermes backend profiles.

### Uninstallation
- Move `/Applications/Hermes Studio.app` to Trash.
- If you wish to completely remove local client data:
  ```bash
  rm -rf ~/Library/Application\ Support/Hermes\ Studio
  ```

---

## Limitations & Boundaries

- **Signing:** Uses an ad-hoc local development signature (`codesign --sign -`). Distribution through the Mac App Store or notarized Developer ID requires credentials configured in secure CI.
- **Architecture:** `arm64` only.
- **Updates:** Automatic in-app background updates are not included in this initial release.
