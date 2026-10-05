# F4 — Shell, navigation and Hermes Studio components

<!-- implementation-packet:start -->
## Assignment for the implementation chat

When this feature card is attached as a development assignment, implement and verify **only the F4 frontend/integration**, following the workflow below and this card’s specific sections. The attachment is the entry point: open the linked workspace files and SKILL.md files before writing code. “Documented/not implemented” statements describe the baseline; they do not require the assigned chat to stop at a plan.

**Type of work:** Design and implementation of Studio surfaces. The Fxx split provides ownership, implementation and testing in separate chats: the product remains a single Hermes GUI in the OpenDots style.

**Outcome:** Implement shell/sidebar/header/composer/popovers consistent with OpenDots and keep the Hermes context recognizable at all times.

**Backend and boundary:** Consume projects/sessions/models/effort/capabilities provided by the owning adapters; Hermes Settings uses the scoped backend, Studio Settings uses app state. Studio is a Hermes frontend/adapter: names and GUI may change, but agent capabilities and gates remain native. A missing contract is an explicit gap, not a new backend feature to build.

**Relevant context and interactions:** D37: each connected runtime presents its own Bots as Dots through the native roster, without manual recreation; F7 owns this. Also apply D36 below: a side panel for temporary children; persistent Dots in their own chat, attributed messages and runtime-confirmed activity. Readable Space/host/model/effort; active Space in the sidebar, @ and / popovers, selectors showing pending/actual outcomes. Distinct offline/stale/unsupported states. Reading the [shared GUI requirements](gui-context-and-references.md) is mandatory; apply the requirements assigned here and leave other functions to their respective owners.

**Dependencies and additional reading:** F2/F6/F7/F11 supply contracts/data; F4 implements presentation and interactions, not a new connection/executor. Read [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow and skills](../agents/feature-workflow.md), [boundaries](../architecture/feature-boundaries.md), then this card’s Files and skills section and gates. Verify actual files, methods and version; future paths are not already existing APIs.

**Mandatory specific tests for the relevant increment:** 900/1360px, long names and namesakes, switching chats while loading, IME/Enter in menus, Escape/focus, zoom/VoiceOver/Reduced Motion, content not obscured by the panel. Use synthetic profiles and data; exercise the actual interface. Fixtures, builds, handshakes and isolated runtime tests are distinct evidence.

**Required delivery:** Working increment code, relevant tests with recorded commands/results, typecheck/build of the changed dependency graph and a proportionate .app smoke test. If the UI changes: verify keyboard/focus, IME where relevant, 900/1360px, accessibility and Reduced Motion. Review the diff against the specification/principles, fix identified issues, and update status/gates in this card and MEMORY/STATUS/WORKLOG. Declare unperformed tests and external blockers; completion requires proven increment gates. Git: select only your own files after inspecting diff/index/secrets; push/publish according to current authorization.

If essential scope is missing, clarify only that; otherwise use confirmed requirements and choose a vertical increment consistent with this card, declaring it before edits. Agree on shared dependencies; do not implement the backlog. F0 remains explicit maintenance of the completed baseline; F18 remains future work until selected and supported. For other IDs, proceed with implementation and verification within authorization and actual capabilities, without another general interview.
<!-- implementation-packet:end -->


Status: specification for a future chat; partial existing baseline, feature incomplete. Updated: 2026-10-04. The user’s new request is to document the project by feature and start from a nearly empty MVP. This document does not authorize resuming the overnight plan or deleting the prototype.


<!-- feature-guidance:start -->

## Files and skills to read and use

First follow the [shared ask-matt-guided workflow](../agents/feature-workflow.md): it contains initial reading, implementation/review skills and exit criteria. Then read the specific files below. The [complete project and global catalog](../agents/skills-catalog.md) preserves all collections; load skill bodies only when relevant.

### Specific skills

