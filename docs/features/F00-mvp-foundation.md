# F00 — MVP essenziale e qualità della base

Stato: completata — 2026-10-04. Baseline MVP consolidata con review, build/test e correzioni essenziali; commit locale della consegna. I limiti delle altre feature restano espliciti.



<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [improve-codebase-architecture](<../../.agents/skills/improve-codebase-architecture/SKILL.md>) | Review dei candidati prima di scegliere un singolo module |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Valutare interface, locality e seam della baseline |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Se si approfondisce il ciclo Conversazione nel renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Per il gate di avvio e persistenza della vera app |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Solo per un failure mode osservato |

### Punti di ingresso da leggere

- [docs/architecture/feature-architecture-review.md](<../../docs/architecture/feature-architecture-review.md>): Candidati e limiti; nessuno già selezionato.
- [desktop/package.json](<../../desktop/package.json>): Script e grafi dipendenze effettivi.
- [desktop/tsconfig.metadata.json](<../../desktop/tsconfig.metadata.json>): Configurazione typecheck metadata e dipendenze.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Orchestrazione attuale.
- [desktop/hermes/server.mjs](<../../desktop/hermes/server.mjs>): Metadata/trasporto attuali.
- [desktop/scripts/test-packaged-ui.cjs](<../../desktop/scripts/test-packaged-ui.cjs>): Prova packaged esistente, da verificare rispetto ai gate.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

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

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Sviluppa soltanto F00. Leggi questa scheda, ADR0006, principles.md e feature-architecture-review.md. Prima proponi quale singolo module approfondire e quali comportamenti proveranno equivalenza; non implementare le altre feature. Preserva dati e codice storico. Consegna MVP essenziale e prove, senza dichiarare supporto a feature future.

## Incremento scelto — Metadata locali

Contratto `metadata-contracts.ts`: route locali dipendono da WorkspaceStore e operazioni di pagina/conversazione, senza importare Platform/CopilotKit. Proprietà, accesso agli Space e revisioni restano nei medesimi store; Studio e adapter storico implementano la stessa interface. `tsconfig.metadata.json` verifica il grafo spedito senza --noCheck. Il manifest runtime continua ad escludere executor legacy. Le correzioni bridge/UI sono limitate ai bug essenziali della baseline, senza approfondire il ciclo Conversazione o introdurre nuove capacità. Prove richieste: API metadata/revisione409/riapertura/errore, fixture bridge cold resume, build e smoke .app isolata.

## Esito dei gate

1. PASS fresh userData, Hermes disconnesso, UI utile e nessun prompt/installazione automatica.
2. PASS Space/documento/memoria al riavvio; failure storage e conflitto reale preservano bozza.
3. PASS invarianti Metadata espliciti e regressioni attraverso API/store reali; nessun executor aggiunto.
4. PASS strict renderer/metadata senza --noCheck, npm test e smoke packaged. Il template executor storico non è il grafo prodotto: incompatibilità SDK dichiarata nella review.
5. PASS fixture token/origin, session filtering, cold resume/no retry e bootstrap processo posseduto; dati personali non usati.
6. PASS struttura OpenDots ispezionata, 900px senza overflow, Tab con focus visibile, Reduced Motion senza animazioni/transizioni. Audit VoiceOver e confronto visuale completo rimangono F01.

Evidenze e limiti: [review F00](../architecture/f00-review-2026-10-04.md). Artefatto locale: desktop/release/mac-arm64/Hermes Studio.app, firma ad hoc; pubblicazione/notarizzazione e DMG aggiornato sono F12.
