# Hermes Studio — una integrazione frontend per chat

2026-10-04. F0 completata; F1 selezionata, scelte di prodotto confermate e spec/piano tecnico proposti. Non implementare automaticamente le schede. La baseline esistente è parziale; `documentata` non significa `implementata` o `verificata`.

Le Fxx sono **moduli di lavoro sulla GUI e sui collegamenti Studio**, non un catalogo di nuove feature da creare in Hermes. Cron/routine, Bots, progetti, memoria, approvazioni, skill/tool, terminale e Computer Use restano native del backend. Studio ne adatta presentazione e interazioni in stile OpenDots. Connessioni/multi-host, design client e packaging hanno responsabilità frontend esplicite e non creano un runtime concorrente.

L'app resta una repository indipendente. Il codice MIT OpenDots già riusato conserva licenza e provenienza. Struttura visiva OpenDots; componenti e microinterazioni con riferimenti Unsloth/Codex. Motore e strumenti Hermes. Nessun secondo executor OpenDots per simulare capacità Hermes.

## Parità Hermes — D30

Capacità e memoria native rimangono nel runtime: Studio deve presentarle con origine/esito senza duplicarle o disabilitarle per semplificare la UI. [F8](F8-hermes-native-features-and-observability.md) tratta viewer memoria, notifiche post-turn e mappa di copertura; F9 resta memoria Markdown Space/legacy ed eventuale gestione selezionata. Catalogo aggiornato a **19 schede F0–F18**, una per chat.

## Catalogo

| ID | Scheda da scegliere | Dipendenze principali | Stato |
|---|---|---|---|
| F0 | [Baseline MVP e manutenzione](F0-mvp-foundation.md) | nessuna | completata; baseline verificata, limiti dichiarati |
| F1 | [Connessioni e host del runtime Hermes](F1-runtime-connection.md) | F0 | selezionata D32/D33; locale/SSH e autonomia, spec/piano proposti |
| F2 | [Chat e presentazione degli eventi Hermes](F2-conversations.md) | F0, F1 | documentata; bridge parziale |
| F3 | [GUI delle approvazioni e dei permessi Hermes](F3-permissions-and-approvals.md) | F1 | contratto parziale; fixture disponibili |
| F4 | [Shell, navigazione e componenti di Hermes Studio](F4-workspace-shell.md) | F0 | documentata; UI esistente parziale |
| F5 | [File, riferimenti e artefatti nel workspace Hermes](F5-files-and-artifacts.md) | F0 per file locali; F1/F3 per tool agente | documentata; UI futura |
| F6 | [Spaces collegati ai progetti e alle cartelle Hermes](F6-spaces-documents-memory.md) | F0, F4, F5 per folder | documentata; metadata legacy parziali, folder non implementati |
| F7 | [Dots collegati ai Bots Hermes e avatar](F7-bots-and-identities.md) | F0/F4 per avatar; F1 per bot runtime | documentata, da scegliere |
| F8 | [Visibilità delle capacità e della memoria Hermes](F8-hermes-native-features-and-observability.md) | F1/F2 per note; F7/contratto read-only per viewer | documentata, non implementata |
| F9 | [Memoria Markdown degli Spaces e integrazione memoria](F9-memory.md) | F6/F5 per Space; F1/F3 per mutazioni runtime opzionali | documentata; memoria Studio legacy parziale |
| F10 | [GUI delle routine e del cron Hermes](F10-routines.md) | F1, F3; F7 se destinatario Bot | priorità prodotto, da scegliere |
| F11 | [GUI di plugin, skill e capabilities Hermes](F11-plugins-and-capabilities.md) | F1, F3 | documentata, da scegliere |
| F12 | [Browser integrato con i tool Hermes](F12-browser.md) | F1, F3 | documentata; nessuno stream/takeover attuale |
| F13 | [Packaging macOS e release GitHub DMG](F13-github-releases-dmg.md) | F0; versione selezionata delle altre feature | documentata; DMG locale di sviluppo esistente |
| F14 | [GUI della delegazione e collaborazione tra Bots Hermes](F14-delegation-and-dot-collaboration.md) | F7, F2, F3 | documentata, da scegliere |
| F15 | [Vista degli output e del terminale Hermes](F15-terminal.md) | F1, F3 | documentata; preview eventi parziale |
| F16 | [GUI del Computer Use e del Bot Screen Hermes](F16-computer-use.md) | F1, F3 | documentata; A catture, B tool agente, C Bot Screen |
| F17 | [GUI della voce e delle conversazioni vocali Hermes](F17-voice-and-calls.md) | F2/F1 per conversazione; F3 | documentata in-app; telefonate future |
| F18 | [Specialisti Codex tramite integrazione Hermes — futura](F18-codex-specialists.md) | F14, F3 | futura, solo documentazione |

