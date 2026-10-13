## Riparazione integrazioni native — 2026-10-12

Utente richiede correggere tutti i difetti della review e rendere il progetto funzionante. Scope selezionato: otto findings e relative integrazioni native, con runtime/profili personali preservati. [Piano](native-integration-repair-plan-2026-10-12.md). In corso: file 16 PASS, collaboration/computer 10 PASS, audio/API 5 PASS. Browser reale/Bots/header/progetti implementati ma non ancora certificati in .app; memory/matrix e ulteriori adapter schema native da correggere. Nessuna completezza dichiarata prima dell'acceptance.

## Review funzionale corrente — 2026-10-12

La precedente dicitura globale «implementati/verificati» non dimostra funzionalità Hermes complete: browser/collaborazione attuali producono stati locali simulati e diversi gate restano aperti. Build corrente PASS; suite 83 Node PASS + 99 metadata/UI PASS, 1 FAIL; smoke offline artefatto precedente PASS. [Review funzionale, difetti e prove](../architecture/current-functionality-review-2026-10-12.md). Nuova .app separata, smoke offline/chat/approvals sintetici PASS; otto difetti riprodotti o verificati sul sorgente. Nessuna modifica alle feature protette o al runtime personale.

## Stato routine Bot self-scheduled (2026-10-11)

- La specifica addendum è stata implementata nella superficie Studio/proxy, mantenendo scheduler, esecuzione, routing profilo e Bot Chat nel runtime Hermes.
- La creazione richiede un profilo concreto; le routine esistenti restano legate al profilo restituito dal runtime e non possono essere spostate tramite update.
- `bot-chat` viene mostrato come destinazione locale per turno separato; target non configurati non sono selezionabili.
- Copertura verificata: typecheck renderer/metadata, suite UI F10 (5 test), suite manager routines (10 test), diff check.
- Rimane da verificare con runtime collegato: autorizzazione reale del Bot, due run e risposta Bot Chat, isolamento Bot B, capability disabilitata, pause/cancel, host offline/client chiuso, replay e duplicate-free delivery.


Consolidato 2026-10-11. **F0–F3 completate/verificate per incremento; F4 shell, F5 file workspace, F6 folder-backed spaces, F8 Capability/Memory visibility, F9 Space Markdown Memory, F10 Hermes routines GUI, F11 catalogo read-only di toolset/tool/plugin/skill e F12 browser integrato con lease takeover e persistenza implementati e verificati.** [Catalogo](../features/README.md), [piano](feature-development-plan.md), [decisioni](decisions.md).

## Baseline verificata

Electron/React, servizio Node embedded e bridge Hermes; codice SwiftUI storico preservato. Consegna F0 nel commit `7c7e2a5`: strict typecheck renderer/metadata senza --noCheck, npm test (18 fixture e 55 test), package:dir e smoke .app con dati sintetici; restart/failure storage/conflict/focus/900px/Reduced Motion verificati. Correzioni essenziali cold resume/offline/navigazione incluse. [Evidenze F0](../architecture/f00-review-2026-10-04.md).

Questi sono esiti precedentemente documentati, non test rieseguiti dal consolidamento. Template executor storico non distribuito resta incompatibile con alcune dipendenze; full upstream check non certificato. Il candidato Metadata è stato consolidato in F0; approfondimento del ciclo Conversazione non selezionato.

.app arm64 locale di sviluppo, firma ad hoc; DMG precedente non rigenerato con F0, nessuna release GitHub/firma Apple/notarizzazione. [Artefatti storici](../releases/development-artifacts.md). Node handshake Hermes 0.21.5 verificato senza sessione/prompt: non prova chat, streaming o strumenti.

## Incremento F14 — adapter GUI/connection (2026-10-11)

Implemented and verified the first F14 vertical slice: temporary subagent side panel (spawn/list/tail/steer/interrupt), persistent Dot-to-Dot messages with explicit queued handoff and asynchronous reply/failure states, hosted-room sequence logs, scoped recall result links, and explicit D38 Space/profile project-link state. This is a persisted Studio adapter with synthetic data; it does not claim that the local adapter is the Hermes runtime's native `delegate_task`, `message_agent`, `groups.*`, or `session_search` implementation.

