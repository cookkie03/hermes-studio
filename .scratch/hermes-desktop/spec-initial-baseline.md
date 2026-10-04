# Hermes Desktop — proposta v0.1

> Aggiornamento: la composizione iniziale è superata dalle decisioni team/espressività/ricerca e scrittura in `docs/project/MEMORY.md`. Q6 è ancora pendente; conservare questa baseline come storico.
Status: draft
Data: 2026-10-04
Priorità confermata: assistente personale e progetti.
Responsabile prodotto: Luca. Coordinamento e preparazione tecnica: Codex in questo workspace.

## Problem Statement

L'utente vuole affidare lavoro personale e progetti ad agenti Hermes che collaborano e continuano tra conversazioni. Deve poter capire cosa stanno facendo, cambiare direzione, ritrovare i risultati e intervenire senza leggere log o gestire processi. Una chat che sembra attiva ma perde il lavoro alla chiusura non soddisfa l'obiettivo.

## Solution

Un'app desktop macOS centrata sulla conversazione. L'utente lavora in progetti e affida incarichi a un agente responsabile, che può delegare parti del lavoro. Un indicatore sintetico mostra stato e attività; un pannello laterale rivela piano, deleghe, risultati e richieste di approvazione. Il runtime è indipendente dal client e dovrà poter funzionare su un host sempre acceso.

