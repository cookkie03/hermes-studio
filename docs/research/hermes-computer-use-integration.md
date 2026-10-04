# Computer Use Hermes → Studio: verifica di integrazione

2026-10-04. Documentazione ufficiale online consultata e lettura del checkout pubblico SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`. Nessun prompt, driver, cattura desktop, doctor, installazione o modifica del profilo personale eseguiti. Le fonti online possono essere più recenti del pin; disponibilità sorgente non equivale a supporto del runtime collegato.

## Fonti primarie

- [Computer Use ufficiale](https://hermes-agent.nousresearch.com/docs/user-guide/features/computer-use/): integrazione built-in, host/sandbox, installazione, diagnosi, permessi e modalità.
- [Bot Screen](https://hermes-agent.nousresearch.com/docs/user-guide/features/bot-screen/): desktop del bot, visione live, controllo umano e lease; superficie distinta dal tool.
- [Registrazione](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/computer_use_tool.py), [schema](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/computer_use/schema.py), [executor](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/computer_use/tool.py), [backend](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/computer_use/cua_backend.py), [tool progress](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tui_gateway/tool_progress.py), [eventi](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tui_gateway/contracts/events.py).

## Cosa è verificato nel sorgente

| Contratto | Evidenza | Conseguenza Studio |
|---|---|---|
| Tool nativo | registry registra `computer_use`, toolset omonimo, schema/handler/check_fn; driver `cua-driver` via MCP stdio | Hermes resta executor. Non aggiungere un secondo Computer Use MCP/OS executor in Studio |
| Disponibilità | `check_computer_use_requirements`: darwin/win32/linux e binary disponibile, oppure placement terminal con probe driver differito | Check registro non prova display/permessi/driver attivo. Capability legata a host/profilo/placement |
| Azioni | capture, click/double/right/middle, drag, scroll, type, key, set_value, wait, list_apps/windows, focus_app; capture SOM/vision/AX | UI presenta azione e target reali; SOM/coordinate si riferiscono alla cattura corretta |
| Approvazioni | handler usa gate condiviso per mutazioni e focus; capture/wait/list sono read-only. Schema semplifica «all other actions» | Non inventare policy dalle descrizioni: preservare gate runtime F3, hard-block e manifest. Nessun auto-approve Studio |
| Risultati | string JSON oppure dict `_multimodal`, content text/image_url e text_summary; dedup può omettere immagine identica | Parse e rendering sicuri; immagine assente non sempre errore, screenshot vecchio marcato come tale |
| Eventi | tool.start/tool.complete per sessione, tool_id/name/args/result/summary; completion parse JSON con fallback | Correlare con host/profilo/sessione/tool_id. Trasporto completo dell’immagine fino al client ancora da provare |
| Host | driver sull’host/display del bot o sandbox terminal; placement gateway esplicito per backend senza display | Connessione SSH non concede controllo sul Mac client. Host/sandbox sempre visibili |
| Lease umano | handler controlla Bot Desktop lease prima di agire, anche capture; `human_has_control` nega l’azione | Riutilizzare il lease nativo per Bot Screen, non un interruttore UI senza effetto backend |

macOS richiede Accessibility e Screen Recording dell’identità driver indicata dalla diagnosi Hermes; non concederle automaticamente né presumere che il permesso Electron valga per il driver. Background/foreground e focus seguono la modalità richiesta e l’esito reale. Modelli tool-capable supportati dal wrapper; AX è testuale, catture vision/SOM richiedono gestione delle immagini o routing vision supportato.

## Gap reali nel client Studio

Ispezionati `desktop/upstream/src/client/ComputerPanel.tsx` e `desktop/hermes/bridge.mjs`:

- Pannello con sole tab Browser/Files/Terminal; filtri file e shell, nessuna vista Computer Use o renderer delle catture.
- Bridge inoltra tool events soltanto di sessioni possedute. Questo è necessario ma non prova che un turno reale esponga `computer_use`.
- Archivio tool events limita ogni evento a 65.536 byte e conserva fallback testuale per payload maggiori: il replay screenshot può perdere immagini. Il percorso live inoltra l’evento; limiti e caricamento media devono essere verificati end-to-end.
- Take over disabilitato. Nessun stream Bot Screen, controllo umano o diagnosi Computer Use UI provati.

## Incrementi e prove necessarie

[F16](../features/F16-computer-use.md) possiede:

A. Eventi/catture: pannello Computer Use dedicato, immagini/AX/target con timestamp, scope e capacità/readiness effettive. Test JSON/multimodal/grandi payload/replay/screen unchanged/offline/host errato.

B. Uso agente: toolset disponibile nel profilo isolato, richiesta dalla chat → capture → azione con gate backend → capture che dimostra la postcondizione. Prove diniego, permessi mancanti, target stale, consegna incerta e nessun retry automatico. Non basta evento tool.start o risposta «ho cliccato».

C. Bot Screen: solo dopo verifica del contratto nativo di streaming/input/control lease nella versione scelta. Visione live e takeover/handoff separati dalla timeline screenshot. Riutilizzare il backend Hermes, niente desktop/VNC parallelo introdotto solo per Studio; isolamento sessioni/display/grant da dimostrare.

F1 trasporto/host; F2 chat; F3 approvazioni; F11 toolset/diagnosi; F8 preservazione capability/eventi; F12 browser condiviso distinto. Computer Use non sostituisce browser_exec per navigazione di pagine/profili autenticati. Interruzione turno, lease umano e chiusura pannello sono operazioni diverse.

**Esito:** capacità Hermes documentata e presente nel sorgente; integrazione completa Studio mancante. Non certificati tool reale, screenshot end-to-end, azione o takeover nell’app. Questa verifica rafforza le schede, non implementa automaticamente F16.
