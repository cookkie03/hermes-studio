# Piano corrente: una feature per chat

2026-10-04. D19–D23 e ADR0006 prevalgono sui piani notturni precedenti.

## Consegna di questa chat

1. Preservare l'MVP parziale e le sue evidenze, senza implementare altre feature.
2. Consegnare il catalogo F00–F17 con ambito, fonti, ownership, dipendenze, criteri di accettazione e prompt di handoff.
3. Consolidare principi e review architetturale; nessun candidato viene refattorizzato automaticamente.
4. Allineare memoria, stato, roadmap e istruzioni per impedire ripartenze sul vecchio piano.
5. Verificare documenti, collegamenti e diff; salvare un commit della documentazione. Nessuna release in questa chat.

## Sviluppo successivo, selezionato dall'utente

F00 consolida la base e i gate ancora aperti; F01 cura componenti e navigazione; F11 connessione; F02 conversazioni; F03 documenti; F15 memoria; F16 approvazioni. Le altre schede sono selezionabili quando i loro prerequisiti sono soddisfatti. F04/F05 trattano bot e collaborazione, F06 routine, F07 plugin, F08 browser, F09 computer use, F10 file, F17 terminale. F12 prepara il vero prodotto GitHub con DMG. Voce e specialisti restano F13/F14 futuri.

Un numero di scheda non è una priorità automatica. Una chat può dividere una feature in incrementi, ma non iniziare le altre. Prima di toccare file condivisi confrontare Git e ownership; pianificare solo il risultato scelto. I vecchi ticket 01–08 restano storici.

## Gate documentale

Tutte le schede sono raggiungibili dal [catalogo](../features/README.md); distinguono esistente, sorgente upstream e proposta. Nuove capacità richiedono test attraverso l'interface reale, fixture isolate e prova packaged proporzionata. Un handshake non prova chat; una bozza di release non prova installazione; il client chiuso non prova continuità per 24 ore.

La review propone due candidati: ciclo Conversazione e Metadata locali. Nessuna scelta effettuata; la prossima chat interessata deve delimitare il candidato prima di implementarlo.
