# Hermes macOS — piano operativo notturno

> **For agentic workers:** eseguire task per task con implementatore e revisore distinti, checklist e prove. `writing-plans` raccomanda subagent-driven-development/executing-plans; la disponibilità di quelle skill non è verificata. Il metodo operativo scelto esplicitamente da Luca è l'orchestrazione con gli agenti di questa chat. Non dichiarare applicate skill non lette.

**Goal:** completare il percorso ricerca e scrittura di Hermes e avanzare il backlog completo di collaborazione e continuità, senza confondere prototipi con capacità reali.

**Architecture:** SwiftUI nativo con archivio locale atomico e gateway Hermes WebSocket JSON-RPC. Il runtime è autoritativo per sessioni, attività e approvazioni; file e bozze restano persistenti sul Mac. Moduli distinti per trasporto, stato del workspace e file selezionati dall'utente.

**Tech Stack:** Swift 6, SwiftUI, Observation, Foundation, WebKit macOS26, SwiftPM/SDK26.5.

**Spec:** `.scratch/hermes-desktop/spec.md`, `docs/project/MEMORY.md` D01–D13, `docs/design/native-reorientation.md`, `docs/design/art-direction.md`.

## Vincoli globali

- macOS14+; Liquid Glass e WebKit nativo moderni gated macOS26; niente dipendenze prodotto esterne.
- Team principale, chat secondaria, workspace ordinato con strumenti affiancati; avatar illustrati e movimento mirato.
- Primo flusso ricerca e scrittura. Il browser manuale non equivale a browser use dell'agente.
- Nessuna lettura di credenziali/config privati o DB chat; prove sintetiche, preservazione del runtime personale.
- Nessuna approvazione automatica. Capability attiva soltanto dopo implementazione e prova.
- Build compilata non equivale a smoke UI; handshake non equivale a chat funzionante; client chiuso non equivale a lavoro 24/7.
- Aggiornare MEMORY, STATUS, WORKLOG e ticket dopo ogni incremento. Commit espliciti verificati; push solo a remote confermato.

## Review focus

1. Invio con risposta incerta: mai retry automatico che duplica il lavoro; bozza recuperabile.
2. Caduta socket e sessione compressa: distinguere runtime ID da stored ID, resume e stato incerto visibile.
3. Approvazione annullata mentre è aperta: rimuovere richiesta stale, nessuna risposta su ID riciclato.
4. File modificato esternamente o symlink fuori cartella: preservare contenuto, mostrare conflitto, non sovrascrivere.
5. Archivio corrotto/versione futura e finestra stretta: proteggere dati, mostrare errore, controlli raggiungibili.

## Squadra e dipendenze

| Area | Responsabile attuale | Proprietà dei file | Gate |
|---|---|---|---|
| Coordinamento/integrazione | root | Store, Shell, Conversation, Settings, memoria, Git | build e percorso integrato |
| Runtime | architecture_review | HermesRuntimeClient.swift, ricerca runtime | fixture, handshake, errori |
| Design/file workspace | art_direction | TeamWorkspaceView, DesignTheme, ResearchFiles/View | build, accessibilità, file sintetici |
| Verifica indipendente | taste_research | Verification, script di test | regressioni concrete e revisione |

T1 e T2 sono paralleli; T3 dipende da T1; T4 da T3; T5 da T2/T4; T6 da T5. T7/T8 avanzano dopo un primo ciclo verificato; la prova 24h non viene abbreviata. Un solo agente modifica ciascun file alla volta. root integra e risolve conflitti; niente Git dagli agenti.

## Task 0 — riallineamento e audit skill (root)

Files: docs/project/{MEMORY,STATUS,WORKLOG,skill-audit}.md; spec; ROADMAP.

- [x] Salvare decisioni D01–D13 e autorizzazione orchestrazione/Git.
- [ ] Separare installata/letta/applicata/verificata nella matrice di tutte le skill esplicitamente citate.
- [ ] Correggere testo storico che dice shell chat soltanto o nessun codice.
- [ ] Mappare requisiti iniziali ai task e aggiornare ticket con dipendenze, senza retrodatare done.

