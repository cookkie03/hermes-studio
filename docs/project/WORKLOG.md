> Numerazione storica: gli ID nel testo precedono il riordino; i link alle schede puntano ai file attuali. [Corrispondenza vecchi/nuovi ID](../features/numbering-2026-10-04.md).

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

## Reference OpenDots

Link fornito da Luca, README GitHub letto e analisi pubblica sorgenti delegata. Pattern candidati: separazione documenti/agenti, thread collegato alla pagina, review prima di save, provenienza del risultato. Il repository dichiara delega automatica/multi-Dot futuri; nessun test live OpenDots svolto. Aggiornata memoria. Git main/origin ora presenti; preservate modifiche concorrenti.

## Pivot confermato OpenDots desktop

Utente conferma layout identico al riferimento, DMG/release priorità, repository indipendente e voice futuro. Screenshot copiato/verificato e documento target creato. Ricerca agenti: upstream MIT React/Vite/Hono Node, nessun packaging desktop incluso. Valutazione Electron vs SwiftUI/Tauri in corso. Vecchio redesign non più obiettivo. Luca autorizza continuazione notturna.

## Ripresa dopo usage — heartbeat

Controllati file esistenti: snapshotMIT e shellElectron/package presenti; bridge e rendererHermes non ancora presenti. Agentiripresi su proprietà separate; pinning/packaging, bridge metadata/runtime e rendererreference. Glossario aggiornato Dot/Space/pagina e memoria riallineata in testa con decisioniD14–D18. Aggiunta matrice acceptance desktop; nessun gate nuovo chiuso per mera presenza del codice. Gitmain origin/main confermati.

## Verifiche baseline documenti

PASS test upstream mirati: workspace, pages, autosave, page-service, markdown — 5 file,27 test,1.17s. Valgono per moduli copiati con fixture locali, non per bridgeHermes/UIElectron. Applicata to-spec per sintesi senza nuova intervista: specv0.2 pronta agente, baselinearchiviata. Metodo/target già espressamente confermati; non inventata nuova approvazione. Tracker riallineato.

## Bridge e revisione prima packaging

Root ha rieseguito suite bridge Node:8testPASS. Coprono privacy eventi estranei, concorrenti/identitàinvio, ack/finale, approvals stale, resume, bozze e loopback. Revisioni hanno imposto drop sessioni non possedute, riserva invio primaawait, working solo runtime e binding duraturo. Moduli metadata copiati hanno ancora una incompatibilità TS nel vecchio executorCopilot non usato: pipeline distingue typecheck renderer da transpilationmetadata, senza direfulltypecheckpassed. Packagingagent detiene buildlock. .gitignore esclude artefatti Electronrelease.

## Verifica artefatto macOS e correzione UI — 2026-10-04

Build `.app` arm64 completata; avvio reale da `desktop/release/mac-arm64/Hermes Studio.app` con userData sintetico temporaneo, nessun prompt Hermes. Finestra significativa con Spaces/Dots, header e Computer; nessun devserver esterno. Test memoria ha individuato un difetto reale: `computer-overlay` intercetta il pulsante Add memory alla finestra iniziale. Riparazione assegnata ad art_direction; DMG finale sospeso fino al nuovo smoke. Il primo errore di locator Preference era del test (label reale Preference or context), distinto da questo difetto UI.

Renderer fixtures7PASS; bridge8PASS e metadata1PASS già verificati, ulteriori test bridge per resume/capability in corso. Typecheck renderer/build PASS; full upstream typecheck ancora incompatibile nel vecchio executor escluso. App di sviluppo non notarizzata, icona predefinita e dipendenze847MB: limiti documentati, non release finale. Capability approvazioni ora in revisione per passaggio Settings→Chat senza riconnessione o prompt.

### Packaged UI metadata smoke PASS

Root `flows.cjs` actual arm64 `.app`: Memory add/save, new Space, page title and Markdown source edit, CmdS autosave, navigate away and reopen PASS; renderer console/page errors none. Synthetic data `/private/tmp/hermes-studio-flow-oCNfSu`, screenshot memory/document outside repository. Reproducible basic smoke now `desktop/scripts/test-packaged-ui.cjs`. No runtime connection/prompt. Network synthetic WebSocket+redirect suite independently rerun: bridge/server/network14PASS, including real local sockets and no personal credentials. New feature gaps discovered in Spec review: conversation review/save UI, page context for Hermes, background approval route, persistent toolcards; implementers addressing before final build.

