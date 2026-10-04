# Revisione architettura per feature

Data: 2026-10-04. **Audit storico prima di F00**, conservato per ragionamento e provenienza. Aggiornamento: candidato Metadata locali selezionato/consolidato in F00, strict typecheck senza --noCheck; [review consegna](f00-review-2026-10-04.md). Candidato Conversazione non selezionato. Tabella/limiti sotto fotografano il codice precedente: per norme e ownership attuali usare [principi](principles.md), [confini](feature-boundaries.md) e [STATUS](../project/STATUS.md).

## Scope autorevole

La nuova richiesta dell’utente privilegia documentazione per feature e un MVP essenziale, quasi vuoto. Stop a nuove feature/build/release. Il fork è annullato: non è un candidato architetturale né un’attività futura di questa revisione. ADR0005 conserva la scelta del renderer Electron e la separazione tra metadata locali e runtime Hermes; non richiede implementare tutte le superfici copiate.

Letture: MEMORY, STATUS, GLOSSARY, ADR0005, improve-codebase-architecture, codebase-design e HTML-REPORT. Il parent sta aggiornando i documenti canonici: i passaggi storici su lavoro notturno/fork non prevalgono sulla richiesta appena ricevuta. Hotspot esplicito: desktop/, appena creato e modificato. Ispezione dei sorgenti, non prova live delle feature.

## Candidato 1 — Deepen il module Conversazione

**Recommendation strength: Strong**, per il prossimo intervento sul comportamento Conversazione, non come lavoro da iniziare adesso.

Files: `desktop/upstream/src/client/Chat.tsx`, `hermes-display.ts`, `PageConversation.tsx`, `desktop/hermes/bridge.mjs`, `desktop/hermes/server.mjs` e fixture relative.

**Problema:** l’interface che il renderer deve conoscere comprende ammissione HTTP, eventi SSE, fase del turno, messaggi confermati/incerti, rinnovo della presenza UI per Approvazione, ripristino bozza e cronologia. L’implementation è concentrata in Chat ma i test di pure helper attraversano un’altra seam: non verificano l’ordine reale delle chiamate. Le correzioni recenti del doppio invio, cancellazione Approvazione e bozza durante cambio chat sono evidenze concrete di questa locality insufficiente.

**Soluzione proposta:** concentrare il ciclo di una Conversazione in un deep module interno al renderer; Chat e Conversazione della Pagina usano la stessa interface comportamentale. L’implementation assorbe sequenza, cleanup e riconciliazione. Il gateway resta un adapter al seam del trasporto; niente framework generico di agenti o sostituzione del runtime.

**Before:** Chat conosce bozza + HTTP + stream + cronologia + lease; helper puri ricevono sottoparti dello stato. **After:** le due superfici visive conoscono la Conversazione; l’implementation concentra stato e ordine degli eventi, con adapter Hermes reale e adapter sintetico già necessari nelle prove.

**Deletion test:** eliminare oggi un helper di sola trasformazione sposta logica dentro Chat; non elimina la complessità del ciclo. Il candidato ha valore soltanto se deleting il futuro deep module fa riapparire sequenza e riconciliazione nei due caller. Non aggiungere un pass-through sopra gli helper esistenti.

**Benefici:** locality delle transizioni; leverage della stessa interface per chat principale e Pagina; tests sull’interface usata dai caller. Nessuna interface concreta proposta in questa revisione. Non mantenere contemporaneamente due sistemi di stato.

**Gate del candidato:** una sequenza sintetica deve coprire HTTP202 prima/dopo finale, interruzione di stream, reply incerta senza replay, cambio Conversazione con bozza non vuota/vuota, Approvazione cancellata, unmount e rinnovo della presenza UI. Testare cleanup e ordine, non il numero di hook o la struttura interna.

## Candidato 2 — Concentrate il module Metadata locali

**Recommendation strength: Worth exploring**, soltanto quando una feature Metadata viene selezionata.

Files: `desktop/hermes/server.mjs`, `desktop/upstream/src/server/{app,workspace,workspace-routes,page-routes,store,pages}.ts`, `desktop/tsconfig.metadata.json`, `desktop/scripts/metadata-manifest.cjs`.

**Problema:** l’adapter riusa route Metadata tramite un facade che assume forme dell’executor originale e implementazioni unavailable. L’interface mentale comprende nomi e contratti che il runtime Hermes non usa. L’implementation metadata è verificata da fixture, ma il grafo TypeScript originale trascina tipi dell’executor inattivo e viene temporaneamente trascritto con --noCheck.

**Soluzione proposta:** rendere esplicito un module Metadata locali con interface limitata a Space, Pagina, Dot e Memoria effettivamente selezionati nell’MVP. L’adapter HTTP resta sottile; proprietà/accesso/revisione e persistenza restano nell’implementation, senza introdurre storage intercambiabili ipotetici. Reuse conservato dove guadagna depth; eliminare dipendenze dall’executor solo con test equivalenti.

**Before:** renderer → route riusate → facade dell’executor → store locali; tipi executor attraversano il seam. **After:** renderer → adapter HTTP → deep module Metadata locali → store già esistenti; runtime Hermes resta indipendente.