| Skill / path | When to apply it to this feature |
|---|---|
| [frontend-design](<../../.agents/skills/frontend-design/SKILL.md>) | Visual direction consistent with the reference and component anatomy |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | React components and renderer state |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — conditional | Packaged UI verification with synthetic data and actually available tools |
| [ux-extract](<../../.agents/skills/ux-extract/SKILL.md>) — conditional | If evidence is missing for a component or microinteraction |
| [axiom-design](<../../.agents/skills/axiom-design/SKILL.md>) — conditional | macOS hierarchy and conventions, applied to the Electron stack |
| [axiom-accessibility](<../../.agents/skills/axiom-accessibility/SKILL.md>) — conditional | Keyboard/focus/contrast criteria; native APIs only in the native branch |

### Entry points to read

- [docs/design/component-system.md](<../../docs/design/component-system.md>): Proposed tokens, states and motion.
- [docs/design/opendots-target.md](<../../docs/design/opendots-target.md>): Authoritative composition.
- [docs/ux-extracts/desktop-components/pattern-library.md](<../../docs/ux-extracts/desktop-components/pattern-library.md>): Live observations versus screenshots.
- [desktop/upstream/src/client/App.tsx](<../../desktop/upstream/src/client/App.tsx>): Shell navigation.
- [desktop/upstream/src/client/ThreadList.tsx](<../../desktop/upstream/src/client/ThreadList.tsx>): Sidebar.
- [desktop/upstream/src/client/style.css](<../../desktop/upstream/src/client/style.css>): Shared styles to coordinate.

Verify paths and version before working; coordinate shared files. Reading does not authorize other features or changes to the personal runtime.
<!-- feature-guidance:end -->

## Outcome and boundaries

Open Hermes Studio and understand where agents, conversations, documents and tools are, even when no data exists yet. The shell organizes work; it does not create an agent, start a session or connect Hermes by itself.

MVP: macOS window, sidebar, selected destination, main area, openable inspector, empty state and connection status. Installation and packaging have a separate specification. Calls, scheduling, automatic teams, executable terminal and computer use do not belong to this feature.

## References and evidence boundary

- Central visual standard: [component-system](../design/component-system.md). Before implementation, verify that the document is available and read its Unsloth/Codex evidence; this file does not replace that extraction.
- Observed reference: [user’s OpenDots screenshot](../design/references/opendots-user-reference-2026-10-04.png), described in [opendots-target](../design/opendots-target.md): one sidebar, central chat and Computer on the right; illustrated avatars, light surfaces, lavender selection, teal accents.
- Approximately 19%/53%/28% is an estimate from the screenshot, not a measured upstream responsive layout. CSS figures below are proposals.
- Unsloth and Codex provide component and state references through the central document; their presence does not authorize extra rails, fictional tasks or unsupported menus. No animation has been verified from a static screenshot.

## Component anatomy

| Component | Parts and behavior |
|---|---|
| Window | Hermes Studio title, macOS controls, resizable content. Do not imitate traffic lights in the DOM. |
| Sidebar | Logo, New chat action with an accessible name, search, Spaces and Dots sections, recent conversations if present, Memory and Settings at the bottom. One column only, no second rail. |
| Space row | Folder, name, expansion when it has children; counts only if real. Selection distinct from focus. |
| Dot row | Illustrated avatar, name and actual summary or configured role. Ellipsis, never overflow; operational state distinct from identity. No invented timestamp. |
| Header | Avatar and name aligned left; role/state below; actions right. State readable without color. |
| Main area | Selected destination or brief instruction to create the first item. No preloaded Acme/Scout examples to appear functional. |
| Inspector | Computer title, close control, Browser/Files/Terminal tabs only with honest content/states. Opening it does not create a capability. |
| Settings | Connection and local preferences. No CopilotKit credentials screen in the Hermes flow. |

## Geometry and tokens

Proposal to validate against the central standard: 4px base spacing, 16–24px shell padding, 56–68px sidebar rows with 36–40px avatars, 64–72px header, 1px separators, 8px control radii and 12–16px surface radii. macOS system font: body 14px/20px, secondary text 12px/18px, header title 16px/22px. These values are proposals, not Unsloth/Codex measurements.

At 1360px: sidebar approximately 258px, inspector approximately 381px, center approximately 721px. The inspector must not inherit 40vw from upstream. Proposed minimum window size 880×640, to test before fixing it. At 900px, prioritize the main area: inspector overlays only on explicit opening, with accessible closing; when switching to Memory/Spaces/Settings, close it if it intercepts content. Do not block Add memory or document controls with an invisible overlay. Sidebar collapsible by keyboard, with focus returned to its button.

