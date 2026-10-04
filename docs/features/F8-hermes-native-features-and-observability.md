# F8 — Visibilità delle capacità e della memoria Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F8**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Esporre capacità, memoria e aggiornamenti nativi Hermes preservando autorità e ambiti del backend.

**Backend e confine:** review.summary e contratti read-only memory/capability alla versione verificata; memoria/procedure rimangono Hermes. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Note post-turn persistenti nella chat corretta; viewer scoped; coverage di Computer Use F16, browser F12, comandi/skill F11 e settings reali con gap espliciti. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** A note, B viewer, C mappa: selezionare uno; F2 timeline/F1 routing/F7 profile. Le funzioni native scoperte si assegnano agli owner, non si implementano tutte in F8. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Review dopo fine turno, pending contro applied, notifiche off, dedup/replay/restart, evento di altra sessione, profilo cambiato e API status senza contenuti. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: documentata D30, 2026-10-04; nuova scheda per chat dedicata, nessuna implementazione selezionata. L'utente vuole preservare tutte le funzioni del backend Hermes e poterle vedere/usare da Studio, come nel desktop ufficiale. La memoria rimane Hermes: qui si progetta la sua presentazione, non un nuovo motore o archivio di ricordi.

## Continuità autonoma richiesta in F1 — D33

Principio utente: Hermes lavora 24/7 indipendentemente da Studio aperto; Studio facilita e visualizza il backend Hermes completo. Routine/cron, heartbeat, bots, strumenti e memoria mantengono ownership native Hermes. Configurazione, stato host/servizio e risultati devono restare osservabili dopo riapertura, con esiti reali. Nessun timer/heartbeat/executor alternativo nel client e nessun arresto del backend alla chiusura. Il requisito non è ancora una verifica di durata o di esecuzione dopo riavvio; riprendere [F1/D33](F1-runtime-connection.md#principio-cardine--hermes-autonomo-studio-facilitatore-d33) e i gate specifici della scheda prima di implementare.

<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow ask-matt comune](../agents/feature-workflow.md), i [principi](../architecture/principles.md), [F1](F1-runtime-connection.md) e questa sola scheda. Il [catalogo skill progetto/globali](../agents/skills-catalog.md) contiene gli strumenti di sviluppo; non è il catalogo delle skill del profilo Hermes dell'utente.

| Skill | Applicazione |
|---|---|
| [ask-matt](../../.agents/skills/ask-matt/SKILL.md) | Selezionare il singolo incremento e le letture |
| [codebase-design](../../.agents/skills/codebase-design/SKILL.md) | Contratto di eventi/proiezione piccolo, invarianti di ownership e ripresa |
| [documentation-and-adrs](../../.agents/skills/documentation-and-adrs/SKILL.md) | Mappa capacità, versione, gap e prove |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | UI e aggiornamenti dopo fine turno |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Prova .app/renderer con dati sintetici |
| [research](../../.agents/skills/research/SKILL.md) — condizionale | Gap di contratto non risolvibile dai sorgenti fissati |
| [diagnosing-bugs](../../.agents/skills/diagnosing-bugs/SKILL.md) — condizionale | Perdita/duplicazione/associazione errata di eventi riproducibile |

Punti di ingresso Studio: [gateway.mjs](../../desktop/hermes/gateway.mjs), [bridge.mjs](../../desktop/hermes/bridge.mjs), [Chat.tsx](../../desktop/upstream/src/client/Chat.tsx), [App.tsx](../../desktop/upstream/src/client/App.tsx), [WorkspaceDialog.tsx](../../desktop/upstream/src/client/WorkspaceDialog.tsx), [workspace.ts](../../desktop/upstream/src/server/workspace.ts). Concordare ownership con F2/F11/F1/F9 prima del codice.

