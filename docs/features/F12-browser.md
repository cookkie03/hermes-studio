# F12 — Browser integrated with Hermes tools

<!-- implementation-packet:start -->
## Assignment for the implementing chat

When this card is attached as a development assignment, implement and verify **only the frontend/integration F12**, following the workflow below and the card-specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before coding. The “documented/not implemented” labels describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** GUI adaptation and integration with existing Hermes capabilities, rather than creating the feature in the backend. The Fxx separation establishes ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Connect the same browser page/profile to the user and Hermes browser tools, with verified persistence and control.

**Backend and boundary:** Native browser controller/callback/CDP/tools according to the audit; browser_exec and F16 Computer Use remain distinct capabilities. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** The panel shows URL/tab/profile/host/owner and the chat’s Space; manual/agent navigation and takeover only when supported by the actual contract. You must read the [shared GUI requirements](gui-context-and-references.md); apply the requirements identified here and leave other functionality to its respective owners.

**Dependencies and additional reading:** F1 routing/F3 grants and browser audit; do not add a second tool ecosystem to obtain a preview that looks live. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills and gates. Verify actual files/methods/version; future paths are not existing APIs.

**Required specific tests for the relevant increment:** Cookies/storage/history across restart, wrong tab, takeover/revoke, expired lease, isolated login/profile, host change and no fallback to a parallel browser. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** working increment code, relevant tests with recorded commands/results, typecheck/build of the modified graph and proportionate .app smoke testing. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the spec/principles, fix discovered issues, and update status/gates in the card and MEMORY/STATUS/WORKLOG. Declare tests not performed and external blockers; completion requires proven increment gates. Git: select only your own files after checking diff/index/secrets; push/publication follows current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with the card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within actual authorizations and capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: spec updated D27, 2026-10-04; neither implemented nor tested in the client. Final goal: a visible browser inside Hermes Studio, controlled by existing Hermes tools and directly usable by the user, with persistent profile, cookies, storage and history. Receipts, URLs and screenshots are intermediate increments and do not complete this feature.

<!-- feature-guidance:start -->
## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) retains all collections; load skill bodies only when relevant.

### Feature-specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Verify browser tools versus controller |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Browser lease and scope |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — conditional | React components and renderer state |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — conditional | Packaged UI verification with synthetic data and actually available tools |
| [ux-extract](<../../.agents/skills/ux-extract/SKILL.md>) — conditional | Only missing browser-panel observations |

### Entry points to read

- [docs/features/F1-runtime-connection.md](<../../docs/features/F1-runtime-connection.md>): Authentication required by the controller.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Permissions.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Current panel.
- [desktop/electron/external-links.cjs](<../../desktop/electron/external-links.cjs>): Protected URL opening.
- [Hermes: tools/browser_tool.py](</Users/luca/.hermes/hermes-agent/tools/browser_tool.py>): Browser tools; source reading at the pinned version, not a live test.
- [Hermes: tui_gateway/methods_browser_control.py](</Users/luca/.hermes/hermes-agent/tui_gateway/methods_browser_control.py>): Controller and gates; source reading at the pinned version, not a live test.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Sources and technical choice to verify

Read the [integrated browser research](../research/hermes-integrated-browser.md) and [official Hermes desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). Studied checkout: `e1e82d782f353766c7a22db6e5ac4fa58bbff325`; source capabilities, not live tests. Additional public entry points: `apps/desktop/src/app/chat/right-rail/preview-pane.tsx`, `tools/drive_preview_tool.py`, `tools/read_preview_tool.py`, `tools/browser_extension_router.py`, `tools/browser_tool_cdp.py`, `gateway/browser_control_broker.py` and `tui_gateway/methods_browser_control.py`.

Upstream already has a persistent webview (`persist:hermes-preview`) with `read_preview`/`drive_preview` callbacks. The `browser_*` controller and CDP connection are other existing paths. The webview’s presence alone does not demonstrate that `browser_*` tools control the same page. First implement a vertical test and choose the most integrated supported path; do not add a second tool catalog or a parallel browser. Define Studio endpoints/adapters after the test; do not invent already-available APIs.

