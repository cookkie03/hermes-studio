> Snapshot storico prima del consolidamento del 2026-10-04. Contiene stati e istruzioni superati; leggere [MEMORY corrente](MEMORY.md) e [indice documentazione](../README.md). I contenuti storici e gli ID originali sono conservati; soli percorsi delle schede aggiornati alla rinumerazione. SHA256 del corpo originale prima di aggiornare i link (Git 52d14ea): `11b13a3c005dc28e285e4527ec390419813c4f2c27669a2f2a8f813aa069a943`.

## Ultimo incremento — F00 completata, 2026-10-04

Utente seleziona review/build/test/correzioni essenziali/commit della baseline MVP. Esito e limiti nell'ultimo blocco F00 e in STATUS; D19–D23 continuano a vietare lo sviluppo automatico delle altre feature.

## Direzione attuale — 2026-10-04 aggiornamento utente

D19: layout OpenDots, componenti/gerarchia/microinterazioni ispirati anche a Unsloth e Codex. Osservazioni live e screenshot distinte da token/durate proposte.
D20: interrompere sviluppo automatico di nuove feature. Preservare baseline MVP essenziale/parzialmente funzionante; preparare documentazione autonoma per ogni feature, una feature per chat Codex scelta da Luca. Catalogo canonico docs/features/README.md.
D21: repository indipendente; annullata la proposta di repository derivata e aggiornamenti esterni. Rimossi proposta e promemoria precedenti. Conservare licenze/provenienza MIT.
D22: Bots/Dots, collaborazione con messaggi/deleghe/ripresa, routine, plugin, browser e computer use Hermes hanno schede separate. Distinguere capacità native comprovate e adattamenti da progettare.
D23: release GitHub con DMG è feature documentata F12, da sviluppare in chat dedicata; nessuna pubblicazione automatica ora. Architettura: review e principi persistenti, non refactor non selezionato.

# Memoria del progetto Hermes

Aggiornata: 2026-10-04. Documento canonico di continuità richiesto da Luca. Leggere questo file e STATUS prima di ogni sessione. Decisioni confermate qui prevalgono sulle proposte precedenti; WORKLOG conserva la cronologia e i documenti di ricerca le prove.

## Direzione attuale — leggere prima

D14–D18 e ADR0005 superano il client SwiftUI e il team-main/editoriale precedenti. Obiettivo: interfaccia OpenDots conforme allo screenshot utente, app macOS/DMG con Hermes backend e strumenti, frontend originale riutilizzato in Electron. Piano di implementazione storico: docs/superpowers/plans/2026-10-04-opendots-desktop.md. Piano corrente documentale: docs/project/feature-development-plan.md; ADR0006 e D19–D23 prevalgono. Screenshot: docs/design/references/opendots-user-reference-2026-10-04.png. Docs/future contiene le idee da ricordare alla chiusura dei task. Non reinterpretare le sezioni storiche seguenti come direzione attuale.

## Baseline iniziale conservata

Client macOS nativo per Hermes: assistente personale e progetti, con agenti collaborativi, responsabilità persistenti e continuità tra conversazioni. Esperienza ispirata alle interazioni Dots/Spaces descritte dall'utente, alle superfici operative Codex e a Unsloth. Non basta una chat con skin diversa.

Il lavoro 24/7 richiede un runtime indipendente dal client su host disponibile. Chiusura della finestra non deve essere presentata come stop del lavoro. Non dichiarare il requisito soddisfatto fino a prova reale di 24 ore.

## Decisioni confermate dall'utente

| ID | Decisione | Origine e conseguenza |
|---|---|---|
| D01 | Prima versione: assistente personale e progetti | Priorità accettata all'inizio; non limitare Hermes al coding |
| D02 | Persistenza continua su file | Richiesta ripetuta; aggiornare memoria, stato e registro dopo blocchi significativi |
| D03 | Client macOS e applicazione delle skill native | Richiesta di installare tutte e iniziare sviluppo; analisi deve orientare codice |
| D04 | Carattere espressivo, agenti caratterizzati | Risposta Q1; supera la precedente raccomandazione di app solo calma |
| D05 | Vista team principale, chat secondaria | Risposta Q2; supera il wireframe iniziale centrato sulla conversazione |
| D06 | Avatar illustrati, movimento mirato | Risposta Q4; identità leggibile anche da fermi; motion spiega eventi |
| D07 | Spazio con collaborazione e strumenti integrati | Risposta libera Q3: Dots/Spaces + browser, file, universal editor, Markdown editor, browser use e computer use |
| D08 | Primo percorso: ricerca e scrittura | Risposta Q5: agente, browser, fonti, file e documento; non promette subito tutti gli strumenti |
| D09 | Workspace ordinato con team e strumenti | Risposta Q6 confermata: team/incarico principale, conversazione apribile e browser/editor affiancati |

