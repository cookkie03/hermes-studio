# F1 — Collegamento al runtime Hermes

Stato: documentata; attach locale parziale esistente. Nessuna nuova integrazione implementata ora.



<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Se schema/eventi upstream sono incerti: ricerca primaria documentata |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Connessione, autenticazione e processo posseduto |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se emerge un errore riproducibile di connessione o lifecycle |
| [wizard](<../../.agents/skills/wizard/SKILL.md>) — condizionale | Solo prerequisiti account/host che il client non può completare |
| [hermes](</Users/luca/.codex/skills/personal/hermes/SKILL.md>) — condizionale | Soltanto se viene esplicitamente delegata un’operazione a Hermes; non sostituisce il connector |

### Punti di ingresso da leggere

- [docs/research/hermes-desktop-reference.md](<../../docs/research/hermes-desktop-reference.md>): Versione e riferimento principale.
- [docs/research/runtime-integration-findings.md](<../../docs/research/runtime-integration-findings.md>): Contratti studiati.
- [desktop/electron/backend-bootstrap.cjs](<../../desktop/electron/backend-bootstrap.cjs>): Discovery/process ownership.
- [desktop/hermes/gateway.mjs](<../../desktop/hermes/gateway.mjs>): Gateway.
- [desktop/hermes/gateway-network.test.mjs](<../../desktop/hermes/gateway-network.test.mjs>): Fixture di rete.
- [Hermes: apps/desktop/electron/main.ts](</Users/luca/.hermes/hermes-agent/apps/desktop/electron/main.ts>): Orchestrazione ufficiale; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Obiettivo e fonte

Studio usa lo stesso runtime Hermes del desktop ufficiale senza incorporarne l'interfaccia. Fonte primaria: [apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop), electron/backend-discovery.ts, main.ts e src/lib del checkout locale; mappa dettagliata ../research/runtime-integration-findings.md. Annotare SHA/versione prima di sviluppare: main può cambiare.

Desktop ufficiale documenta risoluzione/probe e modalità locali/remoto/cloud; ciò non prova che il connector Studio corrente le supporti. Baseline Studio supporta solo loopback HTTP senza login richiesto; remoto, OAuth e installazione gestita sono incrementi da delimitare, non automatismi del MVP.

## Contratto e stati

Discovery → probe HTTP → autenticazione autorizzata → WebSocket → gateway.ready → registrazione capability coerenti. Process candidates non sono readiness. Token in memoria; login richiesto produce stato dedicato, mai bypass o riuso indiscriminato di credenziali. Nuova sessione solo su operazione esplicita; session ID runtime diverso da stored ID, resume segue lineage reale.

Stati UI: non configurato, ricerca locale, collegamento, login necessario, disponibile, disconnesso, errore. Mostrare host e modalità perché tool/files/terminale agiscono sull'host runtime. Nessun `Working` da health, socket o prompt ammesso.

Quit client termina soltanto servizio UI posseduto. Se in futuro Studio avvia un Hermes gestito, ownership e responsabilità shutdown vanno definite prima; mai kill di un runtime personale agganciato. Nessuna installazione sul computer senza selezione esplicita della modalità.

## Seam e ownership

Connector runtime in desktop/hermes/gateway.mjs; orchestrazione binding in bridge.mjs; Electron discovery/bootstrap/privilegi separati. I chiamanti lavorano con operazioni dominio, non token o frame grezzi. Adapter Hermes reale e fixture sintetica esercitano la stessa seam. F2 usa questa connessione, F3 possiede approvazioni/capability; F7/Bots non deve aprire socket concorrenti implicitamente.

Persistenza: preferenza endpoint sicura con schema/versione; token nel deposito sicuro appropriato o effimero secondo contratto. Binding thread-owned Studio separato da DB Hermes. Migrazione/import sessioni esplicita e reversible, niente import personale al lancio.

## Verifica e non-obiettivi

Test readiness/timeout/redirect/login, discovery stale, cambio host senza invii al vecchio, caduta socket senza cancel/retry, resume ID e scope. Handshake live senza prompt poi sessione/prova sintetica isolata separata. Remote support richiede test auth reali isolati e indicatori host; se non scelto resta disabilitato. Non appartengono alla feature browser UI, plugin, routine, voce o installazione automatica.

## D30 — Eventi oltre il turno e parità runtime

[F8](F8-hermes-native-features-and-observability.md) usa il trasporto scoped F1 per osservare anche `review.summary` e stati successivi alla risposta. La connessione/session subscription non termina implicitamente quando il testo è completo. Mapping versione/profilo/capability e gap visibili; nessun request(method) generico o import di profili personali per ottenere parità. Memoria/learning restano Hermes, mentre cache UI derivate non sono ricordi del modello.

## Handoff

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa solo F1 con riferimento al desktop Hermes ufficiale e versioni pin. Leggi principi/ADR0006. Delimita il primo incremento attach locale, autenticazione o remoto; non implementarli tutti implicitamente. Preserva runtime/configurazioni personali, usa profilo/dati isolati per i prompt, documenta ogni capability effettivamente provata.
