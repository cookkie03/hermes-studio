# F9 — Memoria Markdown degli Spaces e preferenze legacy

Stato: documentata, non completa; aggiornamento D28/D30, 2026-10-04. Contenuti locali MVP preservati. [F8](F8-hermes-native-features-and-observability.md) possiede visualizzazione della memoria Hermes e note native; questa scheda non crea un secondo archivio runtime.

<!-- feature-guidance:start -->

## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | Memoria Studio distinta da memoria Hermes |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) — condizionale | Scope e persistenza locale |
| [research](<../../.agents/skills/research/SKILL.md>) — condizionale | Solo se si seleziona integrazione con memoria runtime |

### Punti di ingresso da leggere

- [desktop/upstream/src/client/WorkspaceDialog.tsx](<../../desktop/upstream/src/client/WorkspaceDialog.tsx>): Superficie memoria.
- [desktop/upstream/src/server/workspace.ts](<../../desktop/upstream/src/server/workspace.ts>): Metadata locali.
- [desktop/upstream/src/server/store.ts](<../../desktop/upstream/src/server/store.ts>): Persistenza.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Inclusione nel contesto.
- [Hermes: tools/memory_tool.py](</Users/luca/.hermes/hermes-agent/tools/memory_tool.py>): Riferimento distinto dal client Studio; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Risultato e incrementi

**F9-A — Ambiti locali/legacy:** mostrare preferenze Studio già presenti con origine chiara e collegamenti alle sezioni Space/runtime. Nessuna importazione/migrazione implicita; archivio illeggibile preservato. Non reiniettare copie della memoria Hermes.

**F9-B — Memoria Markdown Space:** scegliere/creare un file nella cartella autorizzata, con percorso, revisione, ultimo esito e stato leggibili. Prerequisiti F6/F5; filesystem autoritativo. `MEMORY.md` è nome possibile, non capacità di discovery automatica Hermes. Evitare collisioni col file esistente.

**F9-C — Gestione built-in opzionale:** eventuali add/replace/remove/pending/approve/reject sulle memorie del profilo Hermes tramite contratto backend supportato, solo se questo incremento viene selezionato. F8-B rimane viewer read-only. Non usare `/api/memory` status come CRUD né scritture dirette che aggirano gate/lock/formato; prove e permessi F1/F3 richiesti.

La precedente F9-D (learning/curator) è ricondotta a **F11 per gestione skill/manutenzione** e **F8 per visibilità**. Restano future selezioni autonome, non attività implicite di F9.

## File Space aggiornato durante il lavoro

Eventi significativi: decisione confermata, risultato salvato, milestone verificata e chiusura incarico. Modalità da definire nella chat feature: manuale con diff/Save oppure automatica entro file/ambito scelti. L'agente prepara cambiamenti con fonte/chat/esecuzione, decisioni, stato/prossimo passo e link ai risultati. Mostrare policy, revisione ed esito applicato; testo «ricordato» non prova scrittura.

Usare writer/revision/conflict F5; preservare sezioni manuali e bozza, rileggere versione prima di salvare. Cambi esterni non vengono sovrascritti. Nessun diario infinito: sintesi corrente con link alla storia. Un file salvato non prova che un incarico attivo lo abbia letto; inclusione/lettura per incarico esplicita e versionata. Host remoto richiede root raggiungibile/grant, non semplice path Mac nel prompt.

Creazione e aggiornamento di file in un vault personale richiedono destinazione scelta nell'app: niente seed/import/scan personale al lancio, nessuna scrittura automatica su file omonimo esistente o istruzioni AGENTS/SOUL.

## Contratti runtime da consultare per F9-C

[Persistent Memory ufficiale](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/) e [prospetto completo](../research/hermes-memory-system.md) sono il riferimento tecnico per USER/MEMORY, snapshot congelato, budget, pending, tool format, provider, recall e compaction. [Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator/) e [Memory Providers](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory-providers/) sono approfondimenti, non prerequisiti per file Space locale.

Preservare contenuti/profili Hermes senza migrazione: memoria profilo, identità SOUL, cronologia e file progetto distinti. I gates backend decidono staged/applied; una nuova sessione è distinta dal resume. Il viewer è F8; skill/provider management non si implementa per rendere attiva una checkbox Studio.

## UI, ownership e privacy

Memory locale/Space mostra origine e percorso, policy, bozza, errore/conflitto e ultima scrittura confermata. Viewer Profilo e note post-turn sono destinazioni F8, identità del Dot F7. Loading, vuoto, offline/stale e errore diversi. Save/Cancel/focus/tastiera/Reduced Motion seguono [component-system](../design/component-system.md).

F9 possiede workflow memoria Space/legacy ed eventuali mutazioni built-in selezionate; F5 writer, F6 editor, F7 binding, F1 trasporto, F3 grants. [Confini condivisi](../architecture/feature-boundaries.md). Niente testo ricordi/prompt completi nei log/Git; dati inviati al runtime possono arrivare al provider scelto. Nessun reset, purge o provider installato all'apertura.

## Definition of done per incremento

A: origini/scope visibili, legacy preservato al restart e su errori, nessuna inclusione doppia o import. B: folder sintetico, creazione/update/restart, conflitto esterno e evento significativo provati; contenuti manuali preservati; lettura per incarico/versione dimostrata. C: mutazione realmente applicata o pending, approve/reject/stale target/overflow, fresh session contro resume, isolamento profili e file illeggibile senza reset. Ogni incremento: packaged UI, focus/tastiera/900px, privacy e nessun dato personale modificato dalle prove.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e File e skill F9. Implementa solo F9-A/B/C selezionato; viewer e note Hermes sono F8, manutenzione skill F11. Per Space usa root/revision/writer F5 ed editor F6, senza copie dei file in un nuovo store. Per eventuali mutazioni runtime leggi Persistent Memory e docs/research/hermes-memory-system.md, verifica contratto/gates del profilo isolato, non scrivere direttamente i built-in. Prova esito/restart/conflitto e aggiornamenti significativi su dati sintetici. Aggiorna scheda, STATUS, MEMORY/decisioni se cambia direzione e WORKLOG; review prima del commit.
