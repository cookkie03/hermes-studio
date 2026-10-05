# F2 — Native review notes and D38 context

Status: done for this increment; full D38 owner/runtime acceptance remains open. Selected by user 2026-10-05: review updated F2 diff and apply to code. Base b285629.

Implement persistent scoped review.summary projection (F2 timeline with minimal F8 event adapter), exact native text, no inferred applied/pending/skill outcome or approval RPC. Archive at bridge independently of mounted chat; restore offline/restart; dedupe native replay epoch/session/sequence, document fallback for envelopes without identity. Use supported session.events.since only when replay epoch advertised; expose replay limitations.

D38 F2 surface: display actual session.info profile/model/effort/project/cwd and selected page Space separately; don't deduce Space from Dot default, project from name or native Bot from local Dot. No shared legacy-memory injection. F6 project links and F7 Bot bindings are absent; expose limits, do not implement their stores or mutate native context implicitly. Profile/Space switching and native project registration remain owner prerequisites, not simulated selectors.

Shared files: bridge.mjs native archive/history; server.mjs history context and prompt; Chat.tsx timeline; shared display/context types; styles. Existing approved F2 seams: bridge public history with synthetic gateway, authenticated REST, packaged Electron -> REST/SSE -> synthetic HTTP/WS runtime. Test late/background note, unknown scope, repeat/replay, restart/offline, persistence error, missing context; UI 900/1360/Reduced Motion.

No personal runtime, credentials, new executor, file copies, profile mutation, autoapprove or auto prompt retry. Preserve pre-existing document changes.

Verification: npm test 43 Node + 61 metadata/display PASS; package PASS; final packaged synthetic conversations PASS including late/background review notes, native replay/live overlap, offline/restart persistence, clean SSE closure, reading position, 900/1360px, focus-visible and Reduced Motion. Source review 0 Standards / 0 Spec findings. See docs/architecture/f2-native-notes-context-review-2026-10-05.md for owner/runtime limits.
