# Documentazione Hermes Studio

Punto di ingresso consolidato, 2026-10-04. Le 19 schede F0–F18 descrivono incrementi da scegliere in chat dedicate; F0 è completata, altre feature non diventano implementate perché documentate.

## Cosa leggere e dove aggiornare

| Domanda | Fonte autorevole |
|---|---|
| Qual è la direzione attuale? | [MEMORY](project/MEMORY.md) |
| Cosa è realmente verificato o manca? | [STATUS](project/STATUS.md), con link alle prove |
| Quali decisioni ha preso Luca? | [Decisioni D01–D31](project/decisions.md) |
| Quale feature posso scegliere? | [Catalogo F0–F18](features/README.md), [vecchi/nuovi ID](features/numbering-2026-10-04.md) |
| Come lavora una chat? | [Piano](project/feature-development-plan.md), [workflow/skill](agents/feature-workflow.md) |
| Chi possiede un comportamento condiviso? | [Confini delle feature](architecture/feature-boundaries.md), [principi](architecture/principles.md) |
| Quali termini/scelte tecniche usare? | [GLOSSARY](../GLOSSARY.md), [ADR](adr/README.md) |
| Quale UI seguire? | [OpenDots target](design/opendots-target.md), [componenti](design/component-system.md) |
| Come funziona memoria/capacità Hermes? | [F8](features/F8-hermes-native-features-and-observability.md), [ricerca memoria](research/hermes-memory-system.md) |
| Quali fonti e prove abbiamo? | [Ricerca](research/README.md), [UX](ux-extracts/desktop-components/pattern-library.md), [review F0](architecture/f00-review-2026-10-04.md) |
| Come distribuire .app/DMG? | [F13](features/F13-github-releases-dmg.md); comandi sviluppo in [desktop README](../desktop/README.md) |
| Qual è la cronologia? | [WORKLOG](project/WORKLOG.md), Git e snapshot storici sotto |
| Quali idee conserviamo per dopo? | [Future](future/README.md): telefonate e specialisti |

## Gerarchia e manutenzione

Istruzioni correnti dell'utente determinano lo scope. Decisioni e ADR applicabili fissano direzione/autorità; la scheda selezionata contiene comportamento, gate e file. STATUS riporta esiti, non nuovi requisiti. Ricerca e screenshot sono evidenze con data/versione; un contratto sorgente non è una prova live.

Ogni significato ha una sede: decisioni nel registro, esiti in STATUS, eventi nel WORKLOG, spec nella scheda, fatti upstream nel report. MEMORY contiene solo il riepilogo operativo e riferimenti; evitare di ricopiarvi cronologie/test o spec integrali. Catalogo e roadmap sono navigazione, non ulteriori backlog.

Aggiornare le dipendenze della scheda e la relativa riga del catalogo nello stesso incremento. Un cambiamento fra feature richiede ownership esplicita. Spostare documenti solo se necessario, preservando link e provenienza. Verificare link, conteggio/ID, guide/handoff, diff e dati sensibili prima del commit; nessuna build prodotto per soli testi.

## Storia preservata

[MEMORY prima del consolidamento](project/MEMORY.history-2026-10-04.md) e [STATUS precedente](project/STATUS.history-2026-10-04.md) conservano il corpo integrale con hash; non sono istruzioni attive. Piani in `superpowers/plans/`, design nativo/atelier e ticket iniziali sono storici. Leggerli solo per capire una decisione, conservare codice o riprodurre una prova pertinente.

Architettura prima F0: [review iniziale](architecture/feature-architecture-review.md), con aggiornamento di stato e riferimento alla consegna. Artefatti packaging: [evidenze storiche](releases/development-artifacts.md), non release attuale. I percorsi temporanei nelle prove possono non esistere più: non sono documenti normativi.
