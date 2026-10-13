# Memoria operativa di Hermes Studio

## Riparazione integrazioni native — 2026-10-12

Utente richiede correggere tutti i difetti della review e rendere il progetto funzionante. Scope selezionato: otto findings e relative integrazioni native, con runtime/profili personali preservati. [Piano](native-integration-repair-plan-2026-10-12.md). In corso: file F5/F6 16 test PASS, collaboration/computer 10 PASS, audio/API 5 PASS. Browser reale/Bots/header/progetti implementati, integrazione e acceptance in corso. Ulteriori simulazioni memory/matrix e schema routine/computer incluse. La review precedente resta evidenza storica, non esito post-fix.

## Review funzionale corrente — 2026-10-12

Richiesta esplicita di review dell'intero software. Prima verifica: build PASS, 83 test Node PASS, 99 metadata/UI PASS e 1 FAIL; smoke offline dell'artefatto precedente PASS. Evidenziati adapter browser/collaborazione simulati, takeover solo locale, collegamento progetto inventato e difetti file tree/symlink. [Report con prove e limiti](../architecture/current-functionality-review-2026-10-12.md). Esito: app avviabile e core verificato, prodotto non completo. Otto difetti documentati; nessun codice feature modificato. Nuova app separata, chat e approvals sintetiche PASS.

## Nota incremento routine Bot self-scheduled (2026-10-11)

- Implementata la superficie Studio/proxy dell'addendum senza aggiungere scheduler, executor o memory system: il runtime Hermes resta autoritativo.
- La creazione richiede un profilo proprietario concreto; ownership immutabile; mutazioni indirizzate al profilo restituito dal runtime.
- `bot-chat` è mostrato come destinazione machine-local per un turno separato e i target non configurati dall'host sono disabilitati.
- Verificati typecheck, 5 test UI F10, 10 test manager routine e `git diff --check`.
- E2E runtime ancora aperto: autorizzazione Bot, due run/risposta Bot Chat, isolamento Bot B, capability off, pause/cancel, offline/client chiuso, replay e delivery senza duplicati.

Figma workspace linked on 2026-10-05: [design references and workflow](../design/figma.md). File `GFLrf3A2t6afdV34U8Fh4f` belongs to this repository's frontend design work; no automatic GitHub sync or Code Connect mappings configured.

Consolidata 2026-10-11. Leggere questo riepilogo e [STATUS](STATUS.md) all'inizio del lavoro. [Decisioni D01–D38](decisions.md) conserva le richieste; [WORKLOG](WORKLOG.md) la cronologia. [Indice documentazione](../README.md) distingue fonti attuali e storia.

## Direzione corrente

Assistente personale e progetti macOS. Layout OpenDots conforme allo screenshot utente; componenti e gerarchia Unsloth/Codex. Prodotto Electron/React con servizio Node embedded; SwiftUI precedente conservato come baseline storica. Runtime e strumenti Hermes, con memoria autoritativa nel profilo backend e capacità native presentate in Studio. Repository indipendente, licenza/provenienza del codice MIT conservate.

Sviluppo **una feature per chat**, solo sull'incremento selezionato dall'utente. Catalogo [F0–F18](../features/README.md); [piano](feature-development-plan.md). F0 completata e verificata: non riaprire il task globale o i piani notturni. D31: schede rinumerate nell’ordine concordato, senza zero iniziale. [Vecchi/nuovi ID](../features/numbering-2026-10-04.md). F1 implementata e verificata; F2 selezionata con incremento invio/bozze verificato; la rinumerazione resta documentale. Automazione/goal storici sospesi secondo l'ultima evidenza registrata, non ricontrollati da questo consolidamento.

## F16 — Computer Use nativo tramite Studio

