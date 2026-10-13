# Native integration repair — verification receipt

The reviewed production simulations have been replaced with supported Hermes contracts or explicit unavailable states. This closes the code repair of the review dated 2026-10-12; it does not declare every feature card or external integration complete.

## Changes delivered

- Files: root listing works; new writes cannot escape through a parent symlink; stale revisions conflict even after external deletion. Pending reads cannot replace a newer editor draft or cross folder roots. Edits made during a save remain unsaved.
- Native Bots and projects: actual installation/profile roster, canonical Bot Chat, immutable host ownership and generation checks. Native projects are verified before session.cwd.set; global header defaults removed.
- Collaboration: actual subagent RPCs, scoped native relay receipts, hosted-group contracts and current-conversation recall. Unsupported direct spawning cannot fabricate a child. Room members retain installation boundaries and logs preserve native sequence/timestamps.
- Browser: persistent, isolated WebContentsView with native preview callbacks and actual DOM results. Tool availability comes from the selected session. Manual takeover blocks preview mutations. Replayed pending mutations are rejected before queued redeliveries; typing awaits insertion before confirmation.
- Computer, memory and routines: native receipts and errors, per-conversation isolation, actual memory metadata/review notes, and no inferred routine success or delivery from configuration alone.
- Audio: native profile-scoped transcription/speech/live routes. Dictation edits a draft; voice work delegates to the same Hermes chat. Microphone and media cleanup are scoped. Client-direct disabled remains compatible with server relay; disabled STT/missing credentials remain unavailable. The upstream MIT license is bundled.

## Evidence

| Gate | Result |
| --- | --- |
| Final production suite | 95 Node tests + 110 renderer/metadata tests PASS; strict typechecks, bootstrap and external-link checks PASS |
| Production build and arm64 package | PASS, including local ad-hoc deep signature verification |
| Packaged UI | PASS: offline documents/memory, save failure, cancelled navigation, revision conflicts, restart, 900 px and keyboard focus; no renderer errors |
| Packaged conversations | PASS: streaming, duplicate-send prevention, approvals/review notes, uncertain delivery, chat isolation, drafts and reconnect/restart |
| Packaged native browser | PASS: actual DOM/type/click/capture, cookie/storage persistence, duplicate receipt and takeover rejection; selected conversation/panel exercised |
| Actual isolated Hermes contracts | Earlier PASS on source a50406d9: profile roster/canonical chat, projects/cwd, empty child roster, memory metadata and audio unavailable without credentials; no model/provider inference |
| Latest isolated-native rerun | Not completed: the isolated bootstrap was preparing Python dependencies and exceeded the readiness timeout. No personal runtime was substituted |

Synthetic evidence is kept in temporary directories; screenshots include `/private/tmp/hermes-native-browser-FZGEfQ/native-page.png`. Repeatable tests are `desktop/scripts/test-native-browser.cjs` and `Verification/native-contract-acceptance.mjs`. App output: `desktop/release/repair-20261013/mac-arm64/Hermes Studio.app`.

## Remaining acceptance gates

Live model/tool execution, configured STT/TTS and WebRTC providers, hosted group/relay execution between real Bots, extended VoiceOver coverage and signed/notarized distribution remain unverified. Native Bot Screen takeover and direct subagent spawning remain unavailable in this client contract. Existing warm native sessions retain their actual toolsets; Studio does not terminate/recreate their work to enable desktop tools. No personal credentials, histories or runtime configuration were used for the tests.

Future work can change direction toward external project references without relying on these adapters as a certification of all planned features.
