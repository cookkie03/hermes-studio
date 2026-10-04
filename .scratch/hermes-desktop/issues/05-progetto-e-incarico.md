# 05: Affidare un incarico persistente in un progetto

Status: draft
Type: task
Owner: Codex
Blocked by: 03, 04
Spec: ../spec.md

## What to build

L'utente crea un progetto, affida un incarico con obiettivo e limiti, avvia un'esecuzione e ritrova stato e risultati tornando alla conversazione.

## Acceptance criteria

- [ ] Progetto, conversazione, incarico ed esecuzione sono distinti e collegati.
- [ ] Creazione/modifica conserva obiettivo, responsabile, ambito e criterio di completamento.
- [ ] Inspector mostra attività, risultati e interventi richiesti, mantenendo leggibile la chat.
- [ ] Riapertura recupera incarico e risultato da stato durevole; cache client non diventa fonte dello stato runtime.
- [ ] Cambio di direzione genera un aggiornamento tracciabile; un nuovo tentativo non sovrascrive il precedente.
- [ ] Criterio completato verificato; messaggio finale dell'agente da solo non chiude l'incarico.

## Evidence

In attesa: demo con dati sintetici e riapertura client/runtime secondo contratto.

## Comments

Riusare primitive upstream. Aggiungere stato di progetto soltanto dove il confronto 01 dimostra un gap.
