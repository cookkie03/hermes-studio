# F15 — Memoria Studio

Stato: specifica per una singola chat futura; baseline parziale, feature non completa. Aggiornamento: 2026-10-04. Separata da F03 per rispettare una feature per chat. La richiesta corrente riguarda documentazione e MVP quasi vuoto; nessun nuovo sviluppo o import personale è autorizzato qui.

## Risultato e confini

Conservare una preferenza che l’utente può leggere, modificare e scegliere di includere nei nuovi messaggi di un Dot. Rendere chiaro dove viene conservata e quando entra nel contesto.

Prima slice locale: elenco vuoto, creazione/modifica esplicita, persistenza e riapertura. Seconda slice opzionale: inclusione nei nuovi messaggi con F11/F02. Questa è memoria del client Studio, non controllo della memoria interna di Hermes, cronologia, profilo personale o apprendimento automatico. Non analizzare chat per generare ricordi automaticamente.

## Reference e UI

Norma visiva e contratto di componenti: [component-system](../design/component-system.md). OpenDots mostra Memory nella sidebar in basso; ciò non prova che i suoi toggle modifichino memoria runtime. Unsloth/Codex sono reference della norma centrale, non prova di uno schema privacy o di animazioni.

| Componente | Anatomia e comportamento |
|---|---|
| Memory destination | Titolo, spiegazione Studio context, Add memory esplicito, stato archivio. |
| Empty state | Nessun ricordo automatico. Invito a scrivere una preferenza; nessuna richiesta di importare l’intero profilo. |
| Memory item | Testo visibile, ambito, modifica; nessun badge Learned o Active compute. |
| Edit surface | Label Preference or context, contenuto, destinazione/ambito se supportati, Save e Cancel. |
| Dot preference | Include Studio memories in new messages: significato limitato ai futuri invii, non autorizzazione runtime o cancellazione attiva. |
| Context preview | Se inclusione remota attivata, mostra quali ricordi verranno aggiunti a quel nuovo messaggio, prima dell’invio. |

## Token, tastiera e motion

Norma centrale prevale. Proposta da validare: label 12px/18px, testo 14px/21px, gap 16–24px, bordo 1px, raggio 12px; superficie edit contenuta con textarea multilinea. Sono proposte, non misure live. Elenco sobrio, non card annidate o grafico della personalità.

Tab in ordine visivo; aprire edit porta focus al campo, Cancel/Escape torna al pulsante origine, errore conserva cursore e testo. Copy memory, se introdotto, copia solo il testo selezionato esplicitamente; Copied dopo esito clipboard, altrimenti errore e selezione manuale. Stati idle/hover/focus-visible/disabled/busy/error/success seguono il component-system. Reduced motion elimina traslazioni; eventuale apertura 120–160ms è proposta, non animazione osservata. Salvataggio non usa spinner infinito o confetti.

## Workflow e stati

| Azione/evento | Contratto |
|---|---|
| Apertura | Leggere archivio locale; loading distinto da elenco vuoto verificato. |
| Add/Edit | Bozza locale, nessuna scrittura o richiesta runtime prima di Save. |
| Save | Persistenza nello store Studio dedicato; successo solo dopo esito. |
| Failure | Bozza preservata, errore visibile; non inizializzare sopra un archivio illeggibile. |
| Cancel | Nessuna modifica persistente; ritorno focus. |
| Disabilita inclusione | Esclude memorie dai nuovi messaggi successivi; non cancella contesto già inviato o lavoro in corso. |
| Rimozione | Slice successiva con ambito concreto e recupero/undo; non cancellare ricordi personali implicitamente. |

Cambiare istruzioni del ruolo e aggiungere un ricordo sono azioni diverse. Un Dot configurato non significa sessione remota attiva. La privacy non si deduce dalla presenza di un toggle: il contesto mandato all’agente può arrivare al provider configurato nel runtime, da documentare con la feature connessione.

## Persistenza, privacy e inclusione

Archivio client dedicato, distinta provenienza da cronologia/runtime. Record con ID stabile e ambito esplicito, schema versionato, scrittura atomica e percorso determinato dal profilo applicazione. Riavvio su nuova porta/origin deve recuperare i dati: solo localStorage non basta per l’archivio.

Non leggere, importare o modificare ~/.hermes, credenziali, Obsidian o memorie di altri strumenti automaticamente. Il profilo MVP può essere nuovo e vuoto senza cancellare quello del prototipo. Export/import personali restano fuori scope. Evitare log del testo dei ricordi, token o prompt completi; nei test usare frasi sintetiche.

Con F11/F02, inclusion avviene per invio esplicito e solo per il Dot abilitato. La baseline usa contesto preparato nel bridge; verificare versione e contratto prima dell’implementazione. Il resume non deve mostrare istruzioni/ricordi nascosti come se fossero messaggi utente originali: preservare associazione dell’invio e plaintext, senza rimuovere arbitrariamente testo simile a istruzioni. Limiti del contesto/truncation e ambiti accessibili devono essere visibili. Nessuna modifica del config Hermes per far funzionare una checkbox Studio.

## Dipendenze e ownership

F01 per navigazione; store locale per prima slice. F02+F11 soltanto per inclusione negli invii. F16 non è requisito per memorie locali e non concede accessi automatici. F03 conserva il workflow documenti; non svilupparlo incidentalmente.

Ownership da concordare prima del codice: sezione Memory in App.tsx e dialogo memoria in WorkspaceDialog.tsx oppure componenti estratti dedicati, store/route memory del servizio metadata. File condivisi con F01/F03 richiedono assegnazione esplicita; nessuna riscrittura del bridge/runtime senza coordinamento. Preservare provenienza upstream. La baseline ha già preferenze Studio e prove metadata sintetiche: verificarne implementazione e limiti, non dichiarare questa feature completa.

## Definition of done

Prima slice: avvio vuoto senza import; add/edit/cancel con bozza ed errori; persistenza su disco e riavvio vera.app con stessa directory/nuova origin; archivio corrotto preservato;900px/tastiera/focus/reduced motion; nome e descrizione di ogni controllo. Se inclusione attivata: fixture reali HTTP/WS sintetiche che dimostrano contesto nei soli nuovi invii abilitati, toggle non cancella turno attivo, resume conserva plaintext senza leak e disabilitazione esclude il prossimo prompt. Nessun file profilo runtime mutato. Rimozione reversibile collaudata prima di esporla. Prove separate dalla semplice presenza della schermata e niente dati personali nei log/screenshot.

## Prompt per una nuova chat

> Implementa soltanto la slice selezionata di F15 leggendo AGENTS.md, MEMORY/STATUS, GLOSSARY, component-system e questa specifica. Non importare memorie personali e non usare il profilo Hermes come seed. Prima slice locale, inizialmente vuota; F11/F02 sono prerequisiti solo per futura inclusione nei nuovi messaggi. Ispeziona la baseline e concorda ownership dei file Memory condivisi prima di modificarli. Conserva testo/archivio su errore; contesto Studio è distinto da memoria runtime e lavoro attivo. Verifica restart, privacy, focus/tastiera/reduced motion con dati sintetici, aggiorna prove e documenti. Non riprendere il piano notturno globale né implementare F03 incidentalmente.
