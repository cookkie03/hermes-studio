# F10 — File e artefatti

Stato: documentata; tree/editor SwiftUI storico e anteprima eventi Electron parziali non equivalgono a file workspace completo.



<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Ownership root/path/revisioni |
| [research](<../../.agents/skills/research/SKILL.md>) | Verificare contratto Files sull’host |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se path o recovery della bozza falliscono |

### Punti di ingresso da leggere

- [docs/project/file-workspace.md](<../../docs/project/file-workspace.md>): Baseline filesystem storica, non contratto remoto.
- [docs/features/F03-spaces-documents-memory.md](<../../docs/features/F03-spaces-documents-memory.md>): Pagina vs file.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Destinazione Files.
- [desktop/electron/preload.cjs](<../../desktop/electron/preload.cjs>): Seam privilegi.
- [Hermes: tools/file_tools.py](</Users/luca/.hermes/hermes-agent/tools/file_tools.py>): Tool file reali; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tools/file_tools_paths.py](</Users/luca/.hermes/hermes-agent/tools/file_tools_paths.py>): Path e root; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Risultato

Pannello Files con albero/ricerca/preview e risultati prodotti da tool Hermes; aprire un Markdown o un documento nello Space senza confondere file del Mac, host Hermes e pagina Studio. Fonte tool registry Hermes: verificare read_file/write_file/search_files e contratti effettivi, nomi esatti da ricercare prima dell'implementation.

File dell’host reale, sandbox root, symlink e ACL sono responsabilità del module File workspace; UI non esegue read/write locali generici. Se il runtime è remoto, mostra host e path remoti. Download/import verso Mac sono azioni esplicite con destinazione chiara. Nessuna scansione personale automatica.

## Comportamento

Root scelto → caricamento → albero vuoto/populato → preview → bozza → salvataggio/conflitto/errore. Evidenziare provenienza agent/run/tool e risultato confermato, non supposizione da testo. Modifica dirty resta recuperabile quando cambi file/pannello. Pagina Studio e file indipendenti: export/import con ricevuta, non sync bidirezionale implicita.

## Scope e seam

F11 runtime, F16 permessi, F03 editor documenti riusabile. Ownership futuro in module File workspace con adapter runtime e filesystem sintetico; non infilare filesystem nel preload o Chat.tsx. F17 terminale separato; F08 browser non necessario. Primo incremento read-only root selezionato+preview, poi scrittura solo in una slice esplicita.

## Gate

Uscita dal root, symlink, huge/binary files, stale revision, permesso negato, offline, cambio host, bozza modificata e restart. Fixture con contenuti sintetici, poi operazione runtime isolata e UI e tastiera. Nessun test su cartelle personali, nessun DELETE automatico. Attività tool persistita non prova un file esista ancora: refresh autorevole.

## Handoff

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Implementa solo F10, partendo da read-only Files sul host runtime autorizzato e root esplicito. Usa tools Hermes reali, non shell/file API generica dal renderer. Definisci module e prove path/symlink/conflitto. Non sviluppare terminale o browser; preserva dati personali.