D07 descrive la visione. La gerarchia precisa resta da scegliere: non interpretarla come richiesta di una stanza 3D, una chat di gruppo o un canvas infinito.

## Composizione confermata

Q6 risolta: workspace ordinato con team e strumenti. La stanza visiva non è stata scelta. Primo incremento ricerca/scrittura con team, brief locale, browser e editor Markdown. Nessuna ulteriore intervista necessaria per questo incremento.

## Tecnica scelta e limiti

Swift 6, SwiftUI, Observation; macOS 14+ come target, Liquid Glass gated macOS 26. Nessuna dipendenza prodotto esterna. SwiftPM e packaging .app locale ad hoc. ADR client accettato in seguito a richiesta esplicita di avvio nativo. Riferimento Electron upstream utile per protocollo e feature.

Toolchain verificata: Swift 6.4 CLT, Mac macOS 27.0.1. SDK 27 fallisce per plugin SwiftUIMacros assente nei CLT. Build riuscita selezionando SDK 26.5 nello script, senza modificare xcode-select. Supporto macOS 14/26 non testato dal vivo. Xcode completo e XCTest non disponibili nell'attuale selezione.

## Stato reale del codice

- Prima shell compilata, firmata ad hoc e avviata: build/Hermes.app.
- Sources/HermesCore: modello versionato e persistenza atomica; ID stabili e validazione selezione.
- Sources/HermesDesktop: sidebar, toolbar, nuova conversazione, composer bozza, inspector e Settings.
- Archivio locale dedicato: Application Support/HermesDesktop-Development/workspace.json; distinto dal profilo Hermes personale.
- Invio disabilitato, stato non collegato esplicito. Nessun messaggio remoto o runtime simulato.
- Quattro verifiche Foundation passate: riapertura bozze/selezione; selezione invalida preserva archivio; schema futuro preserva bytes; corruzione preserva bytes.
- swift test fallisce per XCTest assente: non dichiararlo passato. Runner alternativo in Verification/PersistenceChecks.swift e scripts/check-persistence.sh.
- UI osservata via CUA: prima apertura e bozza preparata da suggerimento. Altre interazioni, riavvio UI e accessibilità completa non ancora collaudati.

La shell chat è il primo incremento tecnico. Non rappresenta ancora la nuova composizione team principale. Runtime, streaming, vera delega, progetti, editor, browser, pianificazione e computer use non sono implementati.

## Skill e gusto

25 skill locali verificate. Ultime quattro installate e lette: axiom-macos, liquid-glass OpenAI, swiftui-expert-skill AvdLee, swiftui-liquid-glass Dimillian. OpenAI richiede il percorso annidato esatto, registrato nel workflow. Axiom Design/SwiftUI/Accessibility erano già presenti.

Ricerca gusto con find-skills: prima raccomandazione interface-design; complemento impeccable per critique/polish. Raccomandate, non installate. Principi web adattati al prodotto; convenzioni macOS, San Francisco e Liquid Glass restano governate da Axiom. Non copiare un linguaggio da landing page in un'app operativa. Confronto e comandi in docs/research/design-taste-skills.md.

## Reference Hermes esistente

com.nousresearch.hermes.setup non in esecuzione: apertura scaduta. Individuata app attiva com.nousresearch.hermes, UI v0.21.5+6453. Osservate funzioni esposte: sessions/progetti/pinned, Bots, Capabilities, Messaging, Artifacts, Scheduled jobs, profili/gateway, stati background/unread/approval, contesto/modello/effort/voce, terminal/file tree/review. Presenza UI non prova API o comportamento. Bots non aperta con successo; finestra diventata indisponibile. Mappatura senza transcript privati in docs/research/hermes-live-features.md.

Allegato riletto. Continuità, 24/7, collaborazione e UX Unsloth/ChatGPT sono intenzioni dell'utente; affermazioni di terze parti nell'allegato non diventano fatti verificati.

