# F1 — Connessioni Hermes e autonomia: spec tecnica

2026-10-04. Stato: proposta tecnica per review; scelte di prodotto D32/D33 confermate dopo Q8. Nessuna implementazione avviata. Base Studio `de9dc39f313acf83790e26cff18202b7eb0782d8`; sorgente Hermes fissato `e1e82d782f353766c7a22db6e5ac4fa58bbff325`.

## Risultato e ambito

Studio macOS collega Hermes locale senza login e host SSH (primo caso Linux/Minisforum su Tailscale), con IP/accesso macchina. Gestisce più connessioni e lega le conversazioni al loro host. Riconnette automaticamente; riusa backend/servizi presenti oppure li avvia quando necessario. Hermes completo resta autonomo con Studio/tunnel chiusi. Password solo in memoria fino a quit/disconnessione esplicita. Requisiti Space/progetti e chat/settings completi sono nelle schede proprietarie, non codice di questo incremento.

UI: area Connessioni nel contenitore Settings esistente, distinta dalle preferenze Studio; elenco host con nome/modalità/indirizzo e stati. Aggiunta SSH con nome/IP o alias, user e porta; chiavi/config/agent OpenSSH riconosciuti automaticamente, password come alternativa. Mostrare host di ogni conversazione. Nuova conversazione non invia prompt e non apre sessione Hermes automaticamente. La scelta dell'host precede il primo binding; dopo binding resta fissa. Un host offline conserva chat/bozze e ultima osservazione.

## Approcci confrontati

1. **OpenSSH di sistema + gestione servizi sull'host (raccomandato):** riusa configurazione, agent, chiavi hardware e ProxyJump, coerente con upstream. Serve un canale password/host-key GUI e gestione lifecycle durevole distinta dai tunnel.
2. Libreria SSH embedded: interazione password più diretta, ma replica config/agent/known_hosts e aumenta il contratto di credenziali/dependency; non scelta per il primo incremento.
3. Backend HTTPS remoto con OAuth: percorso valido futuro, ma non soddisfa il caso SSH senza login Hermes scelto qui.

Non copiare il lifecycle SSH isolato upstream: termina backend owned alla disconnessione e usa watchdog idle; setsid/nohup non è supervisione. [Evidenze lifecycle](../research/hermes-runtime-autonomy.md).

## Module e contratti proposti

- `RuntimeConnections` in `desktop/hermes/connections.mjs`: registro versionato, bridge per host, thread→connectionId, auto-reconnect/cancel, routing eventi e richieste. Snapshot `runtime-connections.json`; binding dei bridge in `hermes-connections/<connectionId>.json`, legacy locale letto da `hermes-sessions.json` e preservato. Interface dominio, mai RPC/exec generici esposti al renderer.
- `SshConnection` in `desktop/hermes/ssh.mjs`: OpenSSH/config/agent, tunnel loopback, exec interno di soli comandi bootstrap fissi; auth volatile, host-key challenge, timeout e cleanup. `.close()` elimina solo tunnel/processi SSH client.
- `HostBackend` in `desktop/hermes/host-backend.mjs`: discovery/probe e servizio web Hermes persistente; verifica gateway nativo cron/bots separatamente. Launcher remoto in `desktop/hermes/host-bootstrap.py`, inviato via stdin SSH, versionato e non derivato da testo utente.
- `HermesBridge` rimane owner delle sessioni/turni/approvals per un singolo backend. `HermesGateway` rimane handshake/HTTP/WS e non possiede SSH o servizi. F1 modifica solo gli ingressi di Chat per binding/stato host; timeline/composer F2 preservati.

Identità persistenti: Connection `{id,name,mode,host?,user?,port?,endpoint?,autoConnect}`; ThreadBinding `{threadId,connectionId}` e binding sessione per connessione. Password/passphrase/process token non entrano nello snapshot. IP non è l'identità stabile; la fingerprint SSH valida il server. Un projectId/sessionId uguale su due host resta distinto.

Interface manager: `initialize()`, `list()`, `saveConnection(input)`, `connect(connectionId,{password?})`, `disconnect(connectionId)`, `bindThread(threadId,connectionId)`, `status(threadId?)`, `threadHost(threadId)`, `session/history/send/interrupt/registerHandler` con routing dal thread, `approval({threadId,requestId,result})`, `close()`. Eventi annotati connectionId/threadId; status globale non alimenta lo stato di una chat su un altro host.

REST private Studio proposto: GET/POST `/hermes/connections`; POST `/:id/connect`, `/:id/disconnect`; GET/POST `/:id/challenges`; GET/PUT `/hermes/thread-host?threadId`; status/history/SSE esistenti scoped dal thread. Challenge one-shot, connessione/generazione e durata definite; una risposta stale non può approvare un host diverso. Le approvals Hermes mantengono requestId e owner reale, senza collisioni fra host.