Ispirazioni: shell e composer osservati in Unsloth; responsabilità persistente, feedback e controllo descritti dalla [pagina ufficiale Dots](https://chatgpt.com/features/dots/). Il progetto adotta questi principi con identità Hermes propria; non promette equivalenza funzionale con Dots.

## Utente e primo scenario

Un solo utente, uso personale. Scenario di riferimento con dati sintetici: “Raccogli le informazioni per un progetto e prepara un riepilogo con le decisioni da prendere”. L'agente può cercare in fonti autorizzate e preparare un risultato; un eventuale invio esterno richiede un'autorizzazione concreta. La prima prova reale usa una richiesta testuale innocua, con un profilo Hermes isolato.

## User Stories

1. Come utente voglio aprire una chat senza configurare un team, per chiedere subito aiuto.
2. Voglio raggruppare conversazioni e incarichi in un progetto, per ritrovare il contesto.
3. Voglio scegliere un agente responsabile, per sapere a chi dare feedback.
4. Voglio vedere il mio messaggio appena invio, per capire che l'app ha ricevuto l'azione.
5. Voglio distinguere invio locale e accettazione del runtime, per evitare false conferme.
6. Voglio leggere una risposta mentre arriva, per seguire il lavoro.
7. Voglio vedere l'attività corrente con testo comprensibile, per capire una pausa nella risposta.
8. Voglio aprire i dettagli solo quando mi servono, per concentrarmi sulla conversazione.
9. Voglio affidare un incarico con obiettivo e limiti, per lasciarlo avanzare nel tempo.
10. Voglio capire quale agente sta eseguendo una parte dell'incarico, per seguire le deleghe.
11. Voglio interrompere un'esecuzione e vedere conferma, per cambiare direzione.
12. Voglio rispondere a una domanda o approvare un'azione concreta, per mantenere controllo.
13. Voglio tornare a una chat dopo aver chiuso il client, per ritrovare lo stato attuale.
14. Voglio distinguere il runtime scollegato da un agente fermo, per scegliere cosa fare.
15. Voglio ritrovare file e risultati con la loro provenienza, per valutarli.
16. Voglio pianificare un incarico ricorrente e capire quando lavorerà di nuovo, per delegare una responsabilità.
17. Voglio usare tastiera e VoiceOver, per completare il percorso senza dipendere dal mouse.
18. Voglio ricevere una notifica quando serve il mio intervento o arriva un risultato utile, per evitare aggiornamenti continui.

## Ambito e priorità

### Prima integrazione, milestone M1

Una conversazione con un agente Hermes: invio, streaming, interruzione, cronologia e riapertura. Stato di connessione separato da quello dell'esecuzione. Percorso tastiera completo. Una richiesta di approvazione sintetica o isolata per provare il protocollo. È il primo risultato verificabile, non ancora il prodotto 24/7.

### MVP, milestone M2–M4

Progetti, incarichi persistenti, risultati, approvazioni, delega minima osservabile e una pianificazione ricorrente. Un coordinatore e al massimo due delegati nella prima prova; nessuna stanza di gruppo illimitata. La prova 24/7 arriva su un host sempre acceso dopo aver verificato il recupero dello stato.

### Dopo l'MVP

Voce, integrazioni aggiuntive, memoria modificabile dall'utente, notifiche avanzate, viste condivise o companion mobile. Allegati dopo aver verificato il trasporto, i limiti e la gestione degli errori.

## Implementation Decisions — proposte

- Confine client/runtime stabile con un adattatore che normalizza capacità e eventi.
- Confrontare desktop upstream, SwiftUI e shell multipiattaforma prima di fissare lo stack. Raccomandazione preliminare: SwiftUI se il riuso upstream non raggiunge l'esperienza desiderata.
- Confrontare TUI JSON-RPC e API HTTP/SSE di Hermes su una versione fissata; ACP resta un'alternativa. L'API “compatibile OpenAI” da sola non prova delegazione o continuità.
- Una conversazione contiene messaggi. Un progetto contiene conversazioni e incarichi. Ogni incarico contiene esecuzioni e risultati; una esecuzione può avere deleghe e richieste di approvazione.
- Stato dell'esecuzione e stato della connessione sono separati. La perdita del collegamento non conclude né interrompe automaticamente il lavoro.
- Il runtime è proprietario dello stato effettivo del lavoro. Il client conserva preferenze, bozze e una cache ricostruibile. Lo stato degli incarichi va aggiunto in un servizio separato solo se la verifica conferma che non esiste una superficie upstream adeguata.
- La riconnessione ricostruisce cronologia, turno in corso e richieste aperte. Ripetere un invio di esito incerto richiede riconciliazione/idempotenza prima del retry.
- Approvazioni legate a esecuzione e azione, con scadenza e rifiuto esplicito. Una richiesta risolta su un altro client scompare anche qui.
- Nessuna riscrittura diretta del database personale Hermes. Profilo isolato per sviluppo e prove; segreti gestiti dal runtime, credenziali client tramite meccanismi sicuri della piattaforma.
- La UI usa solo capacità disponibili: un vero comando “Pausa” appare solo se esiste una pausa con semantica verificata. Altrimenti mostra “Interrompi”.

## Testing Decisions

Non esiste codice locale né test precedente. La prima seam è il contratto client–runtime: fixture deterministiche per gli eventi più una prova con un runtime Hermes isolato. I test devono verificare comportamento esterno, non dettagli delle view.

Prove obbligatorie per M1: messaggio accettato una sola volta; ordine e completamento streaming; stop confermato; errore visibile senza perdere la bozza; riapertura della cronologia; riconnessione durante un turno; richiesta approvata/rifiutata/scaduta; nessuna richiesta segreta mostrata nel transcript.

Per il lavoro persistente: chiudere il client durante una richiesta e riaprire; riavviare il runtime durante un'operazione autorizzata di test; determinare se il tentativo è recuperabile o deve essere dichiarato interrotto. Non rieseguire effetti esterni automaticamente. La prova 24 ore riguarda host reale, pianificazione e disponibilità, non un'animazione di attività.

Accessibilità: VoiceOver, Full Keyboard Access, zoom/testo grande, light/dark, contrasto e impostazioni di motion/trasparenza. Le misure temporali sono obiettivi da verificare nel client, non dati ricavati da Unsloth.

## Out of Scope

Training/fine-tuning, model hub, generazione immagini/video, cloud computer gestito, marketplace di skill, organizzazione aziendale, fatturazione, multiutente e distribuzione iOS. Non fanno parte della prima versione richiesta.

## Criteri di successo

- Un incarico è affidabile quando stato e risultato coincidono con il runtime, anche dopo una riconnessione.
- L'utente trova l'attività corrente, il responsabile e l'azione richiesta senza aprire i log.
- In una prova con compiti definiti in anticipo, l'utente sa inviare, interrompere, approvare e ritrovare un risultato senza istruzioni aggiuntive.
- Il requisito 24/7 è dimostrato solo dopo la prova su un host disponibile quando il Mac/client è chiuso.

## Further Notes

Le scelte di stack, host e trasporto sono ancora proposte. Il backlog è una bozza di suddivisione per la revisione; non è un piano di implementazione approvato. Le evidenze della ricerca si trovano nel registro delle fonti e nella libreria Unsloth.

## Incremento ricerca/scrittura confermato

D04–D09 in memoria: workspace ordinato, team principale e chat secondaria, avatar illustrati. Browser manuale, file e editor Markdown affiancati; capacità browser/computer use previste per agenti, da verificare. Prima tranche locale non promette vera delega. Ripristino documento e bozze necessario.
