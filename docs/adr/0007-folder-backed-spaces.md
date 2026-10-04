# ADR0007 — Spaces collegati a cartelle reali

Data: 2026-10-04. Stato: accettata per richiesta utente D25; decisione di prodotto/storage, non migrazione implementata. Integra ADR0005/0006.

## Contesto

Durante la prova F00 Luca chiede Spaces come cartelle/vault Obsidian e progetti Codex, con file testuali visibili e lavoro degli specialisti sugli stessi contenuti. La baseline riusata salva pagine nello store locale: questo non soddisfa il nuovo modello.

## Decisione

Uno Space collega cartelle selezionate esplicitamente. Il filesystem è fonte dei contenuti; il client conserva collegamenti, bozze e ricevute. F03 cura workspace/editor; F10 operazioni file e revisioni; F16 ambito degli accessi. Collegare o scollegare non copia, sposta o elimina la directory. Gli specialisti lavorano soltanto sui riferimenti raggiungibili dal loro host e autorizzati.

## Alternative

Pagine solo nel database con export occasionale: conservate per compatibilità, superate come modello principale perché separano i contenuti dal progetto reale. Import massivo/sync automatico del vault: non richiesto e introduce copie/conflitti. Una cartella imposta dentro il bundle Studio: limita l’uso di progetti già esistenti.

## Conseguenze

Definire root/host/revisione e conflitti esterni prima degli adapter. Preservare dati legacy con export esplicito, senza conversione distruttiva. Le scelte operative di watcher, versione file e trasporto remoto restano da decidere nella chat feature. Aggiungere cartelle non autorizza automaticamente i bot alla scrittura.
