# F07 — Plugin, skill e capacità reali



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
- [docs/features/F16-permissions-and-approvals.md](<../../docs/features/F16-permissions-and-approvals.md>): Gate autorizzazioni.
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

Nuovi `desktop/hermes/capabilities.mjs`, `capabilities.test.mjs`, `CapabilitiesPanel.tsx`; bridge permette solo RPC allowlist scoped, mai endpoint arbitario request(method). Dipende F11 per scope/connessione, F04 se associato a Bot e F16 per approvazioni; sblocca F08/F09 e diagnostica F05. Prima read-only snapshot+refresh+errorreason; poi gestione persistente con serializzazione per profilo e rollback/outcome. Riutilizzare manifest upstream, non cataloghi generici non verificati.

## Privacy, migrazione e non-obiettivi

Non leggere `.env`, token o vault plaintext per popolare UI. Non trasferire toggle Dot locali a tools.configure: i campi researchAllowed/memoryAllowed non erano ACL runtime. Migrazione li etichetta come contesto o dismette con scelta, senza modificare Hermes. Non installare aggiornamenti automaticamente, non interpretare documenti/risultati tool come autorizzazioni.

## Accettazione e DoD

Fixture tool enabled vs serverinactive, unknown/deferredtools, profile collision, capability update denial, widened update delta, secretsetting reject, stale session rebuild, restart failure. DoD read-only: UI capability gating usata da altre feature, contracttests scoped e packaged smoke; management DoD ulteriore include installisolato/reversibilità e consentoruntime. Registrare provenienza/versione, niente label available prima livecheck.

## D30 — Parità del catalogo Hermes e visibilità apprendimento

[F18](F18-hermes-native-features-and-observability.md) mappa capacità/esiti native alla UI. F07 conserva catalogo skill/plugin/toolsets del profilo Hermes e gestione autorizzata; nessuna libreria parallela Studio. Aggiornamenti di skill/review/curator ricevuti possono aggiornare la vista con freshness e origine, non attivare installazioni/run. Non occultare deferred tools per aderire al template OpenDots. Segnali post-turn in chat sono F18-A/F02.

## Prompt nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa F07 read-only capabilities con allowlist scoped, usando contracts/tools_mcp_plugins e desktop contrib/plugins. Parti da toolsets/tools/plugins e stati installato≠attivo. Non installare plugin né modificare config personale durante test. Se estendi a management, prepara diff concreto/review per capabilitydelta, vault-safe settings e rollback. Completa DoD e aggiorna docs; preserva strumenti Hermes deferiti.
