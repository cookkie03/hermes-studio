# F08 — Browser, ricerca e controllo scoped



<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Verificare browser tool vs controller |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Lease e scope del browser |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [ux-extract](<../../.agents/skills/ux-extract/SKILL.md>) — condizionale | Solo osservazioni del browser panel che mancano |

### Punti di ingresso da leggere

- [docs/features/F11-runtime-connection.md](<../../docs/features/F11-runtime-connection.md>): Autenticazione necessaria al controller.
- [docs/features/F16-permissions-and-approvals.md](<../../docs/features/F16-permissions-and-approvals.md>): Permessi.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Pannello corrente.
- [desktop/electron/external-links.cjs](<../../desktop/electron/external-links.cjs>): Apertura URL protetta.
- [Hermes: tools/browser_tool.py](</Users/luca/.hermes/hermes-agent/tools/browser_tool.py>): Tool browser; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tui_gateway/methods_browser_control.py](</Users/luca/.hermes/hermes-agent/tui_gateway/methods_browser_control.py>): Controller e gates; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Confine delle prove

Stato: **documented, not implemented** (2026-10-04). Questa specifica descrive una futura slice di Hermes Studio; codice upstream disponibile non significa capability collegata nell’app. Evidenze: lettura del checkout sorgente `/Users/luca/.hermes/hermes-agent`, non esecuzione live, nessun prompt/configurazione/database personale. Riferimento autorevole: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). La versione remota può cambiare: prima di implementare fissare SHA e ripetere i contract test.

Leggere prima `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` e `desktop/hermes/README.md`. UI OpenDots scelta dall’utente; Hermes resta l’unico executor. Gli endpoint Studio sotto descritti sono **proposte**, non API esistenti.

## Obiettivo e casi d’uso

Seguire ricerca reale Hermes nel pannello Computer, leggere fonti e aprirle, capire se l’agente controlla un browser remoto o locale. Distinguere tool browser runtime, visualizzazione manuale di URL e controller desktop. L’attuale app mostra solo activity/readresult e non un browser live; ADR0004 WebKit appartiene alla baseline SwiftUI, non prova controllo del renderer Electron.

## Contratto verificato e gap

Tool browser registrati: browser_navigate, browser_snapshot, browser_click, browser_type, browser_scroll (up/down), browser_back, browser_press, browser_get_images, browser_vision, browser_console; schema e prerequisiti in `tools/browser_tool.py:474–610,1365`, runtime/CDP in `tui_gateway/methods_browser.py`. `tool.start/complete` ha tool_id/name/args/result; vedere link o tool name non conferma un viewport live.

Controller RPC `browser.controller.register {session_id,controller_id,browser_profile_id,capabilities?,protocol_version?}`, `.result {session_id,command_id,ok,result?,error?}`, `.heartbeat`, `.detach`. Scope server-derived principal/profile/session/controller/browserprofile/transport; client principal_id ignorato. **Richiede authenticated non-internal identity**, flag/protocol e capability gates; register failclosed4403. Il gateway anonimo attach oggi usato da Studio non dà questa capability automaticamente. Fonti `contracts/groups_bot_relay.py:577–638`, `methods_browser_control.py:149–208`, `gateway/browser_control_broker.py`. Studiare anche `apps/desktop` browser adapters prima di costruire un controller alternativo.

## Dominio, UX e seam

BrowserActivity, SourceReceipt, BrowserView e ControllerLease separati. Stati tool-working/source-received/view-unavailable, controllerconnecting/owned/expired/disconnected; takeover non disponibile finché lease/autorizzazione non provati. Una preview URL può essere aperta esternamente con sourceURL allowlist, non in iframe arbitrario nella privileged UI. Primo incremento: render risultati/fonte/screenshot runtime con provenienza. Controller visuale è fase separata subordinata a F11 autenticazione e F07 capability. Nuovi `desktop/hermes/browser.mjs`, tests e client `BrowserActivityView.tsx`; ComputerPanel changes concordate. Non disabilitare Electron sandbox/CSP/navigationguard per farlo funzionare.

## Privacy, migrazione e non-obiettivi

Profilo browser esplicito isolato; nessuna adozione automatica Chrome personale/cookie/download. Screenshot possono contenere dati sensibili: retention e redaction dichiarate, non archiviare tutte le frame. Tenere ownership sessione e lease; cambiare Dot revoca vecchio controller. Tool events storici restano receipts, non browser riaperto. Browser/search via Hermes continua anche quando Studio non ha controller; non promettere takeover da un pulsante.

## Accettazione e DoD

Test fixture toolresults/sourceURL/screenshot/malformed URL, private session dropped, controllerunauth rejected, principal spoofignored, stalecommand reject, heartbeat expiry, cleanup su nativeclose e session switch. Isolated actual browser proverà navigate→snapshot→clic→result con fonte e stop; gate controller richiede transport authenticated supportato. DoD: slice dichiarata (receipts o livecontroller), realcapabilitygating, scopedtests, packagedview+screenshot, no unrelated cookies/files.

## Prompt nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa F08 per slice receipts browser/source e preview supportata. Verifica schema/browser mode upstream, non simulare live viewport o takeover. Controller successivo deve passare authenticated non-internal lease gate e failclosed4403, con profilo browser isolato. Mantieni CSP/sandbox e sourceURL allowlist; testa cleanup, privacy, actualbrowsercontract quando autorizzato. Aggiorna DoD e documentazione.
