# Progetti Hermes e Space Studio su più host

2026-10-04. Ricerca per intervista F1 e handoff F6. Sola lettura del sorgente pubblico nel checkout `/Users/luca/.hermes/hermes-agent`, SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`; nessuna connessione, test, configurazione, credenziale o DB personale letto. Skill grilling richiede ricerca delegata dei fatti; domain-modeling e documentation-and-adrs applicate per il confine.

## Fatti dal sorgente fissato

- `hermes_cli/projects_db.py:23-49,149-179`: DB projects per HERMES_HOME, Project con più folder; ProjectFolder contiene path/label/is_primary/added_at, nessun host.
- `tui_gateway/methods_projects.py:27-43,70-132`: API profile-scoped projects.list/get/create/update/archive/delete/set_active/for_cwd/add_folder/remove_folder/set_primary. `apps/desktop/src/store/projects.ts:524,665,872,934` usa anche tree/project_sessions/discover_repos/record_repos.
- `hermes_cli/projects_db.py:462-478`: membership tramite path uguale/antenato, prefisso più lungo. `apps/desktop/src/store/projects.ts:67-77`: tree backend autorevole per repo/worktree/sessioni.
- `tui_gateway/methods_session.py:87-91,404-440`: sessioni per profilo e working directory. `:1087-1126` e `apps/desktop/src/store/projects.ts:777-809`: session.workspace.move aggiorna cwd/git e agente vivo, non cambia host né realizza migrazione runtime.
- `apps/desktop/src/store/project-scope.ts:11-12` e `store/projects.ts:350-398,459-464`: ID Project scoped a un singolo backend projects.db; cambiare connessione/profilo richiede uscire dallo scope.

## Deduzione proposta, ancora da scegliere in F6

Space Studio multi-host aggrega riferimenti a cartelle e progetti distinti per connessione/host/profilo. Non coincide con un unico Project Hermes. Identità suggerite: progetto `(connectionId, profile, projectId)` e cartella `(hostId, path)`. Sono proposte, non schema implementato o relazione già approvata.

Decisioni future: cardinalità Space/progetti per host; riuso o creazione esplicita progetti; scelta host/cwd di una nuova conversazione; accesso cross-host; indisponibilità/offline. Un tunnel SSH a un runtime non prova accesso dell'agente ai filesystem di altre macchine. Nessuna mutazione del runtime dalla ricerca.

Owner: [F6](../features/F6-spaces-documents-memory.md), file [F5](../features/F5-files-and-artifacts.md), conversazioni [F2](../features/F2-conversations.md), trasporto [F1](../features/F1-runtime-connection.md).
