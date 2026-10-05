# F2 — Native review notes and truthful D38 context

2026-10-05. User-selected update: inspect latest F2 diff and apply it to code. Review base b285629. This increment implements the F2 presentation/adapter portion; it does not certify the complete F2/F6/F7/F8 vision.

## Changes and contracts

| Updated requirement | Contract and implementation | Evidence / limit |
|---|---|---|
| Persistent Self-improvement review, including late/background delivery | Native review.summary payload {text}, stored-session/runtime-session scope; bridge archives independently of mounted view, REST history restores, NativeReviewNotes displays session notes | Bridge tests and packaged synthetic HTTP/WS -> REST/SSE -> Electron; no arbitrary association with last assistant response |
| Pending/applied/skills/discarded outcomes | Exact original text; no guessed mutation status, curator label or approval RPC | Synthetic pending, confirmed skill and discarded text; no structured mutation receipts in native contract |
| Proposal review | Preserve /memory pending instruction, disclose GUI review unavailable | No automatic apply, no invented backend operation |
| Replay/restart/offline | Native session.events.since when gateway.ready advertises replay_epoch; epoch/session/seq identity; saved archive survives restart | Unsupported, truncated and offline replay disclosed even with empty archive. Native replay is a bounded process window, not a guarantee of historical completeness |
| Repeated notes | Distinct sequenced events with identical text retained; repeat same identity ignored | Public bridge history tests + repeated synthetic envelope and reconnect/restart UI |
| Missing sequence identity | Exact-text fallback within stored/runtime-session/epoch scope | Identical unsequenced summaries may collapse; UI states this limitation |
| Archive failure | Text retained in current app session if disk write fails; oversized text (>1 MB) rejected with durable scoped warning when storage succeeds | Write barrier and oversized-note restart tests; no false durable-success claim |
| D38 chat context | Separate page-selected Studio Space from native session.info profile_name/model/reasoning_effort/wire/cwd/project; first-send snapshot and later native updates | REST and packaged checks; native Finance project does not select Studio Space by name |
| Individual specialist memory | Removed shared legacy Studio-memory reinjection from prompt preparation | REST test records shared synthetic memory and proves it absent from prompt; legacy records preserved |
| No implicit project/profile switch | No native context mutation for UI selection; missing Space-project links/Bot identity declared in context details | F6 associations and F7 bindings remain prerequisite gaps; no project copies, profile merge or hidden workspace.move |
| New activity while reading above | Follow bottom only when already near it; explicit Show new activity | Packaged injected real fixture event while scrolled above |

Native public-source checkout read only: /Users/luca/.hermes/hermes-agent, SHA e1e82d782f353766c7a22db6e5ac4fa58bbff325. Read contracts/events.py, contracts/common.py, event_replay.py, methods_session.py and native desktop status.ts. No runtime home, credentials, personal database or sessions read.

## Verification

- npm test from desktop: PASS, 43 Node + 61 metadata/display tests; renderer/metadata strict type checks, bootstrap and external-link checks PASS.
- npm run package:dir: PASS, arm64 development .app, ad hoc signature; no Apple identity/notarization or release.
- npm run test:packaged-conversations: PASS final run, including clean SSE EOF, event while reading above, background notes, native replay overlap, offline/reconnect and restart at a new origin. Actual packaged renderer, authenticated REST/SSE, synthetic Python HTTP/WS fixture and fresh temporary Studio profile. Final evidence /private/tmp/hs-conversations-ui-BlFkZ0: chat-1360.png, chat-900.png and reviews-900.png. The last capture closes the existing Computer overlay so native context and review text can be inspected together. 900px overlay behavior remains the F4 baseline. Keyboard focus-visible and Reduced Motion checks PASS; no pageerror or framework overlay observed.
- Independent Standards/Spec review: found replay-state and archive-warning gaps; repaired with regressions. Final source review: 0 actionable findings per axis.
- git diff --check and Python fixture syntax: PASS. Browser plugin unavailable; used project Playwright Electron workflow.

First full suite in sandbox failed because localhost sockets/background services were denied; rerun with approved permissions passed. Existing synthetic background services use temporary names/profiles and cleanup. No personal Hermes attach or live model run.

## Remaining owner and live gates

F6 owns actual explicit Space -> (connection/runtime, profile, native projectId) associations, profile-scoped catalog/registration and folders/grants. F7 owns verified native Bot identity and canonical Bot Chat. Their contracts/stores are absent in current Studio: this increment does not offer fake project/profile selectors or promise D38 PM/CTO/Maintenance workflow. F3/F8 own supported proposal approval/discard and mutation receipts. Native context/notes display is not proof of a confirmed memory or skill change performed by Studio.

Unknown sessions are never imported to recover notes. Background archival covers owned live sessions; replay for an owned binding occurs on its create/resume/history refresh. If native replay is unavailable/evicted or a formerly live runtime ID changes, missing original events cannot be reconstructed by Studio. Runtime-emitted text is the only review outcome contract verified here. Model-backed isolated acceptance, F2 thinking, other owner context/catalog/collaboration gates and complete interruption/reconnection continuity remain open.

Pre-existing document edits were preserved. Code/fixture/new receipt and ticket are delivered independently; the user's broader D38/spec edits and shared project-document changes remain in the working tree.
