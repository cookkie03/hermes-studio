# Piano corrente: una feature per chat

2026-10-04. D19–D23 e ADR0006 prevalgono sui piani notturni precedenti.

## Consegna di questa chat

1. Preservare l'MVP parziale e le sue evidenze, senza implementare altre feature.
2. Consegnare il catalogo F00–F18 con ambito, fonti, ownership, dipendenze, criteri di accettazione e prompt di handoff.
3. Consolidare principi e review architetturale; nessun candidato viene refattorizzato automaticamente.
4. Allineare memoria, stato, roadmap e istruzioni per impedire ripartenze sul vecchio piano.
5. Verificare documenti, collegamenti e diff; salvare un commit della documentazione. Nessuna release in questa chat.

## Sviluppo successivo, selezionato dall'utente

F00 consolida la base e i gate ancora aperti; F01 cura componenti e navigazione; F11 connessione; F02 conversazioni; F03 documenti; F15 memoria; F16 approvazioni. Le altre schede sono selezionabili quando i loro prerequisiti sono soddisfatti. F04/F05 trattano bot e collaborazione, F06 routine, F07 plugin, F08 browser, F09 computer use, F10 file, F17 terminale. F12 prepara il vero prodotto GitHub con DMG. Voce in-app è documentata in F13; telefonate e specialisti restano idee future.

Un numero di scheda non è una priorità automatica. Una chat può dividere una feature in incrementi, ma non iniziare le altre. Prima di toccare file condivisi confrontare Git e ownership; pianificare solo il risultato scelto. I vecchi ticket 01–08 restano storici.

## Gate documentale

Tutte le schede sono raggiungibili dal [catalogo](../features/README.md); distinguono esistente, sorgente upstream e proposta. Nuove capacità richiedono test attraverso l'interface reale, fixture isolate e prova packaged proporzionata. Un handshake non prova chat; una bozza di release non prova installazione; il client chiuso non prova continuità per 24 ore.

La review propone due candidati: ciclo Conversazione e Metadata locali. Nessuna scelta effettuata; la prossima chat interessata deve delimitare il candidato prima di implementarlo.

## Incremento selezionato successivo: F00

2026-10-04: Luca richiede esplicitamente review, build/test, correzioni essenziali e commit MVP. F00 completata con Metadata locali e correzioni essenziali di baseline; esiti in STATUS e scheda F00. Nessuna selezione automatica delle schede successive.

## Revisione documentale D25–D29

F00 completata dall'utente. Nessuna nuova feature selezionata per implementazione. Schede aggiornate: F03/F10 cartelle reali, F04-A avatar OpenDots indipendente dal binding runtime, F08 browser unico visibile/persistente/shared-control, F15 memoria runtime distinta dai documenti Markdown Space, F13 messaggi vocali e vocal chat in-app. Telefonate rimangono future. Prima chat consigliabile per la nuova richiesta: F10/F03 per un incremento folder selezionato con ownership condivisa; non avviare entrambe automaticamente. Documentazione memory ufficiale e confronto sorgente in docs/research/hermes-memory-system.md.

## F18 — Parità e presentazione delle capacità native, D30

Nuova scheda dedicata: F18-A note post-turn, F18-B viewer memoria Hermes, F18-C mappa capacità. Hermes conserva tutta la sua memoria; Studio osserva origine/stato/aggiornamenti senza import o nuovo motore. F15 memoria Markdown Space distinta. Implementazione non selezionata; ogni incremento richiede backend/read contracts e ownership della UI. Questo principio si applica a tutte le feature senza riavviare sviluppo globale.