## Ripartenza

1. Applicare D09 senza rifare l’intervista da zero.
2. Aggiornare spec/design/roadmap verso ricerca e scrittura in spazio team.
3. Completare smoke UI della shell, poi realizzare incremento coerente con composizione scelta.
4. Verificare runtime Hermes su profilo isolato e versione fissata; nessuna modifica al runtime personale.
5. Collegare capacità reali prima di rendere attivi invio, delega, browser/computer use e pianificazione.

## Repository GitHub

2026-10-04: repository personale pubblica `cookkie03/hermes-studio`, nome prodotto Hermes Studio. L'utente conferma di volerla mantenere pubblica e caricare il progetto. `.gitignore` esclude credenziali, configurazioni Hermes locali, archivi/database personali e artefatti macOS/Swift, preservando codice, documentazione, skill e backlog.

## Direzione futura: Codex per agenti specialisti

2026-10-04. L'utente conferma come direzione futura che gli agenti specialisti Hermes possano richiamare Codex, consultarne il lavoro e usarlo per proseguire gli incarichi Hermes, con un'esperienza simile all'utilizzo di Codex Desktop. L'architettura corrente basata su team e specialisti resta il riferimento. Per ora è solo documentazione: nessuna implementazione, sincronizzazione generale o accesso ai thread Codex è assunto. I dettagli tecnici e la possibilità di riprendere lo stesso thread vanno verificati in futuro. Vedi [proposta Codex specialisti](../future/codex-specialists.md).

## Preferenza di ripresa delle idee future

Quando un task sta finendo o si avvicina alla chiusura, ricordare periodicamente all'utente le idee future documentate e chiedere se vuole riprenderne una. Non interrompere un task in corso per farlo.

## Mappa dei documenti

STATUS: situazione corrente. WORKLOG: cronologia. native-reorientation: applicazione delle quattro skill. design-taste-skills: ricerca gusto. hermes-live-features: reference app. ADR: scelte tecniche. Spec e desktop-design: baseline iniziale da rivedere con D04–D08 e D09. Wireframe iniziale: storico, non nuova composizione confermata.

## Aggiornamento operativo — 2026-10-04

D10: autorizzato collegamento diretto al runtime Hermes esistente, con dati sintetici nelle prove e preservazione dei dati personali. Discovery e contratto JSON-RPC WebSocket in studio sul sorgente locale; non ancora dichiarare connessione riuscita.

D11: frontend-design esplicitamente richiesta per direzione artistica; adattare al Mac senza sovrascrivere convenzioni native e motion accessibile. Agente dedicato implementa atelier editoriale con avatar illustrato.

D12: utente autorizza ruolo di orchestratore durante lo sviluppo. Agenti separati per contratto/runtime e direzione artistica; integrazione e verifica restano responsabilità del coordinatore.

D13: commit e push periodici richiesti. Git inizializzato su master senza commit e senza remote al controllo corrente. Procedura in git-workflow.md; nessuna pubblicazione dichiarata.

Workspace team e strumenti ora implementati: brief locale, editor Markdown/anteprima/esportazione, browser WebKit manuale su macOS26. Sei verifiche Foundation passate; riapertura UI e ripristino bozza osservati. Ultima build con correzioni selezione sidebar/avatar/anteprima compilata e firmata; tali correzioni richiedono ancora controllo nella nuova istanza UI. Nessuna automazione browser/computer o runtime collegato al momento.

## Piano notturno e stato agenti

Utente richiede piano completo e lavoro continuato, con agenti e ruolo PM. Piano canonico esecuzione: docs/superpowers/plans/2026-10-04-overnight-hermes.md. Audit skill distinto da installazione in skill-audit.md. Goal attivo; heartbeat Hermes — sviluppo e verifica attivato ogni30min per riprendere senza notifiche inutili. Trasporto actor implementato/strict concurrency passato e otto check sintetici passati; handshake e chat live non ancora provati. File workspace e art direction consegnati dagli agenti, integrazione/build/UI pendenti. Non dichiarare esaurite tutte le skill o tutto il prodotto.

## Evidenze successive

