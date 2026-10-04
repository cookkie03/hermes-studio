# F4 — Shell, navigazione e componenti di Hermes Studio

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F4**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** design e implementation delle superfici Studio. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Realizzare shell/sidebar/header/composer/popover coerenti con OpenDots e contesto Hermes sempre riconoscibile.

**Backend e confine:** Consumare progetti/sessioni/modelli/effort/capability forniti dagli adapter owner; Settings Hermes usa backend scoped, Settings Studio stato app. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Applicare anche D36 qui sotto: pannello laterale per figli temporanei; Dots persistenti nella propria chat, messaggi attribuiti e attività confermata dal runtime. Space/host/modello/effort leggibili; sidebar Space attivo, popover @ e /, selettori pending/esito reale. Stato offline/stale/non supportato distinto. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F2/F6/F7/F11 forniscono contratti/dati; F4 implementa presentazione e interazioni, non una nuova connessione/executor. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** 900/1360px, nomi lunghi e omonimi, cambio chat mentre carica, IME/Enter nel menu, Escape/focus, zoom/VoiceOver/Reduced Motion, contenuto non coperto dal pannello. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: specifica per una chat futura; baseline esistente parziale, feature non completa. Aggiornamento: 2026-10-04. La nuova richiesta dell’utente è documentare il progetto per feature e partire da un MVP quasi vuoto. Questo documento non autorizza a riprendere il piano notturno né a eliminare il prototipo.


<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [frontend-design](<../../.agents/skills/frontend-design/SKILL.md>) | Direzione visiva conforme al riferimento e anatomia dei componenti |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [ux-extract](<../../.agents/skills/ux-extract/SKILL.md>) — condizionale | Se manca evidenza su un componente o una microinterazione |
| [axiom-design](<../../.agents/skills/axiom-design/SKILL.md>) — condizionale | Gerarchia e convenzioni macOS, applicate allo stack Electron |
| [axiom-accessibility](<../../.agents/skills/axiom-accessibility/SKILL.md>) — condizionale | Criteri tastiera/focus/contrasto; API native solo nel ramo nativo |

### Punti di ingresso da leggere

- [docs/design/component-system.md](<../../docs/design/component-system.md>): Token, stati e motion proposti.
- [docs/design/opendots-target.md](<../../docs/design/opendots-target.md>): Composizione autorevole.
- [docs/ux-extracts/desktop-components/pattern-library.md](<../../docs/ux-extracts/desktop-components/pattern-library.md>): Osservazioni live vs screenshot.
- [desktop/upstream/src/client/App.tsx](<../../desktop/upstream/src/client/App.tsx>): Navigazione shell.
- [desktop/upstream/src/client/ThreadList.tsx](<../../desktop/upstream/src/client/ThreadList.tsx>): Sidebar.
- [desktop/upstream/src/client/style.css](<../../desktop/upstream/src/client/style.css>): Stili condivisi da coordinare.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Risultato e confini

Aprire Hermes Studio e capire dove si trovano agenti, conversazioni, documenti e strumenti, anche quando non esiste ancora alcun dato. La shell organizza il lavoro; non crea un agente, avvia una sessione o collega Hermes da sola.

MVP: finestra macOS, sidebar, destinazione selezionata, area principale, inspector apribile, empty state e stato di connessione. L’installazione e il packaging hanno una specifica separata. Chiamate, scheduling, team automatici, terminale eseguibile e computer use non appartengono a questa feature.

## Riferimenti e confine delle prove

- Norma visiva centrale: [component-system](../design/component-system.md). Prima di implementare verificare che il documento sia disponibile e leggere le sue evidenze Unsloth/Codex; questo file non sostituisce quella estrazione.
- Riferimento osservato: [screenshot OpenDots dell’utente](../design/references/opendots-user-reference-2026-10-04.png), descritto in [opendots-target](../design/opendots-target.md): una sidebar, chat centrale e Computer a destra; avatar illustrati, superfici chiare, selezione lavanda, accenti verde acqua.
- Circa 19%/53%/28% è una stima dalla screenshot, non un layout responsive misurato upstream. Sono proposte i numeri CSS riportati sotto.
- Unsloth e Codex forniscono reference di componenti e stati attraverso il documento centrale; la loro presenza non autorizza rail aggiuntive, task fittizi o menu non supportati. Nessuna animazione è stata verificata da una screenshot statica.

## Anatomia dei componenti

