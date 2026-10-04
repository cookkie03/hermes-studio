# F00 — MVP essenziale e qualità della base

Stato: documentata; baseline esistente parziale. Non eseguire refactor automaticamente in questa chat documentale.

## Risultato

Una .app significativa anche senza runtime: sidebar Spaces/Dots, chat vuota, documenti e memoria locale recuperabili, Settings e capacità future chiaramente assenti. Il primo MVP serve a dare una base utilizzabile alle chat feature, senza promettere plugin, browser stream, computer use, collaborazione o routine già funzionanti.

## Baseline e limiti

Electron/renderer riusato, servizio locale embedded e connector Hermes esistono. Prove packaged di metadata/riavvio e fixture runtime sono disponibili; handshake Node live provato senza prompt. Chat/tool sintetici sono stati osservati, mentre review/save E2E e dialogo reale isolato restano gate. DMG locale di sviluppo non notarizzato, distinta da F12.

Non cancellare per rendere l'app vuota i dati/codepath già esistenti. Togliere dalla navigazione le promesse non supportate o dichiararne lo stato. Una .app vuota senza affordance non soddisfa l'MVP.

## Incremento selezionabile

Leggere review architettura e scegliere un solo candidato: ciclo Conversazione oppure Metadata locali. Prima definire invarianti/ownership e una prova di regressione sul comportamento corrente, poi eventuale deepening senza nuove feature. Non spostare tutto il repository per rispettare un'estetica delle cartelle.

File interessati: desktop/hermes/bridge.mjs, server.mjs, src/client/Chat.tsx per ciclo; Store/WorkspaceStore/pages e tsconfig.metadata per metadata. Electron ha ownership separata. Sources SwiftUI sono storiche e preservate.

## Gate

1. Fresh userData e runtime assente: apertura significativa, nessun prompt/download/installazione automatica, stato offline chiaro.
2. Space/documento/memoria sintetici persistono dopo riavvio; revision conflict non sovrascrive bozza.
3. I module condivisi hanno interface con invarianti documentate e test attraverso seam reale; niente wrapper senza leverage.
4. Typecheck shipped, fixture principali e packaged smoke passano; limiti --noCheck/upstream dichiarati o risolti con prove.
5. Nessuna regressione su owner-token, session filtering, no retry incerto, processo posseduto e dati personali.
6. UI confrontata con norme component-system: focus, minWidth, reduced motion e controlli non supportati.

## Handoff

> Sviluppa soltanto F00. Leggi questa scheda, ADR0006, principles.md e feature-architecture-review.md. Prima proponi quale singolo module approfondire e quali comportamenti proveranno equivalenza; non implementare le altre feature. Preserva dati e codice storico. Consegna MVP essenziale e prove, senza dichiarare supporto a feature future.
