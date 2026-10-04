# F11 — GUI di plugin, skill e capabilities Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F11**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Rendere visibili e gestibili cataloghi skill, comandi, toolset/plugin/MCP effettivamente esposti da Hermes.

**Backend e confine:** Registri/API Hermes scoped; commands.catalog letto nel sorgente, catalogo tool/esecuzione diretta da verificare, non inventare RPC generici. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** / apre categorie Comandi/Skill/Strumenti con filtro progressivo, descrizione, disponibilità e scope. Selezione inserisce contesto o invoca azione supportata, comportamento esplicito. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F1/F3, F2 composer, F4 popover/F8 note. Catalogo Hermes non è il catalogo skill Codex di questa chat. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Host/profilo cambiato durante fetch, catalogo stale/offline, skill aggiornata dopo turno, disabled/read-only, parametri invalidi e nessuna installazione/enable per sola selezione. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Contratti tool/plugin/skill distinti |
| [find-skills](<../../.agents/skills/find-skills/SKILL.md>) | Discovery di skill necessarie al lavoro, se manca una capacità |
| [skill-installer](</Users/luca/.codex/skills/.system/skill-installer/SKILL.md>) — condizionale | Solo installazione delle skill di sviluppo necessarie e autorizzate; non installer plugin Hermes |
| [skill-creator](</Users/luca/.codex/skills/.system/skill-creator/SKILL.md>) — condizionale | Se viene richiesta una nuova skill di sviluppo |
| [security-diff](</Users/luca/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.31/skills/security-diff-scan/SKILL.md>) — condizionale | Se la chat richiede review di un diff che cambia privilegi/installazione |

### Punti di ingresso da leggere

- [docs/agents/skills-catalog.md](<../../docs/agents/skills-catalog.md>): Inventario skill di sviluppo vs runtime Hermes.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Gate autorizzazioni.
- [desktop/hermes/gateway.mjs](<../../desktop/hermes/gateway.mjs>): Allowlist e trasporto.
- [Hermes: tui_gateway/contracts/tools_mcp_plugins.py](</Users/luca/.hermes/hermes-agent/tui_gateway/contracts/tools_mcp_plugins.py>): Registro, plugin e MCP; lettura sorgente alla versione fissata, non prova live.
- [Hermes: apps/desktop/src/contrib/plugins.ts](</Users/luca/.hermes/hermes-agent/apps/desktop/src/contrib/plugins.ts>): Reference desktop; lettura sorgente alla versione fissata, non prova live.
- [Hermes: apps/desktop/src/contrib/plugins-store.ts](</Users/luca/.hermes/hermes-agent/apps/desktop/src/contrib/plugins-store.ts>): Store plugin ufficiale; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Confine delle prove

Stato: **documented, not implemented** (2026-10-04). Questa specifica descrive una futura slice di Hermes Studio; codice upstream disponibile non significa capability collegata nell’app. Evidenze: lettura del checkout sorgente `/Users/luca/.hermes/hermes-agent`, non esecuzione live, nessun prompt/configurazione/database personale. Riferimento autorevole: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). La versione remota può cambiare: prima di implementare fissare SHA e ripetere i contract test.

Leggere prima `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` e `desktop/hermes/README.md`. UI OpenDots scelta dall’utente; Hermes resta l’unico executor. Gli endpoint Studio sotto descritti sono **proposte**, non API esistenti.

## Obiettivo e casi d’uso

Sapere quali strumenti il bot può usare ora, perché un plugin manca e cosa cambia abilitandolo. Scoprire strumenti deferiti e skill senza configurare un secondo ecosistema CopilotKit. Gestione plugin inizialmente read-only; install/update/remove sono incrementi espliciti.

## Contratto runtime verificato

