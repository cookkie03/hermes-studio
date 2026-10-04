# Hermes runtime: contratto locale verificato nel sorgente

2026-10-04. Checkout locale `/Users/luca/.hermes/hermes-agent`, HEAD `1cb26bf248e150f715ce8a487fdef2a2bef6b541`. Solo lettura di sorgenti; nessuna credenziale/config privata/DB/conversazione letta e nessun test di rete eseguito durante questa ricerca. Le capacità seguenti sono documentate nel codice, non ancora convalidate live.

## Collegamento raccomandato

SwiftUI si collega direttamente allo stesso backend di Desktop e dashboard: WebSocket `/api/ws`, JSON-RPC 2.0, più REST per gli archivi di sessione. Non incorporare la dashboard come sostituto dell'interfaccia. Preferire attach-first a un backend già avviato; non avviarne o terminarne uno senza necessità. Discovery non è prova di disponibilità.

- `apps/desktop/electron/backend-discovery.ts:1–17,30–110`: ledger macchina `spawn-ledger.json`, purpose serve/dashboard, record non isolati e porte valide. Solo metadati di processo; health HTTP e token handshake validano l'attach.
- `hermes_cli/process_identity.py:133–140`: ledger sotto get_default_hermes_root, condiviso fra profili.
- `hermes_cli/web_routers/status.py:116–122`: GET `/api/health` → ok, version, displayVersion, auth_required.
- `hermes_cli/web_server_dashboard.py:108–128`: GET `/` in headless restituisce solo pagina token quando auth gate è spento; `window.__HERMES_SESSION_TOKEN__` e auth_required false. Token per processo, da mantenere solo in memoria e mai loggare.
- `hermes_cli/web_server_chat.py:250–374`: loopback ungated WS `/api/ws?token=...`; gated usa ticket monouso/access token con login. Non aggirare gate né cercare token nei file personali. Non confondere legacy process token con OAuth access token.
- `hermes_cli/web_server.py:364–374,478–493`: token sensibile REST tramite header `X-Hermes-Session-Token`; gated usa identità autenticata.

## WebSocket e metodi reali

`hermes_cli/web_routers/chat_ws.py:589–614` inoltra `/api/ws` a `tui_gateway.ws.handle_ws`. `tui_gateway/ws.py:365–370` invia `{"jsonrpc":"2.0","method":"event","params":{"type":"gateway.ready","payload":{"change_events":true,"heartbeat":true,"replay_epoch":...}}}`. Attendere questo frame prima di dichiarare collegamento pronto. `ws.py:420–423` gestisce `gateway.ping`. `tui_gateway/server.py:691–700` definisce event con `params.type`, `params.session_id`, `params.payload`. Un messaggio WS può contenere JSON con terminatore newline; parser preserva frame/eventi.

| Azione | Metodo e prove nel sorgente |
|---|---|
| Nuova sessione | `session.create` in `tui_gateway/methods_session.py:352–509`; params source desktop, profile opzionale, idempotency_key; risultato session_id runtime distinto da stored_session_id durevole, info.desktop_contract |
| Riprendere | `session.resume` :1050–1075; session_id durevole e profile. Il backend segue lineage/compressione e restituisce runtime corrente; non riutilizzare ciecamente runtime ID vecchio |
| Inviare | `prompt.submit` in `methods_prompt.py:657–719`, params session_id runtime e text; risposta RPC non equivale a completamento |
| Streaming | `prompt_turn.py:747–764` message.delta payload.text; `:1177–1179` message.complete. Contratto in contracts/events.py:184–199: text/status/error/failure_reason/usage. Il testo finale è autoritativo |
| Interrompere | `session.interrupt` in methods_session.py:2381–2412; params session_id; ack interrupted non è la stessa cosa del terminal event |
| Sessioni archiviate | REST GET `/api/sessions?limit=20&offset=0&order=recent&profile=...` in web_routers/sessions.py:177–194; GET `/api/sessions/{id}/messages?limit=100&order=latest&profile=...` :686–715. Lettura tramite backend, mai DB diretto |
| Approvazioni | `client.capabilities` methods_voice.py:444–451 abilita server_requests. Richiesta server→client JSON-RPC method approval con string id, params in contracts/server_requests.py:67–95; risposta sullo stesso id result.choice/all. server.py:810–845. Fallback approval.pending/received/respond in methods_prompt.py:1146–1179, exact request_id |

Approvazioni moderne **non sono un semplice approval.request event**: client deve distinguere risposta RPC, notification event e richiesta server con method+id. Pubblicare server_requests=true solo dopo che la UI risponde o declina i metodi supportati e gestisce request.cancel. Altrimenti il backend ritira richieste non gestibili anziché attendere per sempre. Non introdurre approvazioni automatiche.

## Ciclo di vita e isolamento

`hermes_cli/subcommands/dashboard.py:16–56,65–77`: `hermes serve --host 127.0.0.1 --port 0 --isolated`, nessuna SPA, no-open implicito; default 9119 se non si usa port0. Isolamento vero richiede anche HERMES_HOME dedicato e dati sintetici; non copia automatica di credenziali. `apps/desktop/README.md:96–99` documenta home throwaway. `web_server.py:1398–1408` readiness HERMES_BACKEND_READY port=N; `web_server_lifecycle.py:204–217` file ready opzionale HERMES_DESKTOP_READY_FILE.

`ws.py:459–470`: disconnessione chiude sessioni close_on_disconnect oppure distacca le altre verso grace-window orphan reaper. Non promettere che ogni lavoro continui illimitatamente dopo chiusura SwiftUI; verificare resume e continuità reale. Chiusura client ≠ richiesta session.interrupt. Il 24/7 resta non verificato.

## Primo incremento verificabile

1. Discovery metadati loopback o indirizzo esplicito; health + root handshake + gateway.ready, nessun prompt automatico.
2. Nuova sessione su click esplicito; mostra stored/runtime IDs correttamente, bozza resta locale fino a invio confermato.
3. Prompt sintetico autorizzato, streaming e final status/error; interruzione esplicita e riconnessione con resume durevole.
4. Approvals UI prima di esporre strumenti che ne necessitano; capability assenti restano disabilitate.

Non dichiarare successo chat in base al solo handshake. Nessuna modifica al runtime personale effettuata da questa ricerca.

## Transport Swift realizzato

`Sources/HermesCore/HermesRuntimeClient.swift`: actor URLSessionWebSocketTask, JSON-RPC Codable/Sendable, AsyncStream di eventi/richieste server, timeout per RPC e readiness, distinzione runtime/stored ID, invio/interruzione/resume su azione esplicita. Discovery legge soltanto metadati ledger, accetta loopback e filtra record isolati; connect verifica health, root handshake e gateway.ready. Nessuna credenziale persistita, nessun avvio processo o prompt automatico. HTTP redirects rifiutati per non inoltrare token. server_requests=false default; la UI deve gestire richieste prima di abilitarlo. Non supporta ancora login gated/remoto né riconnessione automatica. Eventi terminali restano autoritativi, ack submit non completa l'incarico.

Verifica: `swiftc -swift-version 6 -strict-concurrency=complete -sdk /Library/Developer/CommandLineTools/SDKs/MacOSX26.5.sdk ... -emit-module` passato. È verifica compilazione isolata, non prova handshake/chat live. Verifica sintetica separata affidata al verifier. Nessuna modifica al runtime personale.
