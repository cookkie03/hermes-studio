> Documento/evidenze storici. Per stato corrente leggere [STATUS](../project/STATUS.md); requisiti e gate attuali nel [catalogo feature](../features/README.md). Il contenuto sotto non autorizza nuove attività né certifica lo stato successivo a F00.

# OpenDots desktop — applicazione del riferimento

2026-10-04. Decisioni D14–D18 e immagine utente in `docs/design/references/opendots-user-reference-2026-10-04.png` prevalgono sull’atelier SwiftUI precedente. Questa implementazione modifica il renderer del sorgente OpenDots fissato nel documento PROVENANCE del desktop; non sostituisce il frontend con un redesign.

## Confronto osservato

L’immagine utente ha una sola sidebar, prima Spaces poi Dots, con avatar plush e un estratto per agente. Header Dot/chat in alto, conversazione al centro, composer in basso; Computer a destra con Browser/Files/Terminal. Palette chiara avorio, selezione lavanda, messaggio utente verde acqua, card bianche con bordi sottili. Non vi compare il rail verticale aggiunto nell’HEAD upstream.

Applicazione: rimosso rail; riordinata sidebar; ricerca filtrante Spaces/Dots; avatar originali preservati, Dot summary dalla vera metadata locale. I componenti documenti/editor/Spaces e le loro risorse rimangono upstream. CSS aggiunto alla fine del foglio per circoscrivere gli adattamenti Hermes. Titolo serif e illustrazione del prototipo SwiftUI non vengono portati qui. Header/composer/card mantengono il linguaggio OpenDots. Le colonne hanno larghezze adattive, pannello Computer diventa overlay quando lo spazio è insufficiente.

Queste sono osservazioni sull’immagine e sul codice. Un confronto visivo live della nuova build, resize e accessibilità completa non sono ancora verificati da questo agente.

## Stato e runtime

App/Chat/ThreadList non richiedono il provider CopilotKit né una chiave OpenAI separata per il percorso Hermes. Le conversazioni sono record locali; l’invio passa al bridge `/api/hermes/*`. ChatTranscript e avatar upstream vengono riutilizzati. L’editor dei documenti resta upstream.

La timeline mostra immediatamente il messaggio utente con identità stabile e stato pending. HTTP accepted non è una prova di esecuzione; RPC acknowledgement o eventi reali confermano ricezione. Dispatching, waiting, running e uncertainty restano distinti. Delta/finale e risultati tool provengono dal runtime; nessuna conversazione Acme, risultato, running o review approvata viene inventata.

SSE interrotto mostra subito incertezza, conserva il testo e non cancella il runtime. Nessun reinvio automatico. La riconnessione rilegge la history della sessione posseduta, con merge che preserva righe pendenti e delta più nuovi. Un runtime esplicitamente idle può sciogliere l’incertezza; running assente non è interpretato come idle. Approvals mostrano soltanto scelte supportate ricevute dal runtime, correlate al request ID; non approvano automaticamente.

Le bozze sono per conversazione: GET/PATCH dedicati al bridge salvano su disco; localStorage è fallback sull’origine corrente. La lettura deve riuscire prima dell’autosalvataggio remoto, per evitare di sovrascrivere una bozza esistente con vuoto. Il risultato di un invio precedente non cancella testo nuovo digitato nel frattempo. Gli errori di bozza sono visibili.

## Strumenti e funzioni future

Computer mantiene la superficie a tre tab ma non chiama il servizio OpenBot non configurato. Espone connessione Hermes e risultati file/terminale ricevuti realmente dalla chat attiva. Browser non mostra una screenshot inventata: stream del computer e takeover sono indisponibili. Chip dei permessi sono informativi; il runtime governa accesso agli strumenti, non questi chip.

Chiamata e allegati sono disabilitati con spiegazione. Chiamate, Slack, scheduling, learning e controllo umano restano integrazioni future. Settings non richiede credenziali Intelligence/voice; permette connessione al gateway Hermes. Non promette che modificare una preferenza interrompa il lavoro in corso. Le memorie Studio vengono incluse nei messaggi successivi secondo i controlli del bridge; non sono la memoria interna Hermes.

## Verifica del renderer

Sette scenari Vitest passati in `src/client/hermes-display.test.ts`: ordine utente prima di delta antecedente acknowledgement, una sola riga pendente e uncertainty, accumulo delta/finale unico, bozza nuova preservata durante invio vecchio, history senza duplicare pending o perdere delta nuovi, richieste identiche distinte, proiezione di text parts e formato ignoto rifiutato.

La prima verifica TypeScript ha rilevato union troppo larga nel renderer (corretta con TextMessage) e incompatibilità AG-UI della risoluzione dipendenze upstream (gestita dall’agente packaging fissando le versioni originali). Build finale, DMG, smoke UI e confronto screenshot vengono coordinati dal parent e vanno registrati dopo il loro esito, non desunti da questi test di stato.

## Limiti correnti

