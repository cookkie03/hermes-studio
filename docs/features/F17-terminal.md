# F17 — Terminale integrato

Stato: documentata; output di tool in UI non è una sessione PTY interattiva.

## Scopo

Mostrare comandi e output Hermes associati a un'esecuzione; opzionale PTY interattiva solo dopo verifica del contratto desktop ufficiale. Separare risultato tool-shell e terminal session; non inventare una console che invia testo al modello come fosse una shell.

Host/session/cwd/stato/permessi sempre chiari. Console vuota, apertura, collegata, comando avviato, output, codice di uscita, interrotta, offline. Uscita0 non equivale a obiettivo completato; cancellare display non cancella processo. Input per nuovo comando disabilitato senza capability/authorization.

Module Terminal owns PTY/identità tool, transport/backpressure, resize, detach/attach e ownership del processo. Renderer mostra stream; preload non offre exec generico. Sessioni personali esistenti non importate per default. Output può contenere segreti: limitare log persistenti e clipboard/export espliciti.

Dipendenze F11+F16. Verificare source desktop Hermes terminal adapters e endpoint reali prima di progettare interface. Primo incremento output confermato dei tool e cronologia; PTY interattiva è slice separata scelta nella chat, con dichiarazione host locale/remoto.

Gate: stdout/stderr ordering, output voluminoso/backpressure, codice di uscita, disconnect senza terminazione automatica, resize, interruzione esplicita e restart. Test processi sintetici isolati, nessun comando personale/distruttivo. Tastiera/focus e accessibilità del pannello; distinguere CtrlC terminale e cancellazione composer.

## Handoff

> Lavora soltanto F17; scegli output tool oppure PTY e verifica il contratto Hermes ufficiale. Usa processi test isolati, ownership esplicita e permessi F16. Non aggiungere una shell generica Electron e non sviluppare Files/browser. Documenta esito e limiti.
