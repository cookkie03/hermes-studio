# Hermes Studio

macOS desktop client for **Hermes Agent** with an OpenDots-inspired interface. Self-contained application packaging with local and remote agent connectivity, file workspaces, folder-backed spaces, and routine automation.

---

## Download & Installation

Hermes Studio is distributed as a standalone macOS `.app` inside an installable DMG. It includes its own embedded Node/Electron runtime: **you do not need Node.js, npm, or a development server installed on your Mac**.

### 1. Download
Download the latest `Hermes Studio-0.1.0-arm64.dmg` from the [Releases](https://github.com/cookkie03/hermes-studio/releases) page.

### 2. Install
1. Open the downloaded `.dmg` file.
2. Drag the **Hermes Studio** icon into your **Applications** folder.
3. Eject the disk image.

### 3. First Launch & macOS Gatekeeper
Current development releases use an ad-hoc local signature (no Apple Developer ID notarization ticket yet). When opening for the first time, macOS Gatekeeper may present a security prompt.

- **Recommended:** Right-click (or Control-click) `Hermes Studio.app` in `/Applications`, choose **Open**, then click **Open** in the dialog.
- **Alternative (Terminal):** Remove the quarantine flag:
  ```bash
  xattr -d com.apple.quarantine "/Applications/Hermes Studio.app"
  ```

---

## Runtime & System Requirements

- **Operating System:** macOS 13.0 (Ventura) or newer.
- **Architecture:** Apple Silicon (arm64 — M1, M2, M3, M4).
- **Hermes Agent Backend:** Hermes Studio is a frontend client. To chat with agents and run active background routines, connect to an active Hermes Agent daemon (running locally at `http://127.0.0.1:8000` or reachable via SSH).
- **Offline Mode:** Writing documents, managing local Spaces, viewing file trees, and configuring routines function completely offline without an active backend connection.

---

## Upgrades & Data Preservation

- **Seamless Upgrades:** To upgrade, download the new DMG release and replace `Hermes Studio.app` in `/Applications`.
- **Persistent Data:** All local settings, spaces, documents, and drafts reside in standard macOS Application Support:
  `~/Library/Application Support/Hermes Studio`
  Replacing or updating the app bundle preserves all user data untouched.

---

## Features

- **OpenDots UI Shell:** Clean, responsive sidebar and split-pane interface supporting 900px and 1360px layouts, keyboard navigation, and Reduced Motion.
- **Spaces & Folders:** Folder-backed spaces linking native Mac directories with conflict detection and revision safety.
- **Agent Connectivity:** Connect to local or remote Hermes instances with live health monitoring and zero prompt leaks.
- **Security & Approvals:** Clear visibility and approval prompts for sensitive tool execution.
- **Native Routines GUI:** Inspect and schedule cron and interval routines with run history.

---

## Documentation & Development

- For building from source, testing, and contributing, see [CONTRIBUTING.md](CONTRIBUTING.md) and [desktop/README.md](desktop/README.md).
- [Documentation Index](docs/README.md): Architecture, decisions, and feature specifications.
- [Release Notes](docs/releases/release-notes-v0.1.0.md): Detailed release notes and checksums for v0.1.0.