La prima slice F16-A/B usa solo eventi `computer_use` già emessi dal bridge Hermes: `ComputerManager` conserva ricevute cattura/azione per host e la GUI presenta target, profilo, app/finestra, modalità SOM/vision/AX, timestamp, approvazione/esito/errore, stale capture e summary quando il payload supera 64 KiB. `human_has_control` nega mutazioni e il pulsante di lease resta disabilitato senza stream Bot Screen dichiarato disponibile. Non è stato aggiunto un executor CUA/VNC/MCP alternativo; driver, display, permessi live, postcondizione reale e F16-C restano gate aperti.


- **Non duplicare Hermes.** Hermes è l'unico backend autorevole. Prima di aggiungere codice o una feature a Studio, verificare se Hermes la offre già e integrarvi la GUI tramite i contratti nativi. Studio implementa soltanto presentazione, connessione e adattamento necessari; non replica executor, scheduler, cron, heartbeat, bot, memoria, progetti, impostazioni o logiche di approvazione già presenti nel backend. Ogni nuova astrazione va motivata dal confine client/runtime e verificata contro il sorgente Hermes.
- Spaces collegano cartelle reali: filesystem autoritativo, editor e conflitti condivisi F6/F5; collegare/scollegare preserva dati. [ADR0007](../adr/0007-folder-backed-spaces.md).
- Dots: avatar OpenDots selezionabili F7-A; binding Bot/profilo Hermes separato F7-B. Team/membership non concede accesso a file o memorie di altri profili.
- Browser F12: stessa pagina/profilo per utente e strumenti Hermes, persistenza e takeover; tool/controller/CDP richiedono prova prima della scelta tecnica.
- F8: memoria Hermes visibile, riepiloghi post-turn e copertura delle capacità native. F9: file memoria dello Space e preferenze legacy; nessun secondo archivio Hermes reiniettato. F11: skill/plugin e manutenzione autorizzata.
- F17: dettatura, messaggi vocali, TTS e vocal chat in-app; motori/provider Hermes. Telefonate e specialisti Codex restano [idee future](../future/README.md).
- F14 increment: `desktop/hermes/collaboration.mjs` and routes expose a persisted Studio adapter for temporary subagent panels, Dot-to-Dot message receipts, hosted-room logs, scoped recall results, and explicit D38 profile-project links. The adapter is covered by synthetic tests; runtime-native delegation/message_agent/groups/session_search contracts still require connected-backend verification before claiming native execution.
- F13: release GitHub con DMG/.app installabile; artefatti locali ad hoc esistenti non sono release notarizzate.

## Fonti e confini

Design: [opendots-target](../design/opendots-target.md) e [component-system](../design/component-system.md). Uno screenshot non prova animazioni/API. Norme: [principi](../architecture/principles.md) e [confini feature](../architecture/feature-boundaries.md). Fonti memoria e browser: [prospetto Hermes](../research/hermes-memory-system.md), [browser](../research/hermes-integrated-browser.md); codice pubblico studiato alla SHA e1e82d7, non test runtime live né promessa di versione attuale.

Dati e profili sintetici per le prove; runtime/credenziali/conversazioni/vault personali preservati. Capability e stati solo dopo esito reale. Nessun retry di prompt incerto; chiusura client/disconnessione/cancellazione distinte. Documenti e cataloghi di skill non concedono accessi o implementazioni automatiche.

## Continuità del lavoro

Prima della feature: [workflow ask-matt](../agents/feature-workflow.md), scheda selezionata e SKILL.md pertinenti. Aggiornare questo riepilogo se cambia direzione, STATUS per esiti/gate e WORKLOG per blocchi significativi; decisioni nuove nel registro, ADR per scelte tecniche costose. Evitare append di stati superati in questa memoria.

Git: origin confermato `git@github.com:cookkie03/hermes-studio.git`; [procedura](git-workflow.md). Commit/push di incrementi verificati autorizzati; release richiede la selezione F13. Ultimi esiti tecnici nel STATUS e nelle prove F0.

La memoria precedente è conservata integralmente in [snapshot storico](MEMORY.history-2026-10-04.md); non è una fonte di istruzioni correnti.

