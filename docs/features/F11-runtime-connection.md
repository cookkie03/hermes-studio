# F11 — Collegamento al runtime Hermes

Stato: documentata; attach locale parziale esistente. Nessuna nuova integrazione implementata ora.

## Obiettivo e fonte

Studio usa lo stesso runtime Hermes del desktop ufficiale senza incorporarne l'interfaccia. Fonte primaria: [apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop), electron/backend-discovery.ts, main.ts e src/lib del checkout locale; mappa dettagliata ../research/runtime-integration-findings.md. Annotare SHA/versione prima di sviluppare: main può cambiare.

Desktop ufficiale documenta risoluzione/probe e modalità locali/remoto/cloud; ciò non prova che il connector Studio corrente le supporti. Baseline Studio supporta solo loopback HTTP senza login richiesto; remoto, OAuth e installazione gestita sono incrementi da delimitare, non automatismi del MVP.

## Contratto e stati

Discovery → probe HTTP → autenticazione autorizzata → WebSocket → gateway.ready → registrazione capability coerenti. Process candidates non sono readiness. Token in memoria; login richiesto produce stato dedicato, mai bypass o riuso indiscriminato di credenziali. Nuova sessione solo su operazione esplicita; session ID runtime diverso da stored ID, resume segue lineage reale.

Stati UI: non configurato, ricerca locale, collegamento, login necessario, disponibile, disconnesso, errore. Mostrare host e modalità perché tool/files/terminale agiscono sull'host runtime. Nessun `Working` da health, socket o prompt ammesso.

Quit client termina soltanto servizio UI posseduto. Se in futuro Studio avvia un Hermes gestito, ownership e responsabilità shutdown vanno definite prima; mai kill di un runtime personale agganciato. Nessuna installazione sul computer senza selezione esplicita della modalità.

## Seam e ownership

Connector runtime in desktop/hermes/gateway.mjs; orchestrazione binding in bridge.mjs; Electron discovery/bootstrap/privilegi separati. I chiamanti lavorano con operazioni dominio, non token o frame grezzi. Adapter Hermes reale e fixture sintetica esercitano la stessa seam. F02 usa questa connessione, F16 possiede approvazioni/capability; F04/Bots non deve aprire socket concorrenti implicitamente.

Persistenza: preferenza endpoint sicura con schema/versione; token nel deposito sicuro appropriato o effimero secondo contratto. Binding thread-owned Studio separato da DB Hermes. Migrazione/import sessioni esplicita e reversible, niente import personale al lancio.

## Verifica e non-obiettivi

Test readiness/timeout/redirect/login, discovery stale, cambio host senza invii al vecchio, caduta socket senza cancel/retry, resume ID e scope. Handshake live senza prompt poi sessione/prova sintetica isolata separata. Remote support richiede test auth reali isolati e indicatori host; se non scelto resta disabilitato. Non appartengono alla feature browser UI, plugin, routine, voce o installazione automatica.

## Handoff

> Implementa solo F11 con riferimento al desktop Hermes ufficiale e versioni pin. Leggi principi/ADR0006. Delimita il primo incremento attach locale, autenticazione o remoto; non implementarli tutti implicitamente. Preserva runtime/configurazioni personali, usa profilo/dati isolati per i prompt, documenta ogni capability effettivamente provata.
