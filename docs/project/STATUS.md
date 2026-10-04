# Hermes Studio — stato corrente

Consolidato 2026-10-04. **F0 completata; F1 incremento locale/SSH implementato e verificato; altre feature documentate o parziali.** Incremento selezionato D32/D33: attach locale/SSH e routing host; codice prodotto modificato. [Catalogo](../features/README.md), [piano](feature-development-plan.md), [decisioni](decisions.md).

## Baseline verificata

Electron/React, servizio Node embedded e bridge Hermes; codice SwiftUI storico preservato. Consegna F0 nel commit `7c7e2a5`: strict typecheck renderer/metadata senza --noCheck, npm test (18 fixture e 55 test), package:dir e smoke .app con dati sintetici; restart/failure storage/conflict/focus/900px/Reduced Motion verificati. Correzioni essenziali cold resume/offline/navigazione incluse. [Evidenze F0](../architecture/f00-review-2026-10-04.md).

Questi sono esiti precedentemente documentati, non test rieseguiti dal consolidamento. Template executor storico non distribuito resta incompatibile con alcune dipendenze; full upstream check non certificato. Il candidato Metadata è stato consolidato in F0; approfondimento del ciclo Conversazione non selezionato.

.app arm64 locale di sviluppo, firma ad hoc; DMG precedente non rigenerato con F0, nessuna release GitHub/firma Apple/notarizzazione. [Artefatti storici](../releases/development-artifacts.md). Node handshake Hermes 0.21.5 verificato senza sessione/prompt: non prova chat, streaming o strumenti.

## Requisiti specificati, ancora da implementare/provare

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
