# F05 — Delega, messaggi fra bot e recall



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

- [docs/features/F04-bots-and-identities.md](<../../docs/features/F04-bots-and-identities.md>): Identità canonica.
- [docs/features/F16-permissions-and-approvals.md](<../../docs/features/F16-permissions-and-approvals.md>): Autorizzazione e richieste stale.
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

Separare DelegationRun, BotMessageDelivery, HostedRoom e RecallResult. Stati UI: composing, queued, admitted, working, awaiting reply, reply received, declined, failed, delivery uncertain; “inviato” soltanto con ricevuta. Un pannello Team mostra figli live, una timeline Messaggi collega bot persistenti e un risultato recall mostra profile/thread/message anchor. Scope recall iniziale: chat propria + fonti condivise selezionate; estendere a profili personali solo con scelta esplicita. Notifica approvazione su thread diverso deve consentire navigazione.

## Seam, ownership e dipendenze

Dipende da F04/F11 per identità e connessione, F02 per cronologia e F16 per approvazioni. F07 è pertinente solo se si amplia il registro delle capacità. Nuovi `desktop/hermes/collaboration.mjs`, `collaboration.test.mjs`, `CollaborationPanel.tsx`, `RecallResults.tsx`; accordare bridge/server/shared types. Prima slice osserva deleghe reali e messaggi di due bot isolati. Seconda introduce relay con single-owner claim e ricevute; terza gruppi/log replay. Nessun executor OpenDots parallelo. Endpoints Studio proposti scoped `/bots/:identity/messages`, `/collaboration/:room/log`, `/recall`; nessuno esiste attualmente.

## Privacy, migrazione e non-obiettivi

Mai inoltrare intera chat privata o spoofare sender; target/author runtime authoritative. Scope e grants precedono lettura cross-profile. Conservare event_id/cursor/authority, receipts e origin link senza confondere pin sessione. Non convertire toolEvents storici in messaggi inviati. Non promettere exactly-once con sola dedupe HTTP; rete remota e failover gruppi avanzato sono successivi.

## Scope degli Spaces su cartelle — D25

Collaboratori lavorano su file reali autorizzati dello Space F03/F10, con host/root/revisione nelle consegne. Membership non concede accesso al vault o profilo di memoria di altri bot; messaggio/delega non crea mount o copia folder. Scritture concorrenti usano writer e conflitti condivisi F10. Memoria progetto F15 distinta da USER/MEMORY del singolo profilo.

## Accettazione, DoD e prompt nuova chat

Due bot isolati: ack ≠ reply, ritardo/errore/offline, omonimi e peer route corretti, replay senza duplicati, cancel stale, callback dopo chiusura UI, recall con anchor e scope negato; delegato temporaneo non appare come bot durevole. DoD: ownership transport e permissions espliciti, fixture e prova isolata di DM+reply+recall, persisted receipts/reopen, packaged UI, nessuna fuga personal data; aggiornare docs.

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa F05 per priorità collaborazione e messaggi/recall. Verifica prima sulla versione fissata delegate_task, message_agent canonico, bot_relay e groups.* nel sorgente Hermes apps/desktop. Scegli una slice tracciabile (due bot isolati DM→reply→recall), non unirli in un falso tool generico. Definisci scope/identity/receipts e ownership, testa incerto/offline/replay, completa DoD e persisti esiti. Non usare archivi personali o inviare messaggi reali senza autorizzazione specifica.