La timeline dei tool è una rappresentazione degli eventi ricevuti nella sessione UI; il ripristino completo di tutti i tool storici non è ancora garantito. Nessuna screenshot Computer, directory personale o shell parallela viene esposta. Il caricamento di messaggi con parti non testuali mostra un indicatore di allegato, senza attivare remoto contenuto. Funzionalità backend non supportate restano visibili come indisponibili o disabilitate.

## Revisione successiva: lifecycle e pannello

Il pannello Computer inizialmente aperto poteva coprire il bottone Add memory nelle viste non-chat. Memory e la navigazione Space ora chiudono il pannello, mentre la vista chat iniziale resta a tre colonne. Correzione verificata nel sorgente; QA della build confezionata è coordinata separatamente. Dot row è vincolata alla sidebar con min-width/ellipsis; il composer della conversazione vuota usa altezza compatta.

Ogni stream Chat presenta un handlerId distinto. Il bridge collega la capability delle approvazioni allo stream autenticato vivo, con cleanup e TTL a difesa di crash; Connect non imposta direttamente server_requests=true. La chiusura del pannello/chat o della finestra non equivale a cancellare il lavoro Hermes.

La UI rimuove una review ritirata da request.cancel e mantiene un invio HTTP202 in attesa fino a feedback del runtime. Una risposta HTTP tardiva non può riportare un turno già completato nello stato waiting. Aggiunte due verifiche di regressione ai sette scenari originali; esito finale della suite da registrare dopo il rebuild coordinato.

## Final renderer integration — 2026-10-04

Save-to-Space is now a human-initiated review using the original page-review card styles, not a fabricated runtime tool call. The latest available assistant text is copied into an editable Markdown draft, title and authorized destination selector; no write occurs when the card opens. The user explicitly saves through the existing reviewed-page receipt route, with a stable `manual-review-UUID` identity. Receipt lookup precedes writes, so an uncertain response can be checked without creating a duplicate page. Failed writes show an error and retain the review; confirmed receipts show destination/revision and Open page. Content over the route's20,000-character bound remains visible and cannot be saved until shortened. UI availability is gated while delivery/turn state is uncertain or active. This is a local reviewed document, not a claim that research was verified by the runtime.

Page conversations now flush their editor and fetch the current saved page before every explicit message. Only its id, Space id and revision go to `/hermes/send`; the backend validates that revision and supplies bounded persisted content. A failed flush does not dispatch a message. Saved tool-start/complete events hydrate the existing real-activity cards after reopening; a historical start cannot regress a newer completion. Other owned conversations' approval-waiting events expose an explicit navigation action, while command payloads remain with the corresponding conversation.

Verification: strict renderer TypeScript check PASS. Fourteen focused Vitest fixtures PASS across `hermes-display.test.ts` (11) and `manual-space-review.test.ts` (3): optimistic ordering, uncertain delivery, deltas/final replacement, draft preservation, resume merge/projection, dispatch admission race, cancelled approvals, draft restoration, persisted tool-card reconstruction, explicit reviewed writes and receipt restoration without duplication. These fixtures exercise reducers and the actual review decision API helper; they do not establish a live Hermes research run. Packaged UI verification remains separate and is recorded after execution. Renderer source frozen for the final lean package at this checkpoint.

## Packaged narrow-window regression — 2026-10-04

Executed the final lean `desktop/release/mac-arm64/Hermes Studio.app` via Playwright Electron against a fresh synthetic `/private/tmp/hermes-renderer-check-8sYURD` data directory. Memory navigation, Add memory, explicit save, then900px-wide Add/Close dialog all PASS without forced clicks. Sidebar measured219px client/scroll width: no overflow. Renderer page errors:0. The native app was closed after the test; no Hermes connection or prompt was sent. Direct sandbox launch failed before UI creation; the authorized native launch succeeded. Screenshots: `/private/tmp/hermes-studio-qa/renderer-memory-wide.png` and `renderer-memory-narrow.png`. The narrow screenshot was visually inspected: Memory content remained reachable, Computer overlay dismissed, Dot summary ellipsized, navigation intact. This test does not verify a live research response or the Save-to-Space card end to end; receipt behavior has14 focused fixture coverage as stated above.

## Screenshot alignment correction — 2026-10-04

Root's actual packaged synthetic-runtime screenshot `runtime-failure.png` exposed a real fidelity defect: Computer occupied40% while the target has about28%, and the Dot header was centered. Source inspection identified the cause: upstream `.template-app .chat-workspace > .result-pane` had greater selector specificity than the Hermes pane override and still imposed40vw. The new scoped selector overrides both width and flex-basis to28vw (bounded320–430px), leaving the center column the remaining space. The persona header now explicitly uses start alignment, static trailing actions, and no inherited live-chat container padding/max-width. New chat and Review response for Space have explicit accessible names; these remain present when their text is hidden visually. Strict renderer typecheck and all14 fixtures PASS after the correction. Actual packaged column measurement/screenshot is a separate pending gate, not inferred from CSS.
