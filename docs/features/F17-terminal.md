# F17 — Terminale integrato

Stato: documentata; output di tool in UI non è una sessione PTY interattiva.


<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Contratto PTY distinto da tool shell |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Sessione, backpressure e processo posseduto |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se output/lifecycle falliscono |

### Punti di ingresso da leggere

- [docs/features/F16-permissions-and-approvals.md](<../../docs/features/F16-permissions-and-approvals.md>): Autorizzazioni.
- [desktop/upstream/src/client/ComputerToolCard.tsx](<../../desktop/upstream/src/client/ComputerToolCard.tsx>): Output tool attuale.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Destinazione Terminal.
- [desktop/electron/preload.cjs](<../../desktop/electron/preload.cjs>): Privilegi.
- [Hermes: tools/terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/terminal_tool.py>): Tool terminale; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/read_terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/read_terminal_tool.py>): Output e continuità; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/close_terminal_tool.py](</Users/luca/.hermes/hermes-agent/tools/close_terminal_tool.py>): Chiusura distinta da display; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Scopo

Mostrare comandi e output Hermes associati a un'esecuzione; opzionale PTY interattiva solo dopo verifica del contratto desktop ufficiale. Separare risultato tool-shell e terminal session; non inventare una console che invia testo al modello come fosse una shell.

Host/session/cwd/stato/permessi sempre chiari. Console vuota, apertura, collegata, comando avviato, output, codice di uscita, interrotta, offline. Uscita0 non equivale a obiettivo completato; cancellare display non cancella processo. Input per nuovo comando disabilitato senza capability/authorization.

Module Terminal owns PTY/identità tool, transport/backpressure, resize, detach/attach e ownership del processo. Renderer mostra stream; preload non offre exec generico. Sessioni personali esistenti non importate per default. Output può contenere segreti: limitare log persistenti e clipboard/export espliciti.

Dipendenze F11+F16. Verificare source desktop Hermes terminal adapters e endpoint reali prima di progettare interface. Primo incremento output confermato dei tool e cronologia; PTY interattiva è slice separata scelta nella chat, con dichiarazione host locale/remoto.

Gate: stdout/stderr ordering, output voluminoso/backpressure, codice di uscita, disconnect senza terminazione automatica, resize, interruzione esplicita e restart. Test processi sintetici isolati, nessun comando personale/distruttivo. Tastiera/focus e accessibilità del pannello; distinguere CtrlC terminale e cancellazione composer.

## Handoff

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Lavora soltanto F17; scegli output tool oppure PTY e verifica il contratto Hermes ufficiale. Usa processi test isolati, ownership esplicita e permessi F16. Non aggiungere una shell generica Electron e non sviluppare Files/browser. Documenta esito e limiti.