| Componente | Parti e comportamento |
|---|---|
| Finestra | Titolo Hermes Studio, controlli macOS, contenuto ridimensionabile. Non imitare i traffic light nel DOM. |
| Sidebar | Logo, azione New chat con nome accessibile, ricerca, sezioni Spaces e Dots, conversazioni recenti se presenti, Memory e Settings in basso. Una sola colonna, nessuna seconda rail. |
| Riga Space | Cartella, nome, espansione quando ha figli; conteggio solo se reale. Selezione distinta dal focus. |
| Riga Dot | Avatar illustrato, nome e riassunto reale o ruolo configurato. Ellissi, mai overflow; stato operativo distinto dall’identità. Nessun timestamp inventato. |
| Header | Avatar e nome allineati a sinistra; ruolo/stato sotto; azioni a destra. Stato leggibile anche senza colore. |
| Area principale | Destinazione selezionata o istruzione breve per creare il primo elemento. Nessun esempio Acme/Scout precaricato per sembrare funzionante. |
| Inspector | Titolo Computer, chiusura, tab Browser/Files/Terminal solo con contenuti/stati onesti. L’apertura non crea una capability. |
| Settings | Connessione e preferenze locali. Nessuna schermata credenziali CopilotKit nel percorso Hermes. |

## Geometria e token

Proposta da validare rispetto alla norma centrale: base spacing 4px, padding shell 16–24px, righe sidebar 56–68px con avatar 36–40px, header 64–72px, separatori 1px, raggi 8px per controlli e 12–16px per superfici. Font di sistema macOS: corpo 14px/20px, testo secondario 12px/18px, titolo header 16px/22px. Questi valori sono proposti, non misurazioni Unsloth/Codex.

A 1360px: sidebar circa 258px, inspector circa 381px, centro circa 721px. Inspector non deve ereditare 40vw da upstream. Dimensione minima proposta della finestra 880×640, da testare prima di fissarla. A 900px privilegiare area principale: inspector sovrapposto solo su apertura esplicita, chiusura accessibile; passando a Memory/Spaces/Settings chiuderlo se intercetta contenuti. Non bloccare Add memory o i controlli di documento con un overlay invisibile. Sidebar collassabile da tastiera, focus restituito al suo pulsante.

Colori e tipografia definitivi appartengono al component-system; niente gradienti decorativi o card annidate per ogni riga. Le superfici operative hanno gerarchia attraverso spazio, bordo e selezione.

## Stati e contratti

| Stato | UI e conseguenza |
|---|---|
| Prima apertura vuota | Nessun Dot/Space/conversazione automatico. Indicazioni Create Space/Create Dot, nessuno stato Working. |
| Metadata in caricamento | Stato breve e annuncio accessibile; non mostrare un archivio vuoto come se fosse già verificato. |
| Archivio illeggibile | Errore e recupero esplicito; preservare i byte e non inizializzare sopra il file. |
| Runtime scollegato | Documenti locali accessibili. Invio e azioni remote non attivi. |
| Inspector non disponibile | Spiegare la capacità assente, non mostrare screenshot o prompt terminale finti. |
| Selezione rimossa | Tornare a destinazione valida senza modificare altri dati. |

Aprire/chiudere l’app è distinto da cancellare lavoro del runtime. I dati personali Hermes non sono un seed della shell. Dots configurati localmente non dimostrano processi avviati.

## Motion e accessibilità

Proposta: panel enter/exit 120–180ms solo per spiegare il cambiamento; focus ring immediato; nessun bob infinito degli avatar. Con reduced motion usare cambio immediato o sola dissolvenza breve senza traslazione. La navigazione deve funzionare senza animazione, hover o drag. Nome accessibile obbligatorio per New chat, ricerca, Computer, Close e Settings. Ridimensionamento e zoom 200% non devono eliminare i controlli essenziali. Contrasto/focus vanno verificati nel prodotto, non dedotti dai colori della screenshot.

## Tastiera, focus e microstati

Applicare il contratto normativo nel component-system. La ricerca mantiene focus mentre filtra; risultati vuoti non diventano un errore di connessione. Enter seleziona un risultato soltanto quando ha focus esplicito. Tab segue logo/azioni/ricerca/navigazione/contenuto; Escape chiude menu o inspector, restituendo focus al pulsante che li ha aperti. Collassare sidebar non lascia il focus in un nodo nascosto. Ogni icona conserva nome e motivo di disabled.

Le righe hanno stati idle/hover/focus-visible/selected/disabled distinti; selezione non equivale a Running. Busy riguarda solo l’azione effettivamente in attesa. Copy non è un’azione della shell MVP: verrà definito nel componente che contiene il dato, senza un comando globale che copi contesto privato.

## Dipendenze e ownership

Prerequisiti: MEMORY/STATUS/GLOSSARY correnti, ADR0005 e ADR0006, component-system e spec aggiornata dell’MVP vuoto. Dipendenza F2 per contenuto conversazioni e F6 per documenti e F9 per memoria; F4 può mostrare destinazioni vuote senza implementarle.

