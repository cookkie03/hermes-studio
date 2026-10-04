# 04: Gestire richieste e approvazioni concrete

Status: draft
Type: task
Owner: Codex
Blocked by: 03
Spec: ../spec.md

## What to build

L'utente vede una richiesta di Hermes, ne comprende ambito e conseguenze e può rispondere o rifiutare. Richieste scadute o risolte altrove vengono ritirate.

## Acceptance criteria

- [ ] Richiesta legata ad azione/esecuzione e identità stabile, con destinazione e dati comprensibili.
- [ ] Approva/rifiuta restituiscono un esito verificato; duplicati non autorizzano due azioni.
- [ ] Scadenza, interruzione e risposta da altra superficie eliminano la richiesta pendente.
- [ ] Ricollegamento ricostruisce solo richieste ancora aperte.
- [ ] Domande e segreti sono trattati secondo il loro tipo; nessun segreto in transcript/log.
- [ ] Percorso accessibile da tastiera e richiesta annunciata una volta.

## Evidence

In attesa: sequenze con richieste sintetiche/isolated runtime, senza permessi personali aggiuntivi.

## Comments

Una revisione di un risultato non concede autorizzazione a inviarlo.
