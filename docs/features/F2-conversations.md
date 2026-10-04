# F2 — Chat e presentazione degli eventi Hermes

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F2**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Rendere utilizzabile la conversazione con streaming reale, stati turno, cronologia, interrupt/resume e componenti runtime visibili.

**Backend e confine:** Sessioni e tool/events Hermes tramite F1; thinking soltanto se emesso, risultati/changes/approvals/validation con origine e esito backend. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** D37: ogni runtime collegato presenta i propri Bots come Dots tramite roster nativo, senza ricreazione manuale; ownership F7. Applicare anche D36 qui sotto: pannello laterale per figli temporanei; Dots persistenti nella propria chat, messaggi attribuiti e attività confermata dal runtime. Header/composer Space-host-modello-effort; @ riferimenti file/range F5/F6; / cataloghi F11; note native F8 e output F15. F2 orchestra transcript e invio, non implementa tutti i tool. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F1 per slice runtime; F3 approvals. File/range e cataloghi consumano i contratti degli owner; gate reali mancanti dichiarati senza fixture presentata come chat live. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Delta prima dell’ack, doppio invio, cambio chat/host durante stream, disconnessione/resume, tool result tardivo, scope negato, bozza preservata, approvazione annullata. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: incremento invio scoped/bozze implementato e verificato il 2026-10-04; F2 completa resta parziale. [Prove e gate aperti](../architecture/f2-submission-review-2026-10-04.md). La selezione della scheda ha autorizzato questo incremento, senza sviluppo delle altre feature.


<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Ciclo Conversazione dietro una interface verificabile |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Riprodurre race, invio incerto o stream interrotto |
| [improve-codebase-architecture](<../../.agents/skills/improve-codebase-architecture/SKILL.md>) — condizionale | Solo se si sceglie il candidato Conversazione |

### Punti di ingresso da leggere

- [docs/research/runtime-integration-findings.md](<../../docs/research/runtime-integration-findings.md>): Eventi e scope.
- [desktop/upstream/src/client/Chat.tsx](<../../desktop/upstream/src/client/Chat.tsx>): Composer e orchestration.
- [desktop/upstream/src/client/ChatTranscript.tsx](<../../desktop/upstream/src/client/ChatTranscript.tsx>): Presentazione.
- [desktop/upstream/src/client/PageConversation.tsx](<../../desktop/upstream/src/client/PageConversation.tsx>): Secondo caller del ciclo chat.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Ammissione e stream.
- [desktop/hermes/bridge.test.mjs](<../../desktop/hermes/bridge.test.mjs>): Fixture esistenti da ampliare con comportamento reale.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Risultato e confini

Preparare una domanda per un Dot, vedere che è stata inviata e distinguere la ricezione dal lavoro effettivo. Ritrovare bozza, messaggi e richieste di decisione senza duplicare un prompt durante una riconnessione.

Prima slice locale: creare/selezionare una conversazione, salvare la bozza e mostrare empty state. Il collegamento remoto è una slice successiva con dipendenza esplicita dalla feature runtime. Nessuna risposta simulata, invio automatico di suggerimenti, chiamata vocale, upload o delega automatica.

## Riferimenti e componenti

Leggere [component-system](../design/component-system.md) come norma visiva e libreria di evidenze Unsloth/Codex. OpenDots fornisce il layout centrale, avatar, composer, card di attività e review; i dettagli del tool disclosure devono rispettare la norma centrale. Una screenshot non prova streaming, animazione o comportamento del composer.

| Componente | Anatomia e interazione |
|---|---|
| Header Dot | Avatar/nome/ruolo a sinistra; stato operativo sotto; Computer e review a destra. Voce assente o future/disabled, mai attiva senza supporto. |
| Timeline | Messaggi utente distinti visivamente, risposta Markdown leggibile, fonti con destinazione reale; attività strumenti e decisioni associate alla conversazione corretta. Nessuna card intitolata Approved senza esito. |
| Composer | Testo multilinea, invio esplicito, pulsante con nome; Shift+Enter nuova riga, Enter invia solo fuori composizione IME. Allegati non disponibili finché il contratto non esiste. |
| Delivery indicator | Pending/received/uncertain sul messaggio utente, distinto dallo stato operativo del turno. |
| Activity card | Nome strumento, stato, input espandibile e risultato reale limitato; copy/download solo se supportati. Forme Unsloth/Codex derivate dalla norma, non aggiunte arbitrariamente. |
| Approval card | Comando/descrizione, ambito e sole scelte del backend. Pulsanti espliciti; nessuna scelta preapprovata. |
| Review document | Azione nominata Review response for Space; apre draft locale modificabile. Il salvataggio e la ricevuta appartengono a F6. |

## Token proposti e motion

