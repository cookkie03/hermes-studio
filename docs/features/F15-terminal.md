# F15 — Vista degli output e del terminale Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Terminale significa la superficie Studio per output dei comandi eseguiti da Hermes e, quando il backend offre il contratto, una sessione interattiva sul suo host. Prima slice: output/tool card nella chat o pannello. Non è un nuovo tool terminale, una shell indipendente o un executor locale alternativo.

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F15**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Mostrare e, se supportato, interagire con il terminale Hermes della sessione/host corretti.

**Backend e confine:** Output, stdin/resize/interrupt/PTY soltanto via contratti native Hermes comprovati; nessuna shell parallela nel renderer. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Output/codice/stato ed esito reali, host/cwd/Space visibili; link di file/righe condivisi F5 dove supportati. Working non equivale a comando riuscito. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F1/F3/F2; slice output-only distinta da terminale interattivo, capability disponibile prima di attivare controlli. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Output incrementale/grande, ANSI/contenuto non attendibile, comando nonzero, disconnect/reconnect, resize, sessione diversa e consegna input incerta. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: documentata; output di tool in UI non è una sessione PTY interattiva.


<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Contratto PTY distinto da tool shell |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Sessione, backpressure e processo posseduto |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se output/lifecycle falliscono |

### Punti di ingresso da leggere

- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Autorizzazioni.
- [desktop/upstream/src/client/ComputerToolCard.tsx](<../../desktop/upstream/src/client/ComputerToolCard.tsx>): Output tool attuale.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Destinazione Terminal.
- [desktop/electron/preload.cjs](<../../desktop/electron/preload.cjs>): Privilegi.
- [Hermes: tools/terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/terminal_tool.py>): Tool terminale; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/read_terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/read_terminal_tool.py>): Output e continuità; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/close_terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/close_terminal_tool.py>): Chiusura distinta da display; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Scopo

Mostrare comandi e output Hermes associati a un'esecuzione; opzionale PTY interattiva solo dopo verifica del contratto desktop ufficiale. Separare risultato tool-shell e terminal session; non inventare una console che invia testo al modello come fosse una shell.

Host/session/cwd/stato/permessi sempre chiari. Console vuota, apertura, collegata, comando avviato, output, codice di uscita, interrotta, offline. Uscita0 non equivale a obiettivo completato; cancellare display non cancella processo. Input per nuovo comando disabilitato senza capability/authorization.

Module Terminal owns PTY/identità tool, transport/backpressure, resize, detach/attach e ownership del processo. Renderer mostra stream; preload non offre exec generico. Sessioni personali esistenti non importate per default. Output può contenere segreti: limitare log persistenti e clipboard/export espliciti.

Dipendenze F1+F3. Verificare source desktop Hermes terminal adapters e endpoint reali prima di progettare interface. Primo incremento output confermato dei tool e cronologia; PTY interattiva è slice separata scelta nella chat, con dichiarazione host locale/remoto.

Gate: stdout/stderr ordering, output voluminoso/backpressure, codice di uscita, disconnect senza terminazione automatica, resize, interruzione esplicita e restart. Test processi sintetici isolati, nessun comando personale/distruttivo. Tastiera/focus e accessibilità del pannello; distinguere CtrlC terminale e cancellazione composer.

## D34 — Codice e comandi visibili dalla chat

La chat deve poter presentare codice/comandi realmente eseguiti e output ricevuti da Hermes, con host, tool/sessione e stato. F2 possiede la timeline e F15 la superficie terminale; snippet della risposta e comando eseguito hanno provenienze distinte. Interattività/PTY non è dimostrata dalla sola tool card. Gating ed esito runtime restano necessari.


## Handoff

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Lavora soltanto F15; scegli output tool oppure PTY e verifica il contratto Hermes ufficiale. Usa processi test isolati, ownership esplicita e permessi F3. Non aggiungere una shell generica Electron e non sviluppare Files/browser. Documenta esito e limiti. Segui anche Incarico per la chat implementatrice di F15: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
