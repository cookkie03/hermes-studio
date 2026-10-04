# Hermes Studio — una feature per chat

2026-10-04. F00 completata; lavoro corrente di consolidamento documentale. Non implementare automaticamente le schede. La baseline esistente è parziale; `documentata` non significa `implementata` o `verificata`.

L'app resta una repository indipendente. Il codice MIT OpenDots già riusato conserva licenza e provenienza. Struttura visiva OpenDots; componenti e microinterazioni con riferimenti Unsloth/Codex. Motore e strumenti Hermes. Nessun secondo executor OpenDots per simulare capacità Hermes.

## Parità Hermes — D30

Capacità e memoria native rimangono nel runtime: Studio deve presentarle con origine/esito senza duplicarle o disabilitarle per semplificare la UI. [F18](F18-hermes-native-features-and-observability.md) tratta viewer memoria, notifiche post-turn e mappa di copertura; F15 resta memoria Markdown Space/legacy ed eventuale gestione selezionata. Catalogo aggiornato a **19 schede F00–F18**, una per chat.

## Catalogo

| ID | Scheda da scegliere | Dipendenze principali | Stato |
|---|---|---|---|
| F00 | [MVP e qualità della base](F00-mvp-foundation.md) | nessuna | completata; baseline verificata, limiti dichiarati |
| F01 | [Shell, sidebar e componenti](F01-workspace-shell.md) | F00 | documentata; UI esistente parziale |
| F02 | [Conversazioni](F02-conversations.md) | F00, F11 | documentata; bridge parziale |
| F03 | [Spaces su cartelle e documenti](F03-spaces-documents-memory.md) | F00, F01, F10 per folder | documentata; metadata legacy parziali, folder non implementati |
| F04 | [Bots e identità Dots](F04-bots-and-identities.md) | F00/F01 per avatar; F11 per bot runtime | documentata, da scegliere |
| F05 | [Delegazione e collaborazione tra Dots](F05-delegation-and-dot-collaboration.md) | F04, F02, F16 | documentata, da scegliere |
| F06 | [Routine](F06-routines.md) | F11, F16; F04 se destinatario Bot | priorità prodotto, da scegliere |
| F07 | [Plugin e capability](F07-plugins-and-capabilities.md) | F11, F16 | documentata, da scegliere |
| F08 | [Browser integrato](F08-browser.md) | F11, F16 | documentata; nessuno stream/takeover attuale |
| F09 | [Computer use](F09-computer-use.md) | F11, F16 | documentata, da scegliere |
| F10 | [File e artefatti](F10-files-and-artifacts.md) | F00 per file locali; F11/F16 per tool agente | documentata; UI futura |
| F11 | [Connessione al runtime](F11-runtime-connection.md) | F00 | attach locale parziale; altre modalità da scegliere |
| F12 | [Software GitHub e release DMG](F12-github-releases-dmg.md) | F00; versione selezionata delle altre feature | documentata; DMG locale di sviluppo esistente |
| F13 | [Vocali e conversazione vocale](F13-voice-and-calls.md) | F02/F11 per conversazione; F16 | documentata in-app; telefonate future |
| F14 | [Specialisti Codex](F14-codex-specialists.md) | F05, F16 | futura, solo documentazione |
| F15 | [Memoria Markdown Space e preferenze legacy](F15-memory.md) | F03/F10 per Space; F11/F16 per mutazioni runtime opzionali | documentata; memoria Studio legacy parziale |
| F16 | [Permessi e approvazioni](F16-permissions-and-approvals.md) | F11 | contratto parziale; fixture disponibili |
| F17 | [Terminale](F17-terminal.md) | F11, F16 | documentata; preview eventi parziale |
| F18 | [Capacità native Hermes e memoria visibile](F18-hermes-native-features-and-observability.md) | F11/F02 per note; F04/contratto read-only per viewer | documentata, non implementata |

L'ordine numerico identifica le schede, non impone l'ordine di sviluppo. Percorso consigliato: F00 (completata) → F01/F10/F03 per cartelle oppure F11/F02 per chat → F16 → una feature avanzata scelta dall'utente. F06 è importante ma non deve aggirare i prerequisiti su esecuzioni durevoli e autorizzazioni. F12 può distribuire il solo MVP, indicando onestamente le capacità incluse.

## Letture e skill

Ogni scheda include File e skill da leggere e usare e richiama il [workflow ask-matt comune](../agents/feature-workflow.md). Il [catalogo completo](../agents/skills-catalog.md) include tutte le skill trovate nel progetto e nelle radici globali, cache plugin e runtime Hermes; la sezione della feature seleziona quelle pertinenti. Leggere i SKILL.md prima dell’applicazione.

## Come aprire una chat dedicata

Copia il prompt finale della scheda scelta, o usa questo schema:

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill della scheda, leggendo i SKILL.md pertinenti. Lavora soltanto sulla feature Fxx descritta in docs/features/<file>.md. Prima leggi AGENTS.md, docs/project/MEMORY.md, STATUS.md, GLOSSARY.md, ADR0006 e docs/architecture/principles.md. Verifica dipendenze e stato reale: non assumere che documentata significhi implementata. Proponi un incremento verticale delimitato, poi implementa solo questa feature con prove sintetiche e gate della scheda. Preserva dati/configurazioni/credenziali personali. Non sviluppare altre feature, non cambiare layout generale, non creare repository derivate. Aggiorna scheda, MEMORY/STATUS/WORKLOG e fai review prima del commit. Push soltanto al remote confermato; release/pubblicazione solo se richieste in quella chat.

Una chat possiede una scheda e i suoi file; se emerge un cambiamento in un modulo condiviso, registra prima contratto e ownership. Evitare due chat che modificano contemporaneamente Chat.tsx, server.mjs o workspace.sqlite. Nessuna nuova chat è stata creata automaticamente.

## Stati e consegna

Usare `documentata → selezionata → in sviluppo → in verifica → completata`; `bloccata` richiede prerequisito preciso e lavoro indipendente esaurito. Una feature è completata solo quando i gate sono provati sull'app/runtimes pertinenti. Una fixture prova il contratto simulato; handshake non prova prompt, tools o lavoro quando il client è chiuso.

Norme: [principi](../architecture/principles.md), [review F00](../architecture/f00-review-2026-10-04.md), [audit storico](../architecture/feature-architecture-review.md), [componenti](../design/component-system.md), [fonte Hermes](../research/hermes-desktop-reference.md), [stato](../project/STATUS.md), [baseline storica](../project/desktop-acceptance.md). Idee future restano nell'indice ../future/README.md.
