# 01: Scegliere client e protocollo Hermes

Status: draft
Type: decision
Owner: Codex; scelta finale di prodotto Luca
Blocked by: None; revisione della proposta prima di qualsiasi probe eseguibile
Spec: ../spec.md

## What to build

Una decisione verificabile su riuso del desktop upstream o nuovo client, e sul protocollo che permette a un utente di inviare un compito, osservare il risultato e controllarne l'esecuzione. Questa decisione precede il codice prodotto.

## Acceptance criteria

- [ ] Confronto tra desktop Hermes esistente e SwiftUI rispetto al design e alle licenze dei componenti riusabili.
- [ ] Versione runtime fissata; elenco capacità con payload, errori ed evidenze, distinguendo documentato e provato.
- [ ] Piano di prova isolato per streaming, interruzione, richieste utente, riconnessione e chiusura client.
- [ ] Semantiche mancanti dichiarate; nessun pulsante pausa promesso senza supporto.
- [ ] ADR e spec aggiornati con scelta e conseguenze, sottoposti alla revisione di Luca.

## Evidence

In attesa. Le fonti documentali sono nel registro di ricerca; non sono ancora prove runtime.

## Comments

Il probe usa un profilo Hermes dedicato e dati sintetici. Non riconfigurare il runtime personale per verificare questo ticket.