## SSH, segreti e host key

Usare `/usr/bin/ssh` tramite argv validati, non interpolazione shell dell'IP/user/porta. Prima tentare chiavi/config/agent; password/passphrase via SSH_ASKPASS con helper fisso e socket Unix privato temporaneo, directory0700/socket0600. Il helper contiene solo codice, nessun segreto; niente password in argv, env, log, JSON persistente o stderr inoltrato al renderer. Invalidate challenge/password alla disconnessione esplicita o quit. Riconnessione automatica in-app può riusare password volatile; dopo restart mostrarne richiesta se le chiavi non bastano.

Primo host sconosciuto: challenge con fingerprint e accettazione esplicita, poi known_hosts OpenSSH. Chiave cambiata: blocco, nessun reset automatico. Porta locale dinamica su127.0.0.1; destinazione tunnel solo loopback host remoto. Nessuna nuova esposizione della porta Hermes sulla rete. Backend auth_required=true mostra stato login necessario: non disabilitare il gate e non estrarre credenziali private.

## Servizi e punto tecnico da approvare

`serve` endpoint web e `gateway` nativo cron/messaging sono distinti. Reusare sempre processi/servizi verificati; non sostituire un backend personale né avviare gateway concorrenti. Se assenti, avvio semplice non basta al requisito autonomia.

**Proposta:** consentire a Studio di registrare servizi background user-scoped sul solo host selezionato, quando mancanti: gateway con CLI nativa `hermes gateway install --if-missing` e start; endpoint `hermes serve --host 127.0.0.1 --port 0` con unit systemd Linux/LaunchAgent locale Studio-owned. È registrazione di servizi per Hermes già installato, non installazione/aggiornamento del runtime. Nessun --force, sudo, modifica globale config, desktop ownership/isolated watchdog o cancellazione di unit preesistenti. Discovery/ready devono identificare processo/unit/porta reali prima del tunnel.

Questa registrazione persistente è una proposta da revieware prima del codice: Q2 aveva confermato avvio, non i dettagli dell'installazione servizi. Se si sceglie solo riuso/start, host con Hermes installato ma privo di servizi mostrerà prerequisito e non sarà un percorso completo IP+accesso.

Linux: controllare user-systemd/D-Bus e disponibilità dopo logout (linger). Non abilitare linger o cambiare policy di sospensione con privilegi in automatico; se manca, mostrare limite e prerequisito concreto. macOS: LaunchAgent sopravvive al client, non garantisce host acceso/senza sospensione. Altri OS remoti possono usare attach SSH a backend già pronto; startup gestito richiede adapter verificato. Ownership persistente per unit/profilo/eseguibile; chiusura UI non invia stop, kill, interrupt o delete sul remoto.

## Persistenza e compatibilità

Snapshot connessioni/binding atomico0600, schema versionato e writer serializzato. Migrare binding legacy su connectionId `local` preservando tutti gli ID e il file originale: nessun import delle chat/profili personali e nessun fallback di una sessione remota su locale. Errore dello snapshot blocca nuovi binding ma preserva bozze/byte. Host rimosso con conversazioni legate resta scollegato/tombstone finché riassociato esplicitamente; nessuna migrazione silenziosa.

Reconnect: un job per host, generazione cancellabile, backoff limitato e niente retry di prompt/mutazioni. Errore password/host-key/gate sospende retry fino ad azione utente; disconnect esplicito disattiva autoConnect di quell'host, persistito prima del teardown. Nessun comando sul vecchio host dopo cambio selezione. Reconnect recupera snapshot/status; completamento e Working restano eventi runtime.

## Prove e criteri di consegna

Seam comuni confermate dal workflow/scheda: manager/bridge reale e adapter sintetico; SSH via OpenSSH contro server fixture con chiavi/password sintetiche; bootstrap su host/profilo throwaway. Test: due host con identici requestId/sessionId, eventi estranei, stale connect, cambio host, timeout/disconnect senza cancel/retry; save/restart/migrazione e password assente da disco/output. GUI: aggiungi host, login necessario/password/fingerprint, stato per chat, disconnect, app close/reopen con900/1360px e tastiera.

Gate indipendenti: handshake reale isolato; processo backend ancora disponibile dopo quit/tunnel chiuso; gateway/scheduler del profilo corretto; continuità turno F2 e riattivazioni F10. Non certificare24h dai test brevi. Se non disponibile un host sintetico per verificare service manager/SSH, documentare gate aperto e non marcare F1 completa. Test packaged non usa Minisforum o conversazioni personali.

## Handoff

[Piano](F1-implementation-plan.md), [F1](../features/F1-runtime-connection.md), [ADR proposto](../adr/0008-runtime-connections-and-autonomy.md). Review tecnico richiesto dal ramo architectural di brainstorming. Il piano è bozza preparata su richiesta utente; non esecuzione del codice prima della review della spec.
