> Documento/evidenze storici. Per stato corrente leggere [STATUS](../project/STATUS.md); requisiti e gate attuali nel [catalogo feature](../features/README.md). Il contenuto sotto non autorizza nuove attività né certifica lo stato successivo a F00.

# Hermes Desktop — proposta di design

> Aggiornamento: la composizione iniziale è superata dalle decisioni team/espressività/ricerca e scrittura in `docs/project/MEMORY.md`. Q6 è ancora pendente; conservare questa baseline come storico.
2026-10-04. Stato: proposta per revisione. Priorità: assistente personale e progetti. Riferimenti applicati: `axiom-design` (HIG, composizione, tipografia, materiali) e [libreria Unsloth](../ux-extracts/unsloth/pattern-library.md).

## Direzione

Una conversazione leggibile, con attività persistente vicina ma secondaria. L'utente deve capire tre cose a colpo d'occhio: con chi lavora, cosa sta avanzando e se serve una sua decisione. Il responsabile rimane stabile anche quando delega; la UI non diventa un flusso rumoroso di messaggi tra agenti.

Le tre alternative sono: estendere il desktop Hermes upstream, creare un client SwiftUI macOS, oppure una shell web/Tauri. Il riuso è la prima verifica; SwiftUI è la raccomandazione per un client nuovo dedicato al Mac. La shell multipiattaforma ha senso se quel requisito viene confermato. Il wireframe descrive il prodotto e non dipende ancora dallo stack.

## Composizione

| Area | Contenuto principale | Comportamento |
|---|---|---|
| Sidebar | Nuova chat, Da rivedere, Incarichi, Progetti, Recenti | Collassabile; progetto selezionato evidente; badge solo se utile |
| Toolbar | Titolo, responsabile, stato sintetico, Apri attività | Controlli di finestra e menu della piattaforma |
| Conversazione | Messaggi, risposte, risultati, richieste di intervento | Larghezza di lettura contenuta; testo selezionabile |
| Composer | Bozza, allegati quando supportati, invio/interruzione | Sempre raggiungibile; comportamento durante attività esplicito |
| Inspector | Incarico, piano, deleghe, risultati, limiti | Chiudibile e ridimensionabile; stato preservato per conversazione |

Proposta iniziale desktop: sidebar circa 240–280 pt; inspector 300–360 pt; colonna di lettura circa 640–760 pt dove c'è spazio. Sono valori di progetto da valutare, non misure di Unsloth. Il minimo finestra e il deployment target saranno fissati nella prova del client.

## Prima apertura

Mostrare “Collega Hermes” se il runtime non è configurato, con scelta locale o remota e verifica di connessione. Nessuna falsa chat pronta mentre il runtime è assente. Dopo il collegamento: “Cosa vuoi portare avanti?” e suggerimenti sintetici, senza campioni che sembrino conversazioni reali. Una chat semplice non richiede creare un progetto, un team o un incarico ricorrente.

## Sidebar

Lavoro operativo sopra, navigazione quotidiana al centro, connessioni/impostazioni sotto. “Da rivedere” aggrega risultati e decisioni pendenti; “Incarichi” mostra responsabilità che durano oltre una chat. Team e agenti si gestiscono nei dettagli del progetto o nelle impostazioni, anziché occupare la navigazione principale.

Le righe dei progetti hanno titolo e stato solo quando serve. Azioni secondarie tramite menu coerente, disponibili anche da tastiera. Il badge delle richieste pendenti ha un numero e un'etichetta accessibile. Il testo importante non viene troncato senza un modo per leggerlo.

## Conversazione e risultati

I messaggi dell'utente hanno un contenitore distinto; le risposte usano tipografia ordinata e spazio, con intestazione leggera del responsabile. Una delega produce una riga riassuntiva nella timeline e dettagli nell'inspector. Il risultato appare come contenuto o file apribile, con origine e stato di revisione. “Completato” viene mostrato dopo conferma del runtime e verifica del criterio dell'incarico.

Quando l'utente scorre indietro, lo streaming non lo trascina in basso. Un controllo “Nuovi aggiornamenti” permette di tornare al presente. Gli output voluminosi hanno anteprima e apertura dedicata. Errori di tool e tentativi successivi non diventano automaticamente un fallimento dell'intero incarico.

## Composer

Invio con Enter, newline con Shift+Enter; la composizione IME non invia un messaggio. Feedback locale immediato con stato “Invio…”; dopo l'ack del runtime passa a “Ricevuto”. Se manca l'ack, “Invio non confermato” propone riconciliazione prima di ripetere.

Durante una esecuzione, l'interruzione è separata dall'invio di una nuova bozza. Il trattamento del nuovo messaggio dipende dal protocollo: direzione aggiuntiva o coda solo se supportate, con etichetta esplicita prima dell'invio. Il selettore del modello e le impostazioni tecniche restano secondari; il responsabile dell'incarico è più importante del nome del modello.

Allegati e voce compaiono quando funzionano. File allegati mostrano nome, stato, errore e rimozione prima dell'invio; nessun upload silenzioso. La prima integrazione testuale non mostra controlli finti per voce o allegati.

## Stati, controlli e copy

