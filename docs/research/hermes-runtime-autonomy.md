# Hermes autonomo: lifecycle da verificare in F1

2026-10-04, D33. Solo sorgente upstream SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`; ricerca delegata richiesta dalla skill grilling. Nessuna connessione/test/configurazione/credenziale/DB personale letti.

## Fatti sorgente

- `tui_gateway/session_lifecycle.py:991-1048`: close_on_disconnect chiude subito; altrimenti transport detached e reaper. Flag accettato in `methods_session.py:426,661`.
- `tui_gateway/server.py:139-150`: grace default20s e attività stale600s. `session_lifecycle.py:847-870,932-963,976`: attività stream/API/tool heartbeat, delegazioni attive e turni freschi continuano detached; idle rimossi, turni stale possono essere interrotti. Disconnect non garantisce continuazione illimitata di qualunque turno.
- `hermes_cli/web_server.py:246-274`: ticker cron parte se is_desktop_owned_backend() è vero. `:90-104` ticker muore col backend; `:316-330` shutdown ferma ticker e termina gateway desktop-managed.
- `hermes_cli/gateway.py:2861,4651`: gateway nativo cron+messaging; comandi run/start/stop/restart/status/install; unit systemd `:3326-3327` con HERMES_SUPERVISED_CHILD=1 e Restart=always.
- `tui_gateway/server.py:386-417`: shutdown processo chiude sessioni, cleanup atexit.

## Conseguenze e gate proposti

Requisito D33: Hermes backend completo indipendente da Studio. Il connector deve distinguere backend web, gateway/scheduler/bots e sessioni. Riusare servizi nativi sull'host; ownership indipendente dal processo UI/SSH; nessun ticker client sostitutivo. Serve/WS vivo non prova servizi nativi operativi o turni durevoli. Verificare profilo, shutdown, disconnect, reaper, ripresa e scheduler separatamente con dati sintetici. Eventuali configurazioni/policy nuove richiedono contratto e ownership espliciti; questa ricerca non autorizza modifiche runtime personali.

Owner trasporto/lifecycle [F1](../features/F1-runtime-connection.md), continuità turno [F2](../features/F2-conversations.md), scheduling [F10](../features/F10-routines.md), bots [F7](../features/F7-bots-and-identities.md), parità/capacità [F8](../features/F8-hermes-native-features-and-observability.md). Nessuna durata24h o sopravvivenza di un turno al reboot provata.

## Ricerca SSH per la spec tecnica F1

Sorgente stessa SHA, nessuna esecuzione. `apps/desktop/electron/ssh-connection.ts:4-24,107,466-469`: OpenSSH/config/agent/ProxyJump, BatchMode e chiavi, non password GUI; host trust accept-new con blocco key-changed. `ssh-config.ts:84-123,136-174`: alias/Include e ssh-G metadata, non lettura delle chiavi private. `remote-lifecycle.ts:1150-1198,824-875`: spawn isolated setsid/nohup e kill owned alla disconnessione. `web_server.py:1352-1362` / `web_server_idle_exit.py:1-19,33`: watchdog idle900s, nessun auto-riavvio dall'updater. Non riusare questa policy per D33.

`hermes_cli/gateway.py:5329-5370,3775-3780,3718-3730,3763-3773`: start richiede unit installata. `:5246-5277` install --if-missing distinto; `:5219-5243` startup/start-now configurabili, default true headless. Nessun equivalente `serve install` trovato nelle superfici esaminate. Registrazione servizio gateway e supervisione serve sono scelta tecnica esplicita in spec/ADR0008 proposed, non autorizzazione dedotta dalla ricerca.