Final colors and typography belong to component-system; no decorative gradients or nested cards for every row. Operational surfaces establish hierarchy through spacing, borders and selection.

## States and contracts

| State | UI and consequence |
|---|---|
| Empty first launch | No automatic Dot/Space/conversation. Create Space/Create Dot guidance, no Working state. |
| Loading metadata | Brief state and accessible announcement; do not show an empty archive as if already verified. |
| Unreadable archive | Error and explicit recovery; preserve bytes and do not initialize over the file. |
| Disconnected runtime | Local documents accessible. Sending and remote actions inactive. |
| Unavailable inspector | Explain the missing capability; do not show fake screenshots or terminal prompts. |
| Removed selection | Return to a valid destination without changing other data. |

Opening/closing the app is distinct from deleting runtime work. Personal Hermes data is not a shell seed. Locally configured Dots do not prove processes have started.

## Motion and accessibility

Proposal: panel enter/exit 120–180ms only to explain the change; immediate focus ring; no endless avatar bobbing. With reduced motion, use immediate changes or only a brief fade without translation. Navigation must work without animation, hover or drag. Accessible names are mandatory for New chat, search, Computer, Close and Settings. Resizing and 200% zoom must not remove essential controls. Verify contrast/focus in the product rather than infer them from screenshot colors.

## Keyboard, focus and microstates

Apply the normative contract in component-system. Search retains focus while filtering; empty results do not become a connection error. Enter selects a result only when it has explicit focus. Tab follows logo/actions/search/navigation/content; Escape closes menus or inspector, restoring focus to the opening button. Collapsing the sidebar does not leave focus in a hidden node. Each icon retains a name and reason for being disabled.

Rows have distinct idle/hover/focus-visible/selected/disabled states; selection does not mean Running. Busy applies only to the action actually pending. Copy is not an MVP shell action: it will be defined in the component containing the data, without a global command that copies private context.

## Dependencies and ownership

Prerequisites: current MEMORY/STATUS/GLOSSARY, ADR0005 and ADR0006, component-system and the updated empty-MVP specification. Depends on F2 for conversation content, F6 for documents and F9 for memory; F4 may show empty destinations without implementing them.

Future ownership: `desktop/upstream/src/client/App.tsx`, `ThreadList.tsx`, shell styles and dedicated components if extracted. Share `style.css` only by explicit agreement to avoid overwrites. Do not change bridge/runtime, server models, packaging or editor. Preserve source/assets/MIT provenance. The baseline already contains a sidebar and inspector: inspect actual state before deciding reuse or replacement.

## Reversible data and verification

New, separate development profile, initially empty. Do not delete current prototype data or Hermes profiles; migration/demo seeding are separate, explicit actions. Selection/inspector settings can be reset; no writes outside the development profile.

Definition of done: zero-data startup without runtime calls; keyboard navigation; 1360 and 900px screenshots with measured proportions/overflow; inspector open/close and switching to Memory without interception; zoom and reduced motion; archive errors preserve data; accessible names verified in the UI tree. Record screenshots and measurements, not claims of identical appearance based only on CSS. Relevant typecheck/build and smoke test of the actual .app, without personal prompts.

## D25–D29 alignment

The Space destination presents actual folders and documents (F6/F5), preserving legacy pages; it is not merely a list of metadata pages. Dot identity uses the selected F7-A avatar on every surface. The Computer browser is the same profile/page for the user and Hermes (F12), not a static preview. Memory distinguishes Space/profile/legacy F9; the composer offers voice only when F17 readiness/permission is proven. These controls remain unavailable until the features are implemented; F4 does not implement them incidentally.

## D34 — Hermes Settings and Hermes Studio Settings

The app must have a dedicated Settings section with two distinguishable scopes: **Hermes**, all runtime settings available for the selected version/host/profile; **Hermes Studio**, standalone app preferences. Host/profile name, origin and limitations must remain visible for Hermes settings. Connection configuration belongs to F1; F4 owns navigation/hierarchy; F8 inventory/coverage; specific features own reads/mutations. Client preferences do not silently modify the backend. Hermes settings are not a divergent local copy of its config. A gap remains explicit until the contract is connected/verified. First complete implementation in the F4 chat and owning features; F1 adds only the agreed connection surface.


