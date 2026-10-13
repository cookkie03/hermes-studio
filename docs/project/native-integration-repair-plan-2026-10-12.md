# Hermes Studio: native integration repair plan

**Goal:** Correct the eight reviewed defects and replace simulated production outcomes with working native Hermes integrations wherever supported by the connected runtime.
**Architecture:** Keep Electron/React and the existing authenticated Studio service. Hermes owns Bot identities, projects, execution, scheduling, memory and receipts. Studio adapters route by connection/profile/session, translate supported contracts, and refuse unsupported operations before claiming success.
**Tech stack:** Existing Electron 44, Node/Hono, React/TypeScript, native Hermes HTTP/WebSocket contracts.
**Spec:** current-functionality-review-2026-10-12.md plus selected F5/F6/F7/F12/F14/F16/F17 and shared GUI context requirements.
**Execution:** Native implementation in this chat; parallel source research via research skill, independent final Standards/Spec review via code-review. The explicit user request to correct the delivered review selects this repair scope across the previously reviewed owners; it does not authorize personal runtime/profile/configuration changes or unrelated F0–F3 redesign.

## Global constraints

- Preserve existing dirty work; reference copy in /private/tmp/hermes-repair-baseline-20261012.
- No fabricated statuses/transcripts/project identifiers, no second executor/scheduler/memory system.
- Runtime request ownership includes connection/profile/session; a Studio Dot ID is not a Hermes profile.
- Isolated synthetic profiles, temporary files and fixtures; no private archives or credentials inspected.
- Unsupported capabilities visibly unavailable; no silent retries of uncertain actions.

## Review focus

1. Parent symlink on a new file must not escape the authorized root.
2. Selected SSH/offline chat must not inherit another connection's status/model/profile.
3. Unsupported or disconnected native RPC must not produce a local successful receipt.
4. Legacy simulated browser/collaboration records must not be resumed as runtime authority.
5. Late audio/browser results must not update another thread; permissions and media cleanup remain scoped.

## Tasks

- [x] File boundary: failing public FileWorkspaceService tests for root list/search and new writes via outside parent symlink; correct nearest-parent realpath checks and preserve revision conflicts. Command: npx vitest run --root upstream tests/f5-files.test.tsx.
- [x] Native context/identity/projects: inspect current upstream methods, resolve actual profile/host/session/project; replace global header labels and synthetic project IDs. Add public adapter/API routing/unsupported/offline tests.
- [x] Collaboration: replace timers/maps as execution source with subagent/groups/recall native requests and actual events; respect unavailable spawn/steer/message endpoints, managed Bot Chat gates and uncertain delivery. Native request receipt tests replace simulation assertions.
- [x] Browser: real dedicated persistent Electron browsing surface shared through verified Hermes preview/controller callbacks; exact current upstream auth/capability limitations recorded. Test synthetic site DOM/cookie/storage/restart and native callback action/results; remove mock HTML and counts.
- [x] Computer: reject unavailable takeover API and preserve runtime completion receipts; test successful completion under unsupported lease request.
- [x] Audio: proxy supported native audio routes with immutable thread owner; authenticated tests exercise handlers, no fallback transcript. Integrate dictation/playback/live pathways only when runtime advertises and supports them; denied permission/cancel/late event tests.
- [x] Verification: repair meaningful F6 UI acceptance mismatch, full typecheck/tests/build, package separate .app, synthetic UI/chat/approvals/native integration smoke, independent review and document actual remaining external gates.

Shared ownership: parent owns server.mjs, App/Chat/ComputerPanel, transport and product adapters. Research agents only write their respective docs/research files. Each repair uses red→green at the public interfaces already implicated in and authorized by the review, rather than testing internals. No new dependencies or publications without a concrete need.


Repair verification and remaining external gates: [verification receipt](../architecture/native-integration-repair-verification-2026-10-13.md). Feature-wide acceptance is not inferred from the repaired adapters.
