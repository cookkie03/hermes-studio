# F13 — macOS packaging and GitHub DMG releases

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the frontend/integration F13**, following the workflow below and the card-specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before coding. The “documented/not implemented” labels describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** client distribution, separate from backend capabilities. The Fxx separation establishes ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Produce an installable release of the selected version with .app/DMG, manifest/checksum and verifiable limitations.

**Backend and boundary:** Studio packaging and compatibility with the selected Hermes version; no new backend or implicit personal runtime installation. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** Honest first launch, connection/host status and capabilities; declare functionality not included, rather than demonstrating the backlog. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements identified here and leave other functionality to its respective owners.

**Dependencies and additional reading:** Distribute only already-verified features; publication/signing/credentials follow chat authorization. A historical DMG does not prove a new release. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Required specific tests for the relevant increment:** Shipped-graph build, clean installation, launch without an npm devserver, declared checksum/signing/notarization, upgrade/preserved data and no secrets in the bundle. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified graph and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the spec/principles, fix discovered issues, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare tests not performed and external blockers; completion requires proven increment gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within actual authorizations and capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: documented, to be developed in a dedicated chat. A local ad-hoc DMG exists; pipeline and public releases are not complete. This is the handoff document requested by the user.


<!-- feature-guidance:start -->
## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [writing-plans](<../../.agents/skills/writing-plans/SKILL.md>) | Pipeline with build/verification/publication gates |
| [documentation-and-adrs](<../../.agents/skills/documentation-and-adrs/SKILL.md>) | Release version, prerequisites and limitations |
| [wizard](<../../.agents/skills/wizard/SKILL.md>) — conditional | Only signing or CI credentials to be supplied by the user |
| [pr](<../../.agents/skills/pr/SKILL.md>) — conditional | If creating a PR |
| [security-diff](</Users/luca/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.31/skills/security-diff-scan/SKILL.md>) — conditional | If a review of the packaging workflow/diff is requested |

### Entry points to read

- [desktop/package.json](<../../desktop/package.json>): Commands and version.
- [desktop/electron-builder.config.cjs](<../../desktop/electron-builder.config.cjs>): Packaging.
- [desktop/scripts/sign-development.cjs](<../../desktop/scripts/sign-development.cjs>): Ad-hoc development signing.
- [desktop/scripts/verify-package.cjs](<../../desktop/scripts/verify-package.cjs>): Manifest and checks.
- [docs/releases/development-artifacts.md](<../../docs/releases/development-artifacts.md>): Historical evidence.
- [Hermes: apps/desktop/BUILDING.md](</Users/luca/.hermes/hermes-agent/apps/desktop/BUILDING.md>): Hermes distribution reference; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Goal

Produce versioned releases from the `cookkie03/hermes-studio` repository with an installable DMG, checksum, clear notes and user instructions. The user downloads, opens the DMG and drags .app into Applications; they must not need to install Node/npm or launch npm run dev. The Hermes runtime is an explicit prerequisite until a separate feature handles its installation.

## Concrete baseline and version selection

`desktop/package.json`, package-lock, electron-builder.config.cjs, scripts/sign-development.cjs, electron/main.cjs and README contain arm64 packaging. Build/test source ../releases/development-artifacts.md. Historical SHA256 must not be reused after a rebuild. Historical SwiftUI Sources is not the main product to package for this release.

Choose the tag/version and set of features actually included. No derived repository, origin changes or automatic merges from external projects. Preserve LICENSE/PROVENANCE and dependency notices. New-code licensing and branding/icon must be defined before declaring a final public release.

## Chat scope

1. Verify remotes/GH CLI and branch/commit; clean working tree or explicit snapshot. Confirm version, supported architectures and feature baseline.
2. Reproducible scripts install lock→typecheck shipped→fixture→build production→verify package→app→DMG→manifest checksum/size/commit/version/arch.
3. macOS CI with versioned cache, minimal permissions and source-reviewed workflow; separate build/verify from publish. Node/npm are developer/CI tools, included in the product where necessary.
4. DMG contains .app and an Applications link; embedded Electron/Node and an owned UI service. No devserver/hardcoded localhost or included personal secrets/configuration/runtime/database.
5. Signing: declared ad-hoc development channel; Apple Developer/notarization/stapling release only with account/credentials provided through secureCI. Do not invent identities or bypass Gatekeeper. If the account is missing, keep a clearly labeled draft/devrelease and explain the prerequisite.
6. Generate release notes with macOS/architecture support, included features, runtime setup, limitations, installation/upgrade/uninstall with preserved data. Repository README targets user downloads, CONTRIBUTING targets development.
7. Prepare a GitHub release draft tied to the verified tag/commit, attaching DMG+SHA256+manifest. Publish only if authorized in the F13 chat and all gates pass; do not publish merely because the builder exits 0.

An auto-updater is not mandatory for the first release; do not add backend accounts/certificates or an update feed as a diversion. Intel/universal must be tested natively before being promised; current arm64 does not prove x64.

## Gates and tests

Fresh build on the chosen commit and clean runner; inspect actual signature, codesign deep strict, DMG integrity and read-only mount; launch .app from the mount/after copying without an external development toolchain; new synthetic userData and a meaningful absent-runtime state, then isolated fixtures for chat/error/persistence. Understandable permission requests and metadata upgrades without data loss. Audit secrets and artifacts, license/notices/icon/privacy docs. Download release assets from the draft/published release and compare hashes with local files; remote tag and GitHub API confirm identity. Do not confuse an initiated upload with a complete asset or a created release with a published one.

## Ownership and dependencies

F0 baseline gates and selected feature versions; ownership of packaging/CI/release docs. Do not modify browser, Bots, routines or chat to complete F13. If an app gate fails, record the blocker and a bounded fix, rather than expanding the product. No tags, Actions or releases are created in this preparation chat.

## Prompt to pass to Codex

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Turn the GitHub repository cookkie03/hermes-studio into distributable macOS software by following only docs/features/F13-github-releases-dmg.md. Read AGENTS.md, MEMORY/STATUS, ADR0006 and principles.md; verify status, remotes and actual artifacts. Prepare reproducible builds and CI, .app+DMG+checksums+notes, npm-free installation for users and a GitHub release draft. Preserve data, licenses and credentials; do not implement other features or derived repositories. Do not claim notarization without evidence. Before publication, verify all gates and explicit chat authorization. Deliver confirmed release/commit URLs and checksums or precise prerequisites. Also follow the Assignment for the implementing chat for F13: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions still apply.