### Persistenza riavvio e handshake Node live

Riavvio completo dell'artefatto macOS PASS: memoria e Markdown recuperati dalla stessa directory sintetica nonostante nuova porta/origin loopback. Title Hermes Studio. Node bridge discovery+health+ready+capability false live PASS su Hermes0.21.5, senza session.create/resume/prompt/history. Il primo test diretto del solo gateway più recente ha rifiutato correttamente auth_required=true; inventario health pubblico ha trovato anche un gateway auth_required=false e il percorso reale bridge.connect() ha selezionato quello. Nessun bypass login e nessuna credenziale persistita. Non prova chat, streaming o browsertools.

Bridge/server aggiornati13PASS; network2PASS nella precedente verifica. Nuove slice: contesto pagina verificato per proprietà/accesso/revisione prima del prompt; strumenti owned persistenti e transcript che esclude deliverypending/uncertain. Runtime dependency graph prodotto ridotto a quattro radici auditate, nuova build/launch da riprovare.

## 2026-10-04 — Consegna documentale e cambio di ambito D19–D23

Luca chiede una feature per chat, documentazione completa e MVP essenziale preservato; sospeso sviluppo automatico di nuove feature. Annullata proposta fork/upstream e rimossa da memorie/piani attivi e idee future, preservata provenienza MIT e storia del codice. Catalogo F00–F17: 18 schede con contratti, limiti, ownership, dipendenze, accettazione e handoff. F05 distingue delegate_task, message_agent canonico, relay/gruppi e session_search; F06 distingue routine, run, delivery e host scheduler. F12 documenta release GitHub/DMG senza pubblicare.

Agenti documentali: architecture_review ha prodotto candidati Conversazione/Metadata e report HTML; art_direction F01/F02/F03/F15; taste_research F04–F09; root altre schede, principi, ADR0006, sistema componenti e continuità. Nessun refactor scelto. Fonte Hermes desktop verificata sul checkout SHA1cb26bf248e150f715ce8a487fdef2a2bef6b541 e pagina GitHub fornita dall'utente. Lettura sorgente non equivale a prova integrata.

Nuovi screenshot Unsloth/Codex copiati e verificati in .reference/ui-private ignorato da Git. Unsloth disclosure attività aperta/chiusa osservata; niente prompt, cambi permessi/modello o contenuti privati raccolti. Accesso live Codex negato dallo strumento; usato screenshot utente, animazioni non osservate. Token/motion dichiarati proposte. L'ultima build .app precedente allo stop non implica che DMG contenga ultimo layout; gate aperti conservati in STATUS. Automazione riallineata a sola documentazione e da arrestare alla consegna.

Verifica documentale finale: 18 schede, collegamenti locali del catalogo/schede/piano/README/componenti validi; diff e index senza errori whitespace. Scan di 74 file testuali senza credenziali riconosciute; indice di 55 file documentazione/config, senza sorgenti, screenshot personali o artefatti release. Automazione hermes-sviluppo-e-verifica aggiornata a PAUSED con conferma del tool. Implementazione precedente non inclusa nel commit documentale.

Commit documentale 91f3644 creato: 55 file, nessun sorgente dell’incremento MVP incluso. Push origin main completato con exit0 (6c84b4b..91f3644). Sorgenti e fixture precedenti rimangono nel working tree, preservati per futura review; questa nota di esito è un aggiornamento locale successivo al commit.

## Riallineamento della continuazione automatica

Il goal automatico risulta ancora active con il vecchio obiettivo D01–D13 SwiftUI, mentre MEMORY/STATUS/ADR0006 confermano la successiva richiesta esplicita di interrompere nuove implementazioni e scegliere una feature per chat. La precedente consegna è progresso verificabile (commit 91f3644), non completamento del vecchio obiettivo. Si applica la sospensione richiesta dall’utente al goal storico; nessuna ripresa del codice, nessuna dichiarazione di completamento delle feature.

## Prossimo passo consigliato — proposta, non selezione

