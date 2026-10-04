# F03 — Spaces e documenti

Stato: specifica per una chat futura; baseline esistente parziale, feature non completa. Aggiornamento: 2026-10-04. MVP quasi vuoto: nessuno Space, documento o ricordo dimostrativo aggiunto automaticamente. Questo documento non avvia sviluppo.



<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | Componenti React e stato del renderer |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Revisioni e ownership metadata |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se autosave o conflitto non preserva la bozza |

### Punti di ingresso da leggere

- [desktop/upstream/src/client/PageDocument.tsx](<../../desktop/upstream/src/client/PageDocument.tsx>): Documento.
- [desktop/upstream/src/client/editor/use-page-autosave.ts](<../../desktop/upstream/src/client/editor/use-page-autosave.ts>): Ciclo autosave.
- [desktop/upstream/src/client/SaveToSpaceReview.tsx](<../../desktop/upstream/src/client/SaveToSpaceReview.tsx>): Revisione e salvataggio esplicito.
- [desktop/upstream/src/server/page-routes.ts](<../../desktop/upstream/src/server/page-routes.ts>): Contratto metadata.
- [desktop/upstream/src/server/pages.ts](<../../desktop/upstream/src/server/pages.ts>): Persistenza pagine.
- [docs/features/F15-memory.md](<../../docs/features/F15-memory.md>): Confine con memoria separata.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Risultato e slice

Organizzare e scrivere contenuti persistenti indipendentemente dalla disponibilità di Hermes. Prima slice: Space e pagina Markdown creabili esplicitamente, salvataggio e riapertura. Seconda slice: revisione di risposta prima di trasformarla in pagina. La memoria è una feature separata: [F15 — Memoria](F15-memory.md). Review e memoria non sono prerequisiti per un editor locale funzionante.

Non è un file manager universale, una sincronizzazione cloud, una memoria globale Hermes o un sistema ACL del filesystem. Non assume web research, browser takeover o import delle note personali.

## Reference e anatomia

Norma visiva: [component-system](../design/component-system.md), inclusa l’estrazione Unsloth/Codex. OpenDots separa Spaces/documenti dai Dots e mostra una review prima di salvare. Questi pattern sono osservati nella screenshot/sorgente, non una prova di tutti i comportamenti upstream o delle transizioni. Componenti dell’editor e menu contestuali devono seguire evidenze centrali, senza inventare animazioni.

| Componente | Anatomia e comportamento |
|---|---|
| Space row | Cartella, nome, espansione figli. Conteggio reale, empty state Create page. |
| Documento | Breadcrumb/titolo, stato salvataggio, editor Markdown o vista ricca upstream con source accessibile, preview e azioni essenziali. Nessuna toolbar universale anticipata. |
| Stato editor | Modified/Saving/Saved/error/conflict con revisione verificata. Non mostrare Saved prima dell’esito persistente. |
| Review | Titolo card, destinazione autorizzata, titolo pagina, testo Markdown modificabile, Cancel e Save reviewed draft. Solo ricevuta confermata abilita Open page. |
| Page conversation | Pannello apribile, specialista con accesso allo Space, riferimento pagina salvata. Disponibilità dipende da F02/runtime. |

## Token proposti e disclosure

Norma centrale prevalente. Proposta: documento max-width 760–900px, testo editor 15–16px/24px, Markdown source 13px/20px monospace, toolbar 40–48px, titolo 24px/32px, label 12px/18px, gap 12–24px. Review riusa superficie bianca/bordo 1px/raggio 12–16px; textarea almeno 240px, ridimensionabile. Non sono misure live Unsloth/Codex.

Progressive disclosure: menu contiene azioni secondarie; source/preview espliciti, context chat apribile senza nascondere stato di salvataggio. Review non maschera il documento né impersona un runtime tool. Ridimensionamento/900px e zoom 200% devono mantenere Save/Cancel raggiungibili. Se un pannello interferisce, chiuderlo o convertirlo in superficie modale con focus trap corretto e ritorno focus.

Motion proposta 100–160ms su apertura review/menu, non ad ogni autosave. Reduced motion elimina traslazioni. Nessuno spinner che continua dopo errore e nessun badge Saved temporizzato senza risposta. Tastiera, Cmd+S, undo del testo e focus visibile; evitare scorciatoie che sovrascrivono la composizione IME.

## Dati e stato del documento

Pagina: ID stabile, Space ID, parent opzionale, titolo, contenuto, revision crescente, origine conversazione quando pertinente. Space non equivale a sessione Hermes; un Dot può lavorare in più Spaces.

| Stato | Regola |
|---|---|
| Modifica locale | Conservare draft; indicazione Modified. |
| Save/autosave in corso | Snapshot con expectedRevision; nuove modifiche restano dirty. |
| Save riuscito | Ricevuta ID/revision e testo effettivamente salvato; solo allora Saved. |
| Save fallito | Draft e errori visibili; nessun reset editor. |
| Revisione concorrente | Non sovrascrivere. Mostrare conflitto e permettere confronto/ricarica o copia draft. |
| Navigazione/close dirty | Tentare flush solo se previsto; se fallisce conservare e permettere scelta. Mai perdere testo per aprire altra chat. |
| File/database illeggibile | Preservare archivio; niente inizializzazione sopra dati esistenti. |