Punti di ingresso Hermes, solo sorgente pubblico: `tui_gateway/contracts/events.py`, `tui_gateway/server.py::_wire_session_agent`, `agent/background_review.py`, `apps/desktop/src/app/session/hooks/use-message-stream/gateway-event/status.ts`, `apps/desktop/src/components/assistant-ui/thread/system-message.tsx`, `apps/desktop/src/api/system.ts`, `apps/desktop/src/api/skills.ts`, `apps/desktop/src/types/hermes.ts`, `hermes_cli/web_routers/ops.py` e contratti `tools_mcp_plugins.py`. Fonti fissate e limiti sotto; non leggere home/database/skill personali per preparare la feature.
<!-- feature-guidance:end -->

## Regola di prodotto

Studio adatta le superfici OpenDots/Unsloth/Codex al runtime Hermes, preservandone strumenti, memoria, apprendimento, profili, scheduler e approvazioni. Non limita deliberatamente il runtime al sottoinsieme previsto dal template OpenDots. Una funzione backend supportata deve avere una destinazione UI o un gap esplicito nella mappa, non sparire silenziosamente.

Questo è obiettivo di parità **funzionale**, non promessa che tutte le capacità siano già implementate né obbligo di copiarne la UI. Progressive disclosure ammessa; assenza dal composer non deve diventare disabilitazione Hermes. Non alterare config/tools/memory/curator per semplificare la schermata. Nessuna importazione o duplicazione automatica della memoria in metadata Studio.

## Mappa iniziale di ownership, non inventario completo del runtime

| Capacità Hermes | Destinazione Studio | Scheda proprietaria |
|---|---|---|
| Sessioni, modello/effort, contesto, streaming, comandi, tool results, interruzione/ripresa | Chat/composer/dettagli attività | F2/F1; F8 conserva segnali e copertura |
| Memoria built-in e provider, identità e learning | Memory del profilo, dettagli origine/budget/pending; identità nel Dot | F8 viewer, F7 identità, F9 solo aggiunte Space/legacy |
| Review memoria/skill post-turn | Riga discreta nella conversazione, dettagli e link al contenuto interessato quando risolvibile | F8 adapter/ricevute; F2 renderer |
| Skills, curator, plugin, MCP/toolsets/deferred tools | Capabilities/Skills, stato e manutenzione del profilo | F11 gestione; F8 visibilità notifiche/stato |
| Bots, messaging, delegate task | Dots/chat/team e ricevute distinte | F7/F14 |
| Scheduler/routine, esecuzioni e delivery | Routine, storico e stato host | F10 |
| Browser/search, computer use, file/artifacts, terminale | Computer e risultati con origine | F12/F16/F5/F15 |
| STT/TTS e voice conversation | Composer/voce/playback | F17 |
| Approvazioni, richieste input, grants | Controlli associati a owner/azione reale | F3 |

Nella chat implementativa costruire una matrice per la **versione/profilo collegati**: feature/tool/evento → contratto → superficie → stato (supportato backend, collegato, verificato, indisponibile/gap) → prova. Discovery dinamica più mappa versionata; non certificare tutto dal conteggio endpoint. Ogni famiglia resta alla sua scheda; F8 non implementa incidentalmente browser, routine o plugin.

## Memoria runtime da osservare, senza copiarla

L'utente apre Memory e sceglie il Dot/profilo/host associato. Mostrare contenuto effettivamente leggibile, provenienza, aggiornamento noto e budget verificato di USER/MEMORY; identità SOUL distinta, provider attivo e stato recall/skill/curator dove supportati. Nessun ricordo creato al primo avvio e nessun seed personale letto implicitamente. Un nuovo Dot non crea un archivio runtime proprio senza binding F7.

Fonte autoritativa: profilo Hermes. Cache/snapshot UI eventuali sono dati derivati con provenienza e freshness, non memorie reiniettate nell'agente o un secondo writer. Ripresa offline indica ultima osservazione, non dati attuali. File Space F9 e preferenze legacy hanno sezioni/ambiti distinti.

