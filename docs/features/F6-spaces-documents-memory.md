# F6 — Spaces collegati a cartelle e documenti su file

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

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e File e skill della scheda. Implementa soltanto la slice selezionata di F6 aggiornata D25: Spaces collegati a cartelle reali, come vault/progetti. Definisci con F5 root/list/read/save e con F3 scope prima degli edit condivisi. Parti da folder sintetico read-only e persistenza del collegamento; contenuti autorevoli nel filesystem, pagine legacy preservate. Aggiungere/scollegare non copia né elimina file. Non scansionare vault personali o attivare specialisti/remote mapping automaticamente. Prova riavvio, errore e cambi esterni; aggiorna documenti e gate con prove.