Handshake live al backend già avviato PASS (health, root token in memoria, gateway.ready, capabilities(false), gateway.ping, disconnect). Nessuna sessione o prompt né lettura cronologia personale. Non equivale a chat funzionante. Build con art direction e File tab PASS SDK26.5; ultimo corretto pairing security scope richiede rebuild. Sei test filesystem sintetici PASS riferiti dal verificatore; runner scripts/check-research-files.sh. Prossimo gate integrazione RuntimeConnection/UI e transcript persistente.

## Nuova reference: OpenDots

Luca ha condiviso https://github.com/CopilotKit/OpenDots. Reference aggiunta al lavoro corrente senza cambiare stack SwiftUI/runtime Hermes. README verificato: Spaces/pagine separati da Dots, conversazioni legate alle pagine e review prima di salvataggio; delega automatica e gruppi multi-Dot restano sviluppi futuri nel template. Analisi sorgenti affidata ad art_direction, output docs/research/opendots-reference.md. Nessuna demo live ancora osservata; non chiamare questa ricerca un ux-extract esaustivo.

Git ricontrollato: ora main con remote origin git@github.com:cookkie03/hermes-studio.git, aggiornamento rispetto al controllo precedente senza remote. Remote configurato non equivale a push confermato. Preservare modifiche docs/future di altro lavoro.

## Direzione autorevole aggiornata — OpenDots desktop

D14: Luca vuole esattamente l'esperienza/layout OpenDots Dots, Spaces, documenti, chat e memoria. Screenshot originale salvato in docs/design/references/opendots-user-reference-2026-10-04.png con copia verificata hash. Leggere docs/design/opendots-target.md prima di ogni scelta UI; supera atelier editoriale e team-main come composizione. Backend e strumenti Hermes restano; nessun falso stato runtime.

D15: distribuzione vera app macOS con DMG e release, senza npm run dev per l'utente. SwiftUI rewrite facoltativo; riuso frontend/packaging desktop ammesso. Scegliere fedeltà e risultato operativo.

D16 aggiornata: repository Hermes Studio indipendente; mantenere storia e attribuzione del sorgente MIT riusato. Nessuna sincronizzazione automatica o conversione della repository prevista.

D17: telefonate real-time al cellulare con componenti vocali open source sono idea futura, non sviluppo attuale. Tutte le idee future in docs/future/ (Codex specialisti e voice); ricordarle periodicamente solo alla chiusura dei task, senza interrompere lavoro attivo. Non assumere PSTN gratis o nessun operatore per chiamare un numero.

D18: Luca va a dormire e autorizza continuazione finché possibile. Piano/heartbeat devono seguire nuova direzione screenshot, preservare dati e non continuare il redesign SwiftUI precedente per inerzia.

Piano eseguibile autorevole dopo pivot: docs/superpowers/plans/2026-10-04-opendots-desktop.md. ADR0005 riuso UI Electron desktop, risultato/build ancora da verificare. Indice future docs/future/README.md. Piano notturno precedente storico per UI, prove protezione dati/trasporto mantenute.

Ripresa: artefatto Electron arm64 avviato con dati sintetici. Gate UI aperto: overlay Computer blocca Memoria; correggere e rifare smoke prima DMG. App847MB di sviluppo, non notarizzata. Nessun prompt live inviato in questa ripresa.

Overlay repaired: packaged metadataUI smokePASS (Memory/Space/Markdown/autosave/reopen), errorsnone. FinalDMGheld forreview/saveUI +pagecontext +prunedruntimegraph verification. New bridge/server/network14synthetic testsPASS; no live prompt proof.

Nuovo Nodebridge discovery livePASS Hermes0.21.5: scarta backendlogin e collega backendlocaleaccessibile, readiness+capabilityfalse soltanto. Chat/streaming/tools live non provati. Metadata persistenti dopo riavvioappPASS.

Proposta di sequenza successiva, non ancora scelta da Luca: F00 salva e verifica prima la baseline di codice tuttora non committata; poi F01/F11/F02/F16/F03 e F12 alpha. Nessuna nuova implementazione autorizzata dalla sola domanda su come procedere.

## F00 selezionata — 2026-10-04

Luca richiede risultato della scheda F00: review del codice, build/test, correzioni essenziali e commit MVP. Incremento delimitato ai Metadata locali: contratti strutturali delle route separati dai tipi del vecchio executor, typecheck senza --noCheck; preservati store, API e dati. Review a due assi su HEAD 91f3644 e baseline WIP/untracked. Correzioni essenziali emerse: invio dopo cold resume di turno runtime attivo/incerto; stato offline nella schermata vuota e cancellazione della navigazione prima di cambiare selezione. Fixture di rete richiedono porte localhost fuori sandbox; rerun sintetico PASS (2 test). Build packaged e gate finali ancora in corso. Nessuna selezione di altre feature o pubblicazione release.