**Deletion test:** il facade attuale non va semplicemente cancellato: sposterebbe mapping e politica nelle route. Il guadagno esiste se il nuovo module concentra invarianti e rimuove conoscenza del vecchio executor dai caller. Un package che riesporta gli stessi simboli è shallow e non soddisfa il candidato.

**Benefici:** locality di proprietà/revisioni; leverage delle route per editor e libreria; interface come test surface. L’unico adapter persistenza attuale non giustifica una seam astratta per database alternativi.

**Gate del candidato:** typecheck del grafo Metadata senza --noCheck; fixture di proprietà/accesso, revisione409, errore di salvataggio e riapertura; nessuna importazione del vecchio executor nel prodotto. Non ampliare le capacità del prodotto per giustificare il refactor.

## Top recommendation

Documentare prima il ciclo Conversazione e i suoi invarianti nella scheda feature, poi scegliere se esporlo nell’MVP. Il candidato 1 presenta attrito osservato e due caller concreti; il candidato 2 riguarda una consolidazione futura. Nessuno dei due è un prerequisito per scrivere documentazione o tenere l’MVP quasi vuoto.

## Un lavoro per feature, una chat

| Feature | Ownership concreta | Contratti da consultare | Fuori scope della chat |
|---|---|---|---|
| Shell e navigazione | Electron lifecycle, App selezione/layout | autenticazione locale, permessi, chiusura ≠ cancellazione | nuovo runtime, voice, palette redesign |
| Conversazione | Chat, ciclo invio/eventi/bozza | gateway, identità owned, ammissione ≠ finale | routing globale, editor, tool executor nuovo |
| Approvazione | presenza UI, richiesta/risposta/cancel, avviso owned | Conversazione e capacità gateway | autorizzazioni globali o cambi del runtime personale |
| Space e Pagina | metadata, editor, revisione e autosave | proprietà/accesso, schema, --noCheck limitation | chat e memoria generiche |
| Revisione risultato | SaveToSpaceReview, testo selezionato, ricevuta | Pagina revisionata; provenienza confermata | salvataggio autonomo o contenuti incerti |
| Memoria | preferenze locali e permesso di contesto | store locale e preparazione contesto | import delle memorie personali Hermes |
| Computer | rappresentazione capability/tool owned | gateway reale e provenienza | browser/computer use inventato, takeover non supportato |
| Packaging | entrypoint, grafi runtime e notice | production build, firma locale, manifest | pubblicazione, fork, credenziali Apple |

Questa tabella assegna lavoro documentale; non approva tutte le feature per l’MVP. I file condivisi richiedono coordinamento: una chat non acquisisce automaticamente ownership di App, server o bridge interi. Ogni scheda deve nominare file toccati, invarianti condivisi, evidenze esistenti, criteri minimi, dipendenze e non-obiettivi. Registrare una nuova decisione trasversale in ADR prima di duplicarla tra schede. Nessuna feature deve dipendere da un riordino globale del repository.

## Convenzioni e quality gates

- Usare il GLOSSARY: Conversazione, Esecuzione, Approvazione, Space, Pagina e Memoria restano distinti. Un Dot non implica un processo attivo.
- Mantenere interface piccole e complete: errori, ordine, cleanup, persistenza e capacità sono parte dell’interface, non note opzionali.
- Evitare varianti speculative: un adapter è una seam ipotetica; due adapter concreti possono giustificarla. Non creare plugin architecture per il futuro.
- Prima cambiare documentazione del comportamento, poi implementation soltanto quando la feature è autorizzata. Non copiare output privati nelle fixture o nelle schede.
- Test principali attraverso la stessa interface dei caller. Pure helper tests restano complementari e non provano orchestration.
- Gate distinti: renderer/shared strict typecheck; Metadata --noCheck è una limitazione aperta; Node fixture comportamento; trasporto sintetico; UI packaged. Non rinominare il primo gate full typecheck.
- Verifica proporzionata: sintassi/test mirati per un cambiamento scelto; rebuild/package solo per cambiamenti prodotto autorizzati. Nessun gate impone una nuova build nella fase documentale corrente.
- Mai trasformare handshake in prova di chat o UI in prova di tool. Riapertura metadata, socket sintetico, handshake live e prompt live sono evidenze diverse.
- Mantenere LICENSE/PROVENANCE come attribuzione del codice riusato; ciò non richiede fork GitHub o aggiornamenti automatici.
- Una feature conclusa include contratto, limiti ed evidenza persistente. Non dichiarare il MVP concluso perché una screenshot assomiglia al target.

## Evidenze e limiti

Questa revisione non ha eseguito nuove prove o build. Il processo package:dir già avviato (session15744) era completato con exit0 prima del cambio di scope. Le fixture e gli smoke citati sono evidenze raccolte nei blocchi precedenti; non una conferma live aggiuntiva. Nessun sorgente desktop modificato da questa revisione. Nessuna pubblicazione, fork o refactor.

Report visuale: /var/folders/b6/gd7wmz3x2qd3mfp8vdf2yg_m0000gn/T/architecture-review-20261004-134503.html
