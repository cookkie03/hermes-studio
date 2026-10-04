# F1 Runtime Connections Implementation Plan

> Per agenti: seguire `docs/agents/feature-workflow.md`; esecuzione native nella chat con `.agents/skills/implement/SKILL.md`, task verticali e review Standards/Spec. Questo layout di progetto sostituisce i percorsi superpowers. Piano tecnico draft: nessun passo prodotto eseguito prima della review della spec, come richiesto da brainstorming.

**Goal:** connessioni locale/SSH in-app, conversazioni per host e backend Hermes indipendente da Studio.

**Architecture:** un registro versionato instrada thread e stream a bridge distinti. OpenSSH si occupa del tunnel; lifecycle backend/gateway è sull'host e indipendente da UI/SSH. Le impostazioni native e Space/progetti sono handoff alle rispettive feature.

**Tech Stack:** Electron/Node24+, ESM, React/TypeScript, OpenSSH, Hermes alla SHA fissata; service manager Linux/macOS.

**Spec:** [F1-connection-design.md](F1-connection-design.md). Base Studio `de9dc39f313acf83790e26cff18202b7eb0782d8`. ADR0008 proposto. Registrazione dei servizi mancanti da approvare nella spec.

## Global Constraints

- Password solo memoria fino a quit/disconnessione esplicita; niente Portachiavi/disco/argv/log.
- Reconnect automatico, mai retry prompt/mutazioni incerte.
- Quit/disconnect non arresta Hermes; scheduler/bots/heartbeat/tools/memoria nativi.
- Profilo/dati sintetici per test; runtime/config/credenziali/chat personali preservati.
- Solo F1 codice; D34 e Space multi-host sono documentazione futura.
- Gate reali distinti da fixture; nessuna certificazione24h con test brevi.

## Review Focus

1. Due host con identici sessionId/requestId non contaminano chat/approvals.
2. Connect stale o host offline non invia al vecchio host e non cancella lavoro.
3. Password e fingerprint challenge non sopravvivono a quit/disconnect o finiscono in file/output.
4. Host solo Hermes installato non appare autonomo quando manca supervisor/scheduler.
5. Binding legacy/storage failure non sposta sessioni o perde bozze.

## Task1 — Registro e routing multi-host

**Files:** Create `desktop/hermes/connections.mjs`, `connections.test.mjs`; modify `bridge.mjs`, `server.mjs`; existing `bridge.test.mjs`, `server.test.mjs`.

**Interface:** RuntimeConnections initialize/list/saveConnection/bindThread/status; per-thread session/history/send/interrupt/approval; eventi connectionId/threadId. Ogni bridge possiede un backend. Legacy `local` preserva hermes-sessions.json. REST e schema esatti nella spec.

- [ ] Fixture rossa: due runtime con identici IDs; invio/approvals/eventi restano al thread owner.
- [ ] Implementare registro versionato writer atomico0600, migrazione preservando originale e bridge factory per host.
- [ ] Integrare route/SSE scoped, rifiutare rebind dopo sessione, host tombstone e storage failure.
- [ ] Node test mirati: `cd desktop && node --test hermes/connections.test.mjs hermes/bridge.test.mjs hermes/server.test.mjs`.
- [ ] Diff/index/scan segreti e commit incremento verificato.

## Task2 — SSH con chiavi e password volatile

**Files:** Create `desktop/hermes/ssh.mjs`, `ssh-askpass.sh`, `ssh.test.mjs`, `ssh-fixture.test.mjs`; package manifest dev-dependency solo se necessaria per server fixture SSH sintetico.

**Interface:** SshConnection.open({host,user,port,password?,onChallenge}), forward(remotePort)→localEndpoint, execBootstrap(script) solo interno, close() solo client. Nessun exec/RPC arbitrario nel renderer.

- [ ] Fixture rossa OpenSSH→server SSH sintetico: auth key e password, trust nuovo/changed, timeout e segreto assente da output/file.
- [ ] Implementare argv validation, system config/agent, socket Unix askpass privato, challenge one-shot/generation/expiry.
- [ ] Implementare tunnel solo loopback e cleanup locale cancellabile; nessun kill remoto.
- [ ] `node --test hermes/ssh.test.mjs hermes/ssh-fixture.test.mjs`; dichiarare gap se fixture real-SSH non disponibile.
- [ ] Scan argv/env/file e review prima commit.

## Task3 — Discovery e backend autonomo sull'host

