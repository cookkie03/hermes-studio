# F14 — GUI della delegazione e collaborazione tra Bots Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F14**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Presentare deleghe e messaggi tra bot Hermes con mittente/destinatario, ricevute e risultati tracciabili.

**Backend e confine:** delegate_task, message_agent/bot relay/gruppi solo se realmente supportati; bot persistente distinto da subagent temporaneo. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Applicare anche D36 qui sotto: pannello laterale per figli temporanei; Dots persistenti nella propria chat, messaggi attribuiti e attività confermata dal runtime. Mostrare Space e host della consegna e di ogni collaboratore; contesto condiviso esplicito e file/range scoped, non accesso all’intero progetto per membership. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F7 bot/F2 transcript/F3 grants/F5-F6 riferimenti. Nessun orchestratore o messaging backend alternativo in Studio. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Due bot/profili, omonimi, ack contro risposta, recall, offline/timeout, duplicato/replay, delega cancellata e accesso file/memoria negato. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Se schema/eventi upstream sono incerti: ricerca primaria documentata |
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | Quando cambiano identità, stato o termini del dominio |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) — condizionale | Separare Delega, Messaggio e Gruppo |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se emerge un errore riproducibile di connessione o lifecycle |

### Punti di ingresso da leggere

- [docs/features/F7-bots-and-identities.md](<../../docs/features/F7-bots-and-identities.md>): Identità canonica.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Autorizzazione e richieste stale.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Trasporto owned.
- [Hermes: tools/delegate_tool.py](</Users/luca/.hermes/hermes-agent/tools/delegate_tool.py>): Delega temporanea; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/bot_mode_dm.py](</Users/luca/.hermes/hermes-agent/tools/bot_mode_dm.py>): Messaggi tra bot; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/session_search_tool.py](</Users/luca/.hermes/hermes-agent/tools/session_search_tool.py>): Recupero cronologia; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tui_gateway/contracts/groups_bot_relay.py](</Users/luca/.hermes/hermes-agent/tui_gateway/contracts/groups_bot_relay.py>): Relay/gruppi e scope; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Confine delle prove

Stato: **documented, not implemented** (2026-10-04). Questa specifica descrive una futura slice di Hermes Studio; codice upstream disponibile non significa capability collegata nell’app. Evidenze: lettura del checkout sorgente `/Users/luca/.hermes/hermes-agent`, non esecuzione live, nessun prompt/configurazione/database personale. Riferimento autorevole: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). La versione remota può cambiare: prima di implementare fissare SHA e ripetere i contract test.

Leggere prima `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` e `desktop/hermes/README.md`. UI OpenDots scelta dall’utente; Hermes resta l’unico executor. Gli endpoint Studio sotto descritti sono **proposte**, non API esistenti.

## Obiettivo e casi d’uso

Priorità utente: bot che collaborano, si inviano messaggi e recuperano conversazioni pertinenti. Esporre destinatario, responsabilità, scope e provenienza: chiedere un risultato a un collega persistente, seguire una delega temporanea, riprendere un confronto precedente, coordinare un gruppo senza duplicare lavoro dopo una disconnessione.

## Tre contratti distinti verificati

1. `delegate_task`: figli con contesti isolati, `tasks:[{goal,context?,output_schema?,images?,group?}]`; `action` spawn/list/steer/stop, `subagent_id`, `message`. Richiede parent agent context e limiti runtime di profondità/concorrenza. RPC `subagent.list`, `.tail`, `.interrupt` richiedono sessione proprietaria; tail max16KB. Questi figli **non sono automaticamente Dots o Bot Chat durevoli**. Fonte `tools/delegate_tool.py:474,683–760`, `tui_gateway/contracts/profiles_vault_complete_foreign_subagents.py:642–674`.
2. `message_agent {target,message}`: tool **iniettato soltanto** nella Bot Chat canonica gestita, non toolset globale. Target validato sul roster: profilo locale, peer/agent, handle@connection. Corpo max16.000 caratteri; attribution aggiunta server-side. Ack `queued`+delivery_id è handoff, non ricevuta; reply/failure arriva dal processo asincrono, con eventuale `reply_delivery=poll` da rispettare. Il runtime verifica nuovamente il gate; UI non deve abilitarlo in una normale chat cambiando titolo. Fonte `tools/bot_mode_dm.py:1–130`. Cross-connection `bot_relay.roster.sync`, `.outbox.drain`, `.deliver {profile,message,from_*?}` (blocking reply), `.reply {id,reply?,error?,reason?}` richiedono un relay posseduto, non fanout browser improvvisato. Fonte contracts `groups_bot_relay.py:508–570` e `methods_bot_relay.py`.
3. Gruppi persistenti: `groups.capabilities`, `.create {room_id,name,members}`, `.send {room_id,event_id?,payload}`, `.log {room_id,since_seq?,limit?}`, `.state`, `.stop`, `.approve`, `.retry`. Log contiene seq/event_id e authority gateway/epoch; retry esplicito, tombstone disband, non ricreare task incerti. Fonte `tui_gateway/contracts/groups_bot_relay.py:150–360`.

Recall: `session_search` cerca/legge messaggi reali (FTS5), non riassunti inventati: query/limit/sort/detail, oppure session_id/around_message_id/window; `profile` opzionale permette lettura di altro profilo. Il link `@session:<profile>/<id>` preserva scope. Non è un tool chiamato “bot_recall” verificato. La descrizione e il campo session_id hanno formulazioni parzialmente diverse: testare read-alone e scroll con anchor sulla versione fissata. Fonte `tools/session_search_tool.py:651–779`.

