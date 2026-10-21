# Direction C design and accessibility acceptance audit

## Scope and method

This is a current-renderer accessibility and responsive-behavior audit, not another visual direction proposal. Direction C is approved, with the existing Hermes contracts and F4 requirements retained. Reference frame of code: `2f8bd5604821e364e37078f431e026c598faf9f7`.

Inspected the accepted Direction C implementation, F4, component-system tokens, renderer source and prior implementation-review matrix. Ran the production renderer in Chromium against controlled synthetic API data (no Hermes runtime, credentials or personal data), with viewport resizing and keyboard interaction. Measured the shipped token color pairs using the WCAG relative-luminance contrast formula. `npm run typecheck:renderer` and production `npm run build` passed. Initial parallel `npm run test:metadata` reported four unrelated 5-second timeout errors under high parallel load; rerunning `npm run test:metadata -- --maxWorkers=1` passed all 24 files / 110 tests. Focused F4/app/display rerun: 3 files / 18 tests passed. Build retains the existing >500 kB chunk advisory.

## Verified strengths

- Direction C uses a consistent warm canvas/surface/sidebar palette and keeps the Hermes-provided app and runtime contracts; no second runtime or fabricated production state was added.
- `Chat.tsx` autosizes the composer to 150px and turns on internal scrolling above that limit; native `details`/`summary` exposes tool output disclosures to browser keyboard semantics.
- At 1360px and 900px the synthetic production renderer has no horizontal document overflow. It reports 259px and 232px sidebar widths, and 381px / 320px inspector widths respectively.
- WCAG 2.x contrast ratios calculated for regular text: text/canvas 15.66:1, text/surface 16.47:1, text/sidebar 14.12:1, muted/canvas 5.16:1, muted/surface 5.43:1, muted/sidebar 4.65:1; all exceed 4.5:1.
- Tool-accent/white at #d97706 is only 3.19:1; hover #b45309/white is 5.02:1. Accent text must not be used at normal size/weight on the surface, and white small text on the default send-button background does not meet 4.5:1. Accent fills used for controls/icons meet the non-text 3:1 threshold (the default fill computes 3.19:1 against white). Border/canvas #e9e3d4 is 1.21:1, so it cannot alone carry essential control boundaries.

## Bounded acceptance gaps and proposed verification

1. Mobile narrow widths: production renderer at 600px has document scrollWidth 612px (12px horizontal overflow); Sidebar is translated to x=-260 and its search input has tabindex 0, but CSS visibility is `hidden`; Playwright programmatic focus resolved to `body`, not the input. This is not a demonstrated sequential-tab focus leak. Confirm the closed sidebar has no keyboard-reachable descendants using a real tab-sequence assertion (and separately ensure the opening control provides access); the 12px document overflow remains reproducible. Likely ownership: `desktop/upstream/src/client/style.css`, `App.tsx` and a focused F4/packaged Playwright test. Acceptance: zero horizontal overflow; closed navigation excluded from sequential focus; opening navigation transfers focus into it and Escape/backdrop close restores focus to its opener.

2. Inspector close focus: pressing Escape with focus in the open inspector removes it but leaves `document.activeElement` on BODY. The Escape handler tries to focus the header toggle, but the toggle is hidden while chat is active (`App.tsx:518-526`), so it cannot receive focus. Its effect also omits `pane` from dependencies (`App.tsx:181-201`); depending on event listener lifecycle, Escape may use a stale pane value after toggling. Reproduce and cover via a DOM/browser test across open -> close and reopen -> close; make the toggle focusable/available when the inspector is open and ensure the handler tracks current pane state. Acceptance: after close, focus is visibly located on the inspector toggle or another explicit visible trigger; Escape closes the inspector from its descendants on every opening cycle.

3. Default button text contrast: palette audit measures #fff on Direction C #d97706 at 3.19:1, below WCAG AA 4.5:1 for normal text. Keep the C hue if desired, but make button foreground satisfy 4.5:1 or use a sufficiently dark foreground; test the rendered computed foreground/background rather than just tokens. Acceptance: send/start labels/icons and other text-bearing accent controls meet 4.5:1; large text minimum 3:1.

4. Narrow responsive threshold: inspect 600px and 320px after fixing the overflow. Current implementation only has the declared <=900px and <=700px breakpoints, and the inspector remains in a 320px layout at 600px, leaving a narrow chat column. Define/assert expected inspection behavior at 600px and the smallest supported width rather than equating absence of document overflow with usable content. Acceptance: primary composer, message content and navigation remain operable without forced side-by-side compression.

5. Automated keyboard-acceptance gap: focused F4 source test `desktop/upstream/tests/f4-shell.test.tsx` exercises only settings tab markup. Extend focused UI coverage with actual keyboard interaction for inspector Escape/focus return, mobile nav open/close and disclosure keyboard operation. Keep test names tied to behaviors above.

## Verification limits

This Linux environment has Chromium, not macOS. No macOS VoiceOver/Accessibility Inspector traversal, real packaged macOS window capture, native focus behavior, signing/notarization, live Hermes integration, or 320px/low-vision user acceptance was performed. `prefers-reduced-motion` query was emulated in browser; the existing CSS reduced-motion rule should be independently confirmed in product and test rather than counted as an AT acceptance gate. These are explicit remaining gates, not inferred passes.

## Task handoff

Findings and concrete acceptance criteria are ready for engineering/product routing. No product source was modified and nothing was committed. Focus first on the bounded mobile 600px overflow/focus containment and inspector focus-return regressions, then the accent foreground contrast and regression tests. Capture actual macOS VoiceOver and visual evidence on supported hardware before claiming complete accessibility acceptance.
