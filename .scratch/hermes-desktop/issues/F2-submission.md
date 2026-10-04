# F2 — Invio scoped, delivery e bozze

Status: done (solo incremento invio scoped/bozze)
Baseline: ecdddfa473015f4aee47405a6f8813de44e16e72
Spec: docs/features/F2-conversations.md

Ownership: Chat.tsx, conversation-submission.ts/test, bridge.mjs/test, ConversationHost.tsx (callback lifecycle F1), Verification/RuntimeWebSocketFixture.py, script packaged F2, package.json test gate e documentazione propria. Dipendenze F1 implementata; PageConversation continua a fornire beforeSend senza modifiche F6.

Gate: cambio chat/host durante preparazione, doppio invio, delta prima ack, ack dopo terminale/turno successivo, bozza nuova e draft dopo cambio origin, suite/typecheck/build, smoke packaged sintetico. Nessun prompt personale. Roster/Bot Chat F7, F3/F8/F14 e live modello isolato restano gate separati.

Consegna: docs/architecture/f2-submission-review-2026-10-04.md; gate selezionati PASS, suite 36+61, package e GUI sintetica. F2 completa non dichiarata.
