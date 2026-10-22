# F13 CI and development DMG gates

## Implemented pipeline, not a completed release

PRs targeting main and pushes to main run Linux source validation and the reusable macOS arm64 package job. Both use Node 24 and locked `npm ci`. CI workflows run `npm run build:metadata` before `npm test`, and `npm test` itself includes `npm run build:metadata` before running Node adapter tests (which import generated metadata modules like `dist/server/server/store.js`). `npm test` includes renderer/metadata typecheck, metadata compilation, Node adapter tests, selected metadata/UI Vitest suites, bootstrap and external-links tests; it is not every upstream test. Linux builds production assets and verifies package inputs. macOS runs `package:dmg` (build + package verification + electron-builder), with publishing disabled, then codesign deep/strict and hdiutil verification, isolated synthetic packaged UI/connections/conversation tests, manifest generation and independent checksum/source/version verification. No personal runtime or model calls are requested.

All actions are pinned to observed v4 commit SHAs. Build tokens have contents:read and checkout does not persist credentials. Only the draft job has contents:write. No signing secrets are used. The existing development signing hook remains unchanged; ad-hoc signature verification is not Developer ID signing, notarization, Gatekeeper acceptance or proof of installation.

## Integration and first remote run

1. Director integrates reviewed commits and opens the authorized PR. Configure required status checks for Linux source validation and macOS arm64 package validation after their first observed run. Workflow files alone do not configure branch protection.
2. Configure the `macos-release` GitHub Environment with required reviewers and version-tag deployment restrictions before enabling draft creation. An environment name alone does not enforce approval; this task did not change remote settings. Review repository/org Actions permissions as well.
3. Require exact integrated-head CI success. Review actual downloaded DMG, manifest and checksum; separately test mounted DMG drag-to-Applications, first launch/quarantine behavior on supported macOS, accessibility and live runtime acceptance. CI currently verifies the built app and DMG container, not install-from-mounted-image or the complete minimum-OS matrix.
4. With separate release authorization, select an existing tag equal to `v` + desktop/package.json version in Actions → macOS DMG. Default dispatch only validates/uploads artifacts. Enable `create_draft` only to create a draft prerelease after environment approval. Tag pushes validate only; branch dispatch with draft requested fails. No automatic public publication is implemented.
5. Review version-specific release notes before manual publication; historical v0.1.0 prose is not current acceptance evidence. Existing drafts/releases are not overwritten. On a retry after draft creation, inspect the existing draft rather than expecting an idempotent update.

## Traceability and limitations

Artifacts are named `macos-arm64-<github.sha>` with 14-day retention. Three transported files are required: one DMG, its SHA256 sidecar and release-manifest.json. The standalone `node docs/releases/verify-artifacts.cjs DIRECTORY COMMIT VERSION` rejects extra/missing artifacts, invalid paths, wrong source/version/tag/platform/architecture/signature status, size mismatch, SHA256/SHA512 mismatch and malformed checksum sidecars. Run its synthetic unit tests with `node --test docs/releases/verify-artifacts.test.cjs`; fake bytes in these tests are never DMG evidence.

GitHub's artifact record supplies workflow-run provenance. The manifest supplies source commit, package version, architecture, hashes and declared ad-hoc status. The draft job revalidates downloaded bytes and current tag target before creating a draft with `--verify-tag`. A privileged actor can still move a tag after that check; protect release tags administratively. This is consistency checking, not cryptographic build attestation.

The runner is macos-14 arm64; Intel and all macOS versions are not certified. macOS 13+ remains a product target, not a matrix proven here. Credentials for trusted Apple distribution remain absent; adding that channel requires separate authorized work. Linux local tests cannot certify the macOS job, Gatekeeper or notarization. No release/tag/push was performed by this task.
