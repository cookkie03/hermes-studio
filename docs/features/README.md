# Hermes Studio — una feature per chat

2026-10-04. F0 completata; lavoro corrente di consolidamento documentale. Non implementare automaticamente le schede. La baseline esistente è parziale; `documentata` non significa `implementata` o `verificata`.

L'app resta una repository indipendente. Il codice MIT OpenDots già riusato conserva licenza e provenienza. Struttura visiva OpenDots; componenti e microinterazioni con riferimenti Unsloth/Codex. Motore e strumenti Hermes. Nessun secondo executor OpenDots per simulare capacità Hermes.

## Parità Hermes — D30

Capacità e memoria native rimangono nel runtime: Studio deve presentarle con origine/esito senza duplicarle o disabilitarle per semplificare la UI. [F8](F8-hermes-native-features-and-observability.md) tratta viewer memoria, notifiche post-turn e mappa di copertura; F9 resta memoria Markdown Space/legacy ed eventuale gestione selezionata. Catalogo aggiornato a **19 schede F0–F18**, una per chat.

## Catalogo

| ID | Scheda da scegliere | Dipendenze principali | Stato |
|---|---|---|---|
| F0 | [MVP e qualità della base](F0-mvp-foundation.md) | nessuna | completata; baseline verificata, limiti dichiarati |
| F1 | [Connessione al runtime](F1-runtime-connection.md) | F0 | attach locale parziale; altre modalità da scegliere |
| F2 | [Conversazioni](F2-conversations.md) | F0, F1 | documentata; bridge parziale |
| F3 | [Permessi e approvazioni](F3-permissions-and-approvals.md) | F1 | contratto parziale; fixture disponibili |
| F4 | [Shell, sidebar e componenti](F4-workspace-shell.md) | F0 | documentata; UI esistente parziale |
| F5 | [File e artefatti](F5-files-and-artifacts.md) | F0 per file locali; F1/F3 per tool agente | documentata; UI futura |
| F6 | [Spaces su cartelle e documenti](F6-spaces-documents-memory.md) | F0, F4, F5 per folder | documentata; metadata legacy parziali, folder non implementati |
| F7 | [Bots e identità Dots](F7-bots-and-identities.md) | F0/F4 per avatar; F1 per bot runtime | documentata, da scegliere |
| F8 | [Capacità native Hermes e memoria visibile](F8-hermes-native-features-and-observability.md) | F1/F2 per note; F7/contratto read-only per viewer | documentata, non implementata |
| F9 | [Memoria Markdown Space e preferenze legacy](F9-memory.md) | F6/F5 per Space; F1/F3 per mutazioni runtime opzionali | documentata; memoria Studio legacy parziale |
| F10 | [Routine](F10-routines.md) | F1, F3; F7 se destinatario Bot | priorità prodotto, da scegliere |
| F11 | [Plugin e capability](F11-plugins-and-capabilities.md) | F1, F3 | documentata, da scegliere |
| F12 | [Browser integrato](F12-browser.md) | F1, F3 | documentata; nessuno stream/takeover attuale |
| F13 | [Software GitHub e release DMG](F13-github-releases-dmg.md) | F0; versione selezionata delle altre feature | documentata; DMG locale di sviluppo esistente |
| F14 | [Delegazione e collaborazione tra Dots](F14-delegation-and-dot-collaboration.md) | F7, F2, F3 | documentata, da scegliere |
| F15 | [Terminale](F15-terminal.md) | F1, F3 | documentata; preview eventi parziale |
| F16 | [Computer use](F16-computer-use.md) | F1, F3 | documentata, da scegliere |
| F17 | [Vocali e conversazione vocale](F17-voice-and-calls.md) | F2/F1 per conversazione; F3 | documentata in-app; telefonate future |
| F18 | [Specialisti Codex](F18-codex-specialists.md) | F14, F3 | futura, solo documentazione |

Gli ID seguono l'ordine di sviluppo concordato il 2026-10-04; ogni incremento richiede comunque una selezione esplicita. Percorso concordato: F0 completata → F1 connessione → F2 conversazioni → F3 approvazioni → F4 shell → F5 file → F6 Spaces, poi le schede successive. [Vecchi e nuovi ID](numbering-2026-10-04.md). F10 è importante ma non deve aggirare i prerequisiti su esecuzioni durevoli e autorizzazioni. F13 può distribuire il solo MVP, indicando onestamente le capacità incluse.

## Letture e skill

Ogni scheda include File e skill da leggere e usare e richiama il [workflow ask-matt comune](../agents/feature-workflow.md). Il [catalogo completo](../agents/skills-catalog.md) include tutte le skill trovate nel progetto e nelle radici globali, cache plugin e runtime Hermes; la sezione della feature seleziona quelle pertinenti. Leggere i SKILL.md prima dell’applicazione.

## Come aprire una chat dedicata

Copia il prompt finale della scheda scelta, o usa questo schema:

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill della scheda, leggendo i SKILL.md pertinenti. Lavora soltanto sulla feature Fxx descritta in docs/features/<file>.md. Prima leggi AGENTS.md, docs/project/MEMORY.md, STATUS.md, GLOSSARY.md, ADR0006 e docs/architecture/principles.md. Verifica dipendenze e stato reale: non assumere che documentata significhi implementata. Proponi un incremento verticale delimitato, poi implementa solo questa feature con prove sintetiche e gate della scheda. Preserva dati/configurazioni/credenziali personali. Non sviluppare altre feature, non cambiare layout generale, non creare repository derivate. Aggiorna scheda, MEMORY/STATUS/WORKLOG e fai review prima del commit. Push soltanto al remote confermato; release/pubblicazione solo se richieste in quella chat.

Una chat possiede una scheda e i suoi file; se emerge un cambiamento in un modulo condiviso, registra prima contratto e ownership. Evitare due chat che modificano contemporaneamente Chat.tsx, server.mjs o workspace.sqlite. Nessuna nuova chat è stata creata automaticamente.

## Stati e consegna

Usare `documentata → selezionata → in sviluppo → in verifica → completata`; `bloccata` richiede prerequisito preciso e lavoro indipendente esaurito. Una feature è completata solo quando i gate sono provati sull'app/runtimes pertinenti. Una fixture prova il contratto simulato; handshake non prova prompt, tools o lavoro quando il client è chiuso.

Norme: [principi](../architecture/principles.md), [review F0](../architecture/f00-review-2026-10-04.md), [audit storico](../architecture/feature-architecture-review.md), [componenti](../design/component-system.md), [fonte Hermes](../research/hermes-desktop-reference.md), [stato](../project/STATUS.md), [baseline storica](../project/desktop-acceptance.md). Idee future restano nell'indice ../future/README.md.
