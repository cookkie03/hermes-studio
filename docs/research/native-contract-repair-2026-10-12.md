# Native runtime contracts for integration repair

2026-10-12. Source-only research for the eight findings in the current-functionality review. This is a contract reference, not live acceptance evidence. The locally installed source checkout `/Users/luca/.hermes/hermes-agent` was read at HEAD **a50406d9b7474b060450d2dcaff8743c977d296a**. No personal profile/config/database was read and no runtime/provider call was made.

## Source authority

The generated gateway contracts define wire keys; handler code and the upstream Desktop consumers settle stricter validation and lifecycle details. Paths below are relative to the pinned Hermes checkout. A Studio adapter must keep host/connection and profile as immutable ownership coordinates during an operation. Unsupported methods, unavailable transport, authentication failure and an empty result are different outcomes.

## Profiles and canonical Bot Chat

`profiles.list({profile?, include_sessions:true})` returns `{profiles, bot_mode_protocol:true, install_id}`. Roster rows include `name`, `path`, `is_default`, `model`, `provider`, `description`, `display_name`, `canonical_session`, `last_session`, `worker_session`, and optional UI metadata. The canonical row is `{id,resolved_id,root_title,title,preview,started_at,last_active,message_count,live_message_count?}`; `id` is the durable registry root and `resolved_id` the current compression tip. [Contract](/Users/luca/.hermes/hermes-agent/tui_gateway/contracts/profiles_vault_complete_foreign_subagents.py) lines 115–185; [producer](/Users/luca/.hermes/hermes-agent/tui_gateway/methods_profiles.py) `_canonical_session_row`, lines 161–232.

Canonical Bot identity is **(owner profile, exact title `Bot Chat`)**. Native flow:

1. `session.list({profile,title:'Bot Chat',include_hidden:true,limit:200})` returns `{sessions}`. Consult the owner backend. A thrown lookup or an empty lookup contradicted by a previously advertised canonical row is unconfirmed absence; never create another chat in that case.
2. Existing row: `session.resume({profile,session_id:resolved_id||id})`. Input ID is stored, output `session_id` is live. Preserve both IDs.
3. Confirmed absent row: `session.create({profile,title:'Bot Chat',hidden:true,follow_profile_config:true})`. Output contains `session_id`, `stored_session_id`, `messages`, `message_count`, `info`.
4. Upstream immediately calls `session.title({profile,session_id:<live>,title:'Bot Chat'})` to materialize the canonical title before navigation/kickoff. A title uniqueness collision causes a new registry lookup and adoption of the winner, never a prompt into the stray session.

Source: `apps/desktop/src/plugins/hermes-bots/canonical-chat.ts:282–336,450–535`; `tui_gateway/contracts/sessions.py:118–201,309–319`. **There is no `profiles.ensure_bot_chat` method at this SHA.** A Studio wrapper may name its own helper that way but must compose the actual native calls above.

`session.resume` returns `{session_id,stored_session_id?,message_count,messages,info,status?,running?,inflight?,queued?,pending_approval?,open_requests?,...}`. `info` is the authoritative model/provider/effort/cwd/project/profile view; its keys include `model`, `provider`, `reasoning_effort`, `reasoning_effort_wire`, `service_tier`, `cwd`, `project`, `profile_name`, `stored_session_id`. [Contracts](/Users/luca/.hermes/hermes-agent/tui_gateway/contracts/sessions.py) lines 64–101,182–201; `tui_gateway/contracts/common.py:65–98,224–234`.

## Native delegation and control

Supported calls:

| Call | Params | Result |
| --- | --- | --- |
| `subagent.list` | `{session_id,profile?}` | `{subagents:[snapshot],delegations:[failedTask]}` |
| `subagent.tail` | `{session_id,profile?,subagent_id}` | `{subagent_id,available,text,truncated}` |
| `subagent.interrupt` | same | `{found,subagent_id}` |
| `subagent.steer` | `{session_id,profile?,subagent_id,text}` | `{status:'queued'|'rejected',subagent_id,text}` |
| `delegation.status` | `{profile?}` | `{active,paused,max_spawn_depth,max_concurrent_children}` |

Snapshot fields are `subagent_id,parent_id,depth,goal,delegation_id,model,started_at,status,tool_count,last_tool,accepting_steer`. A roster can include lineage-owned children after reconnect; tail/steer/interrupt retain exact session-generation + transport authority and can legitimately refuse control of a visible child. Tail is bounded to 16 KiB. `found:false` means no currently interruptible child; it is not a confirmed cancellation. Queued steer is not delivered steer.

There is **no `subagent.spawn` RPC**. New children are created through the Hermes agent's `delegate_task` tool. Studio may submit an explicit delegation request to the parent conversation and observe native spawn events/list, but must never create its own worker/timer or claim a child exists before native evidence.