Evidence: `node --test hermes/collaboration.test.mjs hermes/collaboration-server.test.mjs` (6 passed), `npm run typecheck` (passed), `npm run build` (passed). Native connected-backend handshakes, packaged `.app` smoke, real two-profile delivery, and keyboard/IME/900/1360 accessibility checks remain pending.

## Incremento F15 — output terminale tool-only (2026-10-11)

Implementata e verificata la prima slice F15: Chat presenta gli eventi Hermes `tool.start`/`tool.complete` dei tool terminal/exec/shell come output terminale con stato, stdout, stderr, exit code e cwd osservato. Nessun executor parallelo, PTY, stdin, resize o nuova API backend è stato aggiunto; la sessione interattiva resta non supportata. Test mirati, `npm test` e `npm run build` superati; smoke `.app`, runtime Hermes live e gate PTY/backpressure/disconnect/resize/interruption restano aperti.

## Incremento F16-A/B — Computer Use nativo tramite Studio (2026-10-11)

Implementata la prima connessione frontend/adattatore per Computer Use Hermes. `ComputerManager` riceve gli eventi runtime nativi `computer_use`, conserva ricevute di cattura/azione per host, espone target/profilo/app/finestra/modalità e rende espliciti `working`, approvazione, esito, errore, payload archiviato come summary oltre 64 KiB e catture stale. La superficie `ComputerPanel` mostra provenienza, catture SOM/vision/AX, timestamp, esiti e stato `human_has_control`; il cambio lease è disabilitato se lo stream Bot Screen non è dichiarato disponibile.

Verifiche: `node --test hermes/computer.test.mjs` (4 passati), `npx vitest run --root upstream tests/f16-computer.test.tsx` (1 passato), `npm run typecheck:renderer`, `node --check hermes/server.mjs`, `node --check hermes/computer.mjs`, `npm run build` superati. `npm run test:metadata` eseguito: 20 file/98 test passati, 1 test F6 preesistente fallito per mismatch di testo dell'empty state. Non eseguiti: runtime Hermes/driver/display/permessi live, capture→azione approvata→postcondizione reale, screenshot/accessibility/IME packaged, F16-C Bot Screen stream/takeover nativo; non viene dichiarato un executor o un takeover reale.


19 schede F0–F18 con skill, ingressi, incrementi, ownership, gate e handoff. In particolare: folder-backed Spaces F6/F5, picker avatar F7-A, browser condiviso F12, voce in-app F17, memoria Markdown Space F9 e viewer/riepiloghi Hermes F8. Metadata del MVP non dimostrano questi nuovi comportamenti.

Design OpenDots autorevole; componenti Unsloth/Codex. Unsloth disclosure osservata; Codex solo screenshot per diniego del tool. Token/motion proposti, non misurati. Screenshot personali esclusi da Git.

## Gate aperti

| Gate | Responsabile | Evidenza ancora necessaria |
|---|---|---|
| Chat isolata reale, streaming, interrupt/resume | F2/F1 | Percorso runtime completo, distinto dal handshake |
| File/cartelle e review save dalla chat | F6/F5 | File autoritativo, grant, conflitti e ricevuta E2E |
| Layout finale, focus/VoiceOver e motion | F4 | Confronto packaged finale e accessibilità completa |
| Bot/collaborazione/routine/plugin/strumenti/voce | Scheda specifica | Capability, ownership ed esito reale; UI attuale non basta |
| Memoria runtime visibile e note dopo risposta | F8 | Contratto read-only, scoped events, persistenza/replay |
| DMG/release/installazione pulita | F13 | Firma/limiti, checksum e installazione della versione selezionata |
| Continuità runtime con client chiuso | Feature/host selezionati | Prova effettiva; nessuna durata di 24h verificata |

## Continuità e pubblicazione documentale

D20/ADR0006 governano il lavoro. Automazione Hermes e goal notturno sospesi secondo ultime verifiche nel WORKLOG; non riattivati né ricontrollati qui. Repo indipendente, origin confermato. Commit documentali precedenti pubblicati: `4726b38` (D25–D29) e `ecf5f64` (F8/D30). Consolidamento documentale verificato: 19 schede, decisioni D01–D30, collegamenti locali e snapshot storici integri; codice invariato. Commit/push tracciati in Git.