## Required experience

- Browser panel beside the chat: tabs, URL, back/forward/reload, real page, activity and owner are visible. Opening a Hermes search result can navigate this same surface through an explicit action.
- User and agent see and modify **the same page and tabs**, without copies or screenshots presented as an interactive browser. Web search and browser use are distinct backend capabilities.
- Dedicated persistent profile: cookies, login, localStorage and history must survive restart. Persistent history must be implemented/verified: a persistent partition alone does not guarantee it.
- Take over assigns control to the user and suspends/revokes the agent’s browser commands. Explicit Resume; no click/typing races and no implicit cancellation of the entire assignment.
- Closing the panel does not delete the profile or work. Switching Dot/session preserves verifiable associations and prevents the old owner from controlling the new browser.
- A disconnection shows an uncontrollable browser and preserves the page; no automatic repetition of clicks or hidden switch to headless/cloud/another browser.

## Contract and architecture

Separate BrowserProfile, tabs/navigation, BrowserController and control lease from receipts/tool activity. These are proposed responsibilities, not already-implemented types. Reuse the Hermes browser family or existing desktop callbacks according to the verified mode; no alternative OpenDots executor.

The RPC controller requires authenticated non-internal server-derived identity, in addition to supported protocol, flags and capabilities. Studio’s current anonymous attach does not automatically grant register. The lease is tied to principal/profile/session/controller/browser_profile/transport; heartbeat, expiration and result come from the exact owner. Raw CDP/evaluate require distinct gates: a viewer does not grant Developer Mode.

CDP configured through `BROWSER_CDP_URL`/`browser.cdp_url` avoids launching another browser, but Electron guest compatibility and isolation must be tested. Do not modify global configuration or the personal runtime to connect a window. The chosen path must preserve per-profile scope; remote Hermes does not automatically see the Mac’s browser.

F1 owns connection/authentication; F12 owns browser profile, controller and surface; F3 grants/takeover; F11 capability discovery. ComputerPanel.tsx is shared with F16/F5/F15: agree on ownership before coding. No global refactor is necessary merely to display a tab.

## Privacy and states

A dedicated Studio profile is the proposed default; no automatic copying of Chrome/Safari cookies or importing personal profiles. Keep browser data outside Git/logs; retention and clear history/data are explicit operations, not startup actions. Maintain sandbox, context isolation, CSP and navigation, pop-up and download policies. No arbitrary iframe in the privileged UI.

States: manual, connecting controller, agent control, user control, disconnected, error. Tool success only after an outcome; tool history does not mean the controller is still active. Discreet indicator and understandable text, no fake viewport. Component reference: [component-system](../design/component-system.md).

## Gates and Definition of done

1. Packaged synthetic test: Hermes command navigates → snapshot → click/type → outcome on the same displayed page; manual action modifies the DOM visible to the tool. Demonstrate profile/session binding and the chosen mode.
2. Synthetic local site: fake cookie/login, storage, two tabs and history; quit/restart restores according to the documented contract. No real accounts.
3. Takeover during in-flight commands, resume, session switch, expired lease, lost connection and late result: no commands sent to the new owner or retries of uncertain actions.
4. Denied permission/anonymous controller/stale principal/incompatible remote profile remain unavailable; no hidden fallback. Unsafe navigation/downloads/URLs handled without weakening the sandbox.
5. Keyboard/focus/900px/Reduced Motion tests, screenshot privacy and no credentials in logs. Receipt-only remains partial until control and persistence pass these gates.

## Prompt for a new chat

> First follow docs/agents/feature-workflow.md and F12 Files and skills. Implement only the selected shared-browser increment, reading browser research and verifying Hermes SHA/contracts. Start with the manual + tool same-page test and choose among existing Hermes paths; no parallel browser/tools or personal configuration changes. Preserve authentication, owner and permissions. Verify persistence, takeover and no uncertain retries with synthetic data in the .app. Receipts/screenshots do not complete F12. Update the card, evidence and project memory; do not incidentally implement F16 or other features. Also follow the Assignment for the implementing chat for F12: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions still apply.