Sources: `tui_gateway/contracts/profiles_vault_complete_foreign_subagents.py:598–668`; `tui_gateway/methods_subagents.py:20–149`; `tui_gateway/contracts/billing_delegation_pets.py:358–420`; `tui_gateway/methods_session.py:2239–2255`.

## Bot messages and relay

`message_agent` is an injected agent tool, **not a gateway RPC**. Its gate is `agent._bot_mode_protocol` plus the exact canonical title `Bot Chat` plus at least one profile on the install carrying a mapping `ui_meta['hermes-bots']`. `bot_mode_protocol:true` alone does not prove the managed-install gate. The tool returns dispatch acknowledgement and later background completion; it does not immediately return the recipient's reply.

`bot_relay.deliver({profile:<target>,message,from_profile?,from_handle?,from_connection?})` is an actual native JSON-RPC method returning `{reply:string}`. The target must be a real roster profile (`hermes` aliases default); message length is bounded. A native authenticated identity creates a stable bot author independently of client-supplied labels. Sender labels grant no file/memory authority. The handler chooses a live owner's mailbox/open Bot Chat or a native one-turn CLI delivery, under a profile lock.

The RPC can last approximately **1320 seconds** (lock wait + two bounded attempts). `reply` can contain a queue/delivery acknowledgement when a live recipient has not yet answered. Studio must preserve that outcome honestly, not turn every RPC success into processed/completed. Errors include typed `error.data.reason`; preserve it for retry semantics. Native transient retry policy belongs to Hermes; do not independently resend uncertain deliveries.

Sources: `tools/bot_mode_dm.py:1–15,67–91,124–135`; `tools/bot_mode_probe.py:107–129`; `tui_gateway/contracts/groups_bot_relay.py:545–559`; `tui_gateway/methods_bot_relay.py:96–246`.

## Groups

Readiness probe `groups.capabilities({profile})` returns `{protocol_version,driver,persistent_process,authority_gateway_id,room_link,features,methods,max_log_limit}`. `driver:true` requires the actual running hosted-room service; supported method names alone do not prove the driver is ready. RoomLink has its separate enabled/disabled verdict. The generic `gateway.capabilities` only returns `per_session_exclusive_submit`, not a universal method roster.

| Call | Params | Result |
| --- | --- | --- |
| `groups.list` | `{profile,include_disbanded?,limit?,offset?}` | `{rooms,next_offset}` |
| `groups.create` | `{profile,room_id,name,members}` | `{room}` |
| `groups.state` | `{profile,room_id,include_disbanded?}` | `{room,driver_status?}` |
| `groups.send` | `{profile,room_id,event_id,payload:{text,thread_id}}` | `{event,client_event_id,accepted:true,driver_started:true}` |
| `groups.log` | `{profile,room_id,since_seq?,limit?,include_disbanded?}` | `{events,cursor,latest_seq,has_more,authority:{gateway_id,epoch}}` |

The actual create validator requires **2–6 members**, each exactly `{member_id,profile,handle,display_name?,target?}`. Handle has no `@`; IDs/handles/targets are unique; all local profiles must exist. Local target may be omitted or `{kind:'local',profile}`. Peer targets need the actual capability digest and authenticated RoomLink setup, not a connection label. The user payload strictly requires both `text` and `thread_id`; extra fields are rejected. Send accepts an inert user event; member replies/work completion are projected from native events, not inferred from acceptance.

`room` includes `room_id,name,members,authority_gateway_id,authority_epoch,revision,created_at,updated_at,disbanded_at?`. `driver_status` includes `running,working,blocked,counts,pending_actions,peer_routes`. Event keys are `room_id,seq,event_id,kind,actor:{kind,id},authority_epoch?,payload,created_at,idempotent?`.

Sources: `tui_gateway/contracts/groups_bot_relay.py:25–92,141–276`; `tui_gateway/methods_groups.py:216–245,344–394`; `gateway/hosted_room_discussion.py:198–274`; `tui_gateway/contracts/liveness.py:21–26`.

## Projects and workspace binding

Native project RPCs are profile-scoped:

- `projects.list({profile}) -> {projects,active_id}`.
- `projects.get({profile,id}) -> {project}`; unknown ID returns 5062.
- `projects.create({profile,name,folders?:string[],primary_path?,slug?,description?,icon?,color?,board_slug?,use?:false}) -> {project}`; invalid argument/duplicate primary path returns 5063.
- `projects.for_cwd({profile,cwd}) -> {project|null,cwd,branch}`.
- `projects.add_folder({profile,id,path,label?,is_primary?}) -> {project}`.

Project fields include `id,slug,name,description,icon,color,board_slug,primary_path,archived,created_at,folders:[{path,label,is_primary,added_at}]`. Validate the real project returned by Hermes before persisting a Studio association. Native per-profile projects share no ownership across profiles automatically.

