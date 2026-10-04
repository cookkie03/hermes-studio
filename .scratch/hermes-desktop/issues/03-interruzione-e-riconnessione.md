# 03: Interrompere e ritrovare il lavoro in corso

Status: draft
Type: task
Owner: Codex
Blocked by: 02
Spec: ../spec.md

## What to build

L'utente può interrompere un'esecuzione e ricollegarsi durante il lavoro senza perdere lo stato o avviare un duplicato. La chiusura del client ha semantica distinta dall'interruzione.

## Acceptance criteria

- [ ] “Interruzione in corso” termina solo dopo conferma runtime; nessuna falsa pausa/ripresa.
- [ ] Disconnessione durante streaming e riapertura ricostruiscono il turno corrente.
- [ ] Eventi duplicati, gap e ordine non producono risultati conclusi falsamente.
- [ ] Invio di esito incerto viene riconciliato prima di un retry.
- [ ] Riavvio runtime distingue cronologia recuperabile da esecuzione riprendibile; effetti esterni non rieseguiti automaticamente.

## Evidence

In attesa: tracce redatte delle sequenze, test con fixture e prova runtime.

## Comments

Testare separatamente chiusura client, perdita del trasporto e arresto runtime.
