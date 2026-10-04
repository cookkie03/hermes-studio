# Codex come capacità per gli agenti specialisti Hermes

Stato: direzione futura; proposta iniziale, non decisione tecnica né impegno di implementazione.
Aggiornato: 2026-10-04.

## Intento confermato

Hermes mantiene il proprio modello di team e agenti specialisti. In futuro, uno specialista Hermes dovrebbe poter richiamare Codex, consultare il lavoro svolto da Codex e usarlo per proseguire l'incarico dell'utente. L'esperienza desiderata è simile a quella di usare Codex Desktop: poter avviare o riprendere un lavoro Codex e seguirne gli aggiornamenti dal flusso operativo di Hermes.

Questa direzione non cambia l'architettura corrente di Hermes e non introduce una navigazione basata principalmente su cartelle di chat e progetti.

## Ipotesi di lavoro

- Hermes resta il luogo in cui l'utente assegna e segue l'incarico agli agenti specialisti.
- Codex viene invocato da uno specialista Hermes come capacità esterna, mantenendo riconoscibili la provenienza e lo stato del lavoro Codex.
- Lo specialista deve poter consultare aggiornamenti e risultati Codex e integrarli nell'incarico Hermes.
- L'integrazione potrebbe richiedere lettura e avvio/ripresa di thread Codex. Non è ancora deciso se ciò avvenga tramite Codex Desktop, un'interfaccia supportata di Codex o un altro meccanismo.

## Da verificare prima di progettare l'integrazione

1. Quali interfacce supportate consentono a Hermes di avviare Codex e seguire un'esecuzione?
2. Quali dati dei thread Codex sono leggibili e con quali autorizzazioni?
3. È possibile riprendere lo stesso thread Codex o soltanto avviare una nuova attività con il contesto recuperato?
4. Come si rappresentano in Hermes aggiornamenti, richieste di intervento, errori, risultati e interruzioni confermati da Codex?
5. Quale profilo isolato e quali dati sintetici permettono di provare l'integrazione senza esporre conversazioni personali?

## Fuori ambito in questa fase

- Implementare un plugin o un adattatore Codex.
- Sincronizzare tutti i progetti o tutte le conversazioni in entrambe le applicazioni.
- Sostituire il modello attuale di team e agenti specialisti Hermes.
- Dichiarare che l'accesso ai thread Codex o la ripresa dello stesso thread siano già supportati.

## Prossimo passo futuro

Quando questa integrazione entrerà nel lavoro attivo, verificare prima le interfacce e i permessi disponibili. Poi definire il comportamento atteso di uno specialista Hermes che delega a Codex, segue il lavoro e ne riporta il risultato con provenienza verificabile.
