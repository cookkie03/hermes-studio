# Pattern library: Unsloth Desktop

Estratto: 2026-10-04. Riferimento: [repository richiesto](https://github.com/unslothai/unsloth). Osservazione: app installata `ai.unsloth.studio`, UI v0.1.900-beta. Focus: shell desktop, chat/composer, strumenti e dettagli avanzati, con un esempio di workflow immagini. Uso interno come riferimento di design.

**Copertura parziale e dichiarata:** 6 acquisizioni conservate, 4 principali; non è un audit completo dell'intera app o del codice. Il selettore modello è stato aperto e letto tramite accessibilità, ma la relativa acquisizione contiene la schermata base. Streaming, messaggi popolati, errori runtime, interazioni distruttive, motion, ordine Tab e responsive non testati. Nessun modello caricato o scaricato e nessun prompt inviato.

La finestra osservata produceva acquisizioni Retina 2940×1846; copie ottimizzate a 1440×904. Ridurre un'immagine non costituisce test a una viewport differente. L'albero AX include talvolta controlli nascosti: la visibilità è attribuita solo alle schermate confermate. Un riscontro statico successivo dei sorgenti è separato in [source-notes.md](source-notes.md).

## Indice

1. [Navigazione](#navigazione)
2. [Conversazione e composer](#conversazione-e-composer)
3. [Popover e pannelli](#popover-e-pannelli)
4. [Stati e feedback](#stati-e-feedback)
5. [Form e workflow](#form-e-workflow)
6. [Tastiera, motion, responsive](#tastiera-motion-responsive)
7. [Inventario e lacune](#inventario-e-lacune)

## Navigazione

### U-NAV-01 — Sidebar persistente

La sidebar divide azioni globali, aree di lavoro, progetti e chat recenti. L'account e le impostazioni si trovano in basso. In alto sono visibili controlli di sidebar e navigazione indietro/avanti. La larghezza letta dallo splitter AX è 280 unità UI; non è una misura CSS dei sorgenti.

**Evidenza:** [003-chat-default.png](screenshots/003-chat-default.png). **Occorrenze confermate:** chat e immagini, 2 superfici. **Varianti:** navigazione generale e sottosezioni del workflow immagini.

### U-NAV-02 — Navigazione contestuale

Nella schermata immagini la sidebar espande i workflow e seleziona `Reference` con un fondo tonale e un'icona. I tab superiori distinguono creazione e training; `Library` resta accessibile.

**Evidenza:** [002-image-reference.png](screenshots/002-image-reference.png). **Occorrenze confermate:** 1; pattern conservato perché mostra una gerarchia utile per sezioni avanzate.

### U-NAV-03 — Sezioni vuote

La sezione Projects resta visibile con il testo `No projects`. Le chat recenti restano separate. Questo stato comunica dove compariranno i progetti senza spostare la navigazione.

**Evidenza:** [003-chat-default.png](screenshots/003-chat-default.png). Nessuna creazione o cancellazione progetto eseguita; il flusso successivo non è verificato.

## Conversazione e composer

### U-CHAT-01 — Avvio centrato

La nuova chat presenta un saluto e un composer largo, centrato nell'area principale, con ampio spazio libero. Il selettore modello resta nella barra superiore. L'accessibilità identifica l'area di testo come `Message input`; il pulsante invio è disabilitato quando è vuota.

**Evidenza:** [003-chat-default.png](screenshots/003-chat-default.png) e [001-chat-empty.ax.txt](screenshots/001-chat-empty.ax.txt). Il saluto nella prima acquisizione non era ancora renderizzato: usare 003 per il layout stabilizzato.

### U-CHAT-02 — Azioni del composer

Gli allegati si aprono dal pulsante più. Permessi e strumenti attivi sono accanto al testo; dettatura e invio sono sul lato opposto. Search e Code hanno testo, icona e colore di accento; non sono comunicati dal solo colore.

**Evidenza:** [003-chat-default.png](screenshots/003-chat-default.png). Il funzionamento di dettatura, allegati e invio non è stato esercitato.

### U-CHAT-03 — Scelta del modello, evidenza AX

L'apertura ha esposto ricerca locale e tab Recommended / On Device / Connected. La screenshot 005 mostra ancora la base e **non prova visivamente il popover**. Questa voce è un'osservazione AX da ricatturare prima di usarla in un confronto visivo.

Non sono stati selezionati modelli né eseguiti download. La disponibilità indicata da un picker non prova che un modello sia pronto per l'inferenza.

## Popover e pannelli

### U-OVERLAY-01 — Strumenti adiacenti al punto d'uso

Il menu ancorato al composer raccoglie allegati, ricerca, codice, ricerca approfondita, file, MCP, skill, prompt salvati e altre azioni. Gli strumenti attivi hanno una spunta. Alcune voci hanno sottomenu; Export chat è disabilitato nella chat vuota.

**Evidenza:** [006-tools-menu.png](screenshots/006-tools-menu.png). **Occorrenze/varianti:** 1 menu / 1 stato aperto. Trigger verificato: clic del pulsante Tools and attachments. Non inferire le funzioni interne dalle sole voci.

### U-OVERLAY-02 — Inspector avanzato

Run settings apre una colonna destra e riduce lo spazio centrale. La chat e il composer restano disponibili. Preset, prompt di sistema e sampling sono raggruppati; numeri e slider sono affiancati. Il pannello non sostituisce la conversazione.

**Evidenza:** [004-run-settings.png](screenshots/004-run-settings.png). **Occorrenze/varianti:** 1 inspector / aperto e chiuso. Apertura e chiusura tramite controlli osservate; misure temporali e animazione non misurate. Valori non modificati.

### U-OVERLAY-03 — UI avanzata nascosta nell'albero

Alcune acquisizioni AX elencano Run settings e Command Palette anche quando la schermata non li mostra. Per questo estratto il solo nodo AX non conferma pannelli aperti o shortcut funzionanti. È un limite dell'acquisizione, non una diagnosi del prodotto.

## Stati e feedback

### U-FEED-01 — Notifica persistente con azioni

Una scheda in basso a destra mostra l'aggiornamento disponibile, versioni, note e azioni per rimandare o aggiornare. La scheda è separata dalla chat. Nessun aggiornamento avviato.

**Evidenza:** [003-chat-default.png](screenshots/003-chat-default.png). Non dedurre durata o comportamento di dismiss da una singola schermata.

### U-FEED-02 — Dipendenza mancante spiegata

Il workflow immagini mostra uno stato vuoto, una richiesta di selezione modello e Generate disabilitato. Il motivo è vicino all'area risultato, quindi l'utente può capire il prerequisito.

**Evidenza:** [002-image-reference.png](screenshots/002-image-reference.png). Stato di dipendenza mancante osservato; nessuna generazione tentata.

### U-FEED-03 — Stato di caricamento iniziale, solo AX

All'avvio è stato letto `Checking...`. Non è stata salvata una schermata di quel momento; non sono stati misurati tempi o transizioni.

## Form e workflow

### U-FORM-01 — Etichette, tooltip, progressiva esposizione

Il workflow Reference distingue immagine, prompt, negative prompt, proporzioni, risoluzione e parametri. I controlli avanzati sono collassati. Icone di aiuto accompagnano i parametri; il loro contenuto non è stato aperto.

**Evidenza:** [002-image-reference.png](screenshots/002-image-reference.png). Non trasferire questo form tecnico nella chat principale Hermes: il trasferimento viene deciso nel design, non nell'estratto.

### U-FORM-02 — Corrispondenza tra input numerico e slider

Run settings presenta il valore a fianco del parametro e un cursore per regolarlo. Il legame tra i due input e la validazione non sono testati.

**Evidenza:** [004-run-settings.png](screenshots/004-run-settings.png).

## Tastiera, motion, responsive

| Area | Osservazione | Lavoro mancante |
|---|---|---|
| Accessibilità | Nomi descrittivi in AX per composer e controlli | VoiceOver, tab order, contrasto misurato |
| Escape | Nel controllo nativo non ha chiuso affidabilmente il popover | Ricatturare in una sessione stabile; non dichiarare un bug |
| Palette | Presenza di nodi AX non basta a confermare apertura | Trigger, filtro, selezione, focus, dismiss |
| Motion | Nessuna registrazione temporale | Durate, entrata/uscita, Reduce Motion |
| Responsive | Una finestra desktop osservata | 1440×900 reale, 768, 375; trattamento delle colonne |
| Light mode | Osservato solo dark mode | Light, contrasto aumentato, trasparenza ridotta |

## Inventario e lacune

| Superficie | Stato della copertura |
|---|---|
| Chat nuova, composer, sidebar | Osservata e acquisita |
| Menu strumenti | Osservato e acquisito |
| Run settings | Osservato e acquisito |
| Images / Reference | Una schermata osservata e acquisita |
| Picker modelli | Osservato in AX; screenshot da rifare |
| Model hub, Library, Video, Audio, More | Voci osservate; flussi non esplorati |
| Projects e Recents | Sezioni osservate; gestione non testata |
| Settings, MCP, skill, training | Non esplorati |
| Risposta in streaming, tool in corso, errore, retry, stop | Non testati |

Non dichiarare assenti i pattern non osservati. Le opportunità da trasferire a Hermes sono separate in [design](../../design/desktop-design.md). Aggiornare questa libreria quando cambiano la versione di riferimento o i flussi da confrontare.
