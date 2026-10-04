# F10 — GUI delle routine e del cron Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F10**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Configurare e osservare routine native Hermes con run/delivery/risultati dopo chiusura di Studio.

**Backend e confine:** Cron/heartbeat/scheduler Hermes: client presenta configurazione e esiti, nessun timer/executor sostitutivo. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Routine mostra Space/progetto se realmente associato, host/profilo/destinatario e configurazione modello/effort effettiva del job; nessun valore ereditato dalla chat aperta. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F1 lifecycle, F3 permessi, F7 se Bot destinatario; 24/7 è requisito, prova durata distinta da health/creazione job. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Client chiuso, host offline/sospeso, run tardivo, job/run/delivery distinti, prossimo evento/timezone, duplicati/replay, errore consegna e stop esplicito. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


## Continuità autonoma richiesta in F1 — D33

Principio utente: Hermes lavora 24/7 indipendentemente da Studio aperto; Studio facilita e visualizza il backend Hermes completo. Routine/cron, heartbeat, bots, strumenti e memoria mantengono ownership native Hermes. Configurazione, stato host/servizio e risultati devono restare osservabili dopo riapertura, con esiti reali. Nessun timer/heartbeat/executor alternativo nel client e nessun arresto del backend alla chiusura. Il requisito non è ancora una verifica di durata o di esecuzione dopo riavvio; riprendere [F1/D33](F1-runtime-connection.md#principio-cardine--hermes-autonomo-studio-facilitatore-d33) e i gate specifici della scheda prima di implementare.

<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Se schema/eventi upstream sono incerti: ricerca primaria documentata |
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | Quando cambiano identità, stato o termini del dominio |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se emerge un errore riproducibile di connessione o lifecycle |
| [wizard](<../../.agents/skills/wizard/SKILL.md>) — condizionale | Solo per prerequisiti host/account che richiedono davvero il contributo umano |

### Punti di ingresso da leggere

- [docs/features/F1-runtime-connection.md](<../../docs/features/F1-runtime-connection.md>): Host e profilo.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Autorizzazioni.
- [desktop/hermes/server.mjs](<../../desktop/hermes/server.mjs>): Route tasks attuale non equivale a scheduler.
- [Hermes: tools/cronjob_tools.py](</Users/luca/.hermes/hermes-agent/tools/cronjob_tools.py>): Azioni pianificazione; lettura sorgente alla versione fissata, non prova live.
- [Hermes: apps/desktop/src/api/cron.ts](</Users/luca/.hermes/hermes-agent/apps/desktop/src/api/cron.ts>): REST client desktop; lettura sorgente alla versione fissata, non prova live.
- [Hermes: hermes_cli/web_routers/cron.py](</Users/luca/.hermes/hermes-agent/hermes_cli/web_routers/cron.py>): Owner, run e delivery; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Confine delle prove

Stato: **documented, not implemented** (2026-10-04). Questa specifica descrive una futura slice di Hermes Studio; codice upstream disponibile non significa capability collegata nell’app. Evidenze: lettura del checkout sorgente `/Users/luca/.hermes/hermes-agent`, non esecuzione live, nessun prompt/configurazione/database personale. Riferimento autorevole: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). La versione remota può cambiare: prima di implementare fissare SHA e ripetere i contract test.

Leggere prima `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` e `desktop/hermes/README.md`. UI OpenDots scelta dall’utente; Hermes resta l’unico executor. Gli endpoint Studio sotto descritti sono **proposte**, non API esistenti.

## Obiettivo e casi d’uso

Priorità utente: routine affidabili associate a un bot/progetto. Creare “ogni mattina ricerca e prepara una pagina”, pausa/riprendi, esegui ora, controlla run e delivery, recupera risultato dopo chiusura dell’app. La routine è persistente; ogni run ha propria sessione/esito. Il client chiuso non deve determinare la cancellazione, ma la disponibilità dell’host/scheduler sì.

## Contratto runtime verificato

