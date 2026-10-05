# F17 — Hermes voice and voice conversation GUI

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the F17 frontend/connection**, following the workflow below and the card’s specific sections. The attachment is the entry point: open linked workspace files and SKILL.md files before coding. “Documented/not implemented” labels describe the baseline; they do not require stopping at a plan in the assigned chat.

**Type of work:** GUI adaptation and connection to existing Hermes capabilities, not creation of the feature in the backend. The Fxx separation supports ownership, implementation, and verification in separate chats: the product remains a single OpenDots-style Hermes GUI.

**Outcome:** Integrate dictation/voice messages/TTS or voice chat into the Hermes turn without losing identity, drafts, or control.

**Backend and boundary:** Existing Hermes providers/audio/voice; the frontend captures/plays and routes, without imposing a new voice executor or alternative API key. Studio is a Hermes frontend/adapter: names and GUI may change, while agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** The composer and voice chat show Dot/Space/host/model/effort, mic/Mute/End, and actual send status; no implicit bot switch during audio. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements specified here, leaving other functions to their respective owners.

**Dependencies and additional readings:** F2/F1/F3; the voice engine may differ from the chat model and must be labeled. Future telephone calls and wake words are separate. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Mandatory specific checks for the relevant increment:** Denied mic permission, synthetic audio, cancel/draft, late events, interrupt/barge-in if supported, reconnect, mic cleanup, and no duplicate turn. Use synthetic profiles and data; exercise the real interface. Fixtures, builds, handshakes, and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified dependency graph, and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility, and Reduced Motion. Review the diff against the specification/principles, fix issues found, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare unperformed checks and external blockers; completion requires evidence for the increment’s gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: documented D29, 2026-10-04; no implementation selected now. Voice and voice chat are standalone features to develop in a future chat. Calls to PSTN/SIP numbers remain a distinct future idea in [voice-calls](../future/voice-calls.md).

<!-- feature-guidance:start -->
## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial readings, implementation/review skills, and exit criteria. Then read the feature-specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Realtime STT/TTS and telephony are distinct contracts |
| [grill-with-docs](<../../.agents/skills/grill-with-docs/SKILL.md>) | Only to bound requirements of the selected increment that remain uncertain |
| [prototype](<../../.agents/skills/prototype/SKILL.md>) — conditional | Executable answer to a bounded technical question |
| [openai-docs](</Users/luca/.codex/skills/.system/openai-docs/SKILL.md>) — conditional | Only if an OpenAI product is selected; not a local voice requirement |

### Entry points to read

- [docs/future/voice-calls.md](<../../docs/future/voice-calls.md>): Telephony hypotheses, prerequisites, and limitations.
- [docs/features/F1-runtime-connection.md](<../../docs/features/F1-runtime-connection.md>): Host.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Microphone/action permissions.
- [desktop/upstream/src/client/useVoice.ts](<../../desktop/upstream/src/client/useVoice.ts>): Old reference code, not evidence of Hermes voice.
- [desktop/upstream/src/client/CallView.tsx](<../../desktop/upstream/src/client/CallView.tsx>): Existing surface not to be activated automatically.

Verify paths and version before working; coordinate shared files. These readings do not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Official sources and baseline