Memoria operativa in [MEMORY](MEMORY.md), cronologia in [WORKLOG](WORKLOG.md). Stato precedente integrale in [snapshot storico](STATUS.history-2026-10-04.md). Per il prossimo lavoro l'utente sceglie scheda e incremento: il numero della feature non impone priorità.

## Rinumerazione D31

Schede e riferimenti attivi passano agli ID F0–F18 senza padding, secondo la sequenza approvata. Catalogo ordinato numericamente e tabella vecchi/nuovi ID disponibile; documenti storici mantengono i numeri originali con avviso e link aggiornati. Verifica PASS: 19 schede con ID/titoli/dipendenze/handoff coerenti e 1.144 collegamenti locali validi. Contenuti delle schede equivalenti salvo numerazione; storia preservata salvo percorsi aggiornati. Nessun test prodotto rieseguito; commit/push tracciati in Git.

## F1 — scelte di prodotto confermate, spec/piano tecnico proposti

D32 confermata: attach locale senza login Hermes; connessioni SSH in-app, riuso o avvio backend; chiavi Mac rilevate e utente/password senza Portachiavi/disco; riconnessione automatica; password in memoria fino a quit/disconnessione esplicita; conversazioni per host. Q7/D33 confermata: backend Hermes completo/autonomo 24/7, resta attivo dopo quit/disconnessione; Studio facilitatore. Continuità sessioni/scheduler/bots da verificare separatamente, nessuna prova 24h corrente. [F6](../features/F6-spaces-documents-memory.md) conserva requisito multi-cartella/multi-host e decisioni future sul mapping progetti Hermes; ricerca sorgente fissata, nessuna prova live o implementazione nuova.

Connector loopback esistente: discovery, health/root/gateway.ready e capability server-request false per default. Fixture e handshake live limitato documentati in WORKLOG, non rieseguiti; non dimostrano chat/remoto.

## Verifica Computer Use — 2026-10-04

Computer Use presente nel sorgente Hermes e documentazione ufficiale; F16 esplicitata per utilizzo tramite Studio. Pannello attuale privo di catture Computer Use; replay media grandi limitato a fallback, stream/takeover non collegati. [Audit F16](../research/hermes-computer-use-integration.md). Nessun prompt/driver/cattura/permesso personale eseguito; codice invariato.

Q8 confermata; intervista conclusa. [Spec](F1-connection-design.md) e [piano F1](F1-implementation-plan.md) documentano contratti/gate; ADR0008 proposed, registrazione dei servizi mancanti da revieware prima del codice. D34 parità chat/settings registrata nelle schede owner. Nessun nuovo codice F1/F2/F4 o runtime personale modificato da questo blocco.

## Requisiti GUI documentati

Scheda trasversale nelle feature: contesto Space/progetto Hermes, host, modello/effort; @ file/range/testo e / skill/tool dal backend. Collegata a F4/F7/F6/F2, senza edit F0/F1 o implementation. Contratti sorgente progetti e commands.catalog letti; schema attachment/range/catalogo tool e prove UI/runtime ancora gate.

Commit documentale locale `83878f3` creato; push `origin/main` respinto dall'auto-review per autorizzazione esplicita della pubblicazione non riconosciuta. Nessun push riuscito. Spec/piano inizialmente proposti; il successivo incarico esplicito dell’utente ha avviato il codice; Q8 scelte di prodotto confermata. Nota aggiornata localmente dopo il commit.

## D35 — Schede operative aggiornate

Tutte le 19 schede F0–F18 includono incarico implementatrice con risultato, confine Hermes, GUI pertinente, letture/dipendenze, prove specifiche e consegna codice verificato. Handoff finali rafforzati; stati e fonti preservati, nessun codice implementato in questa revisione. Validazione PASS delle 19 sezioni operative/guidance/handoff e 500 collegamenti locali; titoli esplicitano integrazione frontend di capacità Hermes. Nessuna feature backend/client implementata in questa revisione.

## Aggiornamento D36 — collaborazione visibile (2026-10-04)