## Consegna F00 — 2026-10-04

MVP essenziale consolidato: contratti Metadata disaccoppiati da Platform, strict typecheck/build senza --noCheck; cold resume non invia su lavoro attivo/incerto; offline autentico e navigazione annullata preservata. Review Standards (1 finding corretto) e Spec (2 corretti), nessun blocco essenziale residuo. npm test PASS:18 fixture,55 test, typecheck e bootstrap/link. .app arm64 rifatta e smoke finale PASS, firma ad hoc/deep verification; storage failure/conflict/restart e focus/reduced motion/900px verificati con dati sintetici. Baseline SwiftUI storica build e 27 gruppi/check sintetici PASS. Template executor legacy incompatibile e non distribuito; nessun prompt personale, nuova feature o release. Evidenze: docs/architecture/f00-review-2026-10-04.md. Commit locale della baseline tramite index selezionato e scan credenziali, preservando MIT/provenienza.

D24 — Richiesta utente: includere nelle schede skill e file da leggere per sviluppare ciascuna feature, usando ask-matt e includendo progetto/globali. Implementata documentazione: workflow comune docs/agents/feature-workflow.md, sezioni in F00–F17 e catalogo completo docs/agents/skills-catalog.md. Inventario: 39 percorsi progetto, 43 Agents globali, 32 Codex globali, 198 cache plugin e 255 runtime Hermes; 567 percorsi, 469 file risolti distinti. File/cache presenti non equivalgono a skill applicate o tool disponibili; caricare solo ciò che serve alla feature. Nessuna nuova feature o installazione autorizzata da questa richiesta documentale.

## Requisiti aggiornati dopo prova F00 — D25–D29

D25: Spaces collegano una o più cartelle reali (progetti/vault), con file testo/Markdown visibili e specialisti entro scope. Filesystem autoritativo, metadata binding/draft separati; nessuna importazione o migrazione automatica. F03/F10 e ADR0007; pagine legacy preservate.

D26: Create/Edit Dot permette selezione avatar OpenDots. Quattro asset PNG blue/mint/orange/purple verificati nel codice; F04-A locale indipendente da F04-B bot/profilo runtime.

D27: Browser integrato visibile controllato dai tool Hermes, utilizzabile dall'utente sulla stessa pagina/profilo, cookie/storage/history persistenti e takeover. Nessun browser o tool ecosystem parallelo. F08 e ricerca browser distinguono callback desktop, controller browser_* e CDP; trasporto da provare, non scelto né implementato.

D28: memoria Markdown per Space, identità SOUL del profilo, ricordi Hermes e cronologia distinti. Prospetto completo docs/research/hermes-memory-system.md con fonte ufficiale https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/ anche in F15. Review e curator diversi; ricordo totale non garantito. Fonte pubblica SHA e1e82d782f353766c7a22db6e5ac4fa58bbff325, diversa dal precedente pin. Nessun profilo personale letto.

D29: aggiungere messaggi vocali/dettatura, TTS e conversazione vocale in-app alla scheda F13, riusando capacità Hermes. Telefonate PSTN/SIP ancora future, nessuna attivazione mic/provider/runtime.

Questa revisione è documentale; prossime chat scelgono singoli incrementi. Fork annullato, repository indipendente; nessuna ripresa notturna o nuova implementazione automatica.

D30 — Luca chiarisce che tutte le capacità/memorie native Hermes devono essere preservate e trasmesse alla UI Studio. La memoria rimane runtime; user può vederla e seguire come cambia, senza secondo archivio reiniettato. Nuova scheda F18 (parità/capacità, note post-turn, viewer memoria) porta catalogo a19 schede F00–F18. F15 rimane memoria Markdown Space/legacy ed eventuale management esplicito. Verificato nel sorgente pubblico: evento review.summary e nota system nel desktop ufficiale; review e curator distinti, notifiche off/on/verbose. /api/memory dà byte/provider, non testo; viewer read-only richiede contratto supportato. Nessuna feature implementata, profilo personale letto o config mutata.
