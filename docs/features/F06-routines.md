# F06 — Routine e attività ricorrenti



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

- [docs/features/F11-runtime-connection.md](<../../docs/features/F11-runtime-connection.md>): Host e profilo.
- [docs/features/F16-permissions-and-approvals.md](<../../docs/features/F16-permissions-and-approvals.md>): Autorizzazioni.
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

Dipende da F11 per connessione e host, F16 per autorizzazioni; F04 soltanto per destinazioni Bot e F03 se il risultato diventa documento. La cronologia delle esecuzioni appartiene a questa feature. Nuovi `desktop/hermes/routines.mjs`, `.test.mjs`, client `RoutinesView.tsx`/`RoutineEditor.tsx`; sostituire route Studio tasks501 soltanto dopo contratto confermato. Non creare cron macOS o timer Electron parallelo; Hermes scheduler unico. Configurazione del gateway/scheduler deve avere gate separato, nessuna modifica in questa specifica.

## Privacy, migrazione e non-obiettivi

Default destinazione local/app se supportata; all/shared platform richiede scelta esplicita. Inserire solo riferimenti/fonti autorizzati nel prompt autonomo; segreti restano vault runtime. Nessun import automatico di tutte le routine personali. Metadata task OpenDots non diventa cronjob reale; mapping nullable finché confermato. Non garantire funzionamento24h o wake del Mac senza prova durata e politica host.

## Accettazione e DoD

Fixture create/update/pause/resume/remove, one-shot vs recurring, timezone/DST, collisione stesso jobId su profili diversi, stale refresh, trigger timeout senza retry automatico, failed delivery distinta da run, reopen run sulla connessione proprietaria. Prova isolata breve esegue due riattivazioni e recupera run/result con client chiuso; non dichiarare durata24h. DoD: backend adapter scoped, UI e schema reversibile, run/delivery logs reali, scheduler ownership verificata e packaged smoke; STATUS/WORKLOG aggiornati.

## Prompt pronto nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa F06 leggendo spec e riferimento upstream apps/desktop/api/cron.ts. Priorità routine: partire da list scoped+run history, poi creazione/pause/trigger con fixture e scheduler Hermes isolato. Nessun timer alternativo, messaggio esterno o modifica delle routine personali. Mostra next run e disponibilità host verificati, separa run da delivery e non ritentare esiti incerti. Completa test schedule/timezone/relaunch, DoD e documentazione.

## Destinazione file e memoria — D25/D28

Routine può riferire un documento del folder Space con root/host/path e grant durevole verificati; metadato Space non garantisce folder disponibile quando client chiuso. File update confermato da revisione/esito F10; memoria Space F15 aggiornata solo entro policy selezionata. Memoria runtime/skill curator non sono il scheduler; nessun salvataggio al vault da sola consegna testuale.
