# Catalogo delle skill del progetto e globali

Inventario locale del 2026-10-04, richiesto da Luca. Conserva tutti i percorsi trovati, incluse copie/symlink e cache versionate; non equivale a dichiarare tutte le skill disponibili o applicate. Le raccolte sono consultabili su domanda: la chat feature carica soltanto i SKILL.md pertinenti.

| Raccolta | Percorsi leggibili | Inventario |
|---|---|---|
| Progetto | 39 | [Apri elenco](skills-catalog/project.md) |
| Globali Agents | 43 | [Apri elenco](skills-catalog/agents-global.md) |
| Globali Codex | 32 | [Apri elenco](skills-catalog/codex-global.md) |
| Cache plugin Codex | 198 | [Apri elenco](skills-catalog/plugin-cache.md) |
| Runtime Hermes | 255 | [Apri elenco](skills-catalog/hermes-runtime.md) |

Totale: 567 percorsi; 469 file risolti distinti. [Inventario strutturato](skills-catalog/inventory.json). Questi numeri descrivono il filesystem, non tool connessi né workflow eseguiti.

## Selezione e portabilità

La mappa delle skill pertinenti è dentro ciascuna scheda F00–F17. Il percorso comune è [feature-workflow](feature-workflow.md), guidato da ask-matt. Prima usare la copia di progetto quando presente; per una globale scegliere il percorso indicato, controllare che esista e leggere SKILL.md e riferimenti richiesti. Quando manca una skill verificare il catalogo attuale della chat e gli altri percorsi: evitare copie/versioni arbitrarie. Installazione solo se necessaria all’ambito autorizzato.

I percorsi globali assoluti descrivono questo Mac; su altro computer risolverli nelle corrispondenti radici utente/plugin. Un file leggibile non concede tool, credenziali, deleghe, pubblicazioni o accesso ai dati. Le skill runtime Hermes sono una raccolta separata dalle skill con cui Codex sviluppa Studio. Quelle per Spotify, vault, calendario o altri progetti restano catalogate senza entrare nei test o nello scope delle feature Hermes.

## Regola di lettura

Non leggere tutto il catalogo in ogni chat. Leggere indice e riga della feature; caricare il corpo della skill quando scatta la condizione indicata. Segnalare skill letta/applicata e risultato nel WORKLOG; non dichiarare esaurito un workflow solo perché è elencato. Aggiornare inventario quando si installano/rimuovono skill o cambiano versioni.

Rigenerazione dal repository: `python3 scripts/update-skill-catalog.py`. Richiede Python e rg; legge solo metadata dei SKILL.md. Rivedere diff, percorsi e privacy prima di commit. Le associazioni per feature sono curate nelle schede e non vengono sovrascritte dal generatore.
