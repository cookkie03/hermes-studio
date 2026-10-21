# Direction C — implementation review matrix

Status: increment implemented; live acceptance incomplete.

| Requirement | Files | Verification | Outcome |
|---|---|---|---|
| Warm Direction C palette and shell | `desktop/upstream/src/client/style.css` | Renderer typecheck; production build; full suite; diff check | PASS in code; visual screenshots pending |
| Sidebar/inspector responsive presentation | `App.tsx`, `ResultPane.tsx`, `style.css` | Typecheck; semantic `aria-controls`/`aria-expanded`; responsive CSS at 900/700; packaged UI smoke | PASS: packaged 900px overflow check; live 1360 capture pending |
| Inspector Escape and focus return | `App.tsx` | Root Escape handler; toggle ref focus | PASS in code |
| Adaptive multiline composer | `App.tsx`, `Chat.tsx`, `style.css` | `scrollHeight` bounded to 150px; renderer typecheck; packaged UI startup; packaged conversation fixture | PASS: packaged conversation fixture covers draft during dispatch, IME, Shift+Enter, send/stop and chat isolation |
| Reduced Motion | `style.css`, packaged UI smoke | Product-wide reduced-motion CSS; `npm run test:packaged-ui` | PASS: packaged UI smoke |
| IME, Enter/Shift+Enter, drafts, send/stop preserved | `Chat.tsx` | Existing submission and chat tests included in metadata run | PASS: 110 tests |
| Tool groups keyboard disclosure | `Chat.tsx`, `style.css` | Native `details/summary`; typecheck and focused suite | PASS in code |
| Backend-derived state/provenance/approval | Existing Hermes transport unchanged | Focused suite | PASS; no mock runtime added |

## Remaining acceptance work

- No live Hermes runtime/credentials were exercised; the packaged conversation fixture uses a synthetic localhost runtime.
- Human visual captures at 900/1360px and measured contrast are still pending; no WCAG or Gatekeeper/notarization claim is made.
- Generated artifacts: `desktop/release/mac-arm64/Hermes Studio.app` and `desktop/release/Hermes Studio-0.1.0-arm64.dmg`.
- Packaged screenshots copied to `docs/design/redesign-proposals/evidence/`: `direction-c-chat-900.png`, `direction-c-chat-1360.png`, `direction-c-review-900.png`. These are synthetic-fixture captures, not live Hermes acceptance evidence.
