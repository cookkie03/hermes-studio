# F16 — Computer use e controllo della macchina



<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Schema computer use e host supportato |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Target e ricevuta azione distinti |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [security-diff](</Users/luca/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.31/skills/security-diff-scan/SKILL.md>) — condizionale | Se è richiesta review del diff sui privilegi o targeting |

### Punti di ingresso da leggere

- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Approvazioni.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Superficie condivisa.
- [desktop/electron/preload.cjs](<../../desktop/electron/preload.cjs>): Privilegi esposti.
- [Hermes: tools/computer_use/schema.py](</Users/luca/.hermes/hermes-agent/tools/computer_use/schema.py>): Target e azioni; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/computer_use_tool.py](</Users/luca/.hermes/hermes-agent/tools/computer_use_tool.py>): Registrazione del tool; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Confine delle prove

Stato: **documented, not implemented** (2026-10-04). Questa specifica descrive una futura slice di Hermes Studio; codice upstream disponibile non significa capability collegata nell’app. Evidenze: lettura del checkout sorgente `/Users/luca/.hermes/hermes-agent`, non esecuzione live, nessun prompt/configurazione/database personale. Riferimento autorevole: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). La versione remota può cambiare: prima di implementare fissare SHA e ripetere i contract test.

Leggere prima `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` e `desktop/hermes/README.md`. UI OpenDots scelta dall’utente; Hermes resta l’unico executor. Gli endpoint Studio sotto descritti sono **proposte**, non API esistenti.

## Obiettivo e casi d’uso

Osservare e autorizzare azioni reali su applicazioni, finestre, file e terminale attraverso Hermes, mantenendo chiaro host/destinazione e modo foreground/background. Un pannello strumenti non equivale a una desktop session remota o a una presa di controllo disponibile.

## Requisito esplicito — Computer Use nativo utilizzabile da Studio