| Stato del lavoro | Copy proposta | Azioni disponibili |
|---|---|---|
| In coda | “In attesa di iniziare” | Annulla se supportato |
| In corso | “Hermes sta raccogliendo le informazioni” | Apri attività, Interrompi |
| Intervento richiesto | “Serve una tua decisione” | Vedi richiesta |
| Pausa durevole | “Incarico in pausa” | Riprendi, solo con supporto verificato |
| Interruzione richiesta | “Interruzione in corso…” | Attendere conferma; stato non concluso |
| Completato | “Risultato pronto” | Apri, Dai feedback |
| Fallito | “L'esecuzione si è fermata” | Dettagli, nuovo tentativo esplicito |
| Interrotto | “Esecuzione interrotta” | Nuova esecuzione; non fingere una ripresa |

Stato connessione separato: “Collegato”, “Riconnessione…”, “Runtime non raggiungibile”. In quest'ultimo caso la cronologia resta leggibile, le bozze restano locali e non viene dichiarato che l'agente abbia smesso di lavorare.

La pausa dell'incarico può sospendere la pianificazione futura e resta distinta dall'interruzione dell'esecuzione attiva. Dopo un crash non recuperabile: “L'esecuzione è stata interrotta dal riavvio”, con stato dell'incarico e risultati parziali conservati.

## Inspector e approvazioni

Sintesi dell'obiettivo e dell'attività in alto. Sezioni: Piano, Team, Risultati, Limiti. Ogni delegato ha identità, responsabilità e stato; l'utente può passare alla sua attività senza cambiare il proprietario dell'incarico.

Una richiesta di approvazione espone azione, destinazione, dati coinvolti e durata del consenso. Esempio sintetico: preparare un documento è distinto dall'inviarlo. “Approva questa azione” e “Rifiuta” sono espliciti. Scadenza o risoluzione da un'altra superficie ritirano la richiesta; non resta un pulsante utilizzabile su una domanda vecchia. Una revisione di risultato non concede permessi aggiuntivi.

## Visual design Apple

Usare colori semantici di sistema, sfondi adattivi e tipografia di sistema. Regular per il testo, semibold per gerarchia, font monospaziato per codice e dati tecnici. Gli stati combinano testo, icona e colore. L'identità Hermes usa un accento discreto e un avatar statico iniziale.

Materiali della piattaforma per sidebar/toolbar e superfici di controllo; contenuto della conversazione su una superficie stabile e leggibile. Liquid Glass solo dove disponibile e utile per navigazione/controlli; fallback nativo sulle versioni precedenti. Le scelte API, simboli e disponibilità vanno verificate nello SDK scelto. Il vetro non diventa lo sfondo di ogni messaggio.

## Motion e feedback

| Cambio | Proposta | Con Reduce Motion |
|---|---|---|
| Apertura inspector | Transizione breve, circa 180–220 ms | Cambio immediato o semplice dissolvenza |
| Arrivo messaggio | Apparizione discreta, circa 120–160 ms | Nessuna traslazione |
| Lavoro in corso | Indicatore indeterminato vicino alla descrizione | Icona stabile e aggiornamenti testuali |
| Risultato pronto | Cambio di stato e icona | Identico contenuto, senza effetto |

Le durate sono target di progetto da provare. Invio e controlli rispondono subito; le animazioni non ritardano il comando. Niente percentuali inventate: progresso determinato solo per unità misurabili. Le notifiche riguardano risultati, impedimenti e richieste, con deduplicazione.

## Tastiera e accessibilità

Cmd+N per nuova chat, Cmd+K per ricerca/azioni se implementata, Cmd+, per impostazioni. Esc chiude un popover e restituisce il focus al trigger; nell'MVP non interrompe il lavoro per evitare ambiguità. Tutte le azioni hanno accesso tramite menu/controlli, non solo shortcut.

Ordine di lettura: contesto, messaggi, attività riassunta, composer; inspector come regione separata. I token di streaming non vengono annunciati uno a uno. Le richieste urgenti vengono annunciate una volta e restano raggiungibili. Verificare VoiceOver, Full Keyboard Access, testo ingrandito, contrasto e trasparenza ridotta. Per una futura superficie touch applicare target adeguati; non copiare automaticamente misure iOS nei controlli desktop.

## Finestra e adattamento

Con spazio ridotto chiudere l'inspector mantenendo un pulsante attività; poi rendere collassabile la sidebar. Non comprimere la colonna di lettura fino a renderla inutilizzabile. Nella verifica desktop includere 1440×900, 1024×768 e 800×600; 768/375 restano uno studio per un eventuale companion, non un requisito mobile implicito.

## Cosa viene trasferito dalle reference

| Pattern | Trasferimento proposto |
|---|---|
| Unsloth U-NAV-01 | Progetti e recenti distinti; gestione agenti nei dettagli |
| Unsloth U-CHAT-02 | Composer con strumenti vicini e comandi secondari raccolti |
| Unsloth U-OVERLAY-02 | Inspector per attività e risultati, invece di sampling in primo piano |
| Unsloth U-FEED-02 | Prerequisiti spiegati accanto all'azione non disponibile |
| Dots D1, documentazione pubblica | Responsabilità persistente e revisione: da dimostrare con runtime reale |

## Verifica prima della realizzazione

Rivedere un wireframe con: nuova chat, incarico in corso, richiesta di approvazione, runtime scollegato e risultato pronto. Poi decidere il client con la prova di integrazione. Il successo visivo non prova persistenza né correttezza delle capacità.
