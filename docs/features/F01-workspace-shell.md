# F01 — Shell del workspace

Stato: specifica per una chat futura; baseline esistente parziale, feature non completa. Aggiornamento: 2026-10-04. La nuova richiesta dell’utente è documentare il progetto per feature e partire da un MVP quasi vuoto. Questo documento non autorizza a riprendere il piano notturno né a eliminare il prototipo.

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

Prerequisiti: MEMORY/STATUS/GLOSSARY correnti, ADR0005, component-system e spec aggiornata dell’MVP vuoto. Dipendenza F02 per contenuto conversazioni e F03 per documenti e F15 per memoria; F01 può mostrare destinazioni vuote senza implementarle.

Ownership futura: `desktop/upstream/src/client/App.tsx`, `ThreadList.tsx`, stile della shell e componenti dedicati eventualmente estratti. Condividere `style.css` solo con accordo esplicito per evitare sovrascritture. Non modificare bridge/runtime, modelli server, packaging o editor. Preservare sorgente/asset/provenienza MIT. La baseline contiene già sidebar e inspector: controllare lo stato reale prima di decidere riuso o sostituzione.

## Dati reversibili e verifiche

Nuovo profilo di sviluppo separato, inizialmente vuoto. Non cancellare dati dell’attuale prototipo o profili Hermes; migrazione/seed di demo sono azioni separate ed esplicite. Impostazioni selezione/inspector possono essere ripristinate; nessuna scrittura fuori dal profilo di sviluppo.

Definition of done: avvio con zero dati senza chiamate runtime; navigazione da tastiera; screenshot 1360 e 900px con rapporti/overflow misurati; inspector apri/chiudi e passaggio Memory senza intercettazioni; zoom e reduced motion; errore archivio preserva dati; nomi accessibili verificati nell’albero UI. Registrare screenshot e misure, non dichiarare identico sulla sola base del CSS. Typecheck/build pertinenti e smoke della vera.app, senza prompt personali.

## Prompt per una nuova chat

> Implementa solo F01 leggendo AGENTS.md, docs/project/MEMORY.md, STATUS.md, GLOSSARY.md, ADR0005, docs/design/component-system.md e questa specifica. La direzione attuale è MVP quasi vuoto e sviluppo per feature; non riattivare il piano notturno. Ispeziona la shell esistente prima di editarla, preserva asset/provenienza e dati. Lavora soltanto sui file client della shell concordati; coordina gli stili condivisi. Non collegare Hermes né creare dati dimostrativi automaticamente. Verifica 1360/900px, tastiera, nomi accessibili, reduced motion e overlay su profilo sintetico. Aggiorna prove e stato nei documenti; non dichiarare completa una capability remota assente. Se il component-system non è disponibile, completa l’analisi e segnala il prerequisito prima del codice visivo.