Read [Voice Mode — Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/features/voice-mode/) and the [Voice Mode guide](https://hermes-agent.nousresearch.com/docs/guides/use-voice-mode-with-hermes/). Public source studied at SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`: `website/docs/user-guide/features/voice-mode.md`, `tui_gateway/contracts/prompt_voice.py`, `tui_gateway/methods_voice.py`, `tools/transcription_tools.py`, `tools/tts_tool.py`, `tools/voice_client_config.py`; desktop `apps/desktop/src/app/chat/composer/hooks/use-voice-recorder.ts`, `use-voice-conversation.ts`, `use-voice-live-conversation.ts`, `apps/desktop/src/lib/voice-client-direct.ts`, and `voice-live.ts`.

Upstream provides STT/TTS, voice RPC, and desktop surfaces; this does not prove working voice in the Studio bridge. `voice.record` may record on the host device: a remote backend is not the Mac microphone. Desktop capture must be on the client, with verified profile upload/provider routing. Old OpenDots useVoice/CallView are UI references, not executors to enable.

The upstream desktop distinguishes the mic → STT → Hermes turn → TTS chain from an alternative provider-dependent live mode. The chain can reuse local/configured providers without requiring an OpenAI Voice API Key; local does not mean an already bundled model or guaranteed latency. Keyless Edge TTS remains a network service, not fully local. Do not install/download engines or change the personal provider from this card.

## Increments and UX

| Increment | Behavior and status |
|---|---|
| F17-A — Dictation | Mic records on explicit action; stop transcribes and inserts an editable draft; no prompt sent without confirmation |
| F17-B — Voice message | Recording with duration/preview/play/delete and explicit Send; verified attachment/transcript/runtime contract, not a local file pretending to be attached |
| F17-C — Spoken response | Play/Stop on the message or an explicit preference; audio error does not hide text; available devices and providers visible |
| F17-D — Voice chat | Start voice opens an in-app surface for the current Dot, listening/transcribing/working/speaking/interrupted/reconnecting/ended; Mute/End, transcript, barge-in where supported |

These are increments of the same card, selectable one per chat. Composer/microphone and chat surface follow the Unsloth/Codex component system; audio visualization comes only from actual levels, not decorative animation. Working state and an open microphone are distinguishable, with accessible text/controls and a keyboard alternative. Escape closes/ends according to the defined state, restores focus, and releases the device; it does not implicitly cancel Hermes tasks.

Voice chat retains tools, memory, and approvals **from the Hermes runtime**. Spoken words do not bypass F3: sensitive actions require the same visible review. Changing Dot/profile does not move audio/responses to the new session; closing releases streams/TTS. An uncertain response is not automatically retransmitted, creating a duplicate turn.

## Technical contract to validate

RPC documented in source: `voice.toggle`, `voice.record`, `voice.tts`; `voice.transcript`/interrupted events and readiness depend on version/provider/capture. These RPC alone do not amount to remote browser audio transport. The desktop also uses `/api/audio/voice-config` and `/api/audio/voice-live/status` routes; adapt only paths supported by the connected backend.

Immutable owner per operation: connection/profile/session/turn, with cancellation and late results handled. F1 owns transport/availability; F17 capture, playback, and conversation; F2 associates transcript/turn and status, F3 grants. Testable contracts separate from UI components, no second chat engine.

Prefer secrets in the backend/main process. The upstream client-direct reference delivers credentials into renderer memory: do not copy it blindly; choose secure routing and document the tradeoff before coding. A remote profile with local STT/TTS requires the planned relay, not imposed new software. Read active provider/model/voice from runtime; overrides only within the selected scope, no API keys in renderer logs/storage.

## Privacy and prerequisites

macOS and Electron microphone only after a gesture/permission; denied/revoked/missing device states have a remedy and text fallback. No always-on or wake word in the first increment. Make audio sent to provider/host and retention explicit; proposed default is no permanent recording, with transcripts following chat policy. Upload size/format/timeout, temporary cleanup, and no personal PCM/transcript logging.

Dependencies: F2/F1 for sending/conversation; F3 for grants; F4 for the surface, not a global redesign. STT and TTS are independent: ready STT does not imply playback or realtime. Local engines/models and network/cloud are verified separately. In-app voice does not call a telephone and does not require a number/carrier.

## Definition of done

Synthetic data and audio: permission denied/revoked, device absent/change, silence/no speech, cancel, transcription error, manual draft preserved; single send and runtime outcome. Playback stop, text fallback, and cleanup. Voice chat: actual bidirectional conversation, measured latency, interruption/echo, mute/end, turn ordering, profile/session switch, disconnect without uncertain retry, and mic release on quit. Verify packaged macOS, focus/keyboard/Reduced Motion, and zero credentials in logs. A build or audio file does not demonstrate realtime. Do not make calls or record the user during unauthorized development.

## Prompt for a new chat

> First follow docs/agents/feature-workflow.md and F17 Files and skills. Read official Voice Mode documentation and verify desktop/runtime audio contracts at the current SHA. Implement only the selected F17-A/B/C/D increment using Hermes tools/providers, capture on the Mac, and correct owner/session; no alternative OpenDots voice executor. Do not require an OpenAI Voice API Key, install engines, or change personal profiles automatically. Test permissions, synthetic audio, turn ordering, cleanup, and barge-in if supported in the .app. PSTN/SIP telephone calls and wake words remain outside the increment. Update evidence/documents and review before committing. Also follow F17’s Assignment for the implementing chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
