# F10 — File e artefatti

Stato: documentata; tree/editor SwiftUI storico e anteprima eventi Electron parziali non equivalgono a file workspace completo.

## Risultato

Pannello Files con albero/ricerca/preview e risultati prodotti da tool Hermes; aprire un Markdown o un documento nello Space senza confondere file del Mac, host Hermes e pagina Studio. Fonte tool registry Hermes: verificare read_file/write_file/search_files e contratti effettivi, nomi esatti da ricercare prima dell'implementation.

File dell’host reale, sandbox root, symlink e ACL sono responsabilità del module File workspace; UI non esegue read/write locali generici. Se il runtime è remoto, mostra host e path remoti. Download/import verso Mac sono azioni esplicite con destinazione chiara. Nessuna scansione personale automatica.

## Comportamento

Root scelto → caricamento → albero vuoto/populato → preview → bozza → salvataggio/conflitto/errore. Evidenziare provenienza agent/run/tool e risultato confermato, non supposizione da testo. Modifica dirty resta recuperabile quando cambi file/pannello. Pagina Studio e file indipendenti: export/import con ricevuta, non sync bidirezionale implicita.

## Scope e seam

F11 runtime, F16 permessi, F03 editor documenti riusabile. Ownership futuro in module File workspace con adapter runtime e filesystem sintetico; non infilare filesystem nel preload o Chat.tsx. F17 terminale separato; F08 browser non necessario. Primo incremento read-only root selezionato+preview, poi scrittura solo in una slice esplicita.

## Gate

Uscita dal root, symlink, huge/binary files, stale revision, permesso negato, offline, cambio host, bozza modificata e restart. Fixture con contenuti sintetici, poi operazione runtime isolata e UI e tastiera. Nessun test su cartelle personali, nessun DELETE automatico. Attività tool persistita non prova un file esista ancora: refresh autorevole.

## Handoff

> Implementa solo F10, partendo da read-only Files sul host runtime autorizzato e root esplicito. Usa tools Hermes reali, non shell/file API generica dal renderer. Definisci module e prove path/symlink/conflitto. Non sviluppare terminale o browser; preserva dati personali.
