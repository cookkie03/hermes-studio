# F15 — Memoria Hermes, identità e memoria Markdown degli Spaces

Stato: specifica D28, 2026-10-04. Baseline preferenze Studio parziale, integrazione Hermes e Markdown per Space non implementate. La richiesta corrente è documentare, non attivare apprendimento o importare memorie personali.

## Documentazione ufficiale da leggere

Fonte principale: **[Persistent Memory — Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory/)**. Leggere anche [Curator](https://hermes-agent.nousresearch.com/docs/user-guide/features/curator/), [Memory Providers](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory-providers/), [Skills System](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills/), [Personality & SOUL.md](https://hermes-agent.nousresearch.com/docs/user-guide/features/personality/) e [Context Files](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files/).

Il [prospetto completo e confronto col sorgente](../research/hermes-memory-system.md) copre tutta la sezione ufficiale: limiti, snapshot, sessioni, pending, background review, costi/modelli, curator, Journey, provider, richiamo e compaction. Codice fissato alla SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`; verificare versione e contratti prima del codice. Non è collaudo del runtime collegato.

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

## Livelli da mantenere distinti

| Livello | Autorità e funzione | Aggiornamento |
|---|---|---|
| Identità Dot/profilo | `<HERMES_HOME>/SOUL.md`: carattere e comportamento; F04 possiede il binding Dot→profilo | Modifica esplicita; non diario generato automaticamente |
| Memoria Hermes | `memories/USER.md` e `MEMORY.md`: preferenze utente e fatti durevoli; default 1.375/2.200 caratteri | Tool `memory` e review autorizzata; pending distinto da applied |
| Memoria Space | File Markdown scelto nelle cartelle collegate; decisioni e stato del progetto | Contratto Studio proposto sotto, attraverso F03/F10 |
| Contesto progetto | `AGENTS.md`, `.hermes.md`/`HERMES.md` e discovery compatibile col working directory | File del progetto, non duplicazione dei built-in |
| Cronologia/recall | Sessioni runtime persistite e `session_search` | Runtime conserva; richiamo su richiesta e filtrato |
| Procedure | Skill, `/learn`, `/refine`, curator | Sistema Hermes; integrazione manutenzione con F07 |
| Preferenze Studio legacy | Archivio locale già presente nel MVP | Conservato e identificato; nessuna migrazione o inclusione doppia automatica |

Un Dot non riceve una memoria separata solo perché ha un avatar: l'ambito dipende dal profilo Hermes associato. Uno Space non è un profilo, e un `SOUL.md` nel folder non diventa automaticamente identità del runtime. Memoria condivisa fra bot richiede mapping esplicito; non puntare più writer allo stesso home.

## Incrementi selezionabili, uno alla volta

**F15-A — Visibilità e scope:** mostrare origine, profilo, archivio locale legacy e destinazioni; read-only dove non c'è contratto supportato. Nessuna importazione automatica. F01/F04/F11 solo per la parte collegata al runtime.

**F15-B — Memoria Markdown Space:** scegliere/creare un file nel folder autorizzato, con percorso e revisione visibili. F03/F10 prerequisiti; contenuto filesystem autoritativo. `MEMORY.md` è un possibile nome, non un file scoperto magicamente da Hermes. Nome/percorso definitivo scelto nella chat feature per evitare collisioni.

**F15-C — Gestione memoria Hermes:** adattare tool/API supportati al profilo autenticato; add/replace/remove e pending/approve/reject, limiti e nuova sessione. Non scrivere direttamente il file ignorando separatore, lock, sicurezza e approvazioni del backend. `/api/memory` status non prova un CRUD completo o slash command disponibile via RPC.

**F15-D — Apprendimento e manutenzione:** visibilità review, `/refine`, `/learn`, Journey, curator e provider opzionali con F07/F11/F16. Selezionare singoli incrementi; apertura Memory non avvia curator, consolidamento LLM, installazioni o purge.

## Contratto proposto per il file Space sempre aggiornato

Aggiornato dopo **eventi significativi**, non dopo ogni token: decisione confermata, risultato salvato, milestone verificata e chiusura incarico. Modalità da definire per Space nella chat feature: manuale con diff e Save, oppure aggiornamento automatico al verificarsi degli eventi, entro il file e ambito scelti. L’agente prepara il diff con fonte/chat/esecuzione, decisioni, stato/prossimo passo e riferimenti; policy e risultato sono visibili. L’aggiornamento automatico richiesto fa parte della specifica, non viene attivato in questa fase documentale. Un salvataggio deve confermare revisione e timestamp, non basta testo «ricordato».

Riutilizzare writer/revision/conflict F10: rileggere versione, preservare sezioni manuali e bozza, segnalare modifica esterna, nessun overwrite cieco o append concorrente. Niente diario infinito: stato corrente sintetico con link a risultati/storia. Nessuna scrittura automatica in Obsidian, `.git`, `AGENTS.md` o file esistenti a nome uguale.

La lettura per incarico deve essere esplicita e versionata nel contesto/attachment del working directory dello Space. Non iniettare tutti i vault o duplicare gli stessi fatti in legacy Store e memoria Hermes. Mostrare quando il file è stato letto e da quale incarico; stato su disco e contesto già in uso sono distinti. Host remoto richiede root raggiungibile e grant F16.

## Semantica Hermes da preservare

Snapshot built-in congelato all'avvio sessione: scritture persistono subito, il blocco iniziale cambia alla sessione successiva. Restart/resume può continuare la stessa sessione; `/new` è confine distinto. Tool results mostrano stato live. Budget in caratteri: overflow è errore e non elimina automaticamente ricordi.

Scrittura proposta, applicata, rifiutata, conflitto ed errore sono stati distinti. Gate memoria e gate skill separati. Review automatica replace/remove va in pending anche senza gate generale. Mostrare notifiche off non spegne review/scritture. Nessun switch Studio che cambia config personale senza ambito esplicito.

Background review memoria default ogni 10 turni utente; skill dopo 10 iterazioni, con condizioni e tool disponibili. Non aggiornamento garantito di ogni fatto; coda deferred locale può perdere lavoro all'uscita. Curator mantiene procedure, non MEMORY: deterministico stale/archive, consolidamento LLM off per default. Comandi veri `/learn` e `/refine`; non inventare `skilldistill` come API.

Recall storico e compaction separati. Il sorgente limita contenuti/finestre di `session_search` nonostante «no truncation» nel documento; provider esterni possono essere attivi con built-in disabilitati nonostante formulazione generica «always active». Il report documenta queste difformità. Non promettere ricordo totale o durata 24h.

## UI, privacy e ownership

Memory nella sidebar OpenDots, con tab/filtri per Profilo, Space, Preferenze Studio e Apprendimento secondo capability. Mostrare percorso, origine, uso/budget, pending e ultima applicazione; identità si modifica da Dot F04. Empty/offline/unavailable diversi. Focus, Save/Cancel, errori con bozza preservata, Reduced Motion seguono [component-system](../design/component-system.md).

Non leggere home/profili personali come seed. Contesto inviato può arrivare al provider runtime; provider esterni hanno retention e costi propri. Non loggare testo ricordi/prompt/audio, non versionare file runtime. Nessuna attivazione automatica plugin/provider o purge. Ownership: F15 vista e orchestrazione memoria; F10 writer; F03 file/editor; F04 identità/binding; F07 skill; F11 trasporto; F16 grants.

## Definition of done per incremento

A: origini/scope/legacy visibili, nessun accesso implicito. B: folder sintetico, creazione/aggiornamento/restart, conflitto esterno, evento significativo e lettura per incarico provati; file manuale preservato. C: tool write realmente applicato o pending, approvazione/rifiuto/stale target, overflow, nuova sessione contro resume, isolamento due profili e archivio illeggibile senza reset. D: status/run/completion separati, archive/restore reversibili, gate LLM/skill rispettati e nessuna installazione automatica. Ogni incremento: UI packaged, tastiera/focus/900px, privacy e nessun file personale mutato. Fixture, sorgente e live distinti nelle evidenze.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e File e skill F15. Leggi Persistent Memory ufficiale e docs/research/hermes-memory-system.md; verifica SHA e capability del backend. Implementa soltanto l'incremento F15 selezionato, preservando memoria Hermes, identità, cronologia, Space Markdown e legacy Studio come ambiti distinti. Usa file/revision F10 per Space e contratti runtime per built-in, senza import personali o scritture dirette che bypassano gates. Prova esito persistito, pending, conflitto e nuova sessione con dati sintetici. Non attivare curator/provider o sviluppare altre feature incidentalmente. Aggiorna documentazione ed evidenze prima del commit.
