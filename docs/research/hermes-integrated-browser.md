# Browser Hermes integrato — evidenze e gap

Ricerca sorgente 2026-10-04, checkout pubblico SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`. Nessuna sessione/browser/config personale letta o avviata. [Requisito F08](../features/F08-browser.md) distinto da capacità Studio attuale.

| Percorso upstream | Evidenza | Cosa non dimostra |
|---|---|---|
| `apps/desktop/src/app/chat/right-rail/preview-pane.tsx` | webview `persist:hermes-preview`, sandbox/contextIsolation, navigazione e callback pagina/input | Stesso browser dei tool browser_* o history durevole in Studio |
| `tools/read_preview_tool.py`, `drive_preview_tool.py` | tool desktop_ui esistenti, callback desktop-sourced read/act; azioni elementi/click/type/scroll/press/navigation | Callback automaticamente disponibili nell'attuale bridge |
| `tools/browser_extension_router.py` | routing del controller con binding scope; errori su lane controllata non trasferiscono automaticamente l'azione | Browser visibile solo perché esistono risultati tool; fallback legacy possibile prima della registrazione della lane |
| `gateway/browser_control_broker.py`, `tui_gateway/methods_browser_control.py` | protocollo v1, owner/server identity, capabilities, register/heartbeat/result/detach; extension_control OFF per default | Gateway anonimo loopback abilitato al controller; evaluate/CDP senza Developer Mode |
| `tools/browser_tool_cdp.py` | CDP URL configurata evita avvio locale/cloud alternativo; risoluzione websocket via json/version | Compatibilità/isolamento del webview Electron o grant a Mac da runtime remoto |

Proposta: collegare un solo browser/profilo a utente e tool, prima con prova verticale. Riutilizzare controller/callback/CDP esistenti in base alla versione collegata. Non scegliere un trasporto solo perché compila; non attivare config globali, installare estensioni o leggere cookie personali durante la ricerca.

Fonti pubbliche fissate: [preview-pane](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/apps/desktop/src/app/chat/right-rail/preview-pane.tsx), [drive_preview](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/drive_preview_tool.py), [router](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/browser_extension_router.py), [broker](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/gateway/browser_control_broker.py), [CDP](https://github.com/NousResearch/hermes-agent/blob/e1e82d782f353766c7a22db6e5ac4fa58bbff325/tools/browser_tool_cdp.py).

Gate richiesto: stesso DOM/schede/profilo; persistenza cookie/storage/history al restart; takeover e lease; autenticazione/capability; remoto non equivale a browser locale. Non eseguiti in questa ricerca.
