# Memoria operativa di Hermes Studio

Consolidata 2026-10-04. Leggere questo riepilogo e [STATUS](STATUS.md) all'inizio del lavoro. [Decisioni D01–D34](decisions.md) conserva le richieste; [WORKLOG](WORKLOG.md) la cronologia. [Indice documentazione](../README.md) distingue fonti attuali e storia.

## Direzione corrente

Assistente personale e progetti macOS. Layout OpenDots conforme allo screenshot utente; componenti e gerarchia Unsloth/Codex. Prodotto Electron/React con servizio Node embedded; SwiftUI precedente conservato come baseline storica. Runtime e strumenti Hermes, con memoria autoritativa nel profilo backend e capacità native presentate in Studio. Repository indipendente, licenza/provenienza del codice MIT conservate.

Sviluppo **una feature per chat**, solo sull'incremento selezionato dall'utente. Catalogo [F0–F18](../features/README.md); [piano](feature-development-plan.md). F0 completata e verificata: non riaprire il task globale o i piani notturni. D31: schede rinumerate nell’ordine concordato, senza zero iniziale. [Vecchi/nuovi ID](../features/numbering-2026-10-04.md). Prossimo passo consigliato F1 connessione Hermes; nessuna implementazione avviata da questa rinumerazione. Automazione/goal storici sospesi secondo l'ultima evidenza registrata, non ricontrollati da questo consolidamento.

## Requisiti da preservare

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

F1 selezionata, Q8 confermata e intervista di prodotto conclusa: D32 conferma attach locale senza login Hermes, connessioni SSH in-app, riuso/avvio backend, chiavi Mac rilevate automaticamente e utente/password. Host riconnessi automaticamente; password solo in memoria fino a chiusura o disconnessione esplicita, senza Portachiavi/disco. Conversazioni assegnate al rispettivo host. D33 conferma backend Hermes completo/autonomo 24/7, mantenuto attivo dopo quit/disconnessione; Studio facilitatore e visualizzatore. Scheduler/heartbeat/bots native, continuità da verificare per host e feature. Space multi-cartella/multi-host richiesti; relazione ai progetti Hermes e accesso cross-host rimandati a F6/F5, con [promemoria e ricerca](../features/F6-spaces-documents-memory.md#progetti-hermes-e-space--promemoria-per-lo-sviluppo-f6). Nessuna implementazione F1/F6 nuova.

Computer Use nativo Hermes deve essere utilizzabile tramite Studio: F16-A catture/eventi, F16-B azione agente con postcondizione, F16-C Bot Screen/lease nativi previa verifica. [Audit](../research/hermes-computer-use-integration.md): sorgente confermato, integrazione Studio non provata; host/display del bot distinto dal Mac client.

D34: chat Studio con streaming/thinking emesso/tool/codice/output/changes/approvals/validation e controlli reali Hermes. Settings dedicati distinti Hermes (runtime host/profilo) e Hermes Studio (app). Requisiti conservati F2/F3/F4/F5/F8/F11/F15 e component-system; non allargano implementazione F1. Piano/spec tecnici F1 in docs/project.

Requisito GUI confermato: Space collegato ai progetti Hermes, host/modello/effort sempre riconoscibili; @ suggerimenti file Space e riferimenti a righe/testo, / cataloghi skill/tool Hermes. [Spec trasversale nelle feature](../features/gui-context-and-references.md). Studio solo frontend/adapter delle capacità native; niente nuovo backend o capacità agente simulata. F0/F1 non modificate da questa richiesta.