## Shared requirement: Hermes context and composer

Read [visible context, Spaces/projects, @ files/lines and / skills/tools](gui-context-and-references.md). The header identifies the chat/bot’s actual Space, host, model and effort. Capabilities and mutations remain in the Hermes backend; do not simulate unsupported values or actions. Specific ownership is in the cross-feature card.

## D36 — Dots sidebar and sub-agent panel

The sidebar retains persistent Dots, each with a Hermes-derived activity signal and independent unread badge. The selected Dot shows its own chat; selection, activity and unread are separate states. Space/host/model/effort of the active chat remain recognizable even with a panel open.

The “Sub-agent” chat control opens a side panel only for temporary children of the parent session (F14). Listing, child selection, details, closing and focus restoration must work with keyboard and screen readers. Coordinate this surface with the already adjacent browser/files/tools: at 900px, composer and context remain accessible; do not create separate windows for Dots or put Dots in the children panel.

Gates: multiple active Dots, one unread but inactive Dot, an active temporary child and open panel; no identity confusion or composer obstruction. Reduced Motion retains status labels without continuous pulsing.

## D37 — Each runtime brings its own Bots into Studio

When a Hermes runtime is connected, Studio discovers and presents all its authorized Bots as Dots, preserving native identity. Do not require manual recreation of every Bot or creation of a local Dot before it can be seen. Discovery uses the verified native roster (see contracts and sources in [F7](F7-bots-and-identities.md)), not a list invented by the frontend. A profile not confirmed as a Bot is not automatically promoted to Bot.

Identity is scoped to connection/runtime, installation and profile: namesake Bots on different hosts remain distinct, with recognizable host/origin. Selecting a Dot opens that runtime’s canonical Bot Chat according to F7/F2, preserving native session and continuity; it does not create a substitute chat or send introductory prompts. Space, model and effort show the actual available context without associations inferred from names.

Roster discovery does not import all conversations, clone Bots, credentials or memories, or start work. Local metadata/avatars remain presentation. Reconnection refreshes the roster without duplicates; an offline backend shows known Bots as offline/stale, without hiding their origin or attributing activity. Additions/removals follow runtime-confirmed data; disconnecting Studio does not delete Bots or backend work. Temporary delegate_task children remain in the D36 sub-agent panel, not the persistent roster.

**Ownership:** F1 supplies connection and runtime identity; F7 discovers/maps/presents the roster and resolves Bot Chat; F2 presents conversations and events; F4 makes Dots and hosts navigable; F14 connects native messages and activity. Verify capabilities/schema in the connected runtime; a missing contract is a visible limitation, not authorization for an alternative backend.

**Gates:** connect two synthetic runtimes with namesake Bots and different rosters; all authorized Bots appear without manual creation, with correct identities and canonical chats. Refresh/reconnect does not duplicate rows; additions/removals, non-Bot profiles, denied scope, offline and host changes during discovery do not contaminate the roster. No prompts, cloning or global history import merely from connecting. Source contracts are documentary evidence, not live proof.

## Prompt for a new chat

> First follow docs/agents/feature-workflow.md and this card’s Files and skills section, reading SKILL.md files before applying them. Implement only F4 after reading AGENTS.md, docs/project/MEMORY.md, STATUS.md, GLOSSARY.md, ADR0005 and ADR0006, docs/design/component-system.md and this specification. The current direction is a nearly empty MVP and feature-based development; do not reactivate the overnight plan. Inspect the existing shell before editing it, preserve assets/provenance and data. Work only on agreed shell client files; coordinate shared styles. Do not connect Hermes or automatically create demo data. Verify 1360/900px, keyboard, accessible names, reduced motion and overlays using a synthetic profile. Update evidence and status in documentation; do not declare an absent remote capability complete. If component-system is unavailable, complete the analysis and report the prerequisite before visual code. Also follow the F4 Assignment for the implementation chat: deliver verified code and evidence, with the specified GUI/backend context, not just a plan. Capability gates and F0/F18 exceptions remain valid.