F1 selezionata, Q8 confermata e intervista di prodotto conclusa: D32 conferma attach locale senza login Hermes, connessioni SSH in-app, riuso/avvio backend, chiavi Mac rilevate automaticamente e utente/password. Host riconnessi automaticamente; password solo in memoria fino a chiusura o disconnessione esplicita, senza Portachiavi/disco. Conversazioni assegnate al rispettivo host. D33 conferma backend Hermes completo/autonomo 24/7, mantenuto attivo dopo quit/disconnessione; Studio facilitatore e visualizzatore. Scheduler/heartbeat/bots native, continuità da verificare per host e feature. Space multi-cartella/multi-host richiesti; relazione ai progetti Hermes e accesso cross-host rimandati a F6/F5, con [promemoria e ricerca](../features/F6-spaces-documents-memory.md#progetti-hermes-e-space--promemoria-per-lo-sviluppo-f6). F1 codice implementato: registro connessioni, OpenSSH di sistema e GUI host. Suite PASS (35 test Node, 55 metadata), handshake e GUI live Mac Hermes 0.21.5 senza prompt/import/servizi modificati; backend sano dopo quit. SSH key/password/fingerprint e supervisione macOS provati con fixture. Minisforum/systemd live e durata 24h non provati; F2/F10 mantengono i gate di esecuzioni/routine. Prove in docs/architecture/f1-review-2026-10-04.md. F6 non implementata.

Computer Use nativo Hermes deve essere utilizzabile tramite Studio: F16-A catture/eventi, F16-B azione agente con postcondizione, F16-C Bot Screen/lease nativi previa verifica. [Audit](../research/hermes-computer-use-integration.md): sorgente confermato, integrazione Studio non provata; host/display del bot distinto dal Mac client.

D34: chat Studio con streaming/thinking emesso/tool/codice/output/changes/approvals/validation e controlli reali Hermes. Settings dedicati distinti Hermes (runtime host/profilo) e Hermes Studio (app). Requisiti conservati F2/F3/F4/F5/F8/F11/F15 e component-system; non allargano implementazione F1. Piano/spec tecnici F1 in docs/project.

Requisito GUI confermato: Space collegato ai progetti Hermes, host/modello/effort sempre riconoscibili; @ suggerimenti file Space e riferimenti a righe/testo, / cataloghi skill/tool Hermes. [Spec trasversale nelle feature](../features/gui-context-and-references.md). Studio solo frontend/adapter delle capacità native; niente nuovo backend o capacità agente simulata. F0/F1 non modificate da questa richiesta.

D35: tutte le schede F0–F18 sono ingressi operativi per chat implementatrici: risultato/backend/GUI/dipendenze/prove/consegna codice verificato inclusi nella scheda. Leggere i riferimenti nel workspace; implementare la singola feature, non fermarsi al piano salvo blocco reale. Stato F0 completata e F18 futura preservati; Hermes unico backend, requisiti trasversali distribuiti per ownership.

Chiarimento D35: Fxx sono lavoro frontend/adattamento in stile OpenDots, non nuove feature backend. Titoli esplicitano cron Hermes, Dot→Bot, Space→Project, approvazioni, browser/Computer Use e output terminale nativi; F2/F3/F4/F6/F7 restano owner di parti della stessa esperienza.

## Aggiornamento D36 — collaborazione visibile (2026-10-04)

Richiesta utente documentata in F2/F4/F7/F14, requisiti GUI condivisi e component-system: figli temporanei nel pannello laterale della chat padre; Dots persistenti nella sidebar e nella propria chat con messaggio ricevuto e lavoro reale. Segnale attività separato da non letto/consegna; queued non conferma Working. Space/host/modello/effort e @ file/range restano requisiti. Solo documentazione: nessun codice o runtime personale modificato; sviluppo F1 concorrente preservato.

## D37 — Bots dei runtime collegati (2026-10-04)

Correzione esplicita dell’utente: intendeva Bots, non Docs. Ogni runtime Hermes collegato porta in Studio il proprio roster autorizzato, presentato come Dots senza ricreazione manuale, con identità runtime/installazione/profilo e Bot Chat canonica preservate. Riconnessione senza duplicati, host/origine visibili, offline/stale distinti; nessun import globale di chat, clonazione o avvio implicito. Aggiornate F1/F7/F2/F4 e requisiti GUI; rimossa dalle F5/F6 la specifica Docs introdotta per errore nel commit 17f39a3. Requisiti documentali, non implementazione o prova live. Commit correttivo separato, storia preservata.

## 2026-10-04 — F2 selezionata: invio scoped e bozze

Scheda F2 allegata dall’utente come incarico. Incremento verticale corrente: proteggere preparazione/invio da doppio submit, cambio chat/host e risposta tardiva; mantenere bozze e stati Hermes distinti. Baseline Git ecdddfa. Letture ask-matt/implement/tdd/codebase-design e spec F2: test al seam pubblico del ciclo submission, bridge e GUI packaged con dati sintetici, come richiesto dalla scheda. Nessun runtime personale, roster F7, progetto F6 o executor alternativo coinvolto. Rischi trovati: invio dopo unmount durante beforeSend; ack RPC tardivo che regredisce Working o aggiorna un turno successivo. Implementazione e prove in corso; F2 completa non dichiarata.

## 2026-10-05 — F2 incremento invio/bozze verificato

Lock preparazione/dispatch per vista; close/scelta host invalida prima del PUT, esiti tardivi non modificano un nuovo owner. Ack requestId/clientSubmissionId non regredisce Working né aggiorna turni nuovi. Draft serializzati per thread e flush al cambio chat; bozza nuova/clear/restart su nuova origin PASS. Suite finale 36 Node + 61 metadata/display, strict typechecks/bootstrap/external-links e package arm64/firma ad hoc PASS. Smoke .app con REST/SSE/HTTP/WS sintetici PASS: double send, delta prima HTTP, tool tardivo, cambio chat durante invio, PageConversation close/host mentre preparazione sospesa e riferimento revisione salvata, IME/focus/900/1360/Reduced Motion. Review Standards/Spec finale 0 findings aperti; fase evento-before-render e barriera host test corrette. Matrice/skill/esiti/gap in [prove F2](../architecture/f2-submission-review-2026-10-04.md). Modello Hermes reale isolato, interrupt/resume GUI, contesto modello/effort/Space, Bots/approvals/collaborazione e restante F2 non certificati. Nessun prompt o dato del runtime personale utilizzato. Commit locale `32f361d` creato: 17 file selezionati, diff/index e scan credenziali PASS. Push non ritentato dopo rifiuto auto-review storico.

## 2026-10-05 — Callout nativi self-improvement e skill

Screenshot utente conferma avviso Self-improvement review con memoria pending e `/memory pending`; richiesta Studio estesa esplicitamente a skill create/aggiornate confermate. F8-A già specificata per review.summary; precisate F8/F2/F3 per persistenza scoped, pending≠applied, approvazione esplicita e skill solo su conferma runtime, senza confondere curator/background review. Handler/renderer desktop sorgente e1e82d782f riletti, nessuna prova live o codice Studio implementato.


## 2026-10-05 — Confronto scheda F2 e codice richiesto dall’utente

La modifica recente di F2 aggiunge 12 righe per Self-improvement review e precisa D30: nota persistente nella chat di origine, pending/applicato distinti, skill solo su conferma Hermes, istruzione `/memory pending` e gate replay/restart. Ispezione sorgente: bridge.mjs inoltra eventi scoped ma archivia solo tool.start/tool.complete; Chat.tsx non gestisce review.summary e ComputerPanel consuma solo tool. Mancano quindi rendering e archivio delle note, recupero nella chat non selezionata, deduplicazione/replay e prove dei nuovi casi; revisione GUI della proposta dipende dal percorso supportato F3/F8. Invio/bozze resta l’incremento consegnato, non tutta F2. Restano anche thinking, contesto effettivo e cataloghi/roster/collaborazione degli owner, troncamento e autoscroll condizionale; interrupt/reconnect completi e modello reale isolato non certificati. Nessun codice modificato né test runtime rieseguito per questo confronto; preservate le modifiche documentali preesistenti.

## D38 — Space comune e specialisti indipendenti (2026-10-05)

Visione utente confermata: Finance appare come unico Space Studio con associazioni esplicite ai progetti Hermes profile-scoped del PM/CTO; specialista selezionabile per Space/chat senza vincolo permanente. Collegamento mancante: proposta di progetto esistente o registrazione cartelle tramite API native e conferma esplicita. Nessuna copia file, merge memoria o configurazione nascosta; USER resta per profilo. Aggiornate F6/F7/F2/F14, GUI condivisa e ricerca; Bot Chat/cwd, accessi e multi-host restano gate runtime, non capacità implementate. Nessun codice modificato.


## 2026-10-05 — F2 aggiornamento codice selezionato

Utente richiede applicare le nuove differenze F2. Base b285629; diff aggiunge D38 oltre alle note review già analizzate. Incremento in corso: archivio/proiezione review.summary nella chat e contesto F2 veritiero da session.info, senza reiniezione memorie legacy condivise. F6 associazioni progetti e F7 Bot binding non presenti: nessun selettore simulato o cambio cwd/profilo implicito. Seam già richieste dalla scheda: bridge/history, REST autenticata e GUI packaged con fixture isolata. Ticket F2-native-notes-context; skill ask-matt, implement, codebase-design, tdd, react-best-practices, frontend-testing-debugging, documentation-and-adrs lette.


## 2026-10-05 — F2 note native e contesto D38 implementati

Bridge archivia review.summary scoped e recupera replay nativo quando annunciato; timeline mostra testo originale e provenienza, conserva note in altra chat/offline/restart, segnala replay parziale/non disponibile e failure di archivio. Nessuna inferenza applied/skill o RPC approve inventata. Contesto separa Space della pagina da profilo/modello/effort/progetto/cwd session.info; rimossa reiniezione memorie legacy condivise. F6 mapping progetti e F7 binding Bots restano non collegati e visibili come limite. Corretti race replay/turno e lock preparazione; scroll segue solo chi è in fondo. Suite finale 43 Node + 61 metadata/display PASS, package PASS, primo smoke finale PASS; clean EOF e screenshot 900px finale in corso. Review Standards/Spec finale 0 findings. Ricevuta docs/architecture/f2-native-notes-context-review-2026-10-05.md; runtime personale/modello reale non usati.


## 2026-10-05 — F2 verifica finale note/contesto PASS

Smoke packaged finale PASS, compreso EOF SSE pulito, scroll conservato con evento reale della fixture, note tardive/background senza riaccendere Working, dedupe replay, offline/reconnect e restart nuova origin. 900/1360px, focus-visible e Reduced Motion PASS; screenshot finale leggibile con Computer chiuso /private/tmp/hs-conversations-ui-BlFkZ0/reviews-900.png. Nessun pageerror; suite 43 Node + 61 metadata/display e package PASS. Ticket F2-native-notes-context done solo per incremento. Owner F6/F7/F3 e prove modello reale restano aperti; dettagli e matrice nella ricevuta f2-native-notes-context-review-2026-10-05.md. Nessun push/release.


## 2026-10-05 — Git F2 note/contesto

Commit verificato 7e6fad3: feat(f2): persist native review notes and expose chat context. Include solo codice/fixture F2, ticket incremento e nuova ricevuta; index vuoto dopo commit. Modifiche preesistenti alle schede/D38 e documenti di progetto preservate unstaged; nessun push o release.

## 2026-10-05 — Baseline F0–F2 e protezione F0–F3

L’utente conferma di aver realizzato il codice delle feature F0–F2. Registrazione della consegna dichiarata dall’utente, non nuova certificazione live di tutti i gate. Restano aperti: collegamenti Space/progetti D38 e selezione nativa dei Bots (F6/F7); approvazione delle proposte nella GUI; acceptance con modello live. L’utente conferma che tali limiti sono visibili nella UI. Non dichiarare questi percorsi completati dal solo codice F0–F2.

Vincolo permanente per richieste successive: non aggiornare schede, requisiti o codice delle feature F0–F3 senza richiesta esplicita di modificarle. Richieste generiche di documentazione/design o requisiti trasversali vanno registrate negli owner successivi o nei documenti di progetto, senza riaprire F0–F3. Se indispensabile una modifica a quei confini, segnalarla e attendere selezione esplicita. F3 protetta non significa F3 completata. Modifiche preesistenti alle schede preservate, non annullate da questo aggiornamento.

## 2026-10-05 — F3 selezionata: identità delle decisioni

Baseline 7e6fad3. Incremento F3: richiesta approval con decisionId locale non persistito, verificato insieme a thread/host/RPC prima dell’inoltro. Replay aperto conserva identità; reconnect la rinnova. Enum limitato al contratto Hermes once/session/always/deny. Red riprodotto sul seam bridge esistente, green 31 test bridge/connections; verifiche complete in corso. Sorgente Hermes e1e82d782f letto, nessun runtime/dato personale interrogato. Modifiche documentali precedenti preservate. Skill ask-matt/implement/codebase-design/tdd lette e applicate; axiom-design/frontend-design per card OpenDots; code-review letta per revisione finale.

## 2026-10-05 — F3 incremento decisioni verificato

decisionId effimero impedisce risposte stale dopo reconnect/cancel con RPC omonimo; REST verifica thread/host/identità, bridge enum nativo e lease valida. Card con lifecycle testuale, doppio invio/offline bloccati; sent è dispatch, non azione completata. Review Standards/Spec ha corretto dedupe terminale per RPC ID, poi smoke .app REST/SSE/WS sintetico PASS (Allow once/Deny, doppio click, timeout→nuova card omonima, keyboard/focus, 900/1360 e Reduced Motion, zero pageerror). Suite finale 45 Node + 61 metadata/display, typechecks/bootstrap/link e package arm64 ad hoc PASS. Nessun runtime/dato personale. Hermes reale isolato, VoiceOver completo/ritorno focus, storico grant, indicatore background completo e grants specifici/proposte memoria restano gate; F3 intera parziale. Ricevuta docs/architecture/f3-approval-review-2026-10-05.md. Nessun push/release.

## 2026-10-05 — F4–F18 English translation

User requested English translation of all feature cards F4 through F18 and a commit. Translated the full cards in place: implementation assignments, requirements, skill guidance, source evidence, acceptance gates and handoff prompts. Preserved filenames, link targets, technical inline identifiers and Markdown markers; retained F6’s old fragment as an explicit anchor for protected F2 references. Validation: 15 translated cards, 304 local link targets checked, one pre-existing unavailable external skill path in F18 preserved; F0–F3 byte-for-byte unchanged from task start. No application code or runtime behavior changed. Commit scope: these 15 cards and only this task’s project-log entries; other pending changes are preserved outside the commit.

## 2026-10-11 — Protected cards and voice/routine clarification

User prohibits edits to existing F0–F13 cards because another coding agent is implementing them; new supplements are allowed, F14–F18 editable within requested scope. Rule persisted in AGENTS. F17 clarifies reuse of Hermes realtime voice→session delegation, porting required upstream desktop client transport when necessary, without a parallel executor. New docs/features/addendum-bot-self-scheduled-routines-2026-10-11.md records Bots scheduling their own native cron jobs and receiving periodic results in their own Bot Chat; F10 unchanged. Specification only, no code/runtime changes or new live verification. Existing staged work from the other agent preserved; this task does not stage/commit it.

## 2026-10-11 — F13 macOS packaging, DMG release, and GitHub draft release

F13 implemented and verified:
- Reproducible macOS packaging pipeline with `desktop/scripts/release-manifest.cjs`, `desktop/package.json` (`release:manifest`, `package:release`, `verify:release`).
- Verified local DMG generation (`Hermes Studio-0.1.0-arm64.dmg`), SHA-256 hash `cb8332a704a38703e0136364ee5d10ba41f390deecba7bfbc508b00eb54d011b`, size 131,241,647 bytes, and `release-manifest.json`.
- Strict deep codesign verified on bundle and mounted read-only volume.
- Packaged smoke tests for UI, connections, approvals, and conversations passed without npm/devserver.
- Added GitHub Actions release workflow `.github/workflows/release.yml`, `CONTRIBUTING.md`, `README.md` user download focus, and `docs/releases/release-notes-v0.1.0.md`.



## 2026-10-13 — REA coding-agent setup planned

User requests REA installation for this Codex coding agent, with setup plan approval before apply. Live `npx rea-agents@latest setup --client codex --dry-run --json` resolved 6.4.0, status planned, no applied actions. Plan: personal Codex config `/Users/luca/.codex/config.toml` with backup, and bundled skill `/Users/luca/.agents/skills/reverse-engineer-anything`; user-wide scope explicitly disclosed. Approval pending; no product feature or Hermes runtime changes. [Plan](rea-setup-plan-2026-10-13.md).


## 2026-10-13 — Riparazioni dei contratti nativi in corso

Browser demo sostituito da WebContentsView isolata e callback native preview.read/preview.act; niente successi DOM simulati. Collaborazione usa sessione/profilo owner, subagent RPC reali, relay senza delivery ID inventato, gruppi verificati sulla stessa installazione, log/cursori nativi e recall della sola conversazione. Bots nativi scoperti da profiles.list e associati a Bot Chat canonica, con controllo installazione/generazione e apertura concorrente serializzata. Progetti selezionati da catalogo reale e applicati con session.cwd.set. Audio inoltrato a HTTP Hermes del profilo; controlli dettatura/lettura/live aggiunti, trasporto live adattato dal sorgente MIT Hermes a50406d9 (licenza inclusa), richieste di lavoro nella stessa sessione chat. File: root listing e scritture con parent symlink fuori root corrette. Memoria/capability/header mostrano dati osservati o indisponibilità esplicita. Computer: ricevute native, errori/multimodale normalizzati, scope per chat e identità azione conservata; takeover non supportato respinto. Routine: nessun successo/consegna dedotto dalla destinazione, timestamp secondi corretti e scope cronologia.

Build e 100 test metadata passavano prima degli ultimi incrementi; build aggiornata PASS. Prima suite completa fuori sandbox: 90/91 Node PASS, unico difetto rimasto nell'aspettativa del test API (404 nativo owner invalido rispetto a 400), corretto. Nessuna interrogazione del runtime/dati personali, nessuna chiamata a provider. Verifiche complete, review finale e smoke packaged/native isolato ancora da eseguire; non dichiarata la copertura live di modello/voce/gruppi remoti. Modifiche preesistenti preservate, nessun commit/push.


## 2026-10-13 — Chiusura delle correzioni della review

Utente richiede conclusione rapida e commit/push delle modifiche, conservando libertà per una futura direzione basata su reference esterne. Riparazioni degli adapter e dei difetti residui verificate: 95 Node + 110 renderer/metadata PASS, typecheck/build PASS; smoke packaged UI/chat/browser PASS. Ultimi casi: replay browser freddo prima delle richieste accodate, await digitazione, relay audio con client-direct disabilitato, letture file tardive, salvataggio owner/revisione e bozza più recente conservata, conflitto su file cancellato.

Acceptance nativa isolata precedentemente PASS (a50406d9) senza inference; ultima ripetizione non completata perché il bootstrap della home temporanea preparava dipendenze Python ed è scaduta la readiness. Nessun fallback al runtime personale. Modello/provider vocali/gruppi reali e release notarizzata restano gate esterni. La review riparata non certifica tutte le schede feature. Ricevuta: [native-integration-repair-verification-2026-10-13.md](../architecture/native-integration-repair-verification-2026-10-13.md).
