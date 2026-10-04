# F0 — Baseline MVP e manutenzione

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F0**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** manutenzione client della baseline verificata. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Manutenere solo il problema della baseline completata richiesto nella chat; preservare Metadata locali e comportamento già verificato.

**Backend e confine:** MVP Electron/React e adapter Hermes esistenti; metadata/bozze sono stato del client, non memoria/esecuzione agente. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Preservare contesto e layout già presenti; controlli futuri mostrano disponibilità reale, senza nuove capacità simulate. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** [Review consegna F0](../architecture/f00-review-2026-10-04.md); nuova manutenzione delimitata, non ripetizione dell’intero MVP. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Restart metadata e bozze, errore di scrittura/conflitto, offline, smoke packaged e regressione esatta del bug selezionato. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


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

Electron/renderer riusato, servizio locale embedded e connector Hermes esistono. Prove packaged di metadata/riavvio e fixture runtime sono disponibili; handshake Node live provato senza prompt. Chat/tool sintetici sono stati osservati, mentre review/save E2E e dialogo reale isolato restano gate. DMG locale di sviluppo non notarizzato, distinta da F13.

Non cancellare per rendere l'app vuota i dati/codepath già esistenti. Togliere dalla navigazione le promesse non supportate o dichiararne lo stato. Una .app vuota senza affordance non soddisfa l'MVP.

## Incremento completato e manutenzione

In F0 è stato selezionato il candidato Metadata locali e consegnato il contratto disaccoppiato dall'executor legacy; dettagli ed esito sotto. Il candidato Conversazione non è stato selezionato. Ulteriore manutenzione della baseline richiede una nuova richiesta delimitata, non il riavvio automatico di F0.

## Gate

1. Fresh userData e runtime assente: apertura significativa, nessun prompt/download/installazione automatica, stato offline chiaro.
2. Space/documento/memoria sintetici persistono dopo riavvio; revision conflict non sovrascrive bozza.
3. I module condivisi hanno interface con invarianti documentate e test attraverso seam reale; niente wrapper senza leverage.
4. Typecheck shipped, fixture principali e packaged smoke passano; limiti --noCheck/upstream dichiarati o risolti con prove.
5. Nessuna regressione su owner-token, session filtering, no retry incerto, processo posseduto e dati personali.
6. UI confrontata con norme component-system: focus, minWidth, reduced motion e controlli non supportati.

## Incremento scelto — Metadata locali

Contratto `metadata-contracts.ts`: route locali dipendono da WorkspaceStore e operazioni di pagina/conversazione, senza importare Platform/CopilotKit. Proprietà, accesso agli Space e revisioni restano nei medesimi store; Studio e adapter storico implementano la stessa interface. `tsconfig.metadata.json` verifica il grafo spedito senza --noCheck. Il manifest runtime continua ad escludere executor legacy. Le correzioni bridge/UI sono limitate ai bug essenziali della baseline, senza approfondire il ciclo Conversazione o introdurre nuove capacità. Prove richieste: API metadata/revisione409/riapertura/errore, fixture bridge cold resume, build e smoke .app isolata.

## Esito dei gate

1. PASS fresh userData, Hermes disconnesso, UI utile e nessun prompt/installazione automatica.
2. PASS Space/documento/memoria al riavvio; failure storage e conflitto reale preservano bozza.
3. PASS invarianti Metadata espliciti e regressioni attraverso API/store reali; nessun executor aggiunto.
4. PASS strict renderer/metadata senza --noCheck, npm test e smoke packaged. Il template executor storico non è il grafo prodotto: incompatibilità SDK dichiarata nella review.
5. PASS fixture token/origin, session filtering, cold resume/no retry e bootstrap processo posseduto; dati personali non usati.
6. PASS struttura OpenDots ispezionata, 900px senza overflow, Tab con focus visibile, Reduced Motion senza animazioni/transizioni. Audit VoiceOver e confronto visuale completo rimangono F4.

Evidenze e limiti: [review F0](../architecture/f00-review-2026-10-04.md). Artefatto locale: desktop/release/mac-arm64/Hermes Studio.app, firma ad hoc; pubblicazione/notarizzazione e DMG aggiornato sono F13.

## Handoff per eventuale manutenzione esplicita

> Prima segui docs/agents/feature-workflow.md e File e skill F0. F0 è completata: leggi docs/architecture/f00-review-2026-10-04.md e delimita soltanto il nuovo problema di manutenzione richiesto dall’utente. Preserva contratto Metadata, dati e gate già verificati; non scegliere un nuovo refactor o implementare altre feature automaticamente. Esegui verifiche proporzionate al cambiamento e aggiorna prove/STATUS/WORKLOG prima del commit. Segui anche Incarico per la chat implementatrice di F0: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
