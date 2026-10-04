# F6 — Spaces collegati ai progetti e alle cartelle Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F6**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Presentare progetti Hermes come Spaces con cartelle, documenti e conversazioni associati e identità runtime preservata.

**Backend e confine:** projects.* scoped a backend/profilo e working directory sessione; Space è nome UI/mapping, non un nuovo servizio progetti distribuiti. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Applicare D37 per Docs provenienti dal runtime/sessione, con origine verificata e documento originale autoritativo. Space corrente sempre visibile nella chat/bot e sidebar; @ solo cartelle autorizzate del progetto. Host di cartella distinto dall’host della conversazione. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F1 host, F5 root/revisioni, F2 associazione chat; cardinalità multi-host delimitata secondo capacità Hermes, niente accesso cross-host inventato. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Progetti omonimi su due host/profili, folder multipli, backend offline, nessun Space, archive/unlink senza cancellare file, session.cwd diversa dal progetto e grant negato. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: specifica aggiornata D25, 2026-10-04; non implementata. La baseline F0 usa ancora pagine metadata. La nuova richiesta sostituisce il modello di Space come solo contenitore di pagine interne; preservare i dati esistenti.

<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md) | Space, documenti su file e pagine legacy distinti |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | Componenti React e stato del renderer |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Revisioni dei file e ownership Space/FolderBinding |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se autosave o conflitto non preserva la bozza |

### Punti di ingresso da leggere

- [docs/adr/0007-folder-backed-spaces.md](../adr/0007-folder-backed-spaces.md): decisione filesystem e migrazione.
- [docs/features/F5-files-and-artifacts.md](F5-files-and-artifacts.md): contratto filesystem condiviso.
- [desktop/upstream/src/client/SpaceWorkspace.tsx](../../desktop/upstream/src/client/SpaceWorkspace.tsx): contenitore dello Space.
- [desktop/upstream/src/client/WorkspaceDialog.tsx](../../desktop/upstream/src/client/WorkspaceDialog.tsx): selezione esplicita cartelle da aggiungere.
- [desktop/upstream/src/client/PageDocument.tsx](<../../desktop/upstream/src/client/PageDocument.tsx>): Documento.
- [desktop/upstream/src/client/editor/use-page-autosave.ts](<../../desktop/upstream/src/client/editor/use-page-autosave.ts>): Ciclo autosave.
- [desktop/upstream/src/client/SaveToSpaceReview.tsx](<../../desktop/upstream/src/client/SaveToSpaceReview.tsx>): Revisione e salvataggio esplicito.
- [desktop/upstream/src/server/page-routes.ts](<../../desktop/upstream/src/server/page-routes.ts>): Contratto metadata.
- [desktop/upstream/src/server/pages.ts](<../../desktop/upstream/src/server/pages.ts>): Persistenza pagine.
- [docs/features/F9-memory.md](<../../docs/features/F9-memory.md>): Confine con memoria separata.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Risultato richiesto

Uno Space collega una o più cartelle reali scelte dall’utente: un vault Obsidian, un progetto software o un’altra directory di lavoro. Si vedono struttura e file testuali, si aprono/modificano i documenti e gli specialisti possono lavorare sulle stesse cartelle entro l’ambito autorizzato. Aggiungere una cartella significa collegarla, senza copiare o importare tutto in un database Studio.

Il filesystem è la fonte dei contenuti. Studio conserva collegamenti, selezioni, bozze recuperabili e ricevute; il testo salvato è il file reale. La UI resta nel linguaggio OpenDots, mentre l’organizzazione dei contenuti segue il modello cartella/progetto richiesto. La memoria degli agenti è F9.

## Percorso e componenti

1. Create Space: nome e Add folder con selezione esplicita della directory; elenco cartelle collegate e host visibile.
2. Space aperto: radici distinte, albero cartelle/file, ricerca per nome; caricamento progressivo senza scansione ricorsiva dell’intero vault all’apertura.
3. File testuale selezionato: percorso relativo, editor/source e preview Markdown quando pertinente, stato Modified/Saving/Saved/conflict.
4. New file: scelta radice/percorso e creazione esplicita; risultato della ricerca salvabile come `.md` nella destinazione scelta.
5. Specialista: Space attivo e cartelle accessibili visibili nel contesto; riferimenti puntuali ai file, non invio implicito dell’intero vault.
6. Manage folders: aggiungi/scollega, riassocia una directory spostata; scollegare non elimina o sposta alcun file.

Uno Space può esistere prima del collegamento, ma finché non ha cartelle mostra Add folder: non creare contenuti fittizi. Nomi di radici uguali mantengono host/percorso distinguibili. Una root annidata o già collegata va riconosciuta per evitare duplicati e permessi involontariamente ampliati.

## Requisito multi-host confermato durante F1

