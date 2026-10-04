# Sistema dei componenti Hermes Studio

2026-10-04. Struttura OpenDots; componenti e microinterazioni ispirati a Unsloth e Codex. Specifica per F01/F02/F03, non implementazione completata.

## Evidenze

Lo screenshot OpenDots in `references/opendots-user-reference-2026-10-04.png` determina Spaces, Dots, conversazione e Computer. Unsloth: screenshot utente e ispezione nativa AX; splitter sidebar con valore 280, composer e azioni risposta identificati, riepilogo attività aperto e richiuso. Codex: screenshot utente con sidebar/progetti, chat, composer e pannello strumenti; accesso live negato dallo strumento. Popover e animazioni Codex non verificati.

Screenshot personali conservati solo in `.reference/ui-private/`, ignorato da Git; copia verificata. [Inventario delle osservazioni](../ux-extracts/desktop-components/pattern-library.md). Uno screenshot non dimostra tempi, easing o font esatti. I token seguenti sono proposte da validare in Hermes.

## Anatomia

| Componente | Parti e comportamento | Riferimento |
|---|---|---|
| Sidebar | Ricerca, Spaces, Dots con avatar e preview, chat, Memory/Settings; selezione distinta da hover; azioni anche su focus | OpenDots; densità Unsloth/Codex |
| Composer | Textarea adattiva, bozza persistente, strumenti contestuali, invio/stop nello stesso posto; Enter invia, Shift+Enter nuova riga; composizione IME preservata | Unsloth/Codex; stati F02 |
| Messaggio utente | Bolla a destra; inserimento immediato distinto da accodamento, conferma ed esito incerto | Screenshot; contratto F02 |
| Risposta agente | Markdown, copia e revisione accessibili su hover e focus; ricevute strumenti separate | Unsloth e card OpenDots |
| Attività | Riga compatta con stato e durata se nota; apertura dei passi/tool confermati | Disclosure Unsloth osservata |
| Tool card | Icona, nome, destinazione, stato; dettagli apribili con host e provenienza | OpenDots e contratto Hermes |
| Pannello | Titolo, chiusura, tab, focus e scorciatoie; resize se introdotto | Computer OpenDots e pannello Codex |
| Popover | Ancoraggio al controllo, selezione corrente, Escape, chiusura esterna e ritorno focus | Proposta; apertura non interamente osservata |
| Revisione | Destinazione, titolo e Markdown modificabili; salvataggio esplicito; ricevuta dopo persistenza | OpenDots; baseline parziale |

## Token proposti: pixel logici

Spaziatura: 4 come base; 8/12/16/24/32 per distanze. Testo messaggi 16, interlinea 1,5; navigazione 14; secondario 13; metadati 12; header 16 con peso 550. Icone 18–20; area cliccabile minima 32, preferita 36; anello focus 2. Righe ordinarie 40–44; Dots con seconda riga 64–72; separatori 1.

Sidebar 258–280. Computer circa 28%, con obiettivo 320–430 quando tre colonne restano leggibili; centro restante, testo massimo 760 e padding 24–40. Il riferimento OpenDots suggerisce circa 19/53/28: confrontare screenshot alla stessa dimensione prima di dichiarare fedeltà. Sotto la larghezza minima il pannello deve essere apribile senza bloccare memoria o documenti.

Composer vuoto 68–84; textarea minima 28 e massima circa 180, poi scroll; padding 12–16; raggio 18–24; pulsante invio 32–36. Allegati e chip aumentano l'altezza solo quando presenti. Validare testo lungo, IME, zoom e finestra stretta.

Superfici chiare e neutre; accento teal OpenDots per azioni e avanzamento; metadati attenuati senza perdere contrasto. Avatar caratterizzati con gerarchia stabile. Stato espresso anche con testo o icona. Liquid Glass eventualmente nei controlli e nella cornice, dopo verifica di coerenza con il riferimento e leggibilità.

## Motion proposto

Hover/focus 120 ms; popover con opacità e spostamento verticale 4 px in 140 ms; apertura pannello 180 ms ease-out; resize composer 120 ms; nuovo messaggio con opacità e spostamento 2 px in 120 ms, senza ritardarne l'inserimento. Questi tempi non sono misurazioni di Unsloth/Codex.

Indicatore attività con etichetta; spinner solo durante un'operazione attiva. Durata locale distinta dalla durata confermata dal runtime. Autoscroll solo quando l'utente è già in fondo; altrimenti indicatore di nuovi aggiornamenti. Reduced Motion elimina spostamenti/transizioni mantenendo feedback testuale. Nessun rimbalzo avatar o animazione per ogni token. Un'animazione non anticipa la conferma dell'esito.

## Gate

Provare stati vuoti, popolati, in attesa, errore, incerti e offline; tastiera e ritorno focus; multilinea/IME; bozza nuova durante invio; disclosure con dati reali; scroll senza disturbo; finestre 900/1360 e zoom testo. Misurare o registrare motion in F01 prima di dichiararla verificata. I controlli riflettono capability reali: i tool futuri hanno stato esplicito; selezione modello e permessi richiedono contratti Hermes.

## Anatomia aggiuntiva D25–D29, proposta da implementare nelle feature

Folder picker e file tree nello Space (F03/F10), con host/percorso e conflitto; avatar picker Create/Edit Dot (F04-A) con griglia, selezione non solo colore e radiogroup. Browser (F08) mostra tab/URL/profilo/owner e takeover sullo stesso viewport; Memory (F15) mostra origine, ambito, percorso, pending/esito. Composer mic (F13) distingue bozza vocale da Send; vocal chat ha Mute/End/transcript e livello audio reale. Queste sono specifiche, non osservazioni o controlli già funzionanti. Dimensioni/motion seguono token centrali finché misurate nella .app.