Il tool `computer_use` già presente in Hermes deve essere utilizzabile dai Dots nelle chat Studio sul rispettivo host/display autorizzato, con catture, azioni, approvazioni e risultati visibili. Non basta elencarlo tra le capability. [Verifica sorgente e gap Studio](../research/hermes-computer-use-integration.md), SHA e1e82d7; [documentazione ufficiale](https://hermes-agent.nousresearch.com/docs/user-guide/features/computer-use/).

### Incrementi selezionabili

- **F16-A — Osservazione:** superficie Computer Use nel pannello, target/host/sandbox, capture SOM/vision/AX, screenshot e timestamp, azioni ed esiti nella chat. Il pannello attuale Browser/Files/Terminal non la implementa. Supportare JSON e risultati multimodali; verificare grandi payload e replay, perché il bridge archivia solo fallback testuale oltre 64 KiB.
- **F16-B — Percorso agente completo:** toolset e driver sul backend scelto, richiesta in chat → capture → azione approvata → capture di verifica. Hermes esegue l’azione e applica la policy; Studio rende visibili scelta e risultato, anche quando negati/uncertain. Probe disponibile non equivale a driver/display/permessi operativi.
- **F16-C — Bot Screen live e controllo umano:** riuso della funzione nativa [Bot Screen](https://hermes-agent.nousresearch.com/docs/user-guide/features/bot-screen/), dopo verifica dei contratti stream/input/lease della versione collegata. Nessuno stream promesso dal solo screenshot; nessun secondo executor o desktop parallelo. Rispetto `human_has_control`, takeover e restituzione controllo reali, con prove isolate.

Il computer è quello del bot: gateway locale o sandbox/display del terminal backend. Collegare un host SSH non dà accesso al Mac di Studio. Per macOS verificare permessi del driver, distinti da quelli Electron. Browser web/profili autenticati rimangono F12 e tool browser Hermes; F16 non li rimpiazza.

## Contratto runtime verificato

`computer_use` è registrato da `tools/computer_use_tool.py` e schema in `tools/computer_use/schema.py`. Azioni capture/click/double_click/right_click/middle_click/drag/scroll/type/key/set_value/wait/list_apps/list_windows/focus_app; modes som/vision/ax. Parametri targeting includono app/window/element/coordinate e delivery foreground/background secondo schema. Capture è read-only. Lo schema descrive genericamente approvazioni per le altre azioni, ma l’handler applica il gate condiviso alle mutazioni/focus, mentre wait/list sono read-only: preservare la policy effettiva, hard-block e lease Hermes senza inventare whitelist o autoapproval Studio.

Output accessibility/screenshot e capacità variano da host e backend. Toolstartcomplete passano già bridge owned; Studio non possiede ancora computer backend/live desktop stream, takeover o ACL per Dot. Prima integrare eventi/risultati con scope, poi valutare controller se API ufficiale esiste e testata; non chiamare API arbitrarie dal renderer. Fonti `tools/computer_use/schema.py:18–203`, `tools/computer_use_tool.py:1–20`, package `tools/computer_use/`; `apps/desktop` UI/bridge come riferimento, senza attribuire feature non lette a questa build.

## Dominio, UX e stati

ComputerTarget {connection,host,profile,app?,window?}, CaptureReceipt, ActionRequest e Approval distinti. UI mostra target sempre prima di mutazione e differenzia capture ricevuta da action accepted/working/succeeded/failed/uncertain. Modal esplicita comando/destinazione/offeredchoice esatta; annullamento request rimuove pulsanti. Snapshot vecchia ha timestamp e non diventa stato corrente. “Prendi controllo” resta disabled finché contratto disponibile. Foreground focus visibile; pause Studio non implica runtimeinterrupt.

## Seam, ownership e dipendenze

Dipende F1 routing/identità, F11 capability e F3 approval, con F2 per interruzione del turno. Nuovi `desktop/hermes/computer.mjs`, fixtures, client `ComputerActivityView.tsx`; ComputerPanel condiviso con F12, ownership concordata prima parallelwork. Nessun secondo executor shell/osautomation. Prima slice visualizza capture e target/approvals da Hermes; azioni dirette UI solo tramite API ufficiale comprovata, non via toolname string generico.

## Privacy, migrazione e non-obiettivi

Test in profilo isolato e app sintetica; non richiedere/abilitare Accessibility o Screen Recording sul Mac personale durante docs/tests. Permission macOS è separata dal consenso azione e dall’authorizationruntime. Retention captures opt-in, niente full-frame archivio perpetuo per default. File e Terminal tooloutputs bounded con provenance; accesso filesystem editor distinto da computeruse. Non migrare permissionspill locali in ACL effettive. Bot Screen/takeover nativo è incremento F16-C separato, da verificare; registrazione continua, desktop remoti arbitrari e controllo iPhone fuori scope iniziale.

## Accettazione e DoD

Fixture capture AX/vision/SOM, app/window mismatch, coordinatesobsolete, permissionsdenied, staleapproval, runtimecancel, nativeclose preserva lavoro e revoca leasesUI, foregroundfocus notification, uncertaindelivery no autoretry. Prova isolata actualhost esegue capture→azione approvata→capture conferma postcondizione; ack non prova successo. DoD: backendcapabilityprobe, UI target/provenance, meaningfulintegrationfixture+actualisolatedtest, screenshot/accessibility review e docs limiti.

## Prompt nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa soltanto F16-A/B/C selezionato, leggendo docs/research/hermes-computer-use-integration.md e Computer Use/Bot Screen ufficiali, usando computer_use schema runtime e bridge owned, prima receipts/capture/approval target. Non aggiungere executor diretto o assumere takeover. Verifica supporto reale host+permissions e deliverymode; prova soltanto app/profilo sintetici autorizzati. Implementa failclosed scope/staleapproval e postconditionverification, completa DoD e persisti risultati senza screenshot personali.
