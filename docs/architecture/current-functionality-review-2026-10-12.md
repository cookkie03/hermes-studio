# Review funzionale Hermes Studio — 2026-10-12

**Esito: la .app si avvia e i percorsi fondamentali verificati funzionano, ma Hermes Studio non è completo.** Browser, collaborazione e associazioni progetto dichiarano risultati locali senza esecuzione/verifica Hermes. Sono presenti anche difetti riprodotti nelle operazioni file.

## Ambito e metodo

Review dell'intero prodotto corrente richiesta dall'utente, non sviluppo di una feature. Snapshot HEAD `5ea8c68` su `main`; base delle aggiunte F4+ `ce8ea44`. Incluse modifiche già presenti a routine/server/UI e i file audio non tracciati. F0–F3 e tutte le schede feature preservate. Nessun codice prodotto modificato, commit o push effettuato.

Skill lette: ask-matt, code-review; workflow e norme del progetto. La skill code-review è stata applicata con assi Standards e Spec in agenti paralleli, adattando il confronto alla richiesta sull'intero snapshot. Riproduzioni aggiuntive al seam delle API e dei servizi file. TokenSave inutilizzabile: SQLite `database disk image is malformed`; analisi diretta dei sorgenti.

## Standards — 3 findings

### [P1] Collaborazione/delega genera ricevute e risposte senza Hermes

`desktop/hermes/collaboration.mjs:223` imposta `reply_received` e una risposta prefabbricata tramite timer. Anche spawn, steering, interrupt e stanze modificano mappe/JSON locali. Il gateway passato dal server non viene utilizzato. Riproduzione sintetica con gateway destinato a fallire: zero chiamate, subagent `working`, messaggio comunque `reply_received` dopo circa 150 ms.

Viola `principles.md`: stato runtime autorevole, invio/lavoro/completamento distinti, nessun executor/archivio sostitutivo. Collegare i contratti nativi e le loro ricevute oppure rendere le azioni indisponibili. Non sono prove di `delegate_task`, `message_agent` o gruppi Hermes.

### [P1] Link Space/progetto inventa un progetto e dichiara linked

`desktop/hermes/collaboration.mjs:376` usa `proj-${profile}-${spaceId}` se manca projectId e restituisce `linked` dopo il solo salvataggio in `collaboration.json`. Nessuna creazione/verifica Hermes o associazione alla sessione. La GUI passa inoltre l'ID Dot come profilo. Riproduzione: stato linked e zero chiamate gateway.

Viola identità distinte e binding verificato di principi/confini feature e D38. Il collegamento deve risolvere host/profilo/progetto nativi e applicarsi alla sessione prima della conferma.

### [P2] API takeover computer conferma controllo solo locale e altera le ricevute

`desktop/hermes/computer.mjs:76` cambia il flag locale, senza revocare comandi o modificare approvazioni Hermes. `computer.mjs:154` riscrive anche completamenti riusciti come denied mentre il flag è attivo. Riproduzione: risultato completato `{done:true}` conservato, ma stato visualizzato denied.

**Raggiungibilità:** il normale pulsante in `ComputerPanel.tsx:496` è disabilitato perché Bot Screen stream è sempre false. Il difetto è nell'API autenticata esposta senza capability gate in `server.mjs:202`, non in un takeover GUI oggi utilizzabile. Rifiutare l'API finché manca il contratto nativo e preservare gli esiti osservati.

## Spec — 2 findings

### [P1] Browser naviga e clicca soltanto nei testi simulati

`desktop/hermes/browser.mjs:210` sostituisce il contenuto con `<div>Content of URL</div>`. `browser.mjs:363` costruisce testi Clicked/Typed/Captured e ricevute succeeded senza pagina, DOM, connessione o controller. `ComputerPanel.tsx:743` presenta quell'HTML con dangerouslySetInnerHTML; non è un browser condiviso.

Riproduzione senza rete: navigare a `https://invalid.example/no-page` produce configured=true/state=running; cliccare `#does-not-exist` produce succeeded. I conteggi iniziali di cookie/storage sono prefissati a 3/5, non misurati. F12 richiede “User and agent see and modify the same page and tabs” e “no fake viewport”. Serve il contratto runtime e una pagina reale controllata e vista da entrambi; i test attuali verificano la simulazione.

### [P2] Header riporta host/modello/effort diversi dalla chat effettiva

`desktop/upstream/src/client/App.tsx:478` mostra This Mac/Hermes/Standard quando una qualsiasi connessione è online (`setup.model`). Una chat SSH o una chat offline con altro host online mostra quindi contesto errato. Il componente ConversationContext inferiore consulta la sessione, mentre questo header usa valori globali prefissati.

I requisiti GUI condivisi chiedono host effettivo e modello/effort confermati. Derivare il badge dalla sessione della conversazione selezionata, mantenendo unavailable quando non comunicati.

## Verifica funzionale aggiuntiva — 3 findings

### [P1] Tree delle cartelle sempre rifiutato alla radice

`desktop/upstream/src/server/file-service.ts:55` passa subPath vuoto a validatePathSecurity, che rifiuta la stringa vuota. La richiesta effettiva della GUI (`SpaceWorkspace.tsx:175`) omette subPath. GET `/api/files/tree?rootId=default-workspace` restituisce 400 `Path contains invalid characters.`; la UI inghiotte l'errore e mostra lista vuota. Anche searchFiles usa listFiles(rootId) con lo stesso problema.

