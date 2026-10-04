# Registro di lavoro

## 2026-10-04 — direzione futura per Codex

- L'utente chiarisce che non vuole ridefinire Hermes attorno alla sincronizzazione generale di chat e progetti: mantiene il modello basato su team e agenti specialisti.
- Direzione futura: gli specialisti Hermes possono richiamare Codex, seguirne il lavoro e usarne gli aggiornamenti per proseguire l'incarico, con un'esperienza simile a Codex Desktop.
- Su richiesta dell'utente, registrata solo come documentazione futura in `docs/future/codex-specialists.md`; nessuna implementazione o capacità Codex è stata dichiarata disponibile.
- Preferenza aggiunta alla memoria: quando un task sta per chiudersi, ricordare periodicamente all'utente di valutare le idee future documentate.

## 2026-10-04 — raccolta iniziale

- Ricevuta richiesta di usare `ux-extract`, `axiom-design` e `ask-matt`, installare le skill mancanti e impostare il progetto anche come project manager.
- Priorità scelta dall'utente: assistente personale e progetti.
- Fonte di requisiti: allegato `Pasted text.txt`; mantenuto fuori dai documenti pubblicabili perché contiene una conversazione personale e affermazioni di terzi da verificare.
- Workspace nuovo: solo skill e lockfile; Git senza commit e senza remote.
- Installazione iniziale interrotta dal nome agente non supportato `hermes`; corretta in `hermes-agent`. Installazione delle 15 skill Matt conclusa. Aggiunte anche due skill Axiom.
- Acquisite schermate in `docs/ux-extracts/unsloth/screenshots/`. La UI nativa può esporre elementi nascosti nell'albero accessibilità: per le affermazioni visive usare la schermata, non la sola presenza di un nodo AX.
- Le azioni Escape/Cancel non hanno mostrato una chiusura affidabile del popover nel controllo nativo; non registrarle come comportamento di prodotto verificato.
- Consultati repository pubblici e documentazione Hermes. L'indice GitHub via API pubblica ha risposto 403: nessuna estrazione del codice sorgente dichiarata completa.
- Nessun runtime Hermes personale riconfigurato. Nessun account, provider o servizio remoto modificato.

## 2026-10-04 — richiesta di persistenza continua

L'utente ha chiesto di salvare costantemente le informazioni raccolte su file aggiornati. Creati questo registro e `STATUS.md`; i prossimi blocchi di ricerca e progettazione aggiorneranno direttamente i file del progetto.

## 2026-10-04 — integrazione e riuso

- Letta la pagina ufficiale Programmatic Integration raggiunta dall'indice di architettura. Salvate le fonti in `docs/research/sources.md`.
- La documentazione espone tre opzioni di trasporto e descrive controlli di sessione, streaming e approvazioni. È evidenza documentale, non collaudo locale.
- Individuata la documentazione del client desktop upstream. Aggiunta alla proposta una valutazione di riuso prima di decidere un nuovo client.
- Verifica visiva delle acquisizioni: il file `005-model-picker.png` contiene la schermata base, non il popover. Il selettore è stato osservato nell'albero AX, ma non va dichiarato documentato da quella schermata.

## 2026-10-04 — libreria di pattern

- Verificate le immagini 002 e 006: 002 contiene Images/Reference; rinominata in `002-image-reference.png`. 006 documenta correttamente il menu strumenti.
- Scritte libreria navigabile e corpus del copy. Separati osservazioni, evidenze AX e aree non testate; nessuna copertura completa dichiarata.
- Ottimizzate le copie delle schermate a 1440×904; conversione esplicita al formato PNG. Questo non è un test responsive.

## 2026-10-04 — setup engineering

- Creati AGENTS.md, glossario, tracker locale e guida alle skill. Il setup usa i default adatti al workspace senza remote e la richiesta esplicita di configurazione dell'utente.
- Salvati due ADR proposti: separazione client/runtime e confronto riuso upstream/SwiftUI. Nessuna decisione di stack è etichettata approvata.
- La documentazione del desktop Hermes indica Electron/Vite e backend Python; confronto con SwiftUI rinviato a una verifica dedicata.