Tool `cronjob_manage`, azioni create/list/update/pause/resume/remove/run; create richiede schedule e prompt. Schedule distingue `30m` ricorrente da `in 30m` one-shot e supporta natural day/time, cron e timestamp ISO. `deliver` può essere local, bot-chat[:profile], all o platform:chat:thread; failure_deliver distinto. Ogni run parte in sessione fresca: niente contesto implicito della chat. Pin modello solo se esplicitamente richiesto. Fonte `tools/cronjob_tools.py:1047–1137`.

Desktop usa REST: GET/POST `/api/cron/jobs`, GET/PUT/DELETE `/api/cron/jobs/:job_id`, POST pause/resume/trigger, GET runs?limit, GET `/api/cron/delivery-targets`; create/update typed payload, update `{updates}`. Trigger è operazione sincrona lunga nell’upstream (timeout24h nel client): la risposta HTTP iniziale non va reinterpretata come run concluso. Profilo è owner, list può defaultare ad all: Studio deve passare scope concreto inizialmente. `cron.changed` è segnale refetch. Fonti `apps/desktop/src/api/cron.ts`, `hermes_cli/web_routers/cron.py:668–739`, `hermes_cli/web_server_cron.py`, `tui_gateway/contracts/events.py:727`.

## Dominio, UX e stati

Routine `{connectionId,profile,jobId}` e Run `{sessionId,runId?,startedAt,status,result,delivery}` distinti. Form: nome, bot, istruzione autonoma, schedule/timezone leggibile, destinazione e failure policy; preview next run verificata dal backend. Lista planned/paused/host unavailable; run queued/running/interrupted/failed/succeeded/unknown e delivery separata. Avviso concreto se scheduler non attivo; esito senza run authoritative non passa a succeeded. Operazione elimina con scope chiaro, non confonderla con pausa.

## Seam, ownership e dipendenze

Dipende da F1 per connessione e host, F3 per autorizzazioni; F7 soltanto per destinazioni Bot e F6 se il risultato diventa documento. La cronologia delle esecuzioni appartiene a questa feature. Nuovi `desktop/hermes/routines.mjs`, `.test.mjs`, client `RoutinesView.tsx`/`RoutineEditor.tsx`; sostituire route Studio tasks501 soltanto dopo contratto confermato. Non creare cron macOS o timer Electron parallelo; Hermes scheduler unico. Configurazione del gateway/scheduler deve avere gate separato, nessuna modifica in questa specifica.

## Privacy, migrazione e non-obiettivi

Default destinazione local/app se supportata; all/shared platform richiede scelta esplicita. Inserire solo riferimenti/fonti autorizzati nel prompt autonomo; segreti restano vault runtime. Nessun import automatico di tutte le routine personali. Metadata task OpenDots non diventa cronjob reale; mapping nullable finché confermato. Non garantire funzionamento24h o wake del Mac senza prova durata e politica host.

## Accettazione e DoD

Fixture create/update/pause/resume/remove, one-shot vs recurring, timezone/DST, collisione stesso jobId su profili diversi, stale refresh, trigger timeout senza retry automatico, failed delivery distinta da run, reopen run sulla connessione proprietaria. Prova isolata breve esegue due riattivazioni e recupera run/result con client chiuso; non dichiarare durata24h. DoD: backend adapter scoped, UI e schema reversibile, run/delivery logs reali, scheduler ownership verificata e packaged smoke; STATUS/WORKLOG aggiornati.

## Destinazione file e memoria — D25/D28

Routine può riferire un documento del folder Space con root/host/path e grant durevole verificati; metadato Space non garantisce folder disponibile quando client chiuso. File update confermato da revisione/esito F5; memoria Space F9 aggiornata solo entro policy selezionata. Memoria runtime/skill curator non sono il scheduler; nessun salvataggio al vault da sola consegna testuale.

## Prompt pronto nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa F10 leggendo spec e riferimento upstream apps/desktop/api/cron.ts. Priorità routine: partire da list scoped+run history, poi creazione/pause/trigger con fixture e scheduler Hermes isolato. Nessun timer alternativo, messaggio esterno o modifica delle routine personali. Mostra next run e disponibilità host verificati, separa run da delivery e non ritentare esiti incerti. Completa test schedule/timezone/relaunch, DoD e documentazione. Segui anche Incarico per la chat implementatrice di F10: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