## Dominio, UX e stati

Separare DelegationRun, BotMessageDelivery, HostedRoom e RecallResult. Stati UI: composing, queued, admitted, working, awaiting reply, reply received, declined, failed, delivery uncertain; “inviato” soltanto con ricevuta. Un pannello laterale Sub-agent mostra i figli temporanei della chat padre; la timeline della conversazione di ciascun Dot mostra i messaggi tra bot persistenti e un risultato recall mostra profile/thread/message anchor. Scope recall iniziale: chat propria + fonti condivise selezionate; estendere a profili personali solo con scelta esplicita. Notifica approvazione su thread diverso deve consentire navigazione.

## Seam, ownership e dipendenze

Dipende da F7/F1 per identità e connessione, F2 per cronologia e F3 per approvazioni. F11 è pertinente solo se si amplia il registro delle capacità. Nuovi `desktop/hermes/collaboration.mjs`, `collaboration.test.mjs`, `CollaborationPanel.tsx`, `RecallResults.tsx`; accordare bridge/server/shared types. Prima slice osserva deleghe reali e messaggi di due bot isolati. Seconda introduce relay con single-owner claim e ricevute; terza gruppi/log replay. Nessun executor OpenDots parallelo. Endpoints Studio proposti scoped `/bots/:identity/messages`, `/collaboration/:room/log`, `/recall`; nessuno esiste attualmente.

## Privacy, migrazione e non-obiettivi

Mai inoltrare intera chat privata o spoofare sender; target/author runtime authoritative. Scope e grants precedono lettura cross-profile. Conservare event_id/cursor/authority, receipts e origin link senza confondere pin sessione. Non convertire toolEvents storici in messaggi inviati. Non promettere exactly-once con sola dedupe HTTP; rete remota e failover gruppi avanzato sono successivi.

## Scope degli Spaces su cartelle — D25

Collaboratori lavorano su file reali autorizzati dello Space F6/F5, con host/root/revisione nelle consegne. Membership non concede accesso al vault o profilo di memoria di altri bot; messaggio/delega non crea mount o copia folder. Scritture concorrenti usano writer e conflitti condivisi F5. Memoria progetto F9 distinta da USER/MEMORY del singolo profilo.

## D36 — Due superfici distinte: sub-agent e Dots

**Sub-agent temporanei:** controllo nella chat padre e pannello laterale in stile Codex, con elenco dei figli della sessione e dettaglio selezionabile. Mostrare identità/incarico, stato reale, Space/host/modello/effort quando forniti dal runtime, attività/output autorizzati e risultati. `subagent.list`/`subagent.tail`/`subagent.interrupt` sono contratti sorgente già citati, da verificare nel backend collegato; tail limitato non equivale a transcript completo o ragionamento nascosto. Steer/stop solo tramite capability nativa supportata e gate pertinenti. Figli temporanei non diventano Dots persistenti.

**Dots persistenti:** restano nella sidebar e nella propria conversazione, senza finestra o sezione nel pannello sub-agent. Nella chat mittente mostrare evento «messaggio a [Dot]», contenuto consentito, destinatario, delivery ID e stato reale. Sul destinatario distinguere badge di messaggio non letto e segnale di lavoro. Aprendo quel Dot si vede il messaggio ricevuto con attribuzione e l’attività della sua sessione canonica. `message_agent` è disponibile solo nei Bot Chat gestiti che lo espongono; niente chat parallela creata dal frontend.

**Semantica:** queued/ack non conferma ricezione, attivazione o risposta. Accendere il segnale Working soltanto con stato/evento Hermes comprovato; se manca il contratto, documentare il gap e mostrare stato non verificato. In attesa di approvazione, fallito, interrotto e completato hanno etichette distinte. Nessun retry automatico su consegna incerta. Indicatori sintetici con testo accessibile; movimento discreto solo durante attività confermata e alternativa Reduced Motion.

**Gate UI/runtime:** due Bot sintetici A→B→risposta, verifica timeline mittente, messaggio nella chat destinatario e segnale Working da evento effettivo; ack senza esecuzione non accende Working. Più figli e più Dots attivi senza mescolarli; apertura/chiusura del pannello, tastiera/focus, approvazione, fallimento/interruzione, riconnessione/replay e cambio chat/host durante tail senza contaminazione. Il non letto cambia dopo visione effettiva, non dopo esecuzione. Verificare nel runtime i contratti degli stati prima di dichiarare il percorso funzionante.

## Accettazione, DoD e prompt nuova chat

Due bot isolati: ack ≠ reply, ritardo/errore/offline, omonimi e peer route corretti, replay senza duplicati, cancel stale, callback dopo chiusura UI, recall con anchor e scope negato; delegato temporaneo non appare come bot durevole. DoD: ownership transport e permissions espliciti, fixture e prova isolata di DM+reply+recall, persisted receipts/reopen, packaged UI, nessuna fuga personal data; aggiornare docs.

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa F14 per priorità collaborazione e messaggi/recall. Verifica prima sulla versione fissata delegate_task, message_agent canonico, bot_relay e groups.* nel sorgente Hermes apps/desktop. Scegli una slice tracciabile (due bot isolati DM→reply→recall), non unirli in un falso tool generico. Definisci scope/identity/receipts e ownership, testa incerto/offline/replay, completa DoD e persisti esiti. Non usare archivi personali o inviare messaggi reali senza autorizzazione specifica. Segui anche Incarico per la chat implementatrice di F14: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