Verifica corrente: il commit documentale è presente, ma desktop/ e varie fixture sono ancora untracked; restano anche modifiche SwiftUI storiche. Prima di aprire chat di implementazione separate, raccomandato F00: review della baseline, verifica build/test pertinenti, esclusione di dati/cache/artefatti, commit del codice verificato e limiti dichiarati. Non è autorizzazione a implementare nuove feature. Ordine proposto: F00 → F01 → F11 → F02/F16 → F03 → F12 per una prima alpha installabile. Poi bot/collaborazione/routine e strumenti secondo selezione utente. Una chat per feature; coordinamento prima di modifiche ai file condivisi. Nessuna nuova feature selezionata o chat creata con questa raccomandazione.

## F00 selezionata — 2026-10-04

Luca richiede risultato della scheda F00: review del codice, build/test, correzioni essenziali e commit MVP. Incremento delimitato ai Metadata locali: contratti strutturali delle route separati dai tipi del vecchio executor, typecheck senza --noCheck; preservati store, API e dati. Review a due assi su HEAD 91f3644 e baseline WIP/untracked. Correzioni essenziali emerse: invio dopo cold resume di turno runtime attivo/incerto; stato offline nella schermata vuota e cancellazione della navigazione prima di cambiare selezione. Fixture di rete richiedono porte localhost fuori sandbox; rerun sintetico PASS (2 test). Build packaged e gate finali ancora in corso. Nessuna selezione di altre feature o pubblicazione release.

## Consegna F00 — 2026-10-04

MVP essenziale consolidato: contratti Metadata disaccoppiati da Platform, strict typecheck/build senza --noCheck; cold resume non invia su lavoro attivo/incerto; offline autentico e navigazione annullata preservata. Review Standards (1 finding corretto) e Spec (2 corretti), nessun blocco essenziale residuo. npm test PASS:18 fixture,55 test, typecheck e bootstrap/link. .app arm64 rifatta e smoke finale PASS, firma ad hoc/deep verification; storage failure/conflict/restart e focus/reduced motion/900px verificati con dati sintetici. Baseline SwiftUI storica build e 27 gruppi/check sintetici PASS. Template executor legacy incompatibile e non distribuito; nessun prompt personale, nuova feature o release. Evidenze: docs/architecture/f00-review-2026-10-04.md. Commit locale della baseline tramite index selezionato e scan credenziali, preservando MIT/provenienza.

## D24 — Skill e letture per ciascuna feature

Letti ask-matt e writing-for-agents; applicati router e progressive disclosure alla documentazione, senza eseguire workflow di implementazione. Inventariate tutte le radici progetto, Agents/Codex globali, cache plugin e skill runtime Hermes. 567 percorsi SKILL.md, 469 file risolti distinti; copie/symlink/versioni conservate e classificazione disponibile su disco distinta da callable/applicata. Ogni scheda F00–F17 ora contiene skill specifiche, condizioni dei rami e file esistenti da leggere; sorgenti Hermes indicati come reference locale alla versione pin, non prova live. Workflow comune guida letture iniziali, spec/ticket, implementazione autorizzata, review e handoff; prompt delle schede e AGENTS riallineati. Script di rigenerazione inventario legge solo metadata. Nessuna skill installata o feature sviluppata.

Verifica D24: guida/handoff presenti una volta in tutte le 18 schede; 567 percorsi inventariati ancora leggibili; collegamenti locali e globali delle schede/workflow/cataloghi validi; diff whitespace PASS; scan credenziali sui nuovi documenti e generatore senza candidati. Rigenerazione inventario eseguita con successo; nessun test/build prodotto necessario perché l’incremento riguarda documentazione e relativo generatore.

Concorrenza rilevata nel salvataggio D24: nuovo commit F00 7c7e2a5, con MEMORY/STATUS aggiornati dall’incremento separato e parti della documentazione già incluse. Preservati gli esiti F00 e l’indice vuoto; rimossi dal workflow riferimenti alla baseline ancora non versionata. Commit D24 delimitato ai documenti e al generatore, senza sorgenti prodotto.

D24 salvata nel commit cfd0d94 (30 file documentazione/generatore). Push origin main completato con exit0, intervallo 91f3644..cfd0d94; include il commit F00 separato 7c7e2a5 già presente localmente. Esito registrato qui dopo il commit; nessuna installazione di skill o esecuzione di feature in questa chat.

## 2026-10-04 — Revisione D25–D29, solo documentazione

