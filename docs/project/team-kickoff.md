# Autonomous Hermes Studio team kickoff

## Current user authorization

Luca authorized Engineering Director to orchestrate all eight named teammates, start from `docs/`, and autonomously turn documented ideas into verified working increments. Ask only for material ambiguity, product direction, credentials, or risk decisions. Final target: the existing `cookkie03/hermes-studio` GitHub repository with a downloadable, installable macOS DMG and professional tests/release workflow, progressively covering all accepted documented decisions. This supersedes the historical manual prompt-relay/no-delegation process, not product safety boundaries. Do not treat historical proposals, rejected designs, or future ideas as accepted requirements. Preserve protected F0–F3 unless Luca explicitly authorizes the particular protected behavior change.

## Team ownership

| Role | Profile | Ownership |
|---|---|---|
| Engineering Director | engineering-director | Scope, task dependencies, integration, evidence, final release authorization/gates |
| Product Manager | project-manager | Requirements-to-code/test traceability, priorities, acceptance and unresolved product decisions |
| Tech Lead / Architect | tech-lead | Architecture, contracts, integration boundaries and technical review |
| Research Engineer | research-engineer | Verified libraries/platform/runtime compatibility research; no speculative dependency additions |
| Software Engineer | software-engineer | Bounded full-stack implementation and regression tests in isolated worktrees |
| UI/UX Designer | ui-ux-designer | Approved Direction C interaction/design, keyboard/accessibility acceptance |
| QA Engineer | qa-tester | Independent test execution, regressions, release acceptance evidence |
| Security Engineer | security-engineer | Threat boundaries, data/credential safety, release/security review |
| DevOps Engineer | devops-engineer | Reproducible builds, CI gates, macOS packaging, artifacts/checksums, release pipeline |

## First bounded delivery track

F13 release engineering and evidence-led gap selection. Read project AGENTS, MEMORY, STATUS, glossary, ask-matt router, feature workflow, ownership boundaries and relevant feature card/skills before work. Existing production stack is Electron/React; SwiftUI is a preserved historical baseline, not an authorized rewrite. Apply Axiom design/accessibility guidance and load SwiftUI guidance for native work. Use junior-style bounded implementation assignments followed by specification and quality review.

Durable execution is tracked on the dedicated local Hermes Kanban board `hermes-studio`; this is orchestration state, not an external issue tracker or replacement for the local Markdown product tracker. Reviews in `docs/project/team/` have distinct owners. Code changes occur in isolated worktrees. No publishing, signing, or final release claim until integrated exact-head gates pass. Existing GitHub repository may be used for the requested release. Never modify Hermes Agent source or personal runtime/accounts. Tests use isolated synthetic data, clearly distinguished from live integration.

## Baseline observed before delegation

- Source checkout clean on `main`, HEAD `f3f1bf3`.
- GitHub authenticated as `cookkie03`; repository confirmed, no releases listed.
- Node v26.5.1, npm 11.17.0; existing dependencies available.
- `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:package`: exit 0 on Debian. These do not certify macOS installation, VoiceOver, signing/notarization, or live runtime integration.
- README currently claims macOS 13+ Apple Silicon. Intel/older Mac support must be measured/declared, not promised as 'any MacBook'.
- Known preexisting Hermes installation/plugin update warnings are not Studio code defects; do not repair the shared Hermes installation in this project scope.

## Acceptance

Small complete slices, failing regression before behavior fixes, reuse before new dependencies. Capture commands, exit codes, limitations, source SHA and artifact identity. Review specification compliance and code quality independently. Required release jobs must not be bypassed; signing/notarization or missing Mac infrastructure is a real blocker, not a fabricated success. Keep MEMORY/STATUS/WORKLOG current after significant blocks, with the orchestrator owning shared updates.
