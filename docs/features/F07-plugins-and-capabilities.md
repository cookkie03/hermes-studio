# F07 — Plugin, skill e capacità reali

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

Nuovi `desktop/hermes/capabilities.mjs`, `capabilities.test.mjs`, `CapabilitiesPanel.tsx`; bridge permette solo RPC allowlist scoped, mai endpoint arbitario request(method). Dipende F04/F11 e F01 approvazioni; sblocca F08/F09 e diagnostica F05. Prima read-only snapshot+refresh+errorreason; poi gestione persistente con serializzazione per profilo e rollback/outcome. Riutilizzare manifest upstream, non cataloghi generici non verificati.

## Privacy, migrazione e non-obiettivi

Non leggere `.env`, token o vault plaintext per popolare UI. Non trasferire toggle Dot locali a tools.configure: i campi researchAllowed/memoryAllowed non erano ACL runtime. Migrazione li etichetta come contesto o dismette con scelta, senza modificare Hermes. Non installare aggiornamenti automaticamente, non interpretare documenti/risultati tool come autorizzazioni.

## Accettazione e DoD

Fixture tool enabled vs serverinactive, unknown/deferredtools, profile collision, capability update denial, widened update delta, secretsetting reject, stale session rebuild, restart failure. DoD read-only: UI capability gating usata da altre feature, contracttests scoped e packaged smoke; management DoD ulteriore include installisolato/reversibilità e consentoruntime. Registrare provenienza/versione, niente label available prima livecheck.

## Prompt nuova chat

> Implementa F07 read-only capabilities con allowlist scoped, usando contracts/tools_mcp_plugins e desktop contrib/plugins. Parti da toolsets/tools/plugins e stati installato≠attivo. Non installare plugin né modificare config personale durante test. Se estendi a management, prepara diff concreto/review per capabilitydelta, vault-safe settings e rollback. Completa DoD e aggiorna docs; preserva strumenti Hermes deferiti.