Richieste dopo F00 recepite in F03/F04/F08/F10/F13/F15 e cross-feature F01/F02/F05/F06/F14/F16, catalogo, piano e glossary. ADR0007 filesystem autoritativo e legacy preservato. Ricerca memoria con subagent prevista da research, ownership esclusiva report; pagine ufficiali Memory/Curator/Providers/Skills/SOUL/Context e sorgente pubblico SHA e1e82d7. Link ufficiale anche nella scheda F15. Browser callback desktop vs controller/CDP e voce STT/TTS vs live/PSTN documentati; nessuna prova runtime o codice feature. Quattro asset avatar verificati, nessun catalogo immaginario. Validazione documentale PASS:212 link locali,18 sezioni skill/handoff; git diff --check pulito. Review diff e sorgente pubblica completata, sole specifiche/documenti. Commit/push da verificare separatamente; nessuna build o prova feature dichiarata.

## 2026-10-04 — D30, capacità native Hermes nella UI

Utente richiede scheda dedicata alla conservazione/esposizione delle feature runtime, inclusa tutta la memoria e i suoi aggiornamenti. Applicata documentation-and-adrs con router ask-matt; nessun nuovo ADR tecnico perché l'autorità Hermes è già principio accettato. Creata F18 con ownership/incrementi/contratti/gap/gate/fonti e handoff; allineati F02/F07/F11/F15, workflow, principi, catalogo, piano e memoria/stato. Lettura sorgente pubblico e1e82d7: review.summary post-turn, handler desktop system note, summary pending/applied e GET /api/memory byte/provider. Nessuna UI live/test/runtime/profilo privato. Validazione PASS:144 collegamenti locali,19 guidance/handoff e scan pattern credenziali; git diff --check pulito. Review diff e scheda nuova completata; sole modifiche Markdown. Commit/push da verificare separatamente.

## 2026-10-04 — Consolidamento documentazione richiesto dall'utente

Letti ask-matt, documentation-and-adrs e writing-for-agents; applicate gerarchia/single source/progressive disclosure senza implementation/refactor prodotto. Audit: MEMORY e STATUS accumulavano stati superati; F00 invitava a selezionare candidato già concluso; F15/F18 e approval F01/F16 avevano sovrapposizioni; README/roadmap restavano a 18 schede. Snapshot integrali con hash di MEMORY/STATUS preservati, registro D01–D30 consolidato, indice docs/README e confini feature aggiunti. Riscritti soli documenti correnti; ADR/audit/checklist storici etichettati e collegati alla consegna F00. F15 Space/legacy/management esplicito, F18 viewer/note native, F07 manutenzione skill; F10 non dipende circolarmente dall'editor F03. Handoff finali riordinati dopo requisiti. Nessun sorgente/profilo/vault/artefatto modificato o test prodotto eseguito. Verifica documentale PASS: 394 collegamenti locali nei 51 documenti modificati, 19 schede con handoff finale univoco, decisioni D01–D30 complete e snapshot MEMORY/STATUS identici ai corpi pre-consolidamento (hash verificati). Controllo esteso: 1.081 collegamenti locali in tutta docs validi. git diff --check PASS. Nessuna build necessaria per soli testi; review diff/index/segreti e commit/push separati.

## 2026-10-04 — D31, rinumerazione delle feature

Richiesta esplicita: nomi e ID secondo la sequenza proposta, F0 MVP, F1 runtime, F2 conversazioni, F3 permessi, F4 shell, F5 file, F6 Spaces, F7 bots, F8 capacità native/memoria, F9 memoria Space, F10 routine, F11 plugin, F12 browser, F13 release, F14 collaborazione, F15 terminale, F16 computer, F17 voce, F18 specialisti. Applicata documentation-and-adrs; nessun ADR tecnico nuovo perché cambia solo la numerazione. Aggiornati nomi, titoli, dipendenze, prompt, indici e riferimenti; tabella di corrispondenza per le vecchie chat. Testi storici conservano ID originali con nota; link delle schede aggiornati, snapshot hash riferito al corpo pre-migrazione in Git 52d14ea. Nessun codice/artefatto/runtime/dato personale modificato. Verifica PASS: 19 schede rinumerate, catalogo F0–F18 ordinato, contenuti equivalenti salvo ID/percorsi, guidance/handoff univoci, snapshot storici preservati salvo link e 1.144 link locali validi. diff/index/pattern credenziali controllati prima del commit; pubblicazione tracciata in Git.