Norma centrale prevalente. Proposta: header 64–72px, avatar 40px, corpo 14px/21px, codice 12px/18px monospace, timeline padding 24–32px; composer minimo 56–64px, altezza testo crescente con limite 150px, card raggio 12–16px. Larghezza di lettura massima circa 760px quando il pannello è chiuso; non restringere la colonna fino a centrare l’header. Questi valori non sono misure live Unsloth/Codex.

Nuovo messaggio: comparsa breve 100–160ms proposta, senza ritardare l’invio. Scroll automatico solo se l’utente era vicino al fondo; mentre legge sopra, mostrare un’indicazione nuovi messaggi. Non far pulsare l’intera risposta o animare ogni token. Avatar può spiegare un evento puntuale; niente bob infinito. Reduced motion disattiva spostamenti e mantiene stato testuale e focus. Annunci accessibili sintetici, non ripetere ogni delta.

## Tastiera, copia, focus e microstati

Applicare il contratto normativo del component-system. Enter/Shift+Enter rispettano IME; dopo invio il focus resta nel composer e il messaggio Pending compare senza salto di scroll se l’utente legge altrove. Tab attraversa header, contenuto interattivo e composer in ordine visivo. Disclosure strumenti operabile con Enter/Space; Escape chiude i popover e restituisce focus all’origine. Uno stato errore non ruba focus né elimina il draft.

Copy response, se introdotto nella slice, copia solo il testo della risposta scelta e non gli input tool, memorie o istruzioni nascoste. Successo Copied solo dopo esito clipboard; failure mostra alternativa selezionabile. Pulsanti iconici hanno nome persistente quando il testo visivo è nascosto. Hover, focus-visible, disabled, busy e error appartengono alla norma centrale: non introdurre un’animazione diversa per ogni strumento. Richiesta di approvazione e salvataggio pagina hanno semantica distinta e focus associato alla propria card.

## Contratto degli stati

| Evento/prova | Stato visibile | Regola |
|---|---|---|
| Click Send valido | Riga utente Pending immediata | ID di invio stabile prima di attese rete; testo conservato. |
| HTTP202 | In dispatch/attesa Hermes | Non significa risposta ricevuta, Running o completion. Bloccare secondo invio fino a fase certa. |
| Ack runtime | Ricevuto | Aggiorna la stessa riga; non crearne un’altra. |
| Delta/tool.start reale | Working | Solo evento effettivo dell’esecuzione, non connessione o timer. |
| Complete confermato | Completato/errore/interrotto | Delta e risultato finale si riconciliano una volta. Nessun successo dedotto dal testo. |
| Stream perso | Delivery/stato da verificare | Conservare bozza; osservare/reconnettere senza reinviare né cancellare lavoro. |
| Approval request | Decisione richiesta | ID, thread/sessione e scelte exact; cancel/resolved rimuovono la card. |
| Altra chat richiede decisione | Avviso con navigazione | Nessun comando privato nella notifica generale; aprire la conversazione corretta. |

Una bozza digitata durante un invio precedente non si cancella all’arrivo dell’ack. Memorizzazione locale e disco devono preservare anche la scelta intenzionale di una bozza vuota. Cronologia restaurata può avere stringhe o parti di testo: gestire il formato documentato, non convertirlo silenziosamente in vuoto. Tool.start e complete usano il vero `tool_id`; una vecchia start non regredisce una completion nuova. Conservare provenienza di contenuto troncato e non presentarlo come completo.

## Contratto di integrazione proposto dalla baseline

La baseline ha REST locale e SSE; verificarli sulla versione corrente prima del codice. `/hermes/send` riceve `threadId`, `text`, `clientSubmissionId`; gli eventi distinguono dispatch/admission/turn/runtime. `/hermes/history?threadId&refresh=1` restituisce messaggi, stato effettivo, toolEvents e pendingRequests. `/conversations/:id/draft` conserva la bozza nel profilo client. Non assumere che questi endpoint siano lo stesso contratto del gateway Hermes pubblico.

Le lease delle approvazioni esistono solo mentre il relativo handler/stream è montato. Settings Connect non attiva di nascosto server requests; scollegare il client non autorizza autoapprove. Rispondere solo alle scelte annunciate. Una conversazione legata a pagina richiede `beforeSend`: flush editor riuscito, lettura pagina salvata, invio di `{id,spaceId,revision}` validato dal backend. Mai usare contenuto editor non salvato senza dirlo all’utente.

## Baseline e limiti delle prove

Esistono Chat.tsx, ChatTranscript.tsx e reducer di display. Quattordici fixture renderer/review sono passate durante il prototipo; le prove rete sintetiche e handshake hanno confini separati. Handshake non è prova di un incarico live completato. Il prototipo e le sue fixture sono materiale riutilizzabile, non accettazione automatica della nuova feature. Nessun test deve usare conversazioni o credenziali personali per costruire screenshot.

