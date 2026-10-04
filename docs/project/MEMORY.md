# Memoria operativa di Hermes Studio

Consolidata 2026-10-04. Leggere questo riepilogo e [STATUS](STATUS.md) all'inizio del lavoro. [Decisioni D01–D35](decisions.md) conserva le richieste; [WORKLOG](WORKLOG.md) la cronologia. [Indice documentazione](../README.md) distingue fonti attuali e storia.

## Direzione corrente

Assistente personale e progetti macOS. Layout OpenDots conforme allo screenshot utente; componenti e gerarchia Unsloth/Codex. Prodotto Electron/React con servizio Node embedded; SwiftUI precedente conservato come baseline storica. Runtime e strumenti Hermes, con memoria autoritativa nel profilo backend e capacità native presentate in Studio. Repository indipendente, licenza/provenienza del codice MIT conservate.

Sviluppo **una feature per chat**, solo sull'incremento selezionato dall'utente. Catalogo [F0–F18](../features/README.md); [piano](feature-development-plan.md). F0 completata e verificata: non riaprire il task globale o i piani notturni. D31: schede rinumerate nell’ordine concordato, senza zero iniziale. [Vecchi/nuovi ID](../features/numbering-2026-10-04.md). F1 implementata e verificata; F2 selezionata con incremento invio/bozze verificato; la rinumerazione resta documentale. Automazione/goal storici sospesi secondo l'ultima evidenza registrata, non ricontrollati da questo consolidamento.

## Requisiti da preservare

- **Non duplicare Hermes.** Hermes è l'unico backend autorevole. Prima di aggiungere codice o una feature a Studio, verificare se Hermes la offre già e integrarvi la GUI tramite i contratti nativi. Studio implementa soltanto presentazione, connessione e adattamento necessari; non replica executor, scheduler, cron, heartbeat, bot, memoria, progetti, impostazioni o logiche di approvazione già presenti nel backend. Ogni nuova astrazione va motivata dal confine client/runtime e verificata contro il sorgente Hermes.
- Spaces collegano cartelle reali: filesystem autoritativo, editor e conflitti condivisi F6/F5; collegare/scollegare preserva dati. [ADR0007](../adr/0007-folder-backed-spaces.md).
- Dots: avatar OpenDots selezionabili F7-A; binding Bot/profilo Hermes separato F7-B. Team/membership non concede accesso a file o memorie di altri profili.
- Browser F12: stessa pagina/profilo per utente e strumenti Hermes, persistenza e takeover; tool/controller/CDP richiedono prova prima della scelta tecnica.
- F8: memoria Hermes visibile, riepiloghi post-turn e copertura delle capacità native. F9: file memoria dello Space e preferenze legacy; nessun secondo archivio Hermes reiniettato. F11: skill/plugin e manutenzione autorizzata.
- F17: dettatura, messaggi vocali, TTS e vocal chat in-app; motori/provider Hermes. Telefonate e specialisti Codex restano [idee future](../future/README.md).
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

## 2026-10-04 — F2 incremento invio/bozze verificato

Lock preparazione/dispatch per vista; close/scelta host invalida prima del PUT, esiti tardivi non modificano un nuovo owner. Ack requestId/clientSubmissionId non regredisce Working né aggiorna turni nuovi. Draft serializzati per thread e flush al cambio chat; bozza nuova/clear/restart su nuova origin PASS. Suite finale 36 Node + 61 metadata/display, strict typechecks/bootstrap/external-links e package arm64/firma ad hoc PASS. Smoke .app con REST/SSE/HTTP/WS sintetici PASS: double send, delta prima HTTP, tool tardivo, cambio chat durante invio, PageConversation close/host mentre preparazione sospesa e riferimento revisione salvata, IME/focus/900/1360/Reduced Motion. Review Standards/Spec finale 0 findings aperti; fase evento-before-render e barriera host test corrette. Matrice/skill/esiti/gap in [prove F2](../architecture/f2-submission-review-2026-10-04.md). Modello Hermes reale isolato, interrupt/resume GUI, contesto modello/effort/Space, Bots/approvals/collaborazione e restante F2 non certificati. Nessun prompt o dato del runtime personale utilizzato. Commit locale in preparazione; push non ritentato dopo rifiuto auto-review storico.
