# F1 — Connessioni e host del runtime Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F1**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adapter/connessioni/lifecycle host, con backend Hermes esistente. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Collegare host Hermes locali/SSH secondo D32/D33 e la spec tecnica scelta; riconnettere conservando ownership di sessioni e lifecycle backend.

**Backend e confine:** Discovery/health/gateway.ready, autenticazione/tunnel e servizi Hermes nativi; password effimere secondo D32. Backend autonomo distinto dal servizio UI. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** D37: ogni runtime collegato presenta i propri Bots come Dots tramite roster nativo, senza ricreazione manuale; ownership F7. Fornire identità host/profilo e capability confermate alle viste; i dati Space/modello/effort consumati dalla GUI non si inventano nel connector. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** [Spec F1](../project/F1-connection-design.md), [piano F1](../project/F1-implementation-plan.md), ADR0008 e ricerca lifecycle; stato proposed/accepted verificato prima del relativo gate. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Host sbagliato, tunnel perso/ripreso, password non persistita, credenziali mai nel renderer/log, quit senza arrestare Hermes, nessun retry prompt incerto. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: codice locale/SSH e GUI implementati secondo D32/D33; suite e attach live Mac PASS. Verifica packaged finale PASS; consegna locale verificata. [Prove e limiti](../architecture/f1-review-2026-10-04.md). Minisforum/systemd live e durata 24h non ancora provati.

## Direzione selezionata — D32

L'utente vuole una zona dell'app per gestire le connessioni, partendo dall'attach locale senza login Hermes. Per un host remoto con Hermes già installato (caso Minisforum nella rete Tailscale), indirizzo IP e accesso SSH devono consentire il collegamento attraverso un tunnel, senza dipendere dalla dashboard o da altri servizi di collegamento. Autenticazione SSH distinta dal login Hermes. Scelte confermate: riusare il backend disponibile o avviarlo quando necessario; riconoscere automaticamente chiavi SSH già sul Mac e supportare utente/password senza salvarla nel Portachiavi; conversazioni assegnate al rispettivo host, con più host utilizzabili. Riconnessione automatica degli host già configurati confermata; password solo in memoria fino alla chiusura dell'app o alla disconnessione esplicita, mai su disco o nel Portachiavi. Una nuova apertura richiede la password se l'accesso tramite chiave non basta. Q7 confermata: il backend resta attivo quando Studio chiude o si disconnette; Hermes deve poter lavorare 24/7 indipendentemente dal client. Il contratto Space/progetti è documentato per F6. Successivamente l’utente ha autorizzato il collegamento diretto al runtime del MacBook: handshake/GUI eseguiti senza prompt, import di conversazioni o modifica servizi personali.

## Principio cardine — Hermes autonomo, Studio facilitatore (D33)

Hermes è il backend completo: esecuzione, strumenti, memoria, bots, cron/routine e heartbeat devono usare le capacità native Hermes. Studio facilita configurazione, osservazione e interazione con origine/esiti coerenti; non sostituisce il backend con executor, scheduler, memoria o heartbeat propri. Il lavoro deve poter avanzare senza Studio aperto o tunnel SSH attivo. Riusare servizi Hermes esistenti; quando serve avviarli, progettare gestione sull'host indipendente dal processo UI/SSH e verificare ownership/readiness. Chiudere Studio o disconnettere un host non arresta backend/esecuzioni/routine. Un eventuale arresto è azione esplicita e distinta.

Il requisito 24/7 è una direzione di prodotto confermata, non un esito già verificato. [Ricerca lifecycle alla SHA fissata](../research/hermes-runtime-autonomy.md): gateway nativo cron/messaging distinto dal backend web; le sessioni detached hanno policy/reaper, quindi non basta lasciare un socket/backend acceso. F1 deve separare disponibilità del backend, sessioni attive e scheduler/bots operativi: health o gateway.ready non provano tutti e tre. Prove isolate devono coprire chiusura client/tunnel e ricollegamento senza retry del prompt; F2 verifica continuità della singola esecuzione, F10 riattivazioni native con client chiuso, F7/F14 bots e collaborazione. Host spento/sospeso o servizio non supervisionato va mostrato con il suo effetto reale. Non promettere sopravvivenza di un'esecuzione al riavvio dell'host senza contratto/prova.

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

Quit client termina soltanto servizio UI posseduto. Per il backend avviato da Studio, D33 richiede lifecycle sull’host indipendente dal client; ownership e arresto esplicito vanno definiti prima dell’implementazione. Mai kill di un runtime personale agganciato. Nessuna installazione sul computer senza selezione esplicita della modalità.

## Seam e ownership