## 2026-10-04 — proposta di prodotto e design

- Salvata spec canonica in `.scratch/hermes-desktop/spec.md`, stato draft. Delimitata la prima integrazione e separato il risultato MVP dalla prova 24/7.
- Salvato design macOS: composizione, flussi, copy, accessibilità, motion e adattamento della finestra.
- Distinti incarico/esecuzione, connessione/stato del lavoro, interruzione/pausa, revisione/approvazione. Queste distinzioni evitano controlli che promettono semantiche non verificate.

## 2026-10-04 — roadmap e contratto

- Salvati roadmap, rischi, gate e otto ticket draft con dipendenze. Il primo passo è scegliere client/protocollo con evidenze, poi la chat reale completa.
- Salvato contratto desiderato dell'adattatore, con capacità documentate ancora da collaudare e gestione di eventi/retry/richieste stale.
- Il requisito 24/7 ha una prova dedicata di 24 ore su host disponibile; non viene dichiarato soddisfatto dalla sola cronologia persistente.

## 2026-10-04 — wireframe e indice

- Salvato un wireframe SVG statico con dati sintetici; nessuna UI prodotto implementata e nessun backend finto presentato come reale.
- Creato README come indice dei documenti. Completata l'installazione `writing-plans` (exit code 0): totale 18 skill aggiunte, 3 preservate.
- Avviata una copia temporanea parziale del repository Unsloth per un confronto con i sorgenti, senza dipendenze o avvio dell'app.

## 2026-10-04 — riscontro sorgenti e preview

- Completato clone sparse Unsloth e letti manifest, router e riferimenti a sidebar, palette, composer e CSS. Note persistenti e link al commit in `source-notes.md`.
- Il commit della copia (`689e1b0…`) differisce dal primo HEAD (`124e89…`): entrambe le letture sono registrate e separate dall'app installata.
- La lettura conferma una UI web con React/Tauri: design curato e stack nativo non sono equivalenti. Nessuna build o test upstream eseguito.
- Renderizzato il wireframe in PNG 1440×940 con il runtime grafico disponibile; ispezione visiva completata senza sovrapposizioni rilevate.

## 2026-10-04, 03:56 Europe/Amsterdam — verifica delle fondazioni

- Verifica passata: 26 documenti Markdown, 27 link locali, 21 skill/collegamenti, 8 ticket e relativo grafo senza cicli.
- Verificati formato e dimensioni delle 6 schermate e del wireframe; esito persistente in `docs/project/verification.json`.
- Fondazioni M0 completate. Proposta e ticket restano draft per revisione; la fase successiva è il confronto client/protocollo, non una build già pronta.
- Nessun codice prodotto, deploy o modifica del runtime personale. La copia temporanea pubblica è solo una fonte di lettura; tutti i riferimenti utili sono salvati con link upstream fissati.

## 2026-10-04, 04:08 Europe/Amsterdam — discovery Liquid Glass

- Lavoro app in attesa su richiesta utente; applicata find-skills con leaderboard, CLI Bash e verifica fonti.
- Confermata copertura glass già inclusa in axiom-design e utilità di SwiftUI per il client nativo.
- Raccomandate macOS e OpenAI liquid-glass; confronto alternative, contatori e comandi salvati in docs/research/liquid-glass-skills.md.
- Nessuna nuova installazione o modifica dello stack. Aggiornato STATUS; verificati esistenza e contenuto dei tre documenti.

## 2026-10-04 — avvio nativo autorizzato

Installate Axiom macOS, OpenAI Liquid Glass, SwiftUI Expert, Dimillian SwiftUI Liquid Glass: 25 skill totali. Per OpenAI corretto il percorso annidato dopo il primo mancato match. Letti router e riferimenti pertinenti; salvata revisione nativa e piano prima del codice. Utente richiede esplicitamente analisi e sviluppo, superando attesa precedente. CLT Swift 6.4 e SDK macOS 27 disponibili; Xcode completo non attivo.

## Primo incremento — codice

Creati package SwiftPM senza dipendenze, modello versionato, repository atomico, store Observable e UI SwiftUI con sidebar, toolbar, inspector, Settings, nuove chat e bozze. Aggiunti quattro test sul contratto di persistenza e script bundle ad hoc. Avviata compilazione; non ancora dichiarata verificata.

