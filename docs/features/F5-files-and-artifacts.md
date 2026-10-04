# F5 — File, riferimenti e artefatti nel workspace Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F5**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Leggere/scrivere file nelle root autorizzate e fornire riferimenti precisi a file, righe e selezioni con revisioni/conflict.

**Backend e confine:** Per agenti e host remoti usare filesystem/tool Hermes supportati; editor locale ha IPC limitata a root scelta, non concede tool accesso implicito. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** @ mostra nome/root/host/percorso e filtra progressivamente; chip file/range riapre il punto corretto. Changes/diff e ricevuta salvataggio visibili. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F6 progetto/root, F2 attachment/context Hermes verificato, F3 grant; i riferimenti GUI si adattano a contratti esistenti, senza retrieval backend nuovo. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Omonimi su due root/host, path traversal/symlink, file sparito, range obsoleto, bozza diversa dal disco, payload grande, conflitto esterno e nessuna scrittura cieca. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: documentata; tree/editor SwiftUI storico e anteprima eventi Electron parziali non equivalgono a file workspace completo.


<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Ownership root/path/revisioni |
| [research](<../../.agents/skills/research/SKILL.md>) | Verificare contratto Files sull’host |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se path o recovery della bozza falliscono |

### Punti di ingresso da leggere

- [docs/project/file-workspace.md](<../../docs/project/file-workspace.md>): Baseline filesystem storica, non contratto remoto.
- [docs/features/F6-spaces-documents-memory.md](<../../docs/features/F6-spaces-documents-memory.md>): Pagina vs file.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Destinazione Files.
- [desktop/electron/preload.cjs](<../../desktop/electron/preload.cjs>): Seam privilegi.
- [Hermes: tools/file_tools.py](</Users/luca/.hermes/hermes-agent/tools/file_tools.py>): Tool file reali; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/file_tools_paths.py](</Users/luca/.hermes/hermes-agent/tools/file_tools_paths.py>): Path e root; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## D25 — Filesystem condiviso con Spaces

F6 ora collega una o più cartelle reali. F5 fornisce il module File workspace comune per root, listing, read/save, conflitti e provenienza; evitare un secondo store di testi che diverga dai file dello Space. Il pannello Files e l’editor Space usano la stessa risoluzione dei riferimenti. Metadata vecchi restano legacy/export esplicito.

Il client può navigare cartelle locali scelte anche offline tramite operazioni native limitate; Hermes usa i propri tool file soltanto sulle root raggiungibili e autorizzate sul suo host. API native per l’utente e tool runtime per l’agente hanno stesso riferimento file e revisione, non due copie né un executor nuovo. Root Mac ≠ root server remoto; mancanza di mapping va resa visibile.

Leases/grants sono per Space, folder e identità pertinente; i symlink non ampliano lo scope. Cambi esterni di Obsidian o specialisti aggiornano il tree senza sovrascrivere bozze. Scollegare una cartella rimuove il collegamento, non i dati. Nessun import/index/scan personale automatico. Testare più root, annidamenti, volume offline, rename, file grande/binario, conflitti e accesso fuori root con cartelle sintetiche.

Leggere [ADR0007](../adr/0007-folder-backed-spaces.md) e [F6 aggiornata](F6-spaces-documents-memory.md) prima del contratto; coordinare shared types e main/preload/server con i loro owner.

## Risultato

Pannello Files con albero/ricerca/preview e risultati prodotti da tool Hermes; aprire un Markdown o un documento nello Space senza confondere file del Mac, host Hermes e pagina Studio. Fonte tool registry Hermes: verificare read_file/write_file/search_files e contratti effettivi, nomi esatti da ricercare prima dell'implementation.

File dell’host reale, sandbox root, symlink e ACL sono responsabilità del module File workspace; UI usa operazioni native limitate per file dell’utente o tool Hermes per operazioni dell’agente; nessuna read/write generica dal renderer. Se il runtime è remoto, mostra host e path remoti. Download/import verso Mac sono azioni esplicite con destinazione chiara. Nessuna scansione personale automatica.

## Comportamento

Root scelto → caricamento → albero vuoto/populato → preview → bozza → salvataggio/conflitto/errore. Evidenziare provenienza agent/run/tool e risultato confermato, non supposizione da testo. Modifica dirty resta recuperabile quando cambi file/pannello. Documento dello Space è il file nella cartella collegata; le sole pagine metadata legacy richiedono export/import esplicito con ricevuta.

## Scope e seam

Per file locali: base F0 e selezione root esplicita; F1/F3 per tool agente/host runtime. F6 usa il writer F5, non ne è prerequisito per listing/read-only: evitare dipendenza circolare. Il module File workspace possiede politica filesystem e revisioni; preload espone solo IPC limitata alle operazioni/root autorizzate, Chat.tsx rimane presentazione. F15 terminale separato; F12 browser non necessario. Primo incremento read-only root selezionato+preview, poi scrittura solo in una slice esplicita.

## Gate

Uscita dal root, symlink, huge/binary files, stale revision, permesso negato, offline, cambio host, bozza modificata e restart. Fixture con contenuti sintetici, poi operazione runtime isolata e UI e tastiera. Nessun test su cartelle personali, nessun DELETE automatico. Attività tool persistita non prova un file esista ancora: refresh autorevole.

## Contratto futuro multi-host richiesto durante F1

F6 richiede Space con più cartelle anche su host diversi. F5 deve identificare ogni root/file con host e percorso, preservare scope e revisioni e indicare host offline. Il tunnel F1 verso Hermes non rende automaticamente disponibili i filesystem degli altri host. Riprendere [promemoria F6](F6-spaces-documents-memory.md#progetti-hermes-e-space--promemoria-per-lo-sviluppo-f6) prima del writer o del trasporto remoto; nessuna implementazione F5 selezionata da questa richiesta.

## D34 — Changes visibili nella chat

Modifiche file/diff ricevute e verificabili dal runtime devono essere presentabili nella chat con host/percorso/revisione ed esito. F5 possiede identità file, diff e ricevute; F2 presenta la timeline. Testo che dichiara una modifica non basta a certificarla; collegamento allo Space e review seguono F6. Non confondere approvazione preventiva, proposta di changes e scrittura già applicata.


## Handoff

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa solo F5, partendo da una root esplicita read-only sul client locale oppure sull’host runtime autorizzato, secondo l’incremento selezionato. Per l’agente usa tool Hermes reali; per il client locale usa una interface nativa limitata alle root scelte. Condividi riferimenti e revisioni con F6, senza copie dei contenuti. Definisci module e prove path/symlink/conflitto. Non sviluppare terminale o browser; preserva dati personali. Segui anche Incarico per la chat implementatrice di F5: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