Richiesta utente documentata in F2/F4/F7/F14, requisiti GUI condivisi e component-system: figli temporanei nel pannello laterale della chat padre; Dots persistenti nella sidebar e nella propria chat con messaggio ricevuto e lavoro reale. Segnale attività separato da non letto/consegna; queued non conferma Working. Space/host/modello/effort e @ file/range restano requisiti. Solo documentazione: nessun codice o runtime personale modificato; sviluppo F1 concorrente preservato.

## 2026-10-04 — F1 implementazione connessioni in corso

Registro versionato host/thread, bridge separati, REST/SSE scoped e OpenSSH di sistema implementati. Credential/fingerprint challenge tramite socket Unix privato; password volatile, nessun secret nello snapshot. Bootstrap riusa discovery e comandi nativi Hermes gateway; service manager ospita esclusivamente hermes serve quando assente, senza executor/scheduler Studio. UI Settings aggiunge host SSH e controlli; chat seleziona host prima del binding, Computer segue thread. 17 test bridge/registry/server PASS, typecheck renderer PASS; ulteriori fixture/review/live attach ancora da completare. ssh2 1.17.0 installata soltanto devDependency per server sintetico. Il runtime personale non è ancora stato modificato o interrogato dalla nuova integrazione.

## 2026-10-04 — F1 review, suite e attach reale PASS

35 test Node e 55 metadata/display PASS, strict typechecks/bootstrap/link boundary PASS. Review parallela Standards/Spec completata: corretti races di binding/disconnect/storage e session snapshot stale, cleanup approvals e label Gateway; rilettura 0 findings aperti. OpenSSH key/password/fingerprint/changed key reale contro fixture PASS, LaunchAgent temporaneo restart/client-close PASS. Handshake diretto Hermes Mac 0.21.5 e GUI .app PASS, zero sessioni/prompt/import/servizi personali cambiati; backend sano dopo client/app close. UseKeychain=no/AddKeysToAgent=no imposti per nuove credenziali; ssh2 solo dev fixture. Package arm64 aggiornato/firma ad hoc PASS; smoke finale in corso. Prove/limiti: docs/architecture/f1-review-2026-10-04.md. Minisforum/systemd live e durata24h non provati; F2/F10 restano gate nativi separati.

## 2026-10-04 — F1 consegna verificata

Package finale arm64/firma ad hoc, smoke offline e smoke connessioni con attach Mac reale PASS; zero errori renderer. Verificati host per due chat, password/fingerprint UI, tastiera, 900/1360px, Reduced Motion, backend sano dopo quit. Suite finale 35 Node + 55 metadata PASS, review Standards/Spec 0 findings aperti. Ticket F1 done per incremento connector selezionato; Minisforum/Linux reale, 24h, turni F2 e routine F10 restano prove distinte non dichiarate. Ricevuta: docs/architecture/f1-review-2026-10-04.md. Commit codice locale 71a5d6a creato; nessun push ritentato dopo precedente rifiuto auto-review. Modifiche documentali D35/D36 concorrenti preservate.

## 2026-10-04 — Git F1

Commit codice locale `71a5d6a` creato: 37 file, solo incremento F1 e persistenza propria. Index controllato: diff-check, 69 link locali e scan pattern credenziali PASS. Modifiche concorrenti D35/D36 escluse dal commit e preservate nel workspace. Nessun push ritentato dopo il precedente rifiuto auto-review della pubblicazione esterna.

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
# 2026-10-05 — Figma project association

Figma canvas reference created and verified by returned node IDs and screenshot: frame `7:2`, clickable GitHub link. See [linked design workspace](../design/figma.md).

User provided the Hermes Studio Figma file and requested association with GitHub/frontend work. Plugin access verified: page `0:1` exists and was empty. Repository design links saved in `docs/design/figma.md` and root README. No frontend implementation, automatic synchronization, or component mappings configured.

## F7-A — Selectable OpenDots avatars implemented

- D26 compliant local avatar selection.
- Persisted via `avatarId` in SQLite and preserved across dialog reopen, reload, and restart.
- Graceful fallback using deterministic hashing for bots without an assigned avatar.
- Accessible radio group options for all 4 OpenDots avatars (`blue`, `mint`, `orange`, `purple`).