Connector runtime in desktop/hermes/gateway.mjs; orchestrazione binding in bridge.mjs; Electron discovery/bootstrap/privilegi separati. I chiamanti lavorano con operazioni dominio, non token o frame grezzi. Adapter Hermes reale e fixture sintetica esercitano la stessa seam. F2 usa questa connessione, F3 possiede approvazioni/capability; F7/Bots non deve aprire socket concorrenti implicitamente.

Persistenza: preferenza endpoint sicura con schema/versione; token nel deposito sicuro appropriato o effimero secondo contratto. Binding thread-owned Studio separato da DB Hermes. Migrazione/import sessioni esplicita e reversible, niente import personale al lancio.

## Verifica e non-obiettivi

Test readiness/timeout/redirect/login, discovery stale, cambio host senza invii al vecchio, caduta socket senza cancel/retry, resume ID e scope. Handshake live senza prompt poi sessione/prova sintetica isolata separata. Supporto remoto scelto: OpenSSH reale contro server sintetico con key/password, trust e rifiuto changed key verificati; host sempre visibile. Il Minisforum reale richiede il suo indirizzo/accesso, non forniti in questa chat. Non appartengono alla feature browser UI, plugin, routine, voce o installazione automatica.

## D30 — Eventi oltre il turno e parità runtime

[F8](F8-hermes-native-features-and-observability.md) usa il trasporto scoped F1 per osservare anche `review.summary` e stati successivi alla risposta. La connessione/session subscription non termina implicitamente quando il testo è completo. Mapping versione/profilo/capability e gap visibili; nessun request(method) generico o import di profili personali per ottenere parità. Memoria/learning restano Hermes, mentre cache UI derivate non sono ricordi del modello.

## Piano tecnico e stato dell'intervista

Q8 confermata dall'utente: intervista di prodotto conclusa. [Spec tecnica](../project/F1-connection-design.md) e [piano](../project/F1-implementation-plan.md) concretizzano D32/D33 e ownership; eventuali gate tecnici non sono nuove scelte di prodotto implicite. D34 chat completa e Settings Hermes/Studio registrata nelle schede owner, non implementazione aggiunta a F1.

## D37 — Ogni runtime porta i propri Bots in Studio

Quando si collega un runtime Hermes, Studio ne scopre e presenta tutti i Bots autorizzati come Dots, conservando l’identità nativa. Non richiedere di ricreare manualmente ogni Bot o di creare un Dot locale prima di poterlo vedere. La scoperta usa il roster nativo verificato (vedi contratti e fonti in [F7](F7-bots-and-identities.md)), non una lista inventata dal frontend. Un profilo non confermato come Bot non viene automaticamente promosso a Bot.

Identità scoped a connessione/runtime, installazione e profilo: Bots omonimi su host diversi restano distinti, con host/origine riconoscibili. Selezionare un Dot apre la Bot Chat canonica di quel runtime secondo F7/F2, preservando sessione e continuità native; non crea una chat sostitutiva né invia prompt introduttivi. Space, modello ed effort mostrano il contesto effettivo disponibile, senza associazioni dedotte dal nome.

Discovery del roster non importa tutte le conversazioni, non clona Bots, credenziali o memorie e non avvia lavoro. Metadata/avatar locali restano presentazione. Riconnessione aggiorna il roster senza duplicati; backend offline mostra Bots già noti come offline/stale, senza nasconderne l’origine o attribuire attività. Aggiunte/rimozioni seguono i dati confermati dal runtime; scollegare Studio non cancella Bots o lavoro backend. Figli temporanei delegate_task restano nel pannello sub-agent D36, non nel roster persistente.

**Ownership:** F1 fornisce connessione e identità del runtime; F7 scopre/mappa/presenta roster e risolve Bot Chat; F2 presenta conversazione ed eventi; F4 rende navigabili Dots e host; F14 collega messaggi e attività native. Verificare capability/schema nel runtime collegato; assenza di contratto è un limite visibile, non autorizza backend alternativo.

**Gate:** collegare due runtime sintetici con Bots omonimi e roster differenti; tutti i Bots autorizzati compaiono senza creazione manuale, identità e chat canonica corrette. Refresh/reconnect non duplicano righe; aggiunta/rimozione, profilo non-Bot, scope negato, offline e cambio host durante discovery non contaminano il roster. Nessun prompt, clonazione o import globale di cronologia per la sola connessione. Contratti sorgente sono evidenza documentale, non prova live.

## Handoff

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa solo F1 con riferimento al desktop Hermes ufficiale e versioni pin. Leggi principi/ADR0006. Segui scope D32/D33: attach locale e tunnel SSH, credenziali effimere, riconnessione e routing per host; backend Hermes indipendente dal client. Non implementare le feature native F7/F8/F10 incidentalmente. Preserva runtime/configurazioni personali, usa profilo/dati isolati per i prompt, documenta ogni capability effettivamente provata. Segui anche Incarico per la chat implementatrice di F1: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