## Dipendenze, ownership e reversibilità

F4 per shell; F6 per review/documento; specifica runtime per invio/stream/approvazioni. La slice locale non dipende da Hermes. F1 è il prerequisito della connessione/invio; F3 soltanto delle approvazioni, che possono restare fuori dalla prima slice remota. Ownership futura: Chat.tsx, ChatTranscript.tsx, hermes-display.ts e fixture; PageConversation.tsx solo coordinandosi con F6. Non cambiare gateway/server/shared contracts senza accordo e review. Non coinvolgere packaging salvo verifica finale coordinata.

Profilo client sintetico separato; thread locali non creano sessioni remote finché non c’è invio esplicito. Nessun import automatico della cronologia personale. Migrazioni non distruttive; errore di storage preserva bozza e byte. Close, disconnect e interrupt sono azioni diverse; interrupt esplicito con esito, non terminate del processo runtime.

## Definition of done

Slice locale: vuota al primo avvio, conversazione creabile, bozza ripristinata dopo cambio chat e riavvio con nuova origin, tastiera/IME e nomi accessibili verificati. Slice remota: fixture su HTTP/WS reali sintetici per delta prima di HTTP, ack lento, doppio invio, disconnect, errore terminale, cancel approval, reopen e storia/toolcards. Verificare messaggi in ordine, nessuna duplicazione o retry automatico, bozza nuova preservata, ambiti approval rispettati. Collaudo del runtime reale solo isolato e autorizzato; documentare il risultato effettivo. UI in.app 1360/900px e reduced motion. Review salva solo con scelta esplicita e ricevuta F6.

## Contesto file, memoria e voce — D25–D29

Contesto Space usa riferimenti a file e revisione/host autorizzati F6/F5, non solo pageId legacy. Memoria Space e snapshot Hermes distinti F9. Un attachment non concede accesso all'intero folder. F17 possiede mic/playback; F2 conserva transcript e identità turno, distinguendo bozza dettata, invio e risposta. Risultati tardivi audio/browser non vengono associati a un Dot nuovo; nessun retry di prompt incerto.

## D30 — Eventi nativi e note dopo la risposta

[F8-A](F8-hermes-native-features-and-observability.md) possiede proiezione degli eventi Hermes; F2 presenta la nota `review.summary` nella timeline del suo owner anche dopo fine turno. Non scartare aggiornamenti memoria/skill alla fine della risposta e non limitarli a toast. Correlazione a messaggio preciso solo se supportata, altrimenti nota di sessione. Preservare testo runtime, pending/applicato distinti, e subscription scoped oltre `turn complete`. Review/self-improvement non equivale sempre al curator.

## Handoff F1: conversazioni e host

