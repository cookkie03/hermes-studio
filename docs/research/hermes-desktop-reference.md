# Desktop Hermes ufficiale: mappa di integrazione

Verificato il 2026-10-04 leggendo README, DESIGN e sorgenti del checkout locale. SHA: `1cb26bf248e150f715ce8a487fdef2a2bef6b541`. La pagina GitHub `main` è una fonte mobile, non il pin del contratto.

Fonte primaria: [NousResearch/hermes-agent/apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). Checkout osservato: `/Users/luca/.hermes/hermes-agent`; non è una dipendenza portabile da imporre agli altri sviluppatori. Prima di implementare ottenere una copia isolata alla versione concordata. Nessun dato personale letto per questa ricerca.

## Cosa riusare come riferimento

Il desktop ufficiale separa Electron, renderer React e runtime Hermes. Il runtime espone il gateway JSON-RPC/WebSocket; `apps/shared` è usato anche dalla dashboard. Electron controlla avvio, risoluzione e validazione del backend e le capacità native. Questa divisione aiuta Studio a mantenere Hermes come unico esecutore e a delimitare i privilegi del client.

Le modalità bundled, bootstrap e remote hanno responsabilità diverse: un payload bundled danneggiato non va sostituito silenziosamente con un checkout trovato sul PATH. L'installazione gestita è una scelta distinta dal collegamento a un runtime già esistente. Non trasferire automaticamente a Studio le promesse del desktop ufficiale.

## Mappa delle schede e delle fonti

| Area | File nel repository Hermes | Scheda Studio |
|---|---|---|
| Risoluzione, probe, autenticazione, ownership processo | `apps/desktop/electron/main.ts`, moduli discovery/probe; `apps/shared` | F11 |
| Conversazione ed eventi | `apps/desktop/src/lib`, contratti `tui_gateway` | F02, F16 |
| Bot canonici e messaggi | `tools/bot_mode_dm.py`, contratti bot relay e gruppi | F04, F05 |
| Delega e recupero cronologia | `tools/delegate_tool.py`, `tools/session_search_tool.py` | F05 |
| Routine e run | `apps/desktop/src/api/cron.ts`, `hermes_cli/web_routers/cron.py`, `tools/cronjob_tools.py` | F06 |
| Plugin e strumenti | Registro e contratti citati nella scheda; verificare installazione e abilitazione separatamente | F07 |
| Browser e computer use | Controller e capability citati nelle rispettive schede | F08, F09 |
| File e terminale | Bridge nativo e contratti host; non sostituire con accesso locale implicito | F10, F17 |
| Packaging e distribuzione | `apps/desktop/BUILDING.md`, script e pipeline upstream | F12 |

I percorsi puntuali e le verifiche dei contratti sono nelle schede e in [runtime-integration-findings](runtime-integration-findings.md). I nomi non garantiscono compatibilità: verificare schema, autorizzazione, eventi ed errori alla versione scelta.

## Differenza rispetto alla baseline Studio

Studio oggi ha un attach locale loopback parziale. Il probe live ha confermato health/ready senza inviare prompt. Remoto, OAuth, installazione del runtime e import della cronologia personale non sono dimostrati. In remoto file, terminale e strumenti operano sull'host Hermes: il Mac che visualizza la UI non è automaticamente il computer controllato.

`DESIGN.md` è utile per pane persistenti, ritorno al contesto dopo Settings, azioni coerenti fra tastiera e UI, notifiche senza furto del focus. La composizione visiva di Studio resta quella scelta dall'utente: OpenDots con componenti Unsloth/Codex. Nessun fork o sincronizzazione degli aggiornamenti è pianificato.
