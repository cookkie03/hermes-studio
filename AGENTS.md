# Hermes Desktop

Assistente personale e progetti macOS. Prodotto Electron/React con runtime Hermes; baseline SwiftUI storica preservata. F00 completata; feature successive selezionate una per chat.

## Inizio del lavoro

Leggi `docs/project/MEMORY.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, il catalogo `docs/features/README.md` e la sola scheda selezionata. Per la sequenza usa `docs/agents/feature-workflow.md`; per decisioni/ownership consulta `docs/project/decisions.md`, gli ADR pertinenti e `docs/architecture/feature-boundaries.md`. D20/ADR0006: incrementi solo su selezione utente. `docs/README.md` è l'indice delle fonti, non un'altra spec.

Per UI leggi `docs/design/opendots-target.md` e `docs/design/component-system.md`: screenshot utente autorevole. Piani notturni, atelier/design SwiftUI e vecchie spec sono storia. D30/F18: preservare capacità/memoria Hermes e proiettarne eventi nella UI; file memoria Space F15 distinti. Distingui osservazioni live, sorgente upstream e proposte.

Aggiorna `docs/project/MEMORY.md`, `docs/project/STATUS.md`, `docs/project/WORKLOG.md` e i documenti interessati dopo ogni blocco significativo di ricerca, decisione, implementazione o verifica. Questa persistenza continua è una richiesta esplicita dell'utente.

## Agent skills

### Issue tracker

Tracker Markdown locale in `.scratch/hermes-desktop/`, senza servizi esterni. Leggi `docs/agents/issue-tracker.md` prima di creare o lavorare un ticket.

### Domain docs

Un solo contesto: `GLOSSARY.md` e `docs/adr/`. Leggi `docs/agents/domain.md` quando cambi termini o decisioni.

### Percorso di lavoro

Per ogni feature leggi `docs/agents/feature-workflow.md` e la sezione File e skill della scheda selezionata. Per skill ulteriori consulta `docs/agents/skills-catalog.md` (progetto/globali/cache/runtime distinti) e leggi il SKILL.md pertinente prima di applicarlo. Per scegliere una skill leggi `.agents/skills/ask-matt/SKILL.md`; per il setup e il percorso completo leggi `docs/agents/skills-workflow.md`. Le skill installate sono disponibili come file in questa chat: leggi il rispettivo `SKILL.md` prima di applicarle.

Per estrarre pattern usa `.agents/skills/ux-extract/SKILL.md` e cita le evidenze nella libreria. Per decisioni visive Apple usa `.agents/skills/axiom-design/SKILL.md`; per una futura implementazione nativa e la sua verifica usa le suite `axiom-swiftui` e `axiom-accessibility`.

## Confine delle prove

Usa un profilo Hermes isolato e dati sintetici per le prove di integrazione. Preserva runtime, credenziali e conversazioni personali esistenti. Mostra una capability solo se il backend collegato la supporta; conferma gli stati dopo l'esito del runtime. La chiusura del client e la disconnessione sono diverse dalla cancellazione del lavoro.
