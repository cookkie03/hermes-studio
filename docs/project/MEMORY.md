# Memoria operativa di Hermes Studio

Consolidata 2026-10-04. Leggere questo riepilogo e [STATUS](STATUS.md) all'inizio del lavoro. [Decisioni D01–D30](decisions.md) conserva le richieste; [WORKLOG](WORKLOG.md) la cronologia. [Indice documentazione](../README.md) distingue fonti attuali e storia.

## Direzione corrente

Assistente personale e progetti macOS. Layout OpenDots conforme allo screenshot utente; componenti e gerarchia Unsloth/Codex. Prodotto Electron/React con servizio Node embedded; SwiftUI precedente conservato come baseline storica. Runtime e strumenti Hermes, con memoria autoritativa nel profilo backend e capacità native presentate in Studio. Repository indipendente, licenza/provenienza del codice MIT conservate.

Sviluppo **una feature per chat**, solo sull'incremento selezionato dall'utente. Catalogo [F00–F18](../features/README.md); [piano](feature-development-plan.md). F00 completata e verificata: non riaprire il task globale o i piani notturni. L'attuale richiesta riguarda consolidamento documentale, senza codice prodotto. Automazione/goal storici sospesi secondo l'ultima evidenza registrata, non ricontrollati da questo consolidamento.

## Requisiti da preservare

- Spaces collegano cartelle reali: filesystem autoritativo, editor e conflitti condivisi F03/F10; collegare/scollegare preserva dati. [ADR0007](../adr/0007-folder-backed-spaces.md).
- Dots: avatar OpenDots selezionabili F04-A; binding Bot/profilo Hermes separato F04-B. Team/membership non concede accesso a file o memorie di altri profili.
- Browser F08: stessa pagina/profilo per utente e strumenti Hermes, persistenza e takeover; tool/controller/CDP richiedono prova prima della scelta tecnica.
- F18: memoria Hermes visibile, riepiloghi post-turn e copertura delle capacità native. F15: file memoria dello Space e preferenze legacy; nessun secondo archivio Hermes reiniettato. F07: skill/plugin e manutenzione autorizzata.
- F13: dettatura, messaggi vocali, TTS e vocal chat in-app; motori/provider Hermes. Telefonate e specialisti Codex restano [idee future](../future/README.md).
- F12: release GitHub con DMG/.app installabile; artefatti locali ad hoc esistenti non sono release notarizzate.

## Fonti e confini

Design: [opendots-target](../design/opendots-target.md) e [component-system](../design/component-system.md). Uno screenshot non prova animazioni/API. Norme: [principi](../architecture/principles.md) e [confini feature](../architecture/feature-boundaries.md). Fonti memoria e browser: [prospetto Hermes](../research/hermes-memory-system.md), [browser](../research/hermes-integrated-browser.md); codice pubblico studiato alla SHA e1e82d7, non test runtime live né promessa di versione attuale.

Dati e profili sintetici per le prove; runtime/credenziali/conversazioni/vault personali preservati. Capability e stati solo dopo esito reale. Nessun retry di prompt incerto; chiusura client/disconnessione/cancellazione distinte. Documenti e cataloghi di skill non concedono accessi o implementazioni automatiche.

## Continuità del lavoro

Prima della feature: [workflow ask-matt](../agents/feature-workflow.md), scheda selezionata e SKILL.md pertinenti. Aggiornare questo riepilogo se cambia direzione, STATUS per esiti/gate e WORKLOG per blocchi significativi; decisioni nuove nel registro, ADR per scelte tecniche costose. Evitare append di stati superati in questa memoria.

Git: origin confermato `git@github.com:cookkie03/hermes-studio.git`; [procedura](git-workflow.md). Commit/push di incrementi verificati autorizzati; release richiede la selezione F12. Ultimi esiti tecnici nel STATUS e nelle prove F00.

La memoria precedente è conservata integralmente in [snapshot storico](MEMORY.history-2026-10-04.md); non è una fonte di istruzioni correnti.