**Gap verificato:** `/api/memory` restituisce provider e dimensioni file **in byte**, non testo completo, budget in caratteri o lista mutazioni. Non usarlo come CRUD o percentuale del limite 2.200/1.375 caratteri. Il viewer deve trovare un percorso read-only scoped supportato (ad esempio learning/detail o surface ufficiale compatibile), oppure documentare un adapter necessario; accesso diretto remoto ai file non è implicito. Nessuna esposizione generica filesystem del profilo al renderer.

Preservare memoria di tutti i profili senza aggregarla: una selezione UI non concede lettura globale di chat/profili non autorizzati. Snapshot built-in in uso e memoria attuale su disco sono distinti. F8 non resetta, migra, cancella o cambia provider; eventuale gestione runtime sta in F9-C/F11 con contratto e selezione separati.

## Esempio richiesto: aggiornamenti dopo una risposta

Evidenza sorgente pubblico SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`, 2026-10-04, nessuna prova live:

- Gateway emette **`review.summary`** tramite `background_review_callback`. Payload tipizzato **`{text: string}`** nell'envelope sessione; non include un elenco strutturato delle mutazioni o un message/turn ID garantito.
- Desktop ufficiale intercetta l'evento in `status.ts` e lo aggiunge come messaggio system con marker `review:`; `system-message.tsx` lo presenta come nota memoria/apprendimento. Il codice evita una sola toast fugace. Questa intenzione non prova da sola replay durevole dopo restart: verificarlo.
- `background_review.py` riassume risultati tool riusciti, distingue proposte staged e operations applicate, evita risultati ereditati già presenti. `display.memory_notifications` governa emissione (off/on/verbose), non l'apprendimento in sé.
- Il riepilogo post-turn riguarda **background review/self-improvement**. Il curator è manutenzione skill separata: non chiamare ogni aggiornamento «Curator» e non inventare `curator.updated` come evento. Run/status/report del curator hanno percorso e prove propri.

UX: dopo il testo della risposta, mostrare una riga come «Skills aggiornate» **solo se questo è l'esito ricevuto**, oppure «Modifica proposta: da approvare». Il riepilogo generico deve restare generico se non contiene nomi/azioni. Dettagli espandibili con testo runtime, origine/profilo e link al contenuto solo con target risolto. Non dedurre nomi/file/rollback da prose localizzata.

Un evento tardivo resta nella chat del suo owner anche dopo fine turno o cambio selezione. Agganciare a una risposta esatta soltanto con correlazione supportata; altrimenti nota di sessione con timestamp, non badge all'ultimo messaggio arbitrario. Non riaprire Working per una notifica post-turn e non creare una risposta dell'agente aggiuntiva. Se gli avvisi runtime sono off, indicare la disponibilità della vista memoria; non inventare aggiornamenti o riattivarli di nascosto.

## Contratto Studio proposto e resilienza

F1 consegna eventi autenticati/scoped alla proiezione F8; F2 visualizza ricevute e note, F11/F9 refresh delle viste pertinenti. Proposta di record derivato con origine, connection/profile/session, tipo, payload consentito, timestamp e correlazione/revisione quando realmente presenti. Non è uno schema backend già esistente. Conservare il testo originale come testo, non HTML/link/file-action arbitraria.

Subscription non termina quando arriva fine risposta: review può completare dopo. Nessun ascolto globale che inoltra eventi di sessioni personali non associate. Persistere note/ricevute UI quando previsto; non scrivere ricordi Hermes per conservare una notifica. Dedup/replay usa ID/checkpoint del backend se disponibili; senza identità affidabile definire limiti e non promettere exactly-once. Recovery deve riconciliare stato/snapshot, non rilanciare review, skill writes o prompt.

Eventi nuovi non riconosciuti: diagnostica redatta/contatore per la mappa, non dump privato o render automatico di payload arbitrario. Versioni incompatibili mostrano gap, senza perdere le capacità già collegate. Nulla nella parità autorizza chiamate RPC generiche, reset memory, run curator, installazioni o gestione provider automatici.

## Incrementi da scegliere

- **F8-A — Riepiloghi post-turn:** adattare `review.summary` scoped, nota nella chat, dettaglio e persistenza/ripresa verificati; non richiede un nuovo archivio memoria.
- **F8-B — Viewer memoria Hermes:** lettura read-only profilo/contenuti supportati, freshness/budget/origine e refresh dopo eventi; gap adapter esplicito.
- **F8-C — Copertura feature native:** matrice versione/profilo, discovery e destinazioni; passare i gap alle schede proprietarie invece di implementarle tutte.

Dipendenze A: F1 eventi + F2 timeline/owner; B: F1/F7 e contratto read-only, con link F11/F9; C: capability discovery F11/F1. UI component-system; tastiera/focus/dettagli/Reduced Motion. Nessun incremento selezionato dalla sola creazione della scheda.

## Definition of done

A: fixture emette riepilogo dopo fine risposta e dopo switch chat; nota nel solo owner, non persa alla chiusura pannello/reopen/restart secondo contratto; duplicato/replay/late event/disconnect/malformed gestiti. Prova isolata Hermes di review riuscita distinta da staging/fallimento; notifiche off senza falsi aggiornamenti. Mancanza di id/turn spiegata nei limiti.

B: mostrare memoria sintetica già presente nel backend senza modificarla, con due profili e isolamento; refresh/fresh session contro snapshot, byte contro caratteri, offline stale e permesso negato. Verificare file/provider non alterati dall'apertura di Studio e assenza di seconda iniezione/memoria duplicata. Fonti esterne non lette senza accesso supportato.

C: ogni capacità in scope ha superficie o gap tracciato e ownership; strumenti deferred non esclusi soltanto perché assenti dal composer. Stato disponibile provato, non dedotto dal nome. Gate read-only non prova management. Ogni incremento: UI packaged, focus/accessibilità, privacy, zero log di ricordi/credenziali e prova distinta da build/handshake.

## Fonti

[Persistent Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/), [Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator/), [analisi memoria](../research/hermes-memory-system.md). Sorgente fissato: [eventi](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tui_gateway/contracts/events.py#L247), [gateway wiring](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tui_gateway/server.py#L1042), [review](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/background_review.py#L730), [desktop handler](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/apps/desktop/src/app/session/hooks/use-message-stream/gateway-event/status.ts#L175), [riga UI](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/apps/desktop/src/components/assistant-ui/thread/system-message.tsx), [memory status](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/hermes_cli/web_routers/ops.py#L491).

## D34 — Copertura chat e impostazioni native

Mappare esplicitamente tutte le componenti chat Hermes/TUI: streaming, thinking esposto, tool, codice/comandi/output, changes, approvals/validation e controlli chat. Per ciascuna voce indicare contratto/versione, destinazione owner e prova/gap. Mappare inoltre tutte le impostazioni Hermes nella sezione dedicata Settings Hermes, per host/profilo, distinta da Settings Hermes Studio. F4 possiede contenitore e navigazione; F8 copertura/provenienza, non un writer generico di configurazione. Ogni mutazione passa dalla feature proprietaria e policy F3. Nessuna funzione nativa eliminata per adattare il template.


## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e File e skill F8. Implementa soltanto F8-A/B/C selezionato: preservare capacità e memoria Hermes e presentarle in Studio, senza secondo archivio/motore. Verifica contratti/versione e confronta handler desktop ufficiale. Per A usa review.summary scoped anche dopo fine turno, nota persistente e correlazione solo quando provata; non chiamare tutto curator o applied. Per B sola lettura supportata del profilo scelto, nessun import/reset/config change o reiniezione. Mappa gap alle feature proprietarie, non implementarle incidentalmente. Prove sintetiche/isolate e UI packaged; aggiorna scheda, MEMORY/STATUS/WORKLOG e fai review prima del commit. Segui anche Incarico per la chat implementatrice di F8: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
