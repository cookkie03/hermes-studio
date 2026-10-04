# Hermes Desktop

Prima versione: assistente personale e progetti, confermata dall'utente. Questo workspace contiene le fondazioni del progetto; le proposte di architettura e design sono ancora in revisione.

## Inizio del lavoro

Leggi prima `docs/project/MEMORY.md` e `docs/project/STATUS.md`, `GLOSSARY.md` e gli ADR pertinenti. D19–D23 e ADR0006: nessuna nuova feature automatica. Leggi `docs/features/README.md`, `docs/project/feature-development-plan.md` e la sola scheda selezionata dall’utente. Per progettare leggi prima `docs/design/opendots-target.md` ; il piano `docs/superpowers/plans/2026-10-04-opendots-desktop.md` è storico: screenshot utente OpenDots è autorevole, design SwiftUI precedente storico. `.scratch/hermes-desktop/spec.md` e `docs/design/desktop-design.md` conservano la baseline. Distingui sempre osservazioni live, documentazione upstream e proposte.

Aggiorna `docs/project/MEMORY.md`, `docs/project/STATUS.md`, `docs/project/WORKLOG.md` e i documenti interessati dopo ogni blocco significativo di ricerca, decisione, implementazione o verifica. Questa persistenza continua è una richiesta esplicita dell'utente.

## Agent skills

### Issue tracker

Tracker Markdown locale in `.scratch/hermes-desktop/`, senza servizi esterni. Leggi `docs/agents/issue-tracker.md` prima di creare o lavorare un ticket.

### Domain docs

Un solo contesto: `GLOSSARY.md` e `docs/adr/`. Leggi `docs/agents/domain.md` quando cambi termini o decisioni.

### Percorso di lavoro

Per scegliere una skill leggi `.agents/skills/ask-matt/SKILL.md`; per il setup e il percorso completo leggi `docs/agents/skills-workflow.md`. Le skill installate sono disponibili come file in questa chat: leggi il rispettivo `SKILL.md` prima di applicarle.

Per estrarre pattern usa `.agents/skills/ux-extract/SKILL.md` e cita le evidenze nella libreria. Per decisioni visive Apple usa `.agents/skills/axiom-design/SKILL.md`; per una futura implementazione nativa e la sua verifica usa le suite `axiom-swiftui` e `axiom-accessibility`.

## Confine delle prove

Usa un profilo Hermes isolato e dati sintetici per le prove di integrazione. Preserva runtime, credenziali e conversazioni personali esistenti. Mostra una capability solo se il backend collegato la supporta; conferma gli stati dopo l'esito del runtime. La chiusura del client e la disconnessione sono diverse dalla cancellazione del lavoro.
