# Hermes Studio — stato corrente

Consolidato 2026-10-04. **F00 completata; F01–F18 documentate o parziali, nessuna nuova implementazione selezionata.** Consolidamento documentale corrente. [Catalogo](../features/README.md), [piano](feature-development-plan.md), [decisioni](decisions.md).

## Baseline verificata

Electron/React, servizio Node embedded e bridge Hermes; codice SwiftUI storico preservato. Consegna F00 nel commit `7c7e2a5`: strict typecheck renderer/metadata senza --noCheck, npm test (18 fixture e 55 test), package:dir e smoke .app con dati sintetici; restart/failure storage/conflict/focus/900px/Reduced Motion verificati. Correzioni essenziali cold resume/offline/navigazione incluse. [Evidenze F00](../architecture/f00-review-2026-10-04.md).

Questi sono esiti precedentemente documentati, non test rieseguiti dal consolidamento. Template executor storico non distribuito resta incompatibile con alcune dipendenze; full upstream check non certificato. Il candidato Metadata è stato consolidato in F00; approfondimento del ciclo Conversazione non selezionato.

.app arm64 locale di sviluppo, firma ad hoc; DMG precedente non rigenerato con F00, nessuna release GitHub/firma Apple/notarizzazione. [Artefatti storici](../releases/development-artifacts.md). Node handshake Hermes 0.21.5 verificato senza sessione/prompt: non prova chat, streaming o strumenti.

## Requisiti specificati, ancora da implementare/provare

19 schede F00–F18 con skill, ingressi, incrementi, ownership, gate e handoff. In particolare: folder-backed Spaces F03/F10, picker avatar F04-A, browser condiviso F08, voce in-app F13, memoria Markdown Space F15 e viewer/riepiloghi Hermes F18. Metadata del MVP non dimostrano questi nuovi comportamenti.

Design OpenDots autorevole; componenti Unsloth/Codex. Unsloth disclosure osservata; Codex solo screenshot per diniego del tool. Token/motion proposti, non misurati. Screenshot personali esclusi da Git.

## Gate aperti

| Gate | Responsabile | Evidenza ancora necessaria |
|---|---|---|
| Chat isolata reale, streaming, interrupt/resume | F02/F11 | Percorso runtime completo, distinto dal handshake |
| File/cartelle e review save dalla chat | F03/F10 | File autoritativo, grant, conflitti e ricevuta E2E |
| Layout finale, focus/VoiceOver e motion | F01 | Confronto packaged finale e accessibilità completa |
| Bot/collaborazione/routine/plugin/strumenti/voce | Scheda specifica | Capability, ownership ed esito reale; UI attuale non basta |
| Memoria runtime visibile e note dopo risposta | F18 | Contratto read-only, scoped events, persistenza/replay |
| DMG/release/installazione pulita | F12 | Firma/limiti, checksum e installazione della versione selezionata |
| Continuità runtime con client chiuso | Feature/host selezionati | Prova effettiva; nessuna durata di 24h verificata |

## Continuità e pubblicazione documentale

D20/ADR0006 governano il lavoro. Automazione Hermes e goal notturno sospesi secondo ultime verifiche nel WORKLOG; non riattivati né ricontrollati qui. Repo indipendente, origin confermato. Commit documentali precedenti pubblicati: `4726b38` (D25–D29) e `ecf5f64` (F18/D30). Consolidamento documentale verificato: 19 schede, decisioni D01–D30, collegamenti locali e snapshot storici integri; codice invariato. Commit/push tracciati in Git.

Memoria operativa in [MEMORY](MEMORY.md), cronologia in [WORKLOG](WORKLOG.md). Stato precedente integrale in [snapshot storico](STATUS.history-2026-10-04.md). Per il prossimo lavoro l'utente sceglie scheda e incremento: il numero della feature non impone priorità.