Uno Space deve poter collegare più cartelle anche su host diversi; ogni cartella mantiene il proprio host e le conversazioni il proprio host di esecuzione. Il collegamento ai progetti Hermes va progettato in F6 sulla base dei contratti upstream riportati sotto. Accesso cross-host, mount/sync e trasformazione di Space in progetto Hermes non sono impliciti; nessuna implementazione F6 avviata da questa intervista.

## Progetti Hermes e Space — promemoria per lo sviluppo F6

Ricerca sorgente, non prova runtime: [contratti verificati e limiti](../research/hermes-projects-and-space-hosts.md), SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`. Project Hermes supporta più cartelle, ma è scoped a un backend/profilo; le cartelle contengono path/label e nessun host. Le sessioni hanno una working directory; `session.workspace.move` cambia directory, non runtime/host.

Proposta da scegliere in F6: Space come contenitore Studio che aggrega cartelle su più host e riferimenti a progetti Hermes scoped almeno da connessione/host, profilo e projectId. Il path va sempre risolto insieme all'host; identici path su due macchine restano cartelle distinte. Un Project Hermes singolo non rappresenta tutte le cartelle di uno Space multi-host.

Decisioni da riprendere nella chat F6: collegare progetti Hermes esistenti oppure crearli esplicitamente; cardinalità Space/progetti per ciascun host; scelta di host e cartella di lavoro quando nasce una conversazione; accesso di un agente alle cartelle su altri host e comportamento delle cartelle offline. Nessuna creazione/importazione di progetti, copia/sync o mount impliciti. F1 fornisce connessioni stabili e routing; F2 lega le conversazioni al rispettivo host; F5 risolve file/cartelle; F6 possiede associazioni e UI Space. Registrare contratto e ownership prima degli edit condivisi.

## Dominio e ownership dei dati

Proposta tecnica da affinare: `Space`, `FolderBinding` (identità stabile, host, root scelta, stato di accesso), `WorkspaceFile` (folderId, percorso relativo, tipo, versione), `DocumentDraft` e `SaveReceipt`. Il nome visibile dello Space non è un percorso. Una cartella non equivale a profilo Hermes o sessione.

F5 possiede la risoluzione delle root, listing, lettura/scrittura e rilevamento cambiamenti. F6 possiede organizzazione Space, selezione cartelle, editor e revisione. Le azioni native attraversano un’interface limitata: nessun filesystem generico nel renderer. Definire il contratto comune prima di cambiare shared types/server/preload.

Per runtime remoto, distinguere root Mac e root host Hermes. Un path del Mac non diventa accessibile al server per essere inserito nel prompt. Se manca il mapping/autorizzazione mostrare Unavailable to agent; mount/sync/import remoto è un incremento esplicito, non requisito implicito di F6.

## Salvataggio e modifiche esterne

Le modifiche restano bozze finché la scrittura sul file non riesce. Verificare la versione letta prima di salvare; una modifica di Obsidian o di uno specialista produce conflitto, non overwrite silenzioso. La strategia concreta (hash/revisione, osservazione directory, scrittura atomica) va scelta in F5 e condivisa con l’editor.

Refresh esterno non sostituisce una bozza dirty. Permission denied, volume scollegato, file rinominato o non disponibile conservano testo e collegamento. Su file binari/grandi mostrare un limite onesto invece di forzare l’editor. Preservare encoding e newline supportati; dichiarare formati esclusi. Cmd+S, ritorno focus, scroll, IME e Reduced Motion seguono component-system.

## Lavoro degli specialisti

F1/F2 forniscono connessione e conversazione; F7/F14 identità e collaborazione; F3 controlla l’ambito. Lo specialista riceve riferimenti e istruzioni pertinenti alle cartelle selezionate. Collegare uno Space non autorizza tutte le sessioni o tutti i bot alla lettura/scrittura. Il runtime usa i suoi tool file sugli stessi file raggiungibili; il client presenta risultati e revisioni confermati.

Prima dell’invio di un documento, salvare o scegliere esplicitamente come trattare la bozza. Lettura/versione/provenienza devono corrispondere al file effettivo; non usare un vecchio snapshot della pagina SQLite come contenuto corrente. Attività parallele sullo stesso file richiedono conflitto rilevabile e responsabilità tracciata.

## Revisione di un risultato

La review sceglie Space, cartella, percorso, nome file e comportamento se esiste. La card può modificare la bozza; nessuna scrittura all’apertura. Successo soltanto dopo ricevuta filesystem, con destinazione reale e versione. Dopo risposta persa verificare l’esito prima di ritentare e impedire file duplicati.

Baseline storica: `/conversations/:threadId/reviewed-page` salva una pagina metadata con receipt `manual-review-UUID`. Non è già un contratto di scrittura file. Va adattato nella slice review, preservando idempotenza e bozze; i limiti storici di titolo/contenuto non diventano automaticamente limiti del filesystem.

## Migrazione e compatibilità

Le pagine già esistenti rimangono recuperabili come documenti legacy; nessuna cancellazione o esportazione massiva automatica. Per trasferirle nei folder proporre export esplicito, con destinazione, collisioni e ricevute verificabili. Non aggiungere `.obsidian`, `.git` o metadati Studio dentro un vault esistente senza scelta specifica. Link Markdown e struttura esistenti vanno preservati; non promettere tutte le semantiche Obsidian (plugin, embed, wikilink) dalla sola apertura dei `.md`.

## Dipendenze e incremento

F4 shell; F5 contratto minimo read-only/cartelle e successivamente salvataggio; F3 scope. F1/F2 servono per il lavoro remoto, non per leggere documenti locali offline. F7/F14/F18 riguardano specialisti, non sono prerequisiti per collegare una cartella.

Prima slice: collega folder sintetico → tree → apri testo → riavvia e ritrova binding/file. Seconda: editing, conflitti esterni e review-to-file. Si può concordare F6/F5 come due chat con contratto condiviso; questa scheda non autorizza di implementarle entrambe automaticamente.

File di ingresso già esistenti: SpaceWorkspace, SpaceLibrary, SpaceNav, WorkspaceDialog, PageDocument/editor, page/store/routes e Electron main/preload. Il vecchio page store è compatibilità, non nuova fonte dei file.

## Definition of done

Folder sintetico con `.md`, `.txt` e codice: link senza copia; due root distinguibili; lettura dei byte reali; aggiungi/scollega senza distruzione; root spostata/offline recuperabile; salvataggio e riavvio; modifica esterna preserva bozza; symlink/root escape e accesso negato testati tramite F5/F3. Nessun test sul Second Brain personale. Gate specialisti distinto: tool Hermes isolato legge/modifica un file nella root autorizzata, UI riflette il risultato; fuori root negato. Fixture non prova accesso runtime live.

## Requisito utente aggiornato — contesto e frontend Hermes

[Spec trasversale](gui-context-and-references.md): Space è la presentazione/associazione di progetti Hermes scoped, non un nuovo backend progetto. Space/host/modello/effort sempre riconoscibili; @ per file e range/testo versionati, / per cataloghi skill/tool effettivi. Questa richiesta chiarisce il mapping progetti prima indicato come proposta; multi-host resta limitato a contratti reali, niente Project distribuito inventato o accesso cross-host implicito. Nessuna implementazione automatica.

## D37 — Docs provenienti dai runtime Hermes

Studio presenta i documenti di ciascun runtime Hermes collegato e quelli associati alle sue sessioni, quando il backend li espone o consente di accedervi. «Portare in Studio» significa renderli consultabili nella GUI conservando il documento originale come fonte autoritativa, non importare o duplicare automaticamente tutti i file in un archivio Studio.

Ogni voce conserva connessione/runtime, host, profilo, identità/percorso del documento e revisione disponibile; associazioni a sessione e Space/progetto solo quando confermate dal backend o esplicitamente scelte dall’utente. Non presumere che ogni sessione possieda una raccolta nativa Docs: verificare il contratto del runtime collegato, distinguendo file di progetto, artefatti del turno e documenti effettivamente associati alla sessione. Nessuna API docs.list inventata.

La vista Docs permette di riconoscere origine e scope, filtrare per runtime/Space/sessione e aprire il file tramite F5. Una scheda nella chat F2 rimanda allo stesso documento; `@` usa soltanto le cartelle e i riferimenti autorizzati. Runtime diversi con file omonimi restano distinti. Aggiornamenti derivati da eventi o riletture supportati dal backend, con revisione e conflitti gestiti da F5; nessuna promessa di sincronizzazione live senza contratto verificato. Offline mostra ultimo dato noto come stale, senza spacciarlo per aggiornato o inviare scritture differite alla cieca.

**Ownership:** F6 associazioni e navigazione Docs/Space, F5 lettura/editor/revisioni, F2 collegamenti dalla conversazione, F1 identità connessione e host. Scollegare runtime, chat o Space non elimina documenti originali. Nessun accesso implicito a file di altre sessioni/profili, mount/copia cross-host o backend documentale parallelo.

**Gate:** due runtime con documenti omonimi, sessioni e progetti distinti; verifica origine corretta, apertura autorizzata, aggiornamento esterno/revisione, conflitto, file rimosso, scope negato, offline/reconnect e cambio runtime durante fetch. Associazione assente esplicita, nessun documento della sessione precedente durante il caricamento. Usare dati sintetici e registrare contratto/versione e limiti prima di dichiarare integrazione completa.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e File e skill della scheda. Implementa soltanto la slice selezionata di F6 aggiornata D25: Spaces collegati a cartelle reali, come vault/progetti. Definisci con F5 root/list/read/save e con F3 scope prima degli edit condivisi. Parti da folder sintetico read-only e persistenza del collegamento; contenuti autorevoli nel filesystem, pagine legacy preservate. Aggiungere/scollegare non copia né elimina file. Non scansionare vault personali o attivare specialisti/remote mapping automaticamente. Prova riavvio, errore e cambi esterni; aggiorna documenti e gate con prove. Segui anche Incarico per la chat implementatrice di F6: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