Undo editor non annulla una scrittura remota; distingue recupero del testo da cancellazione pagina. Rimozione non fa parte della prima slice: progettare reversibilità e conferma concreta prima di aggiungerla.

## Review e ricevuta

L’utente sceglie Review response for Space in F02. Il contenuto è una copia modificabile dell’ultima risposta disponibile; non è ricerca verificata né prova che le fonti siano vere. Destinazioni limitate agli Spaces autorizzati per il Dot, con verifica backend. Nessuna scrittura all’apertura della card; titolo e testo revisionabili, incluso un contenuto troppo lungo che va accorciato prima del salvataggio.

La baseline usa `/conversations/:threadId/reviewed-page` e un ID stabile `manual-review-UUID` per la ricevuta. Questo identificatore descrive una revisione manuale, non un toolCall eseguito. Verificare contratto attuale: titolo≤160 caratteri, contenuto≤20.000, Space valido. Prima di ripetere un Save incerto, controllare la ricevuta per lo stesso ID; non creare due pagine. Errore conserva draft; una risposta persa può aver già salvato, quindi non affermare “nothing saved” senza verifica. Ricevuta confermata mostra pagina, destinazione e revisione e abilita Open page. Review rifiutata non salva.

## Separazione da memoria e runtime

Preferenze persistenti di contesto appartengono a [F15](F15-memory.md), non all’editor. Connessione/invio dipendono da F11; le approvazioni del runtime da F16. La review manuale di un documento non è un’approvazione di comando remoto.

Page chat usa solo l’ultima revisione persistente: prima di ogni send flush riuscito, GET pagina aggiornata e `{id,spaceId,revision}` verificati dal backend; errore blocca quell’invio, senza prompt retry. Il runtime inserisce contenuto salvato con limite e indicazione truncation; il client non finge lettura dell’intero documento.

## Tastiera, copia, focus e microstati

Applicare il contratto normativo nel component-system. Cmd+S salva lo snapshot corrente; focus rimane nel punto di scrittura. Menu e select aprono da tastiera, Escape chiude e restituisce focus al controllo di origine; un errore non sposta automaticamente il cursore altrove. Aprire review porta al titolo della card o primo campo, Cancel torna all’azione che l’ha aperta; durante Save i campi non si possono mutare in modo ambiguo.

Copy Markdown è opzionale nella slice: copia soltanto il documento visibile o la selezione indicata, senza dati nascosti di runtime. Mostrare Copied soltanto dopo clipboard.writeText riuscito; errore resta leggibile e offre selezione manuale, niente successo ottimistico. Stato idle/hover/focus-visible/disabled/busy/error/success definito nella norma centrale; disabled conserva nome e motivo, Saving non equivale a Saved.

## Baseline, dipendenze e ownership

Esistono componenti upstream PageDocument/editor, controller autosave e revisioni, SpaceWorkspace, PageConversation, PageReviewCard e SaveToSpaceReview; server metadata/page store separato. Smoke metadata/restart e fixture receipt sono evidenze del prototipo, non conclusione della nuova feature. Un vero research→document live non è provato dalle sole fixture.

Prerequisiti: F01 e modello persistenza locale; F02 per review, F11 per page chat; F16 soltanto se la conversazione riceve approvazioni runtime. Ownership futura: SpaceWorkspace.tsx, PageDocument.tsx, editor/, SaveToSpaceReview.tsx e relativi test; PageConversation coordinato con F02. Page store/routes server richiedono ownership separata concordata; non modificare shared schema, ponte Hermes, shell o package incidentalmente. Preservare editor/assets/licenza upstream; prima leggere le prove e decidere quali parti mantenere.

## Reversibilità e Definition of done

Profilo sintetico vuoto distinto da dati personali; salvare snapshot compatibile prima di migrazioni. Export Markdown esplicito verso destinazione scelta, non scritture personali automatiche. Test di riavvio con nuova porta/origin dimostra persistenza su disco, non solo localStorage.

Gate prima slice: crea Space/pagina, modifica source, autosave/Cmd+S, riapri e riavvia vera.app recuperando stessi byte/revisione; salvataggio fallito e conflitto preservano draft; tastiera/focus/900px/riduzione motion; zero chiamate runtime. Gate review: nessuna scrittura prima del click, titolo/content modificati effettivamente persistiti, accesso Space negato, response loss e receipt retry senza duplicati, Cancel non salva, Open page apre il risultato confermato. Documentare limiti; non chiamare editor universale la slice Markdown.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa soltanto la slice scelta di F03 leggendo AGENTS.md, MEMORY/STATUS, GLOSSARY, component-system e questa spec. La prima slice è documenti locali e MVP vuoto; memoria è F15 e non va implementata qui; non aggiungere review/runtime insieme per inerzia. Ispeziona i componenti upstream e i test autosave prima di editarli, preserva provenienza e dati. Lavora nei file documento/editor concordati e coordina PageConversation/schema/server con i loro owner. Usa profilo sintetico, verifica fallimenti/revisioni/riavvio sulla vera.app e nessuna scrittura personale automatica. Per review richiedi azione esplicita e ricevuta idempotente, non un finto tool approval. Aggiorna documenti con prove e limiti; non riprendere il piano notturno globale.
