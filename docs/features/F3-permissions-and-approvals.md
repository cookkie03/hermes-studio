# F3 — GUI delle approvazioni e dei permessi Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F3**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Presentare e inoltrare decisioni di approvazione Hermes alla richiesta corretta, con lifecycle e grant visibili.

**Backend e confine:** Server-request/approval e policy native; grant e cancel scoped a sessione/host/profilo, hard-block runtime preservati. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Dialogo mostra Dot/Space/host e azione/target; model/effort come contesto se confermati. Conferma, deny, timeout e pending distinti; tastiera/focus accessibili. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F1 trasporto; non introdurre policy di autorizzazione concorrente, non abilitare tool per il solo rendering della richiesta. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Due chat/host con request omonime, stale/cancel, doppio click, reconnect, background, lease handler sparito, risposta fuori enum, nessuna decisione inviata ad altra sessione. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: documentata; server-request/lease e fixture parziali esistenti.


<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Request ownership e lifecycle |
| [research](<../../.agents/skills/research/SKILL.md>) | Choice e cancellation effettive |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Riprodurre richiesta stale o doppia risposta |
| [security-diff](</Users/luca/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.31/skills/security-diff-scan/SKILL.md>) — condizionale | Se è richiesta review del diff su permessi/sessioni |

### Punti di ingresso da leggere

- [docs/research/runtime-integration-findings.md](<../../docs/research/runtime-integration-findings.md>): Contratto server requests.
- [desktop/hermes/gateway.mjs](<../../desktop/hermes/gateway.mjs>): Capability/RPC.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Richieste owned.
- [desktop/hermes/bridge.test.mjs](<../../desktop/hermes/bridge.test.mjs>): Fixture richieste.
- [desktop/upstream/src/client/Chat.tsx](<../../desktop/upstream/src/client/Chat.tsx>): Handler UI.
- [desktop/upstream/src/client/api.ts](<../../desktop/upstream/src/client/api.ts>): Client transport.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Scopo

Un'azione privilegiata di Hermes richiede una decisione comprensibile e circoscritta. Le preferenze Studio non sono ACL del runtime. Plugin/browser/computer/routine/Dot non possono elevare permessi attraverso una semplice casella UI.

Leggere il contratto reale approval/client.capabilities/request.cancel in runtime-integration-findings e sorgente Hermes della versione scelta. Rappresentare choices effettivamente fornite e richiesta RPC e ID, non inventare enum o approvazioni universali. Registrare server_requests solo quando handler/UI è montato e può rispondere, con lease/cleanup su chiusura.

## UI e lifecycle

Mostrare agente, host, comando/operazione, motivo, ambito, durata e conseguenza. Pending → decisione in invio → accettata/rifiutata/conferma fallita/annullata/scaduta. Disabilitare doppio invio; una richiesta cancellata non resta cliccabile. L'azione non è completata perché l'utente ha approvato: attendere runtime.

Richiesta in altra conversazione: indicatore navigabile con identità, niente contenuto personale non posseduto o routing ambiguo. Chiudere un popup non equivale a rispondere `deny`. `Always` va mostrato solo se runtime lo offre e l'ambito è esplicito. Nessuna approvazione automatica per comodità.

## Modulo e dati

Decision module condiviso possiede identità richiesta, session ownership, cancellation, idempotency e lifecycle; UI non possiede socket/token. Seam runtime e adapter fixture reali; registro minimo senza segreti nei comandi/log. F1 connessione; F2 rendering/routing; altre feature chiedono autorizzazione attraverso questo percorso.

## Gate

Pending/cancel/stale/disconnect/reconnect/thread in background, doppio clic e risposte fuori enum. Una decisione singola raggiunge RPC corretto; sessioni sconosciute escluse. Capability false a finestra assente, true solo con handler pronto; cleanup non disabilita altre view attive. Test isolati di percorso autorizzato e diniego, verifica focus/tastiera/Reduced Motion. Non cambiare configurazione privata o policy per far passare test.

## Ambiti aggiuntivi D25–D29

Grant folder dello Space esplicito per root/host/operazioni, distinto da selezione/membership; unlink preserva dati. Browser profilo e lease condiviso F12, Take over/revoke/resume distinti senza fallback nascosto. Memoria profilo e file Space F9 hanno writer/gates propri; pending non è applied. Voce F17 richiede microfono, routing provider e retention chiari; consenso a vocal chat non autorizza chiamate telefoniche o azioni sensibili senza revisione.

## D34 — Approvals e validation nella chat

Le richieste di approvazione/validazione delle operazioni rischiose presenti in Hermes devono apparire nella chat Studio con azione, destinatario host/profilo/sessione, ambito, scelte del runtime ed esito verificato. F3 conserva semantica, scadenza/cancel e policy; F2 presenta le card. Non ricostruire un classificatore di rischio parallelo, non autoapprovare per assenza del client e non trasformare una semplice risposta in autorizzazione. Le impostazioni runtime di permessi appartengono alla sezione Settings Hermes; preferenze solo client restano Settings Hermes Studio. Parità ancora da implementare/provare, non autorizzata da F1.


## Handoff

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Sviluppa esclusivamente F3. Verifica il contratto Hermes della versione corrente, parti dalle fixture esistenti e definisci gli invarianti del decision module. Non aggiungere auto-approve né plugin/browser/computer nuovi. Prova richieste annullate e routing tra conversazioni possedute; aggiorna docs e limiti. Segui anche Incarico per la chat implementatrice di F3: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.

## Incremento 2026-10-05 — decision identity e lifecycle

Implementato e verificato l’incremento decisionId scoped, enum nativo, lease al dispatch e card con invio/cancel/timeout/incertezza. Prove sintetiche packaged e limiti nella [ricevuta F3](../architecture/f3-approval-review-2026-10-05.md). F3 complessiva resta parziale: runtime reale isolato, grants specifici, approvazione proposte memoria e accessibilità completa ancora aperti.