Gli ID seguono l'ordine di sviluppo concordato il 2026-10-04; ogni incremento richiede comunque una selezione esplicita. Percorso concordato: F0 completata → F1 connessione → F2 conversazioni → F3 approvazioni → F4 shell → F5 file → F6 Spaces, poi le schede successive. [Vecchi e nuovi ID](numbering-2026-10-04.md). F10 è importante ma non deve aggirare i prerequisiti su esecuzioni durevoli e autorizzazioni. F13 può distribuire il solo MVP, indicando onestamente le capacità incluse.

## Perché le schede sono separate

F2 possiede transcript/turni; F3 decisioni approval; F4 shell/header/popover; F6 mapping Space→progetto; F7 mapping Dot→Bot. Sono parti della stessa esperienza, separabili per contratti e prove, non schermate o servizi backend duplicati. F10 collega cron/routine esistenti; F11 presenta cataloghi/gestione plugin e skill; F14 presenta collaborazioni native tra bot. F15 è vista output/terminale Hermes, inizialmente output-only se manca un contratto interattivo verificato.

La GUI mostra sempre Space, host, modello ed effort effettivi dove esiste un contesto chat/bot; i cataloghi @ e /, output, thinking emesso, approval e note native si coordinano tramite owner condivisi. Uno Space multi-host non inventa un progetto distribuito backend: limiti e mapping Hermes vengono mostrati e verificati.

## Requisiti trasversali della GUI

[Contesto sempre visibile, Spaces/progetti Hermes, @ file/righe e / skill/tool](gui-context-and-references.md). Studio rimane frontend Hermes: nomi/UI diversi, stesso backend e capacità reali. Computer Use nativo documentato in F16 e relativo audit; nessuna implementazione aggiunta da queste richieste.

## Letture e skill

Ogni scheda include **Incarico per la chat implementatrice** con risultato, contratto/backend, requisiti GUI, dipendenze, prove specifiche e consegna del codice verificato. Allegare la scheda come incarico nella chat dedicata: la chat legge i file linkati e implementa il solo incremento pertinente; non basta produrre un piano. F0 manutenzione e F18 futura conservano le rispettive eccezioni.

Ogni scheda include File e skill da leggere e usare e richiama il [workflow ask-matt comune](../agents/feature-workflow.md). Il [catalogo completo](../agents/skills-catalog.md) include tutte le skill trovate nel progetto e nelle radici globali, cache plugin e runtime Hermes; la sezione della feature seleziona quelle pertinenti. Leggere i SKILL.md prima dell’applicazione.

## Come aprire una chat dedicata

Copia il prompt finale della scheda scelta, o usa questo schema:

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill della scheda, leggendo i SKILL.md pertinenti. Lavora soltanto sulla feature Fxx descritta in docs/features/<file>.md. Prima leggi AGENTS.md, docs/project/MEMORY.md, STATUS.md, GLOSSARY.md, ADR0006 e docs/architecture/principles.md. Verifica dipendenze e stato reale: non assumere che documentata significhi implementata. Proponi un incremento verticale delimitato, poi implementa solo questa feature con prove sintetiche e gate della scheda. Preserva dati/configurazioni/credenziali personali. Non sviluppare altre feature, non cambiare layout generale, non creare repository derivate. Aggiorna scheda, MEMORY/STATUS/WORKLOG e fai review prima del commit. Push soltanto al remote confermato; release/pubblicazione solo se richieste in quella chat.

Una chat possiede una scheda e i suoi file; se emerge un cambiamento in un modulo condiviso, registra prima contratto e ownership. Evitare due chat che modificano contemporaneamente Chat.tsx, server.mjs o workspace.sqlite. Nessuna nuova chat è stata creata automaticamente.

## Stati e consegna

Usare `documentata → selezionata → in sviluppo → in verifica → completata`; `bloccata` richiede prerequisito preciso e lavoro indipendente esaurito. Una feature è completata solo quando i gate sono provati sull'app/runtimes pertinenti. Una fixture prova il contratto simulato; handshake non prova prompt, tools o lavoro quando il client è chiuso.

Norme: [principi](../architecture/principles.md), [review F0](../architecture/f00-review-2026-10-04.md), [audit storico](../architecture/feature-architecture-review.md), [componenti](../design/component-system.md), [fonte Hermes](../research/hermes-desktop-reference.md), [stato](../project/STATUS.md), [baseline storica](../project/desktop-acceptance.md). Idee future restano nell'indice ../future/README.md.

## F1 corrente e D34

F1: [spec tecnica](../project/F1-connection-design.md), [piano](../project/F1-implementation-plan.md), ADR0008 proposed. D34 preserva chat Hermes completa (F2/F3/F5/F15/F8) e Settings Hermes/Studio distinti (F4/F8/F11); documentazione per le feature proprietarie, nessuna loro implementazione aggiunta a F1.
