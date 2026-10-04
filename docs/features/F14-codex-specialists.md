# F14 — Specialisti Codex come capacità esterna

Stato: futura/documentata. Leggere ../future/codex-specialists.md. Non creare task/thread o usare credenziali per questa feature ora.

Obiettivo: un Dot può affidare un incarico delimitato a uno specialista Codex tramite contratto esplicito e riportare risultato/provenienza, non confondere agenti interni Hermes e chat umane Codex. F05 delegazione/routing + F16 autorizzazioni sono prerequisiti.

Definire perimetrorepository/worktree, proprietà delle modifiche, quota/modello/config, eventi e artifact receipts, cleanup e cancellazione. La ricezione di un messaggio da un agente non autorizza messaggi verso altre chat/app. Non introdurre integrazione account o CLI generica privilegiata nel renderer.

Gate: tasksyntheticisolato, ownershipmerge/conflicts, timeout/uncertain/resultverified, nessun push/pubblicazione non autorizzata e credenziali fuori log. Avvio/running/success devono venire dalla capacità reale; approvazione non è completamento.


<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Verificare contratti dei delegati esterni |
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | Identità e responsabilità tra runtime |
| [cdx](</Users/luca/.codex/skills/personal/cdx/SKILL.md>) — condizionale | Se si autorizza delega al CLI Codex |
| [hermes](</Users/luca/.codex/skills/personal/hermes/SKILL.md>) — condizionale | Se si autorizza delega a Hermes CLI |
| [agy](</Users/luca/.codex/skills/personal/agy/SKILL.md>) — condizionale | Soltanto se si seleziona esplicitamente Antigravity |

### Punti di ingresso da leggere

- [docs/future/codex-specialists.md](<../../docs/future/codex-specialists.md>): Idea futura e limiti.
- [docs/features/F05-delegation-and-dot-collaboration.md](<../../docs/features/F05-delegation-and-dot-collaboration.md>): Delega vs bot durevole.
- [docs/features/F16-permissions-and-approvals.md](<../../docs/features/F16-permissions-and-approvals.md>): Autorizzazione.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Binding e provenance del runtime corrente.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Lavora soltanto F14 dopo verifica prerequisiti e codice fonte dell'integrazione scelta. Usa una repository test/worktree isolata e autorizzazione esplicita per comunicare con chat Codex. Consegna risultati verificati e limiti; non implementare Bots/routine/voice in questa chat.
