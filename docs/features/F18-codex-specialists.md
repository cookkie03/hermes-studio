# F18 — Specialisti Codex tramite integrazione Hermes — futura

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F18**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** idea futura di integrazione esterna, subordinata a contratto Hermes disponibile. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Mantenere l’idea futura di specialisti Codex e, solo su selezione esplicita, verificare un percorso Hermes nativo supportato.

**Backend e confine:** Backend Hermes rimane responsabile dell’incarico; integrazione esterna e autorizzazione account/comunicazioni devono già avere contratto verificato. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Task/result/Space/host/provenienza distinti dal bot e dalla chat umana Codex; nessuna finta collaborazione da thread creato senza esito. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** F14/F3 e docs/future; se manca integrazione Hermes supportata consegnare gap e non creare nuovo servizio/backend per implementare l’idea. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Repository sintetica, ownership cambiamenti, timeout/uncertain, risultati/diff verificati, no fuga credenziali e scope dei messaggi rispettato. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: futura/documentata. Leggere ../future/codex-specialists.md. Non creare task/thread o usare credenziali per questa feature ora.

Obiettivo: un Dot può affidare un incarico delimitato a uno specialista Codex tramite contratto esplicito e riportare risultato/provenienza, non confondere agenti interni Hermes e chat umane Codex. F14 delegazione/routing + F3 autorizzazioni sono prerequisiti.

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
- [docs/features/F14-delegation-and-dot-collaboration.md](<../../docs/features/F14-delegation-and-dot-collaboration.md>): Delega vs bot durevole.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Autorizzazione.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Binding e provenance del runtime corrente.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Scope file aggiornato — D25

Space collega cartelle reali F6/F5; specialisti ricevono solo root/file autorizzati e host raggiungibili. Nessuna copia/import del Second Brain o permesso implicito dall'associazione a un team. Revisione/salvataggio e conflitti condivisi con F5; update memoria Space F9 dopo risultati verificati, non diario duplicato nello store.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Lavora soltanto F18 dopo verifica prerequisiti e codice fonte dell'integrazione scelta. Usa una repository test/worktree isolata e autorizzazione esplicita per comunicare con chat Codex. Consegna risultati verificati e limiti; non implementare Bots/routine/voice in questa chat. Segui anche Incarico per la chat implementatrice di F18: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