Riproduzione con root sintetica contenente note.md: listFiles(rootId) fallisce. Consentire esplicitamente il listing della root autorizzata, conservando i controlli traversal/symlink, e verificare il percorso GUI/API.

### [P1] Creazione di file segue un parent symlink fuori dalla root

`desktop/upstream/src/server/file-service.ts:189` controlla realpath soltanto se il file finale già esiste; `file-service.ts:222` scrive direttamente quando è nuovo. Con root/external symlink a una cartella esterna, writeFile(rootId, external/new.md) scrive fuori root e restituisce applied.

Riproduzione esclusivamente in `/private/tmp/hermes-review-files-1aj3RK`: file esterno creato con contenuto sintetico. Verificare i parent reali anche per file mancanti e impedire la scrittura fuori root. I test attuali coprono la lettura di un symlink esistente, non questa creazione.

### [P2] Audio in lavorazione restituisce trascrizione fittizia e capability non provate

File non tracciato `desktop/hermes/audio.mjs:14` dichiara available senza probe. A riga 64, provider assente/fallito produce sempre `Voice dictation transcription` come trascrizione riuscita; tts restituisce testo/status ok, senza audio o playback. Non usa il routing host/profilo Hermes richiesto da F17. Inoltre backend-bootstrap filtra le API_KEY dall'ambiente del servizio .app.

Riproduzione API con payload sintetico: HTTP 200 e frase prefabbricata. La nuova suite audio.api.test non autentica le chiamate: rispondono 401 e superano assert `<500` / `!=501`, senza esercitare i handler. Separare fixture sintetiche dai percorsi distribuiti, dichiarare capability soltanto dopo probe, rendere esplicito il fallimento STT e verificare risposta autenticata/contenuto/audio reale.

## Completezza: funzioni dichiaratamente mancanti

- **F7-B:** roster Bots dei runtime, profilo nativo e Bot Chat canonica non collegati. server.mjs:107 restituisce nativeBotBinding unavailable; il Dot corrente è un'etichetta Studio, non una selezione profilo Hermes.
- **F17:** composer privo di mic/voice hook; chiamate disabilitate (`Chat.tsx:362`), `/api/voice/*` restituisce 501. I vecchi useVoice/CallView non sono montati e Electron nega le permission. Dittatura/TTS/voice realtime non complete; telefonia resta futura.
- **F11:** catalogo read-only non dimostra installazione/manutenzione plugin e skill.
- **F15/F16:** output terminale e ricevute CUA non dimostrano PTY interattiva o Bot Screen/takeover nativo.

Questi gap non sono automaticamente regressioni: diversi sono già dichiarati nelle schede. Smentiscono però una conclusione globale di software completo.

## Prove eseguite e limiti

| Prova | Esito |
|---|---|
| Build e strict renderer/metadata typecheck | PASS |
| npm test con fixture locali fuori sandbox | 83 Node PASS; 99 metadata/UI PASS, 1 FAIL |
| Test fallito | f6-spaces.test.tsx:122, empty state non corrisponde più al rendering; non è un crash generale |
| bootstrap, external-links, verify:package eseguiti separatamente | PASS |
| Packaging codice corrente in cartella distinta | PASS, firma ad hoc verificata; `.app` precedente preservata |
| Smoke offline artefatto precedente | PASS, profilo sintetico vMUuAM |
| Smoke offline nuova .app | PASS, profilo sintetico ekOSCY; zero errori, memoria legacy/Space/pagine, write failure, conflitto, restart, focus/900px |
| Chat nuova .app → REST/SSE → runtime HTTP/WS sintetico | PASS, profilo 74WsrY; streaming, doppio invio, bozze, risultati tardivi, isolamento, note/replay, IME/focus/900/1360/Reduced Motion |
| Approvals nuova .app → fixture sintetica | PASS: decisione scoped, doppio click, timeout, tastiera/900/1360/Reduced Motion; nessun runtime personale |
| Root tree, symlink parent write e audio API | Difetti riprodotti, descritti sopra |
| Browser/collaboration/computer API | Riproduzioni isolate; risultati descritti sopra |

Nuova app: `desktop/release/review-20261012/mac-arm64/Hermes Studio.app`. Gli smoke sono copie temporanee dei test esistenti con solo percorso executable/root aggiornato; nessun test prodotto modificato. Log in `/private/tmp/hermes-review-*.log` e `/private/tmp/hermes-review-current-*.log`; screenshot nei profili sintetici citati.

Il primo npm test nel sandbox falliva su listen EPERM: ripetuto fuori sandbox con sole fixture loopback. Nessun problema ambiente è stato contato come difetto prodotto. Runtime, profili, credenziali e conversazioni personali preservati. Non verificati modello Hermes reale, connessione remota reale, scheduler con client chiuso, driver CUA, Browser controller o realtime voice. Non eseguito un audit esaustivo del vecchio executor upstream non distribuito.

## Priorità operativa

Prima bloccare gli esiti simulati nelle superfici distribuite e correggere confinamento/listing file. Poi collegare browser, collaborazione e progetti ai contratti Hermes reali con prove isolate, completare roster/voce e ripetere acceptance della versione collegata.

**Conteggio:** Standards 3 findings (peggiore: collaborazione senza runtime); Spec 2 findings (peggiore: browser simulato); verifica funzionale aggiuntiva 3 findings. Otto difetti totali e gap di completezza distinti. Una build e uno smoke di avvio riusciti non chiudono quei gate.