Ownership futura: `desktop/upstream/src/client/App.tsx`, `ThreadList.tsx`, stile della shell e componenti dedicati eventualmente estratti. Condividere `style.css` solo con accordo esplicito per evitare sovrascritture. Non modificare bridge/runtime, modelli server, packaging o editor. Preservare sorgente/asset/provenienza MIT. La baseline contiene già sidebar e inspector: controllare lo stato reale prima di decidere riuso o sostituzione.

## Dati reversibili e verifiche

Nuovo profilo di sviluppo separato, inizialmente vuoto. Non cancellare dati dell’attuale prototipo o profili Hermes; migrazione/seed di demo sono azioni separate ed esplicite. Impostazioni selezione/inspector possono essere ripristinate; nessuna scrittura fuori dal profilo di sviluppo.

Definition of done: avvio con zero dati senza chiamate runtime; navigazione da tastiera; screenshot 1360 e 900px con rapporti/overflow misurati; inspector apri/chiudi e passaggio Memory senza intercettazioni; zoom e reduced motion; errore archivio preserva dati; nomi accessibili verificati nell’albero UI. Registrare screenshot e misure, non dichiarare identico sulla sola base del CSS. Typecheck/build pertinenti e smoke della vera.app, senza prompt personali.

## Allineamento D25–D29

La destinazione Space presenta folder e documenti reali (F6/F5), preservando pagine legacy; non è soltanto elenco pagine metadata. Identità Dot usa avatar scelto F7-A in ogni superficie. Browser Computer è stesso profilo/pagina di utente e Hermes (F12), non preview statica. Memory distingue Space/profilo/legacy F9; composer offre voce soltanto quando F17 readiness/permesso provati. Questi controlli restano indisponibili finché feature implementate; F4 non le implementa incidentalmente.

## D34 — Settings Hermes e Settings Hermes Studio

L'app deve avere una sezione Settings dedicata con due ambiti distinguibili: **Hermes**, tutte le impostazioni del runtime disponibili per la versione/host/profilo selezionati; **Hermes Studio**, preferenze dell'app standalone. Nome host/profilo, origine e limiti devono restare visibili per i settings Hermes. Configurazione della connessione è F1; F4 possiede navigazione/gerarchia; F8 inventario/copertura; feature specifiche possiedono letture/mutazioni. Le preferenze client non modificano tacitamente il backend. Le impostazioni Hermes non sono una copia locale divergente della sua config. Un gap resta esplicito finché il contratto non è collegato/verificato. Prima implementazione completa in chat F4 e feature proprietarie; F1 aggiunge solo la superficie connessioni concordata.


## Requisito condiviso: contesto e composer Hermes

Leggere [contesto visibile, Spaces/progetti, @ file/righe e / skill/tool](gui-context-and-references.md). Header identifica Space, host, modello ed effort effettivi della chat/bot. Capacità e mutazioni rimangono nel backend Hermes; non simulare valori o azioni non supportati. Ownership specifica nella scheda trasversale.

## D36 — Sidebar Dots e pannello sub-agent

La sidebar mantiene i Dots persistenti, ognuno con segnale di attività derivato da Hermes e badge non letto indipendente. Il Dot selezionato mostra la propria chat; selezione, attività e non letto sono stati separati. Space/host/modello/effort della chat attiva restano riconoscibili anche con un pannello aperto.

Il controllo «Sub-agent» nella chat apre un pannello laterale per i soli figli temporanei della sessione padre (F14). Elenco, selezione del figlio, dettaglio, chiusura e ritorno focus devono funzionare con tastiera e lettore di schermo. Coordinare questa superficie con browser/file/strumenti già affiancati: a 900px il composer e il contesto rimangono accessibili; non creare finestre separate per Dots né inserire Dots nel pannello dei figli.

Gate: più Dots attivi, uno non letto ma inattivo, figlio temporaneo attivo e pannello aperto; nessuna confusione di identità o copertura del composer. Reduced Motion mantiene etichette di stato senza pulsazioni continue.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa solo F4 leggendo AGENTS.md, docs/project/MEMORY.md, STATUS.md, GLOSSARY.md, ADR0005 e ADR0006, docs/design/component-system.md e questa specifica. La direzione attuale è MVP quasi vuoto e sviluppo per feature; non riattivare il piano notturno. Ispeziona la shell esistente prima di editarla, preserva asset/provenienza e dati. Lavora soltanto sui file client della shell concordati; coordina gli stili condivisi. Non collegare Hermes né creare dati dimostrativi automaticamente. Verifica 1360/900px, tastiera, nomi accessibili, reduced motion e overlay su profilo sintetico. Aggiorna prove e stato nei documenti; non dichiarare completa una capability remota assente. Se il component-system non è disponibile, completa l’analisi e segnala il prerequisito prima del codice visivo. Segui anche Incarico per la chat implementatrice di F4: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
