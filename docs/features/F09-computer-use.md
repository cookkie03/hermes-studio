# F09 — Computer use e controllo della macchina

## Confine delle prove

Stato: **documented, not implemented** (2026-10-04). Questa specifica descrive una futura slice di Hermes Studio; codice upstream disponibile non significa capability collegata nell’app. Evidenze: lettura del checkout sorgente `/Users/luca/.hermes/hermes-agent`, non esecuzione live, nessun prompt/configurazione/database personale. Riferimento autorevole: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). La versione remota può cambiare: prima di implementare fissare SHA e ripetere i contract test.

Leggere prima `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` e `desktop/hermes/README.md`. UI OpenDots scelta dall’utente; Hermes resta l’unico executor. Gli endpoint Studio sotto descritti sono **proposte**, non API esistenti.

## Obiettivo e casi d’uso

Osservare e autorizzare azioni reali su applicazioni, finestre, file e terminale attraverso Hermes, mantenendo chiaro host/destinazione e modo foreground/background. Un pannello strumenti non equivale a una desktop session remota o a una presa di controllo disponibile.

## Contratto runtime verificato

`computer_use` è registrato da `tools/computer_use_tool.py` e schema in `tools/computer_use/schema.py`. Azioni capture/click/double_click/right_click/middle_click/drag/scroll/type/key/set_value/wait/list_apps/list_windows/focus_app; modes som/vision/ax. Parametri targeting includono app/window/element/coordinate e delivery foreground/background secondo schema. Capture privo di side effects; schema dichiara approvazione per altre azioni salvo autoapproval runtime. Non inventare whitelist safeactions diversa dalla policy reale.

Output accessibility/screenshot e capacità variano da host e backend. Toolstartcomplete passano già bridge owned; Studio non possiede ancora computer backend/live desktop stream, takeover o ACL per Dot. Prima integrare eventi/risultati con scope, poi valutare controller se API ufficiale esiste e testata; non chiamare API arbitrarie dal renderer. Fonti `tools/computer_use/schema.py:18–203`, `tools/computer_use_tool.py:1–20`, package `tools/computer_use/`; `apps/desktop` UI/bridge come riferimento, senza attribuire feature non lette a questa build.

## Dominio, UX e stati

ComputerTarget {connection,host,profile,app?,window?}, CaptureReceipt, ActionRequest e Approval distinti. UI mostra target sempre prima di mutazione e differenzia capture ricevuta da action accepted/working/succeeded/failed/uncertain. Modal esplicita comando/destinazione/offeredchoice esatta; annullamento request rimuove pulsanti. Snapshot vecchia ha timestamp e non diventa stato corrente. “Prendi controllo” resta disabled finché contratto disponibile. Foreground focus visibile; pause Studio non implica runtimeinterrupt.

## Seam, ownership e dipendenze

Dipende F11 routing/identità, F07 capability e F01 approval/interrupt. Nuovi `desktop/hermes/computer.mjs`, fixtures, client `ComputerActivityView.tsx`; ComputerPanel condiviso con F08, ownership concordata prima parallelwork. Nessun secondo executor shell/osautomation. Prima slice visualizza capture e target/approvals da Hermes; azioni dirette UI solo tramite API ufficiale comprovata, non via toolname string generico.

## Privacy, migrazione e non-obiettivi

Test in profilo isolato e app sintetica; non richiedere/abilitare Accessibility o Screen Recording sul Mac personale durante docs/tests. Permission macOS è separata dal consenso azione e dall’authorizationruntime. Retention captures opt-in, niente full-frame archivio perpetuo per default. File e Terminal tooloutputs bounded con provenance; accesso filesystem editor distinto da computeruse. Non migrare permissionspill locali in ACL effettive. Remote desktop/session takeover, registrazione continua e controllo iPhone sono fuori scope iniziale.

## Accettazione e DoD

Fixture capture AX/vision/SOM, app/window mismatch, coordinatesobsolete, permissionsdenied, staleapproval, runtimecancel, nativeclose preserva lavoro e revoca leasesUI, foregroundfocus notification, uncertaindelivery no autoretry. Prova isolata actualhost esegue capture→azione approvata→capture conferma postcondizione; ack non prova successo. DoD: backendcapabilityprobe, UI target/provenance, meaningfulintegrationfixture+actualisolatedtest, screenshot/accessibility review e docs limiti.

## Prompt nuova chat

> Implementa F09 usando computer_use schema runtime e bridge owned, prima receipts/capture/approval target. Non aggiungere executor diretto o assumere takeover. Verifica supporto reale host+permissions e deliverymode; prova soltanto app/profilo sintetici autorizzati. Implementa failclosed scope/staleapproval e postconditionverification, completa DoD e persisti risultati senza screenshot personali.
