# 07: Incarico ricorrente con client chiuso

Status: draft
Type: task
Owner: Codex; host scelto da Luca
Blocked by: 05
Spec: ../spec.md

## What to build

L'utente pianifica un incarico su un host sempre acceso, chiude il client e al ritorno ritrova l'esecuzione e un risultato. È la prova della continuità richiesta.

## Acceptance criteria

- [ ] Host, autenticazione e isolamento scelti esplicitamente; nessuna esposizione pubblica automatica.
- [ ] Pianificazione mostra fuso orario, prossima attivazione e politica in caso di host offline.
- [ ] Ogni attivazione crea una esecuzione distinta; nessun duplicato dopo restart/reconnect.
- [ ] Pausa della pianificazione futura distinta dall'interruzione del turno attuale.
- [ ] Prova documentata di 24 ore con client chiuso, esiti effettivi e un riavvio controllato.
- [ ] Notifiche solo per risultato utile, fallimento o richiesta; stato invariato resta silenzioso.

## Evidence

In attesa: host, intervallo di osservazione, attivazioni previste/effettive e risultati redatti.

## Comments

Non dipende dal ticket 06: una attività ricorrente può essere verificata con un solo agente. Prevedere l'ora legale e una semantica di mancata attivazione prima della prova.
