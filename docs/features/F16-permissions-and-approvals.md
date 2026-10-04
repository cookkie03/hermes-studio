# F16 — Permessi, capability e approvazioni

Stato: documentata; server-request/lease e fixture parziali esistenti.

## Scopo

Un'azione privilegiata di Hermes richiede una decisione comprensibile e circoscritta. Le preferenze Studio non sono ACL del runtime. Plugin/browser/computer/routine/Dot non possono elevare permessi attraverso una semplice casella UI.

Leggere il contratto reale approval/client.capabilities/request.cancel in runtime-integration-findings e sorgente Hermes della versione scelta. Rappresentare choices effettivamente fornite e richiesta RPC e ID, non inventare enum o approvazioni universali. Registrare server_requests solo quando handler/UI è montato e può rispondere, con lease/cleanup su chiusura.

## UI e lifecycle

Mostrare agente, host, comando/operazione, motivo, ambito, durata e conseguenza. Pending → decisione in invio → accettata/rifiutata/conferma fallita/annullata/scaduta. Disabilitare doppio invio; una richiesta cancellata non resta cliccabile. L'azione non è completata perché l'utente ha approvato: attendere runtime.

Richiesta in altra conversazione: indicatore navigabile con identità, niente contenuto personale non posseduto o routing ambiguo. Chiudere un popup non equivale a rispondere `deny`. `Always` va mostrato solo se runtime lo offre e l'ambito è esplicito. Nessuna approvazione automatica per comodità.

## Modulo e dati

Decision module condiviso possiede identità richiesta, session ownership, cancellation, idempotency e lifecycle; UI non possiede socket/token. Seam runtime e adapter fixture reali; registro minimo senza segreti nei comandi/log. F11 connessione; F02 rendering/routing; altre feature chiedono autorizzazione attraverso questo percorso.

## Gate

Pending/cancel/stale/disconnect/reconnect/thread in background, doppio clic e risposte fuori enum. Una decisione singola raggiunge RPC corretto; sessioni sconosciute escluse. Capability false a finestra assente, true solo con handler pronto; cleanup non disabilita altre view attive. Test isolati di percorso autorizzato e diniego, verifica focus/tastiera/Reduced Motion. Non cambiare configurazione privata o policy per far passare test.

## Handoff

> Sviluppa esclusivamente F16. Verifica il contratto Hermes della versione corrente, parti dalle fixture esistenti e definisci gli invarianti del decision module. Non aggiungere auto-approve né plugin/browser/computer nuovi. Prova richieste annullate e routing tra conversazioni possedute; aggiorna docs e limiti.