The session owns its workspace through `session.create({profile,cwd,cwd_explicit:true,...})` (explicit user folder selection). `projects.set_active` changes profile active project; it does not by itself rebind an existing session. Use native `info.cwd` / `info.project` as session evidence. An existing project link with a different primary root does not prove matching file access. `cwd_explicit` distinguishes deliberate folder choice from inherited app-global cwd.

Sources: `tui_gateway/contracts/projects_pets.py:20–161`; `tui_gateway/methods_projects.py:14–57,81–125`; `tui_gateway/contracts/sessions.py:118–139`; `tui_gateway/contracts/common.py:65–98`.

## Recall

There is **no `sessions.search` / `session.search` RPC**. Native read-only recall is HTTP `GET /api/sessions/search?q=<encoded>&limit=20&profile=<owner>` with optional `source`, `sources`, `exclude_sources`. Limit is clamped to 1–100. Empty query returns `{results:[]}`. It searches ID, FTS5 message content and title, deduplicating compression lineage while preserving real branches.

Result `{results:[row]}` includes `id`, `snippet`, `role`, `source`, `model`, `session_started`, `last_active`, hydrated title/preview/counts, `profile`, `archived`, and lineage context when applicable. Keep native profile and session IDs on each recall result. Do not fabricate snippets from Studio text.

Source: `hermes_cli/web_routers/sessions.py:284–461`.

## Audio HTTP ownership, auth and safe capability projection

Use the owning Hermes **dashboard HTTP base URL**, not a provider URL or raw JSON-RPC ws URL. All routes below use `?profile=<owner>`; there is no per-session audio header. The immutable conversation owner determines which profile's STT/TTS config is resolved. Loopback requests use `X-Hermes-Session-Token` (legacy Authorization Bearer also accepted). Gated deployments require their native authenticated OAuth bearer/cookie path. Never introduce `internal` bypass or log/persist tokens.

| Method/path | Request | Result |
| --- | --- | --- |
| POST `/api/audio/transcribe` | JSON `{data_url,mime_type?}` | `{ok:true,transcript,provider}` |
| POST `/api/audio/speak` | JSON `{text}` | `{ok:true,data_url,mime_type,provider}` |
| GET `/api/audio/voice-config` | owner profile query | `{ok:true,stt,tts}` including secrets in direct mode |
| GET `/api/audio/voice-live/status` | owner profile query | `{ok:true,mode:'chained'|'gpt-live',available,reason,model,voice}` |
| POST `/api/audio/voice-live/session` | JSON `{sdp,history?}` | `{ok:true,session:{id},transport:{type:'webrtc',sdp}}` |
| POST `/api/audio/tts-lease` | `{lease,active:true|false}` | `{ok:true,lease,active,...native lifecycle result}` |

There is no `/api/audio/tts` endpoint. REST speak returns JSON base64 data URL, not binary audio. MIME is native output `audio/mpeg`, `audio/ogg`, `audio/wav`, `audio/flac` (by file extension). STT accepts base64 audio data URL, validates nonempty data, and caps decoded upload at 25 MiB; silence can legitimately return `transcript:''`. Backend/provider errors remain errors, never prefab transcription.

`voice-config` may carry `api_key` and `base_url` in direct mode. Studio should proxy relay endpoints and project only a whitelist such as `{mode,provider,model,reason,streaming}`; retain any fetched secrets only in the main-process operation scope. `mode:'relay'` means host-side execution, **not necessarily unavailable**: local STT/TTS and disabled client-direct are valid relay cases. `stt.streaming` is the source-probed streaming capability. A direct config containing a key proves configuration, not successful provider acceptance. The GPT-Live status response is explicitly non-secret.

WS `/api/audio/transcribe-stream` uses normal websocket authentication/origin gates and profile query. Client starts `{sample_rate:8000..48000}`, sends binary PCM then `{eos:true}`; server emits partial/final transcript or typed error. WS `/api/audio/speak-stream` accepts `{text}`, `{done:true}`, `{stop:true}`; server emits `{type:'start',sample_rate,channels:1}`, binary int16 PCM, `{type:'end'}` or `{type:'fallback'}`. Native disconnect stops speech; closing Studio must not be reported as cancellation of agent work. Live voice delegates backend work through actual `session.delegation.created` handling bound to the owning Hermes conversation.

Sources: `hermes_cli/web_routers/audio.py:83–197,293–388,515–620`; `hermes_cli/web_models.py:237–255`; `hermes_cli/web_server.py:387,456–499,702–727`; `apps/desktop/electron/main.ts:5620–5661`; `tools/voice_client_config.py:47–62,231–255`; `tools/voice_live.py:131–177`.

## Verification boundary

This note confirms callable contracts and their restrictions at one installed source SHA. It does not confirm active backend version, configured voice providers, authenticated delivery, peer access, actual model/tool use or UI end-to-end success. Runtime capability probing must use harmless native read methods and record their real outcomes; a generic version number or locally stored capability is insufficient. Integration tests must use isolated synthetic Hermes profiles and data.
