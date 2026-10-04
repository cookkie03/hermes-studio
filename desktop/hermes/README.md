# Hermes desktop connector

Local REST/SSE facade over the existing Hermes gateway, not a second agent or tool executor. Startup and connection never submit a prompt. Metadata uses the original OpenDots WorkspaceStore, pages and Store in the app's own SQLite database; runtime archives/configuration are not imported or rewritten.

## Renderer contract

- `POST /api/hermes/connect`: optional loopback HTTP `endpoint`. Handshake always advertises `server_requests:false`; a mounted approval handler enables it later on the same WebSocket.
- `GET /api/hermes/events?threadId=<owned>&handlerId=<UUID>`: authenticated SSE. Each stream owns an independent approval lease, renewed every15 seconds, expired after45 seconds and released immediately on abort/cancel. Stream reopen cannot disable another stream through stale cleanup. Explicit lease fallback is `POST /capabilities {handlerId,threadId,active}`.
- `GET /api/hermes/requests`: pending owned approval requests. `approval-waiting` notices cross owned thread boundaries for navigation; actual request commands stay scoped to their thread. Reply with exact RPC `requestId` and offered `choice` using `POST /approval`; canceled/stale/duplicate requests are rejected.
- `POST /api/hermes/send {threadId,text,clientSubmissionId?,pageReference?}` returns202 after local dispatch, not completion or guaranteed admission. Runtime acknowledgement changes delivery to acknowledged; authoritative runtime events establish work and completion. No automatic retries. Concurrent turns are reserved before any asynchronous session preparation. Submission identity deduplicates within this service process only, not across restarts.
- A page-bound conversation must send `pageReference:{id,spaceId,revision}` after the editor flushes and fetches the persisted page. The server rejects missing/stale/wrong references and revoked access before session creation or prompt submission. The saved page context includes title, revision, Studio source URL, content limited to16,000 characters and a truncation flag. Unsaved editor contents are never silently substituted.
- `GET /api/hermes/history?threadId=<owned>&refresh=1` resumes only that conversation's owned durable session. Live `session_id` and durable `stored_session_id`/`session_key` are distinct. Unknown/hydrating runtime phases remain uncertain; known idle is required to clear an uncertain turn. No external archive/profile import is available.
- History `toolEvents` contains the last100 owned `tool.start`/`tool.complete` frames persisted by this client. Frames over64KiB retain identity/name, bounded8,000-character result text and `truncated:true`. Earlier events and tools run while disconnected are not reconstructed from personal archives. Raw runtime tools pass through without an alternative executor.
- Disk drafts use `GET/PATCH /api/conversations/:id/draft {draft}` independently of changing loopback origins. Page transcript saves exclude pending/uncertain user rows and reject an entirely unconfirmed transcript. Manual reviewed pages may use the existing `/conversations/:id/reviewed-page` route with a unique `manual-review-<UUID>` receipt ID and an accessible Space; this is a local document operation, not a simulated tool call.

Dot role guidance, selected Studio memories and page context are bounded prompt context, not runtime permission controls. Exact owned prompt-hash sidecars project visible user text without stripping arbitrary runtime messages. Hermes tool authorization remains with Hermes. Telephone calls, realtime voice, live browser display, human takeover and Studio task scheduling are unavailable in this milestone.

## Verification

`node --test desktop/hermes/bridge.test.mjs desktop/hermes/server.test.mjs`: 13 synthetic checks passed, including actual local metadata/SSE APIs, page revision/provenance guard, independent approval stream lifetimes, persistence/relaunch, races and rejection of unowned events.

`node --test desktop/hermes/gateway-network.test.mjs`: 2 local synthetic HTTP/WebSocket checks passed, covering out-of-order responses, delta/final events, timeout recovery, disconnect failures, numeric overflow and HTTP redirect rejection. These checks do not submit a real Hermes prompt and do not establish production chat acceptance.
