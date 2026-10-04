# Hermes — stato corrente

Aggiornato 2026-10-04. Piano eseguibile: ../superpowers/plans/2026-10-04-overnight-hermes.md. Memoria canonica MEMORY.md; audit onesto skill-audit.md.

## Risultati verificati

App SwiftUI workspace/team e strumenti compilata, firmata ad hoc e avviata con SDK26.5. Bozza ripristinata alla riapertura UI. Sei verifiche Foundation della persistenza passate; swift test non disponibile per XCTest assente nei CLT. Editor Markdown/anteprima/esportazione e browser manuale implementati; smoke completo ancora pendente.

Trasporto actor HermesRuntimeClient implementato da sorgente upstream fissato, compilazione Swift6 strict concurrency passata. Otto check sintetici del contratto passati, che non provano streaming live. Handshake live PASS senza sessioni/prompt/cronologia: health → token solo memoria → gateway.ready → capabilities(false) → ping. Integrazione Store/GUI ancora da completare. File tree scelto dall'utente implementato in modulo/vista separati, integrato come tab: build PASS e sei test filesystem sintetici PASS; ultimo fix scope da ricompilare, smoke UI pendente. Direzione artistica editoriale implementata: controllo UI pendente.

## Lavoro corrente

Root coordina integrazione e documentazione; agenti runtime, design/file workspace e verifica su file distinti. Goal attivo e ripresa periodica del lavoro attivata. Nessun invio remoto o approvazione dichiarato funzionante prima della prova.

Git master inizializzato, nessun commit o remote al controllo corrente. Commit per incremento dopo gate; push richiede destinazione.

## Limiti

App di sviluppo, non release. Delega runtime, strumenti agenti, host sempre acceso e prova24h non completati. Report architettura prodotto ma candidato di refactoring non selezionato. UX extraction non esaustiva; audit accessibilità e code-review finale pendenti. Baseline wireframe chat e verification.json(21skill) restano storici.

## Direzione futura documentata

Gli agenti specialisti Hermes potranno in futuro richiamare Codex, consultarne gli aggiornamenti e integrare i risultati negli incarichi Hermes. Per ora è una proposta documentale, senza implementazione né assunzioni sulle API o sulla ripresa dello stesso thread. Dettagli e verifiche in [codex-specialists.md](../future/codex-specialists.md). Alla chiusura dei task, ricordare periodicamente all'utente di valutare le idee future documentate.