## Task 1 — contratto e trasporto runtime (architecture_review + verificatore)

Files: Sources/HermesCore/HermesRuntimeClient.swift; Verification/RuntimeContractChecks.swift; scripts/check-runtime-contract.sh; docs/research/runtime-integration-findings.md; docs/adr/0005-runtime-websocket.md.

Interfaces: HermesRuntimeClient.events: AsyncStream<RuntimeEvent>; connectLocal(handlesServerRequests: Bool=false) async throws -> URL; createSession(profile:idempotencyKey:) async throws -> RuntimeSession; resumeSession(storedID:profile:) async throws -> RuntimeSession; submit(text:sessionID:), interrupt(sessionID:); request(_:params:timeout:); RuntimeSession.runtimeID/storedID/messages.

- [x] Fissare sorgente upstream e documentare contratto, auth gate e gateway.ready.
- [x] Implementare client actor; token solo memoria, timeout, nessun prompt su connessione.
- [ ] Verificare con fixture discovery stale, endpoint remoto vietato, RPC error, timeout/disconnect e eventi correlati alla sessione.
- [ ] Eseguire handshake locale limitato senza leggere transcript né creare sessioni; registrare solo esito non sensibile.
- [ ] Revisione indipendente e ADR; commit dopo gate integrato.

## Task 2 — direzione artistica e file tree (art_direction + verificatore)

Files: Sources/HermesDesktop/{DesignTheme,TeamWorkspaceView,ResearchFilesView}.swift; Sources/HermesCore/ResearchFiles.swift; docs/design/art-direction.md; docs/project/file-workspace.md.

Interfaces: TeamWorkspaceView(store:openConversation:) invariata; ResearchFilesView() tab standalone con selezione cartella nativa. Modulo file limita accesso alla radice scelta; i tipi esatti sono documentati dal responsabile prima dell'integrazione.

- [x] Implementare studio editoriale nativo e avatar originale, senza animazione di attività falsa.
- [ ] Cartella scelta con NSOpenPanel, navigazione file bounded, apertura testo/Markdown e salvataggio atomico.
- [ ] Prova su cartella temporanea: UTF8 roundtrip, symlink fuori radice rifiutato, contenuto esterno cambiato preservato; nessuna scansione automatica di home.
- [ ] Documentare formati/limiti e integrare tab File in ToolsPanel (root).
- [ ] Smoke UI tema chiaro/scuro, finestra stretta, tastiera, Reduce Motion/Transparency e labels.

## Task 3 — chat reale e persistenza (root)

Files: Sources/HermesDesktop/{RuntimeConnection,WorkspaceStore,ConversationView,SettingsView,ShellView}.swift; Sources/HermesCore/Workspace.swift; Verification/PersistenceChecks.swift.

Interfaces: RuntimeConnection @Observable @MainActor possiede client e task ricezione; stato disconnected/connecting/ready/failed, messaggi e sessione per UUID locale. Conversation salva storedSessionID opzionale e messaggi compatibili con archivio precedente. Non salvare token.

- [ ] Test archivio precedente e nuovo transcript; corruzione resta protetta.
- [ ] UI Collega con discovery e stato gateway verificato; errore/login richiesto esplicito.
- [ ] Invio esplicito crea/riprende sessione, conserva testo durante esito incerto; streaming delta e testo finale autoritativo.
- [ ] Interruzione esplicita; disconnessione non chiama interrupt; resume senza reinvio automatico.
- [ ] Prompt sintetico minimo per prova live in sessione dedicata, controllo risposta/errore e riapertura.
- [ ] Build: bash scripts/build-app.sh; persistenza: bash scripts/check-persistence.sh. Output exit0 necessario.

## Task 4 — approvazioni e attività autorevoli (root + runtime agent)

Files: RuntimeConnection.swift; nuova RuntimeApprovalView.swift; TeamWorkspaceView.swift in passaggio proprietà concordato; fixture runtime.

- [ ] Implementare request approval con ID originale, scelte dal contratto, rifiuto di metodo sconosciuto e request.cancel.
- [ ] Test annullamento/disconnessione/stale e risposta singola; abilitare server_requests soltanto dopo gate.
- [ ] Mostrare working/waiting/completed/error da eventi reali, distinguendo ack e terminale.
- [ ] Rendere la richiesta visibile nella chat e workspace senza nasconderla dietro Settings.