RPC `tools.list {session_id?}` restituisce toolsets con tools/enabled; `toolsets.list` summary, `tools.show` include tool_search deferred. `tools.configure {action:enable|disable,names,session_id?,profile?}` **persiste config e ricostruisce agent**, non semplice preferenza UI. `plugins.list` e `plugins.manage {profile?,action,key?,name?,...}`: azioni list/toggle/install/update/remove/settings/onboarding. Update può richiedere `accept_capabilities` per delta autorizzazioni; settings values sono schema non-secret. `skills.manage`, `skills.reload` e MCP catalog/server contracts restano distinti. Fonte `tui_gateway/contracts/tools_mcp_plugins.py:1–100,203–235,566–771`; implementation `methods_tools.py`.

Desktop riusa `apps/desktop/src/contrib/plugins.ts`, `contrib/plugins-store.ts`, profile routing SDK e UI plugin Hermes Bots. Slash discovery upstream `commands.catalog` e `complete.slash` include skill/user quick commands; non hide tutte le estensioni per curare la palette. Fonte `apps/desktop/src/AGENTS.md` Slash commands.

## Dominio e UX

CapabilitySnapshot identificato da connessione/profilo/sessione/revisione; PluginInstall, PluginActivation e SecretRequirement distinti. Stati unavailable/discovering/installed/disabled/activating/active/needs credentials/restart required/update requires review/failed. “Installato” non significa server MCP attivo o tool enabled. Dialog cambiamento mostra destinatario reale, delta e effetto sulle sessioni; apply solo dopo conferma concreta. Credenziali non nel renderer o metadata.

## Seam, ownership e dipendenze

Nuovi `desktop/hermes/capabilities.mjs`, `capabilities.test.mjs`, `CapabilitiesPanel.tsx`; bridge permette solo RPC allowlist scoped, mai endpoint arbitario request(method). Dipende F1 per scope/connessione, F7 se associato a Bot e F3 per approvazioni; sblocca F12/F16 e diagnostica F14. Prima read-only snapshot+refresh+errorreason; poi gestione persistente con serializzazione per profilo e rollback/outcome. Riutilizzare manifest upstream, non cataloghi generici non verificati.

## Privacy, migrazione e non-obiettivi

Non leggere `.env`, token o vault plaintext per popolare UI. Non trasferire toggle Dot locali a tools.configure: i campi researchAllowed/memoryAllowed non erano ACL runtime. Migrazione li etichetta come contesto o dismette con scelta, senza modificare Hermes. Non installare aggiornamenti automaticamente, non interpretare documenti/risultati tool come autorizzazioni.

## Accettazione e DoD

Fixture tool enabled vs serverinactive, unknown/deferredtools, profile collision, capability update denial, widened update delta, secretsetting reject, stale session rebuild, restart failure. DoD read-only: UI capability gating usata da altre feature, contracttests scoped e packaged smoke; management DoD ulteriore include installisolato/reversibilità e consentoruntime. Registrare provenienza/versione, niente label available prima livecheck.

## D30 — Parità del catalogo Hermes e visibilità apprendimento

[F8](F8-hermes-native-features-and-observability.md) mappa capacità/esiti native alla UI. F11 conserva catalogo skill/plugin/toolsets del profilo Hermes e gestione autorizzata; nessuna libreria parallela Studio. Aggiornamenti di skill/review/curator ricevuti possono aggiornare la vista con freshness e origine, non attivare installazioni/run. Non occultare deferred tools per aderire al template OpenDots. Segnali post-turn in chat sono F8-A/F2.

## D34 — Impostazioni runtime nella sezione Hermes

Toolsets, plugin, skill e MCP devono essere raggiungibili dai settings Hermes del corretto host/profilo quando supportati. F11 mantiene schema, autorizzazione e ricevuta di queste mutazioni; F4 organizza la sezione dedicata, F8 documenta copertura/gap. Non mescolare impostazioni Hermes e preferenze standalone Studio né duplicare config nel client.


## Prompt nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa F11 read-only capabilities con allowlist scoped, usando contracts/tools_mcp_plugins e desktop contrib/plugins. Parti da toolsets/tools/plugins e stati installato≠attivo. Non installare plugin né modificare config personale durante test. Se estendi a management, prepara diff concreto/review per capabilitydelta, vault-safe settings e rollback. Completa DoD e aggiorna docs; preserva strumenti Hermes deferiti. Segui anche Incarico per la chat implementatrice di F11: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