**Files:** Create `desktop/hermes/host-backend.mjs`, `host-bootstrap.py`, `host-backend.test.mjs`, `host-backend-integration.test.mjs`; modify `gateway.mjs`, network fixture se serve.

**Interface:** HostBackend.probe/ensure({connection,transport,servicePolicy})→endpoint/serviceSnapshot; no install Hermes runtime. Riusa backend/gateway verified; gestisce solo unit owned selezionate, separa gateway/scheduler da serve.

- [ ] Fixture rossa: backend esistente riusato, auth gate non bypassato, gateway assente/start-only/registrazione scelta distinti.
- [ ] Implementare fixed bootstrap, systemd user/LaunchAgent secondo policy approvata; niente isolated/Desktop-owned idle watchdog. Health/gateway.ready dopo porta reale, non PID soltanto.
- [ ] Test throwaway supervisor: backend persiste dopo tunnel/client close e restart processo; user manager/logout limits onesti.
- [ ] `node --test hermes/host-backend*.test.mjs hermes/gateway-network.test.mjs` e profilo Hermes isolato handshake senza prompt/history.
- [ ] Registrare prova distinta gateway/scheduler, nessun test sui servizi personali; commit solo con gate dichiarati.

## Task4 — Reconnect e credenziali effimere

**Files:** Modify `connections.mjs`, `connections.test.mjs`, `server.mjs`.

**Interface:** connect/disconnect/close, startup autoConnect, job e generation per host; challenge risposta scoped. Password in closure/memoria, snapshot contiene solo preferences/binding.

- [ ] Fixture rossa: network drop/reconnect, due host paralleli, disconnect durante bootstrap, restart senza password, password failure senza loop, prompt mai replayed.
- [ ] Implementare backoff limitato e cancel; disconnect persiste autoConnect=false prima cleanup; quit cancella tunnel/secret e non tocca servizi remoti.
- [ ] Assert via interface + file snapshot che password/process token sono assenti e stale jobs non sovrascrivono stato nuovo.
- [ ] Mirati Node/typecheck; aggiornare docs/gate e commit.

## Task5 — UI connessioni e host della chat

**Files:** Create `desktop/upstream/src/client/RuntimeConnections.tsx`, `runtime-connections.ts`; modify `WorkspaceDialog.tsx`, `Chat.tsx`, `PageConversation.tsx`, `ComputerPanel.tsx`, `styles.css` solo se necessario. Shared UI ownership registrata prima edit.

**Interface:** typed DTO manager, lista host, connect/disconnect/challenge e thread-host; status/history/events sempre thread-scoped. Settings host/profilo e prefs Studio distinguibili; non writer generico settings Hermes.

- [ ] Presentare UI connection list/form/stati, password/fingerprint e host chat; reusare component-system senza redesign.
- [ ] Binding esplicito prima primo invio; nuove conversazioni non aprono sessione né inviano prompt. Chat già bound non cambia host con selector.
- [ ] Typecheck renderer/metadata e build `cd desktop && npm run build`.
- [ ] Packaged smoke sintetico: host offline/auth/challenge, due conversazioni diverse, disconnect/restart,900/1360px, tastiera e Reduced Motion.
- [ ] Documentare limiti, review e commit.

## Task6 — Integrazione e consegna

**Files:** Scheda F1, MEMORY/STATUS/WORKLOG, desktop README, ADR0008 se approvato, nuovo ticket F1 e prove.

- [ ] Eseguire una volta `cd desktop && npm test` dopo tutti i mirati.
- [ ] `npm run package:dir` e smoke app sintetico; loopback/SSH e lifecycle isolati con ricevute, nessun dato personale.
- [ ] Review Standards/Spec su base dichiarata e working diff, correggere findings; parità chat/settings F2/F4 non inclusa.
- [ ] Consegna distingue shipped/fixture/live handshake/autonomia servizi/F2-turn/F10-routine/24h non provata. Non marcare F1 complete se manca gate necessario SSH/service.
- [ ] Diff/index/scan segreti, commit/push solo origin confermato; nessuna release/DMG F13.

## Gate di review del piano

Approcci SSH e strategia servizi sono scritti nella spec. L'utente ha approvato scelte di prodotto/intervista e chiesto il piano; il ramo architectural brainstorming richiede review della spec scritta prima del codice. Piano preparato come draft per rendere concreta la review, senza installare dipendenze o modificare runtime. Dopo approvazione, native/implement nella stessa chat come percorso progetto; review parallela soltanto quando richiesta dalla skill code-review.
