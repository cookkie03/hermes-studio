# F14 — Specialisti Codex come capacità esterna

Stato: futura/documentata. Leggere ../future/codex-specialists.md. Non creare task/thread o usare credenziali per questa feature ora.

Obiettivo: un Dot può affidare un incarico delimitato a uno specialista Codex tramite contratto esplicito e riportare risultato/provenienza, non confondere agenti interni Hermes e chat umane Codex. F05 delegazione/routing + F16 autorizzazioni sono prerequisiti.

Definire perimetrorepository/worktree, proprietà delle modifiche, quota/modello/config, eventi e artifact receipts, cleanup e cancellazione. La ricezione di un messaggio da un agente non autorizza messaggi verso altre chat/app. Non introdurre integrazione account o CLI generica privilegiata nel renderer.

Gate: tasksyntheticisolato, ownershipmerge/conflicts, timeout/uncertain/resultverified, nessun push/pubblicazione non autorizzata e credenziali fuori log. Avvio/running/success devono venire dalla capacità reale; approvazione non è completamento.

> Lavora soltanto F14 dopo verifica prerequisiti e codice fonte dell'integrazione scelta. Usa una repository test/worktree isolata e autorizzazione esplicita per comunicare con chat Codex. Consegna risultati verificati e limiti; non implementare Bots/routine/voice in questa chat.