## Task 5 — revisione architettura, UX e skill (root + revisore)

Files: docs/architecture/review-2026-10-04.md; report HTML temporaneo; docs/project/skill-audit.md; docs/ux-extracts/unsloth/; spec/ticket.

- [x] Analisi iniziale e due candidati approfondimento, report creato.
- [ ] Aprire report e presentare scelta come richiesto da improve-codebase-architecture; non dichiarare refactoring concluso senza scelta e verifica.
- [ ] Completare estrazione UX entro accesso legittimo disponibile: inventario, stati, copy e screenshot; annotare cosa non è accessibile invece di inventarlo.
- [ ] Revisione Standards + Spec con code-review dopo lettura skill, prima di commit di consegna.
- [ ] Riparare problemi materiali, ripetere soltanto verifiche interessate e aggiornare audit.

## Task 6 — consegna incrementale e Git (root)

Files: README, docs/project/{STATUS,MEMORY,WORKLOG,native-shell,git-workflow}.md; artefatti screenshot di app con dati sintetici.

- [ ] Documentare comportamento disponibile e istruzioni esatte avvio/build/test.
- [ ] Controllare Git status/diff/index, credenziali e file privati; stage esplicito soltanto incremento verificato.
- [ ] Primo commit fondazioni/codebase; successivi commit per risultati autonomi, niente checkpoint rotto.
- [ ] Ricontrollare remote; push solo destinazione verificata. Remote assente è impedimento di pubblicazione, non di sviluppo.
- [ ] Segnare task done solo con prova e registrare limiti reali della build di sviluppo.

## Task 7 — progetti, delega e strumenti agenti (successivo al percorso integrato)

Files: ticket05/06, nuovi moduli da pianificare sul contratto osservato, matrice capacità.

- [ ] Verificare contratto progetti/lineage/delegati reale; formulare tipi e test prima del codice.
- [ ] Incarico persistente dentro progetto, risultati con provenienza, team senza duplicare responsabili.
- [ ] Eventi delega e interruzione child dalla sessione corretta; una ricerca produce documento tracciabile.
- [ ] Browser/computer use disponibili solo con provider/permessi reali e UI approvazioni funzionante. Nessun computer use automatico notturno su dati personali per semplice presenza del tool.
- [ ] Editor universale: estendere soltanto formati e azioni verificati, non promettere supporto indistinto.

## Task 8 — pianificazione e continuità (milestone con gate temporale)

Files: ticket07, docs/architecture/runtime-contract.md, ADR host/pianificazione, report di prova.

- [ ] Verificare scheduler e comportamento backend alla chiusura client, senza cambiare cron personali.
- [ ] Scegliere host disponibile in base a ciò che è realmente configurato; non inventare un deploy.
- [ ] Prova sintetica pianificata, riconnessione e risultato confermato dal runtime.
- [ ] Test 24 ore con evidenze e recupero errori. Una notte di codice non prova questo requisito.

## Regole operative della notte

Continuare i task pronti senza chiedere conferme già date. Se una scelta prodotto manca, usare richiesta asincrona e avanzare task indipendenti; approvazioni e dati necessari non si assumono dal silenzio. Ogni impedimento registra tre elementi: azione fallita, evidenza, alternativa utile. Nessun loop infinito di polling. Non chiudere il goal per stanchezza o perché il tempo è trascorso. Notificare soltanto risultato significativo, errore che richiede Luca o consegna.

## Self-review del piano

Copertura: D01–D09 nei task2–4/7; persistenza D02 nei task0/3/6; runtime D10 nei task1/3/4; gusto D11 nel task2/5; orchestrazione D12 nella squadra; Git D13 nel task6. Visione24/7 nel task8. Gap espliciti: prove live, scelta candidato architettura, remote e host; non cancellati dal piano. Le firme trasporto sono quelle già implementate. Test di ciascun failure mode sono assegnati sopra. Il piano integra il backlog iniziale, non lo dichiara esaurito.