## Compatibilità toolchain

Primo build fallito: SDK 27 richiede SwiftUIMacros.StateMacro, plugin assente nei CLT. Individuato SDK 26.5 locale; script aggiornato per selezionarlo esplicitamente senza modificare xcode-select. Seconda compilazione in corso.

## Steering e verifica

Build SDK 26.5 riuscita, bundle firmato ad hoc e avviato; AX conferma shell e bozza da suggerimento, invio disabilitato. swift test non eseguibile: XCTest manca nei CLT. Creato runner Foundation per verificare i medesimi quattro comportamenti. Ispezionata UI Hermes attiva com.nousresearch.hermes; salvata mappatura feature senza contenuti personali. Utente sceglie espressività e team principale: nuova direzione, domande successive pendenti. Ricerca gusto delegata secondo grilling.

## Memoria canonica e nuove risposte

Creata docs/project/MEMORY.md con D01–D08, Q6 pendente, codice, verifiche, limiti e ripartenza. Aggiornati AGENTS, README e STATUS per leggerla e conservarla; spec/design marcati baseline precedente. Q5 conferma ricerca/scrittura, Q6 chiede spiegazione della stanza visiva: spiegata e riproposta, non approvazione assunta. Quattro verifiche Foundation completate con esito PASS. Ricerca gusto completata in file, candidate non installate. Finestra Hermes reference indisponibile dopo screenshot di lettura; nessun cambiamento personale.

## Workspace D09 — implementazione

Confermata composizione ordinata. Creati TeamWorkspaceView con ritratto originale Hermes e brief locale, ToolPanel con editor/anteprima/export Markdown e browser WebKit manuale su macOS 26+. Modello esteso con documento locale e decode compatibile per archivi precedenti. Build e sei verifiche della persistenza in corso. Nessun browser use o team runtime simulato.

## ADR e architecture review

Applicate documentation-and-adrs e improve-codebase-architecture su richiesta utente. Letti codebase-design e scaffold del report. Repository senza commit: review concentrata sul codice nuovo; delegata esplorazione secondo skill. Scritti ADR 0003 (archivio distinto dal runtime) e 0004 (browser manuale, non automazione). Corretto backItem della guida in subscript [-1] dopo verifica SDK WebKit 26.5.

## 2026-10-04 — inizializzazione GitHub

Confermata la repository esistente `cookkie03/hermes-studio` dal profilo GitHub autenticato nel browser; è pubblica e ha un commit README. L'utente conferma di volerla mantenere pubblica e caricare il progetto. La CLI `gh` risulta non autenticata. `.gitignore` aggiornato per escludere credenziali, configurazioni Hermes locali, archivi/database e artefatti macOS/Swift, mantenendo codice, documentazione, skill e backlog.

## Orchestrazione, direzione artistica e Git

Utente autorizza agenti di sviluppo e commit/push per incrementi. frontend-design letta; art direction delegata su file UI separati. Contratto runtime concreto individuato nel sorgente upstream: /api/ws JSON-RPC, in verifica. Git master senza commit/remote. Build correzioni workspace riuscita con SDK26.5. Nessun push eseguito.

## Piano operativo notturno

Piano completo salvato con task0–8, responsabilità, dipendenze, review focus e gate. Audit skill salvato con lacune esplicite. Goal attivo e heartbeat ogni30min creato (id hermes-sviluppo-e-verifica). Art direction e File tab integrati. Primo tentativo build ha rilevato deinit MainActor nel modello file, corretto dal responsabile con helper di lifetime. Seconda build SDK26.5 exit0, bundle firmato ad hoc. UI aggiornata ancora da verificare; nessun commit/push o chat live dichiarato.

Handshake live eseguito dal responsabile runtime con rete autorizzata: PASS health/root/gateway.ready/client.capabilities(false)/ping, nessuna sessione/prompt/history. Sei check filesystem PASS dal verificatore. Ultimo fix di pairing security scope da ricompilare. Chat reale e approvazioni restano aperte nel piano.