## 2026-10-11 — Protected cards and voice/routine clarification

User prohibits edits to existing F0–F13 cards because another coding agent is implementing them; new supplements are allowed, F14–F18 editable within requested scope. Rule persisted in AGENTS. F17 clarifies reuse of Hermes realtime voice→session delegation, porting required upstream desktop client transport when necessary, without a parallel executor. New docs/features/addendum-bot-self-scheduled-routines-2026-10-11.md records Bots scheduling their own native cron jobs and receiving periodic results in their own Bot Chat; F10 unchanged. Specification only, no code/runtime changes or new live verification. Existing staged work from the other agent preserved; this task does not stage/commit it.

## 2026-10-11 — F13 macOS packaging, DMG release, and GitHub draft release

F13 implemented and verified:
- Reproducible packaging pipeline established with `npm run package:release` (`package:dmg` + `release:manifest`) and full verification suite `npm run verify:release`.
- Packaged `.app` and DMG (`Hermes Studio-0.1.0-arm64.dmg`, 131,241,647 bytes) built with embedded Electron/Node runtime; no user-side Node/npm required.
- SHA-256 (`cb8332a704a38703e0136364ee5d10ba41f390deecba7bfbc508b00eb54d011b`) and `release-manifest.json` generated and verified.
- Strict deep codesign (`codesign --verify --deep --strict`) passed on `.app` and mounted DMG.
- Clean read-only disk image mount verified with `/Applications` drag symlink and `.app` integrity.
- Packaged UI smoke test (`test:packaged-ui`), host connections (`test:packaged-connections`), approvals (`test:packaged-approvals`), and conversations (`test:packaged-conversations`) passed with synthetic data; no live runtime/secrets in bundle.
- User-oriented `README.md`, developer `CONTRIBUTING.md`, release notes `docs/releases/release-notes-v0.1.0.md`, and GitHub Actions release workflow `.github/workflows/release.yml` created.



## 2026-10-13 — REA setup awaiting approval

REA 6.4.0 downloaded into temporary npm cache; Codex-only dry-run PASS, zero applied actions. Exact configuration/skill paths and user-wide scope in [setup plan](rea-setup-plan-2026-10-13.md). Installation, scoped doctor, MCP handshake and active-session tool availability remain unverified until approval/apply/reconnection. Optional native engines are not configured. Product acceptance status unchanged.


## 2026-10-13 — Riparazioni dei contratti nativi in corso

Browser demo sostituito da WebContentsView isolata e callback native preview.read/preview.act; niente successi DOM simulati. Collaborazione usa sessione/profilo owner, subagent RPC reali, relay senza delivery ID inventato, gruppi verificati sulla stessa installazione, log/cursori nativi e recall della sola conversazione. Bots nativi scoperti da profiles.list e associati a Bot Chat canonica, con controllo installazione/generazione e apertura concorrente serializzata. Progetti selezionati da catalogo reale e applicati con session.cwd.set. Audio inoltrato a HTTP Hermes del profilo; controlli dettatura/lettura/live aggiunti, trasporto live adattato dal sorgente MIT Hermes a50406d9 (licenza inclusa), richieste di lavoro nella stessa sessione chat. File: root listing e scritture con parent symlink fuori root corrette. Memoria/capability/header mostrano dati osservati o indisponibilità esplicita. Computer: ricevute native, errori/multimodale normalizzati, scope per chat e identità azione conservata; takeover non supportato respinto. Routine: nessun successo/consegna dedotto dalla destinazione, timestamp secondi corretti e scope cronologia.

Build e 100 test metadata passavano prima degli ultimi incrementi; build aggiornata PASS. Prima suite completa fuori sandbox: 90/91 Node PASS, unico difetto rimasto nell'aspettativa del test API (404 nativo owner invalido rispetto a 400), corretto. Nessuna interrogazione del runtime/dati personali, nessuna chiamata a provider. Verifiche complete, review finale e smoke packaged/native isolato ancora da eseguire; non dichiarata la copertura live di modello/voce/gruppi remoti. Modifiche preesistenti preservate, nessun commit/push.
