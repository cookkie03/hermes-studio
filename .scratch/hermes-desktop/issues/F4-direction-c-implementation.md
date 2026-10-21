# F4 — Direction C Studio shell implementation

Status: implemented; automated acceptance green; live/visual acceptance incomplete.
Baseline: 57a5d54
Spec: docs/features/F4-workspace-shell.md and docs/project/prompts/04-implement-direction-c.md

Ownership: desktop/upstream/src/client/App.tsx, Chat.tsx, ResultPane.tsx, style.css, and focused F4 UI tests. Preserve F0–F3 transport, drafts, streaming, interruption, scope and approval contracts.

Reference map:
- Direction C shell/sidebar -> App.tsx/style.css -> warm studio tokens, responsive navigation, focus-safe inspector toggle -> render/typecheck and F4 tests.
- Direction C composer -> Chat.tsx/style.css -> adaptive textarea and honest unsupported attachment control, preserving IME/Enter/draft/send/stop -> typecheck and submission regressions.
- Direction C tool groups/inspector -> Chat.tsx/ResultPane.tsx/style.css -> semantic disclosures, runtime-derived states, focus-safe close -> render/typecheck and responsive review.

Gates: typecheck, focused metadata tests, full relevant suite, build/package verification where available. Live Hermes runtime, screenshots and packaged .app remain acceptance evidence only when executable in the isolated environment.

Latest verification (2026-10-19):
- `npm run test:packaged-conversations` PASS: synthetic runtime, streaming/tool/review events, draft during dispatch, navigation isolation, IME/Shift+Enter, restart, 900/1360 width assertions.
- `npm run test:packaged-ui` PASS: offline/persistence/error/reduced-motion/focus/900px checks.
- `npm run build`, `npm run test`, `npm run verify:package`, `npm run package:dir`, `npm run package:dmg`, `codesign --verify --deep --strict` PASS.
- DMG regenerated at `desktop/release/Hermes Studio-0.1.0-arm64.dmg`.
- Remaining gates: live Hermes integration, human visual review/screenshots and measured contrast/WCAG evidence; no notarization/Gatekeeper acceptance claimed.
