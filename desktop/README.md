# Hermes Studio desktop

Production Electron package for the reused OpenDots interface. The React renderer and page editor are copied from MIT-licensed OpenDots; notice and pinned SHA are in upstream/LICENSE and upstream/PROVENANCE.md. Hermes adapter and packaging are separate modules.

Development prerequisites: Node24+ and npm. Installed application includes Electron's Node runtime; the user does not need npm, a devserver or a separately installed Node.

- npm run build: compile packaged renderer and upstream server modules.
- npm start: launch the packaged entrypoint against built assets and the real Hermes adapter.
- npm run package:dir: create production .app.
- npm run package:dmg: create macOS DMG.

The entrypoint starts only its own interface service at a dynamic loopback port. F1 discovers/attaches to Hermes locally or through OS OpenSSH and can start missing native services through the host supervisor; quitting this UI service never kills the Hermes backend. App archive is dedicated userData. Calls are a future direction and permission requests are denied by default.

Adapter contract: hermes/server.mjs receives HERMES_STUDIO_HOST/PORT/DATA_DIR/STATIC_DIR/OWNER_TOKEN, serves built assets plus /api, and sends process.parentPort.postMessage({type:'ready',port}) once listening. Electron supplies the bearer header only for that same loopback service; it is not exposed to the renderer.

The generated app receives a verified local ad-hoc development signature. It has no Apple Developer identity and is not notarized. Publishing/signing/notarization are separate verified steps.

## Build verification scope

`npm run typecheck` checks both the shipped renderer/shared model graph and the metadata graph under strict TypeScript. `build:metadata` compiles without `--noCheck`. Metadata routes depend on structural contracts in `metadata-contracts.ts`, preserving ownership and revisions in the existing stores. The Hermes JavaScript service is verified by behavior fixtures and real packaged launch.

`typecheck:upstream` preserves the original template-wide check. It currently fails in the inactive CopilotKit/TanStack executor graph because the upstream lock contains incompatible AG-UI message types. This does not count as a passed full TypeScript audit. The production service attaches to Hermes and does not instantiate that executor. Metadata routes no longer import the original Platform type. Legacy executor suites that import CopilotKit may also fail at import time; they are preserved separately under `test:upstream` and are not the product gate.

Electron is pinned at 44.5.1, electron-builder at 26.15.3. The installed Electron runtime was checked: embedded Node 24.21.0 and builtin node:sqlite are available. OpenDots dependencies are pinned to their original lockfile versions to avoid unreviewed SDK upgrades.

Packaging computes a manifest of the 13 reachable metadata modules and includes their original ESM identities. Inactive legacy executor JavaScript is excluded; the product runtime dependency graph is restricted to Hono, its Node server, Zod and the MCP SDK. Original renderer/executor dependencies remain development dependencies, and the upstream manifest is preserved. The manifest rejects unaudited external imports.

Source links open in the default browser only after a trusted user click through the isolated preload. The main process validates the local sender and accepts only parsed HTTP(S) URLs without embedded credentials; the private interface origin and all other schemes remain blocked. Arbitrary popup windows and external redirects remain denied. `npm run test:external-links` verifies the URL boundary.

## MVP quality gate (F0)

Run `npm test` for strict renderer/metadata typechecks, 35 bridge/server/network/SSH/lifecycle fixtures, 55 metadata/editor/display checks, bootstrap and source-link checks. Network fixtures require loopback sockets. Run `npm run package:dir` and `npm run test:packaged-ui` for the macOS arm64 app, using fresh temporary userData and synthetic content. The UI test covers offline startup, memory/Space/document persistence, storage failure, cancelled navigation, revision conflict, restart, a 900 px window and keyboard focus. This does not certify a full VoiceOver audit, runtime chat, tools or a public release.

## F1 runtime connections

Settings → Hermes connections supports local attach and SSH by IP/hostname/config alias. System OpenSSH uses existing keys, config and agent; blank port honors SSH config/default. A new server fingerprint requires an explicit decision, a changed key is rejected. Password/key-passphrase input is transient and retained only in service memory until disconnect/quit; never Keychain, registry, command arguments or helper files.

Choose the host before a conversation creates its native session. Later its host stays fixed. Host IDs scope sessions, events and approvals, including colliding backend IDs. Reconnection reattaches and refreshes owned history; it never replays an uncertain prompt. Registry writes must succeed before new bindings become usable. Existing local session bindings remain local.

Missing services use native `hermes serve` under a user LaunchAgent/systemd unit and native `hermes gateway install --if-missing/start/status`. No Hermes installation, update, scheduler, executor, project or memory implementation is added. Existing services/config/auth gates are preserved. Disconnect/quit closes only the client socket/tunnel. macOS user services require host login; Linux logout persistence depends on linger, which Studio observes without changing. Gateway status does not certify cron/bots or 24-hour execution.

Run `npm run test:packaged-connections` for isolated GUI fixtures. `npm run test:packaged-connections -- --live-mac` and `node scripts/verify-local-attach.mjs --live-mac` explicitly attach to an existing ungated runtime, without startup, sessions, prompts or personal history. `HERMES_STUDIO_DISABLE_AUTOCONNECT=1` isolates synthetic app checks. ssh2 is a development-only fixture dependency; shipped transport is OS OpenSSH. [F1 evidence](../docs/architecture/f1-review-2026-10-04.md).
