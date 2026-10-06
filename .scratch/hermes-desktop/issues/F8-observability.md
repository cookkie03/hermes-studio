# F8 — Hermes Capability and Memory Visibility

Status: done for this increment. Implemented and verified 2026-10-06.

Implement frontend observability and backend REST contracts for native Hermes capabilities, profile memory budgets (USER 1,375 chars, MEMORY 2,200 chars), active memory entries, soul identity, byte-size vs character limit API gap explanation, pending self-improvement review summaries requiring `/memory pending`, and the full F1–F17 capability matrix mapping native contracts, surfaces, and evidence.

Shared files: `desktop/hermes/memory.mjs`, `desktop/hermes/capability-matrix.mjs`, `desktop/hermes/server.mjs`, `desktop/upstream/src/shared/types.ts`, `desktop/upstream/src/client/HermesObservabilityView.tsx`, `desktop/hermes/f8-observability.test.mjs`, `desktop/upstream/tests/f8-observability.test.tsx`.

Verification: Node tests (`hermes/f8-observability.test.mjs`) and Vitest metadata tests (`tests/f8-observability.test.tsx`) PASS. Full `npm test` suite PASS.