Scelta utente: conversazioni assegnate al rispettivo host, con host diversi utilizzabili contemporaneamente. F1 possiede connessione/routing; F2 conserva il legame della conversazione a host, profilo e sessione. La selezione di un altro host non migra una conversazione. Per il contesto Space/progetto e la working directory riprendere il [promemoria F6](F6-spaces-documents-memory.md#progetti-hermes-e-space--promemoria-per-lo-sviluppo-f6), senza assumere che una sessione raggiunga tutte le cartelle multi-host.

## D34 — Chat completa Hermes

Studio deve presentare le componenti della chat Hermes, anche quelle visibili nella TUI: streaming della risposta, thinking quando emesso dal runtime, tool eseguiti, codice/comandi e relativo output, changes/diff, richieste di approvazione e validazione delle operazioni rischiose. Controlli modello/effort e altre impostazioni chat devono usare contratti reali del runtime collegato. Non sintetizzare thinking o esito di una validazione dal testo della risposta; associare eventi a host/profilo/sessione/turno solo con identità verificate. F2 presenta timeline/composer; F3 possiede approvazioni; F5 changes/file; F15 terminale; F8 mappa copertura e gap. Preservare layout OpenDots e norma componenti.

Settings persistenti hanno una sezione dedicata, distinta dai controlli contestuali del composer. F4 struttura Settings Hermes e Settings Hermes Studio; F8 inventaria impostazioni native e superfici, ciascuna feature mantiene ownership delle proprie operazioni. Non implementare questa parità incidentalmente in F1.


## Requisito utente aggiornato — contesto e frontend Hermes

[Spec trasversale](gui-context-and-references.md): Space è la presentazione/associazione di progetti Hermes scoped, non un nuovo backend progetto. Space/host/modello/effort sempre riconoscibili; @ per file e range/testo versionati, / per cataloghi skill/tool effettivi. Questa richiesta chiarisce il mapping progetti prima indicato come proposta; multi-host resta limitato a contratti reali, niente Project distribuito inventato o accesso cross-host implicito. Nessuna implementazione automatica.

## D36 — Collaboratori nella chat

Il composer conserva `@` per file delle cartelle dello Space, file interi/range/selezioni secondo F5/F6, e contesto sempre visibile Space/host/modello/effort. La timeline mostra i messaggi tra Bots con mittente, destinatario e stato di consegna reale; una ricevuta queued non significa che il destinatario stia lavorando.

La chat padre offre un controllo «Sub-agent» per aprire il pannello laterale F14: elenco dei figli temporanei e dettaglio del figlio selezionato. Mostrare incarico, stato, contesto disponibile e attività/output forniti da Hermes, senza inventare thinking o transcript completo. I Dots persistenti non occupano questo pannello: il collegamento al destinatario apre la sua conversazione, dove compaiono il messaggio ricevuto e l’attività reale.

Gate: invio A→B, stato di consegna nella chat A, messaggio effettivo nella chat B; attività distinta da non letto. Avvio di una delega apre un dettaglio scoped alla chat padre; cambio chat/host durante il caricamento non mostra eventi del precedente figlio. Offline e stato non verificabile restano espliciti.


## D37 — Ogni runtime porta i propri Bots in Studio

Quando si collega un runtime Hermes, Studio ne scopre e presenta tutti i Bots autorizzati come Dots, conservando l’identità nativa. Non richiedere di ricreare manualmente ogni Bot o di creare un Dot locale prima di poterlo vedere. La scoperta usa il roster nativo verificato (vedi contratti e fonti in [F7](F7-bots-and-identities.md)), non una lista inventata dal frontend. Un profilo non confermato come Bot non viene automaticamente promosso a Bot.

Identità scoped a connessione/runtime, installazione e profilo: Bots omonimi su host diversi restano distinti, con host/origine riconoscibili. Selezionare un Dot apre la Bot Chat canonica di quel runtime secondo F7/F2, preservando sessione e continuità native; non crea una chat sostitutiva né invia prompt introduttivi. Space, modello ed effort mostrano il contesto effettivo disponibile, senza associazioni dedotte dal nome.

Discovery del roster non importa tutte le conversazioni, non clona Bots, credenziali o memorie e non avvia lavoro. Metadata/avatar locali restano presentazione. Riconnessione aggiorna il roster senza duplicati; backend offline mostra Bots già noti come offline/stale, senza nasconderne l’origine o attribuire attività. Aggiunte/rimozioni seguono i dati confermati dal runtime; scollegare Studio non cancella Bots o lavoro backend. Figli temporanei delegate_task restano nel pannello sub-agent D36, non nel roster persistente.

**Ownership:** F1 fornisce connessione e identità del runtime; F7 scopre/mappa/presenta roster e risolve Bot Chat; F2 presenta conversazione ed eventi; F4 rende navigabili Dots e host; F14 collega messaggi e attività native. Verificare capability/schema nel runtime collegato; assenza di contratto è un limite visibile, non autorizza backend alternativo.

**Gate:** collegare due runtime sintetici con Bots omonimi e roster differenti; tutti i Bots autorizzati compaiono senza creazione manuale, identità e chat canonica corrette. Refresh/reconnect non duplicano righe; aggiunta/rimozione, profilo non-Bot, scope negato, offline e cambio host durante discovery non contaminano il roster. Nessun prompt, clonazione o import globale di cronologia per la sola connessione. Contratti sorgente sono evidenza documentale, non prova live.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa soltanto la slice di F2 esplicitamente selezionata, leggendo AGENTS.md, MEMORY/STATUS, GLOSSARY, component-system e questa spec. Prima verifica se il prerequisito runtime è pronto; in caso contrario realizza soltanto conversazioni/bozze locali, senza simulare risposte. Riusa il prototipo dove utile e non riscrivere server o shell fuori ownership. Mantieni Pending, ack, Working e terminale distinti; niente auto retry o approvazioni automatiche. Usa profilo e gateway sintetici, salva le prove dei race test e della vera.app. PageConversation richiede flush e revisione salvata ad ogni invio. Aggiorna documentazione e consegna limiti verificati; non riprendere il piano notturno globale. Segui anche Incarico per la chat implementatrice di F2: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.

## Consegna incremento — 2026-10-04

Invio scoped e lock, cancellazione preparazione su close/scelta host, ack correlati senza regressione Working, bozze serializzate con flush all’uscita. Suite 36 Node + 61 metadata/display, build/package e smoke .app sintetico PASS; tastiera/IME, 900/1360 e Reduced Motion verificati. [Matrice requisiti/contratti/file/prove e limiti](../architecture/f2-submission-review-2026-10-04.md). Il modello Hermes reale isolato e i requisiti completi di F2 non sono certificati; non attribuire il completamento della feature a questo incremento.
