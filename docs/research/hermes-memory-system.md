# Hermes Agent — memoria, apprendimento e continuità

Ricerca documentale: 2026-10-04. Checkout pubblico letto: `/Users/luca/.hermes/hermes-agent`, SHA verificato `e1e82d782f353766c7a22db6e5ac4fa58bbff325`. Non sono stati letti file personali del profilo, configurazioni, credenziali o database di sessione. Nessun comando Hermes, curator o provider è stato eseguito. Queste sono capacità documentate e contratti sorgente, non prove del backend collegato a Studio.

## Documentazione ufficiale e copertura

Il punto di partenza richiesto è [Persistent Memory](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory), letto integralmente e confrontato con la copia `website/docs/user-guide/features/memory.md` e il sorgente alla SHA sopra. La pagina comprende memoria bounded, snapshot, confini delle sessioni, troubleshooting, azioni/target, capacità, deduplicazione e sicurezza, ricerca cronologica, Learning Journey, configurazione, approvazioni, notifiche, modello/costo/reasoning della review, defer locale, gate delle skill e provider esterni.

Completano il prospetto [Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator), [Memory Providers](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory-providers), [Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills), [Personality & SOUL.md](https://hermes-agent.nousresearch.com/docs/user-guide/features/personality), [Context Files](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files) e [Sessions](https://hermes-agent.nousresearch.com/docs/user-guide/sessions). I link pubblici seguono l'upstream; i riferimenti sorgente sotto sono fissati alla versione studiata.

## Come ricorda: più livelli, con compiti diversi

Hermes combina istruzioni durevoli, brevi fatti sempre nel contesto, cronologia ricercabile e procedure caricate quando servono. Conservare una conversazione non significa che ogni suo dettaglio sia presente nel prompt di ogni risposta. La qualità dipende anche dal modello, dal successo delle scritture, dall'ambito del profilo, dalla ricerca e dai limiti del contesto.

| Livello / posizione logica | Cosa conserva | Chi aggiorna e quando | Come entra nel contesto e limiti |
|---|---|---|---|
| `<HERMES_HOME>/SOUL.md` | Identità, voce e comportamento generale del profilo | Utente/configurazione dell'identità; seed iniziale se assente, preservando file esistenti | Slot identità del prompt; non è un diario e non viene scoperto nelle cartelle dei progetti. Scansione e limite del context file; fallback se vuoto/illeggibile. [S1] |
| `<HERMES_HOME>/memories/USER.md` | Identità, preferenze e aspettative dell'utente | Tool `memory`, oppure review che propone/salva fatti pertinenti secondo gate | Snapshot al caricamento dell'agente/sessione. Default **1.375 caratteri**; target `user`. [S2–S3] |
| `<HERMES_HOME>/memories/MEMORY.md` | Fatti su ambiente, convenzioni e lezioni durevoli | Tool `memory`, direttamente durante un turno o tramite review consentita | Snapshot congelato; default **2.200 caratteri**. Non è una copia completa delle chat né di un vault. [S2–S3] |
| Contesto di progetto: `.hermes.md`/`HERMES.md`, `AGENTS.override.md`, `AGENTS.md`, ecc. | Regole e informazioni sul progetto corrente | Utente o agente che modifica quei file nell'ambito autorizzato | Discovery dal working directory: priorità e catena dei context file, con discovery progressiva dei sottofolder. Un generico `MEMORY.md` nel progetto non diventa automaticamente memoria built-in. [S4] |
| `<HERMES_HOME>/state.db` | Messaggi e metadati delle sessioni persistite | Runtime durante il lavoro e ai confini delle sessioni | Richiamo tramite `session_search`; cronologia persistita distinta da contenuto inviato al modello. Esistono filtri, finestre, limiti e lineage di compaction. [S5] |
| Contesto attivo e handoff di compaction | Stato utile a proseguire la conversazione | Context engine/compressor quando il contesto raggiunge la pressione prevista | Sintesi e coda recente preservata; può perdere dettagli. Non sostituisce la cronologia o i fatti built-in. [S6] |
| `<HERMES_HOME>/skills/**/SKILL.md` e riferimenti | Procedure riutilizzabili, conoscenza organizzata | `/learn`, `skill_manage`, review e manutenzione curator nei rispettivi confini | Catalogo leggero, `skill_view` per corpo e riferimenti; non tutte le skill vengono caricate integralmente a ogni turno. [S7–S8] |
| Provider esterno opzionale | Ricordi semantici, fatti o knowledge tree secondo il plugin | Hook del provider e suoi tool; per-turn, fine sessione o pre-compaction secondo contratto | Un solo provider esterno attivo, insieme ai built-in se abilitati. Readiness, identità, servizio e retention dipendono dal provider. [S9] |

`HERMES_HOME` indica il profilo runtime effettivo: default `~/.hermes`, oppure ad esempio `~/.hermes/profiles/work`. Una memoria per Dot coincide con memoria per profilo **solo se quel Dot è associato a quel profilo**. Dot, chat e Space non generano automaticamente tre archivi Hermes separati. Le informazioni condivise fra bot richiedono uno scope esplicito; non basta puntare più processi allo stesso home. [S2, S9]

## Scrittura e caricamento dei file built-in

Il tool `memory` espone `add`, `replace` e `remove`, con target `memory` o `user`; il sorgente supporta anche una lista di operazioni atomiche. Non esiste un'azione `read`: il modello riceve lo snapshot, mentre i risultati del tool riportano lo stato attuale. `replace` sostituisce **l'intera voce** identificata da `old_text`, non solo la sottostringa. Match ambigui vengono rifiutati. Le voci sono separate da `\n§\n`; un normale documento Markdown con titoli e append liberi non è automaticamente equivalente a questo formato. [S2–S3]

Le modifiche applicate sono scritte sul disco subito, ma non riscrivono a metà sessione il blocco congelato nel prompt: questo preserva il prefix cache. Nuove sessioni ricaricano i dati aggiornati. Chiudere una finestra o riavviare un gateway può riprendere la stessa sessione, quindi non equivale a `/new`. Un file aggiornato non prova che un agente già in esecuzione abbia ricevuto il nuovo snapshot. [S2–S3]

La persistenza implementa lock, rilettura prima della mutazione e scrittura atomica; rifiuta file esistenti illeggibili e drift che causerebbe perdita di contenuto. La deduplicazione evita aggiunte esattamente uguali. Scansioni per contenuti pericolosi si applicano sia alle nuove voci sia al caricamento: un elemento bloccato nel prompt può restare nel file per permetterne ispezione/rimozione. [S3]

Il budget è in **caratteri**, non token. Un `add` o `replace` oltre soglia fallisce; il tool non tronca silenziosamente i ricordi. Il modello deve accorciare/unire/rimuovere consapevolmente prima di riprovare. Il sorgente limita i tentativi falliti di consolidamento per turno, così una memoria piena non deve bloccare indefinitamente la risposta. File modificati esternamente oltre soglia vengono segnalati, non automaticamente tagliati. [S3]

### Consenso, proposte e verifica dell'esito

- `memory.write_approval: false` è il default. Con `true`, scritture foreground interattive possono avere approvazione inline; fuori da quel canale vengono accodate in `<HERMES_HOME>/pending/memory/<id>.json`.
- La review automatica non applica `replace`/`remove` senza intervento: li mette in pending anche quando il gate generale è spento. Le proposte fissano il contenuto bersaglio e sono rifiutate se quella voce è cambiata prima dell'approvazione.
- `/memory pending`, `/memory approve <id>` e `/memory reject <id>` sono superfici runtime documentate. `staged: true` è proposta persistita, non ricordo già applicato.
- `skills.write_approval` è un gate separato; quando attivo, le mutazioni skill sono sempre proposte da rivedere con `/skills pending` e `/skills diff <id>`.

Fonti contrattuali: [S2], [S10]. Nessuna frase dell'assistente «lo ricorderò» dimostra una scrittura riuscita: serve il risultato e la persistenza. Prima di diagnosticare un ricordo mancante verificare tool call applicata, eventuale pending, profilo giusto, target abilitato e snapshot della sessione.

## Apprendimento durante e dopo il lavoro

La review di **memoria** usa un contatore di turni utente: default `memory.nudge_interval: 10`. La review di **skill** usa invece iterazioni del lavoro/tool: il fallback `skills.creation_nudge_interval` è 10. Non sono «dieci chat» né una scansione continua di ogni file. Dopo una risposta non interrotta, quando è scattato un nudge e i relativi tool esistono, il finalizer può avviare una review su uno snapshot della conversazione. Può concludere che non c'è nulla da salvare. [S11]

La review ha un whitelist di tool e conserva la provenienza dei cambiamenti; non modifica la cronologia del turno principale. Il modello valuta fatti durevoli e correzioni: `USER.md` per l'utente, `MEMORY.md` per l'ambiente, skill per le procedure. Skill manuali, pinned, esterne o non adottate dal curator hanno protezioni distinte. `/refine [focus]` richiede questa review ora; `/learn <fonte/descrizione>` è invece un normale turno guidato che raccoglie materiale e crea/aggiorna una skill tramite `skill_manage`. [S7, S11]

Non ho identificato nel checkout un tool/comando core chiamato **`skilldistill`**: il nome non va usato come API. La distillazione documentata è il comportamento di `/learn` e della review, che può creare un `SKILL.md` snello e riferimenti tematici; un'eventuale integrazione omonima esterna richiede fonte e contratto separati.

### Controlli della review e costi

| Controllo | Default / significato verificato | Conseguenza per la futura UI |
|---|---|---|
| `auxiliary.background_review.enabled` | `true`; `false` disabilita i fork automatici, non il `/refine` esplicito | Separare apprendimento automatico e comando manuale |
| Provider/modello della review | `auto`: runtime principale; route differente usa digest | Niente promessa di costo nullo; memoria built-in nel prompt e review hanno costi diversi |
| Reasoning della review sullo stesso modello | Eredita quello del turno principale; override della review ignorato | Non mostrare un controllo indipendente inefficace |
| `max_input_tokens` | Se assente: 75% della finestra risolta, tetto 600.000; fallback 120.000. `<=0` illimitato | Budget cumulativo della review, non quantità di memoria conservata |
| `extra_tools` | Nessuno per default; devono già esistere sul parent | Non abilita strumenti arbitrari |
| `defer` / `defer_max_age_s` | `auto` / 1.800s, default del meccanismo: review sul managed llama-server rinviata all'idle | Stato queued distinto da done; coda in memoria non garantita dopo uscita processo |
| `display.memory_notifications` | `on`; `off`, `on`, `verbose`, override per piattaforma | Spegnere avvisi non spegne review o scritture; completed distinto da pending/rollback |

Default e comportamento: [S11–S12]. Non sono stati misurati tempi o costi effettivi. Il modello potrebbe non salvare un fatto o la review potrebbe essere annullata/saltata: la UI deve confermare l'azione realmente riuscita.

## Skill curator: manutenzione delle procedure, separata dalla memoria

Il **curator è un sottosistema core**, implementato in `agent/curator.py`, con comandi `hermes curator` e `/curator`: non serve inventare una skill `curator/SKILL.md`. Gestisce la libreria di procedure; non è il processo che aggiorna continuamente `MEMORY.md` o la personalità `SOUL.md`. [S8]

| Aspetto | Contratto verificato |
|---|---|
| Avvio automatico | Check di inattività in CLI/gateway/serve; non un cron job. Default abilitato, intervallo **168 ore**, idle **2 ore**. Prima osservazione registra il tempo e rinvia il primo passaggio di un intervallo. |
| Passaggio deterministico | `active → stale → archived`; default stale dopo **14 giorni**, archivio dopo **30 giorni** senza uso. Nessuna LLM necessaria per questo passaggio. |
| Consolidamento LLM | **Spento per default** (`curator.consolidate: false`). Opt-in o `run --consolidate`; può unire/patchare procedure gestite, preservando i file di supporto del package. |
| Quali skill | Flag di opt-in curator in `.usage.json`; la review automatica marca quelle create. Skill create foreground o via `/learn` non sono automaticamente curator-managed; `adopt` è distinto da paternità. |
| Esclusioni | Pinned, hub/esterne e protette. Bundled prune solo con `prune_builtins: true`, spento per default; questo non autorizza consolidamento LLM sui built-in. Skill usate dai cron sono protette dalle transizioni automatiche. |
| Archivi | `skills/.archive/`; recuperabili tramite `restore`. `archive_ttl_days: 0` significa nessun purge; purge è comando esplicito, non cancellazione automatica. |
| Stato e report | `skills/.curator_state`, telemetria `.usage.json`, report `logs/curator/<run>/run.json` e `REPORT.md`. Pausa/resume, run e dry-run sono azioni differenti. |
| Backup | Consolidamento mutante tenta snapshot in `skills/.curator_backups/`; default enabled, keep **2**. Prune-only non necessita snapshot perché sposta package interi in archivio. Backup automatico è best-effort nel codice, non garanzia che ogni run abbia un backup riuscito. |
| Ledger | `skills/.curator_ledger.jsonl`, actor/action e manifest before/after; blob per hash in `<HERMES_HOME>/.curator_backups/blobs/`. Default ledger on, limite **5MiB**; errori di telemetria non bloccano necessariamente la mutazione. Rollback verificato è un'azione distinta. |

Fonti: [S8], [S12–S13]. Le intestazioni/commenti vecchi di `curator_backup.py` descrivono un insieme di inclusioni più ampio: l'insieme di esclusioni effettivo e la documentazione aggiornata escludono `.archive`, ledger e hub dal ripristino globale. Non promettere snapshot infinito o riavvolgimento completo della storia.

## Richiamo della cronologia e compaction

`session_search` non richiede una LLM per produrre il risultato: restituisce messaggi reali da SQLite/FTS5. I quattro comportamenti sorgente sono discovery con `query`, scroll con `session_id` + `around_message_id`, read con solo `session_id`, browse senza argomenti. Esistono `profile`, filtri ruolo/tempo, esclusione di sessioni già lette, ranking e limiti. Il profilo corrente è il default; la lettura di altri profili deve essere indicata, non deriva dalla presenza di un id. [S5]

La pagina Memory dice «no truncation», ma **il sorgente attuale ha cap di contenuto e head/tail/finestre**, compreso `_READ_MAX_CONTENT = 2000` per messaggio nella read shape. Le sessioni `kanban`, `subagent` e `tool` sono nascoste dalla discovery; cron demoted. Il riepilogo non deve diventare «cerca ogni cosa senza limiti». Il testo originale può restare persistito anche quando una risposta di ricerca è ridotta. [S5]

La compaction serve a contenere il prompt: costruisce handoff e preserva una coda recente. Default: compression enabled, threshold configurato 0,50 ma con floor 0,75 per finestre sotto 512K, `tail_mode: lean`, `protect_last_n: 20`, `min_tail_user_messages: 1`; micro-compaction per-turn **off**. Non appiattire tutto a «compatta al 50%» e non dedurre perdita zero dal mantenimento di alcuni messaggi. [S6, S12]

Prima della compaction possono intervenire hook del provider. `compression.checkpoint_required` è **false** per default; con true servono checkpoint durevoli compatibili API v2 e successo prima della fase lossy. Un provider che supporta solo hook best-effort non diventa automaticamente checkpoint affidabile. Questo salvataggio e la review built-in post-turn sono meccanismi distinti. [S6, S9]

## Learning Journey e manutenzione visibile

`/journey` (alias learning/memory-graph) rappresenta nodi skill con segnali di apprendimento/uso e voci `MEMORY.md`/`USER.md`; non è un altro archivio che sostituisce i file. Il sorgente crea collegamenti dichiarati fra skill e collegamenti lessicali fra memoria e skill: non prova che il modello abbia «capito tutto». Nodi hanno id/fingerprint per limitare modifiche di elementi cambiati. Edit/delete della memoria e archiviazione delle skill hanno semantiche diverse. [S14]

L'upstream ha superfici sorgente per `/api/memory` (status provider e dimensioni built-in), `/api/learning/graph`, `/api/curator`, pausa e run, più API per SOUL del profilo. Lo status generale non equivale a un endpoint CRUD completo dei ricordi. Run restituisce un'azione avviata: occorre verificare l'action status, non presentare subito «memoria aggiornata». Autenticazione, profilo e versione devono essere verificati nella feature d'integrazione. [S15]

## Provider esterni: cosa aggiungono realmente

Core: `MemoryManager`/`MemoryProvider` coordinano inizializzazione, contesto statico, prefetch di recall, sync turn, tool dispatch, fine sessione, cambio sessione, shutdown e hook pre-compress. Sono hook opzionali: non tutti i provider li implementano tutti. Contesto richiamato va separato dal testo utente e da quello ricatturato, per evitare ricordi che si replicano da soli. [S9]

| Provider nel documento ufficiale | Estensione descritta | Dipendenza / confine |
|---|---|---|
| OpenViking | Knowledge tree, caricamento a livelli, estrazione alla session commit | Server configurato e identità user/peer corrette |
| Mem0 | Estrazione fatti, ricerca semantica, update/delete | Cloud, self-hosted HTTP o OSS; limiti di sync/testo e modello/embedding |
| Holographic | SQLite locale, FTS/trust, query compositive | Auto-extract **false** per default; capacità algebriche opzionali |
| RetainDB | Ricerca ibrida e profilo, tipi memoria e file ingest | Servizio cloud e API key |
| ByteRover | Knowledge tree locale, recall e estrazione pre-compaction | CLI/provider preparati; sync cloud opzionale |
| Honcho | User modeling, peer/session context e ragionamento | Plugin catalogo, cloud/self-hosted; mapping identità/profili non implicito |
| Hindsight | Retain/recall e reflect su knowledge graph | Plugin catalogo, cloud o installazione locale; contratto maintainer |
| Supermemory | Recall profilo, capture turni, ricerca semantica, container | Plugin catalogo; container e endpoint devono preservare isolamento |
| Memori | Capture strutturata e recall tool-aware | Integrazione esterna, non semplice comando core già disponibile |

Questa tabella è **documentazione upstream**, non collaudo dei plugin o raccomandazione d'installazione. I tre provider catalogo possono migrare fuori dal core e avere dipendenze/versioni proprie. Il documento Providers afferma genericamente «built-in always active», mentre codice e pagina Memory consentono di spegnere entrambi i built-in: l'esterno non forza la loro riattivazione. [S9, S12, S16]

## Conseguenze proposte per F9 e Spaces di Studio

Proposta da integrare nella scheda, **non implementata da questa ricerca**:

1. Distinguere nell'interfaccia **identità del Dot/profilo** (`SOUL.md`), **memoria del profilo** (`USER.md`/`MEMORY.md`), **memoria dello Space** (file Markdown del folder) e **cronologia della chat**. Mostrare provenienza e ambito, senza duplicare silenziosamente i built-in in un archivio Studio.
2. Per lo Space-folder, definire file di progetto leggibili come `AGENTS.md` e un documento memoria aggiornato secondo un contratto concordato: autore, evento di aggiornamento, revisione/ultimo esito e conflitti. Il nome/percorso di questo file e la sua lettura automatica sono un **adattamento Studio**, non capacità Hermes già provata per ogni `MEMORY.md`.
3. La personalità `SOUL.md` deve restare profilata; un `SOUL.md` nello Space non va spacciato per identity slot Hermes. Le istruzioni di progetto appartengono al contesto workspace.
4. Rendere visibili pending/applied/error, budget, nuova sessione vs snapshot in uso, sorgenti richiamate e eventuali provider. Esportazione di file non equivale a «ha ricordato».
5. Conservare le procedure nell'integrazione skills/F11, con review e curator accessibili per profilo. Non abilitare consolidamento o purge quando si apre la pagina memoria.
6. Prove future su profilo e cartelle sintetiche: write/read persistente, pending, conflitto, overflow, fresh session, recall, restart, worker/profile isolati e scope condiviso. Nessun test sul Second-Brain personale o avvio autonomo di curator durante questa fase.

## Fonti sorgente fissate alla SHA

I numeri di linea sono punti d'ingresso, non inviti a leggere dati runtime locali. I link GitHub fissano il codice studiato.

- **S1 — SOUL:** [`agent/prompt_builder.py`, `load_soul_md` L1587](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/prompt_builder.py#L1587), [`agent/system_prompt.py`, identità](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/system_prompt.py#L545).
- **S2 — Memory tool e gate:** [`tools/memory_tool.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/memory_tool.py#L35), in particolare `_background_delete_gate` e `load_on_disk_store`.
- **S3 — Store:** [`tools/memory_tool_store.py`, MemoryStore](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/memory_tool_store.py#L87): `load_from_disk`, `_mutate`, `add`, `replace`, `apply_batch`.
- **S4 — Context files:** [`agent/prompt_builder.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/prompt_builder.py#L1798), [`website/docs/user-guide/features/context-files.md`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/website/docs/user-guide/features/context-files.md).
- **S5 — Recall:** [`tools/session_search_tool.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/session_search_tool.py#L1), `_READ_MAX_CONTENT`, `_read_scoped`, `_dispatch`, `session_search`; [`hermes_state_common.py`, FTS schema L777](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/hermes_state_common.py#L777).
- **S6 — Compaction:** [`agent/conversation_compression.py`, `_pre_compress_memory_context` L2972](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/conversation_compression.py#L2972), [`agent/context_compressor.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/context_compressor.py).
- **S7 — Learn/skills:** [`website/docs/user-guide/features/skills.md`, /learn](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/website/docs/user-guide/features/skills.md#L116), [`agent/skill_commands.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/skill_commands.py), [`tools/skills_tool.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/skills_tool.py).
- **S8 — Curator:** [`agent/curator.py`, run L915](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/curator.py#L915), [`tools/skill_usage.py`, managed/adopt](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/skill_usage.py#L290), [`tools/skill_manager_guards.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/skill_manager_guards.py).
- **S9 — Providers core:** [`agent/memory_provider.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/memory_provider.py), [`agent/memory_manager.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/memory_manager.py), [`agent/agent_init.py`, `_init_memory` L1327](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/agent_init.py#L1327).
- **S10 — Pending:** [`tools/write_approval.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/write_approval.py#L65), `evaluate_gate` L201.
- **S11 — Learning review:** [`agent/turn_context.py`, nudge L745](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/turn_context.py#L745), [`agent/turn_finalizer.py` L747](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/turn_finalizer.py#L747), [`agent/background_review.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/background_review.py), [`agent/review_idle_queue.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/review_idle_queue.py).
- **S12 — Defaults:** [`hermes_cli/config_defaults.py`, compression L579](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/hermes_cli/config_defaults.py#L579), background review L814, memory L1314, skills L1451, curator L1501. Flag aggiuntivi defer/budget hanno fallback nel relativo modulo, non tutti una chiave esplicita nel dict defaults.
- **S13 — Recovery skill:** [`agent/curator_backup.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/curator_backup.py#L37), [`tools/skill_ledger.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/skill_ledger.py).
- **S14 — Journey:** [`agent/learning_graph.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/learning_graph.py), [`agent/learning_mutations.py`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/agent/learning_mutations.py).
- **S15 — Desktop-facing surface:** [`hermes_cli/web_routers/ops.py`, memory L488](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/hermes_cli/web_routers/ops.py#L488), [`hermes_cli/web_routers/status.py`, curator/graph L623](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/hermes_cli/web_routers/status.py#L623), [`hermes_cli/web_routers/profiles.py`, SOUL L993](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/hermes_cli/web_routers/profiles.py#L993).
- **S16 — Provider comparison:** [`website/docs/user-guide/features/memory-providers.md`](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/website/docs/user-guide/features/memory-providers.md), confronto L742 e isolamento L756. Dettagli provider riportati come documentazione, non audit delle repository esterne.

## Verifiche ancora necessarie

Versione del backend effettivamente collegato, schema/routing/auth API, fresh-session/reload e notifiche Desktop; prova di review/pending senza prompt personali; gestione dei provider installati e identità di ciascun Dot; protocollo per aggiornare i Markdown dello Space senza race o duplicazioni. Un file aggiornato, un tool visibile o un processo attivo non prova che tutto venga ricordato. Questo report non attiva alcuna feature, installazione o manutenzione.

## Precisazione Studio D30 — observer, non secondo archivio

[F8](../features/F8-hermes-native-features-and-observability.md) documenta la richiesta successiva dell'utente: preservare memoria/capacità del runtime e mostrarne aggiornamenti in Studio. Verifica sorgente alla stessa SHA: gateway `_wire_session_agent` inoltra background review via `review.summary {text}`; desktop `gateway-event/status.ts:175` proietta una riga system `review:` e `thread/system-message.tsx` la presenta come nota. Non è evento curator universale e non garantisce un mutation list/turn ID. Le notifiche rispettano off/on/verbose; il codice distingue staged e operazioni realmente applicate. `/api/memory` dà dimensioni **in byte** e provider, non contenuti; il viewer richiede un contratto scoped distinto. Osservato solo sorgente pubblico, nessun runtime/profilo personale letto o mutato.
