# Hermes Studio — stato corrente

Consolidato 2026-10-04. **F0 completata; F1–F18 documentate o parziali, nessuna nuova implementazione selezionata.** Rinumerazione documentale D31, codice prodotto invariato. [Catalogo](../features/README.md), [piano](feature-development-plan.md), [decisioni](decisions.md).

## Baseline verificata

Electron/React, servizio Node embedded e bridge Hermes; codice SwiftUI storico preservato. Consegna F0 nel commit `7c7e2a5`: strict typecheck renderer/metadata senza --noCheck, npm test (18 fixture e 55 test), package:dir e smoke .app con dati sintetici; restart/failure storage/conflict/focus/900px/Reduced Motion verificati. Correzioni essenziali cold resume/offline/navigazione incluse. [Evidenze F0](../architecture/f00-review-2026-10-04.md).

Questi sono esiti precedentemente documentati, non test rieseguiti dal consolidamento. Template executor storico non distribuito resta incompatibile con alcune dipendenze; full upstream check non certificato. Il candidato Metadata è stato consolidato in F0; approfondimento del ciclo Conversazione non selezionato.

.app arm64 locale di sviluppo, firma ad hoc; DMG precedente non rigenerato con F0, nessuna release GitHub/firma Apple/notarizzazione. [Artefatti storici](../releases/development-artifacts.md). Node handshake Hermes 0.21.5 verificato senza sessione/prompt: non prova chat, streaming o strumenti.

## Requisiti specificati, ancora da implementare/provare

19 schede F0–F18 con skill, ingressi, incrementi, ownership, gate e handoff. In particolare: folder-backed Spaces F6/F5, picker avatar F7-A, browser condiviso F12, voce in-app F17, memoria Markdown Space F9 e viewer/riepiloghi Hermes F8. Metadata del MVP non dimostrano questi nuovi comportamenti.

Design OpenDots autorevole; componenti Unsloth/Codex. Unsloth disclosure osservata; Codex solo screenshot per diniego del tool. Token/motion proposti, non misurati. Screenshot personali esclusi da Git.

## Gate aperti

| Gate | Responsabile | Evidenza ancora necessaria |
|---|---|---|
| Chat isolata reale, streaming, interrupt/resume | F2/F1 | Percorso runtime completo, distinto dal handshake |
| File/cartelle e review save dalla chat | F6/F5 | File autoritativo, grant, conflitti e ricevuta E2E |
| Layout finale, focus/VoiceOver e motion | F4 | Confronto packaged finale e accessibilità completa |
| Bot/collaborazione/routine/plugin/strumenti/voce | Scheda specifica | Capability, ownership ed esito reale; UI attuale non basta |
| Memoria runtime visibile e note dopo risposta | F8 | Contratto read-only, scoped events, persistenza/replay |
| DMG/release/installazione pulita | F13 | Firma/limiti, checksum e installazione della versione selezionata |
| Continuità runtime con client chiuso | Feature/host selezionati | Prova effettiva; nessuna durata di 24h verificata |

## Continuità e pubblicazione documentale

D20/ADR0006 governano il lavoro. Automazione Hermes e goal notturno sospesi secondo ultime verifiche nel WORKLOG; non riattivati né ricontrollati qui. Repo indipendente, origin confermato. Commit documentali precedenti pubblicati: `4726b38` (D25–D29) e `ecf5f64` (F8/D30). Consolidamento documentale verificato: 19 schede, decisioni D01–D30, collegamenti locali e snapshot storici integri; codice invariato. Commit/push tracciati in Git.

Memoria operativa in [MEMORY](MEMORY.md), cronologia in [WORKLOG](WORKLOG.md). Stato precedente integrale in [snapshot storico](STATUS.history-2026-10-04.md). Per il prossimo lavoro l'utente sceglie scheda e incremento: il numero della feature non impone priorità.

## Rinumerazione D31

Schede e riferimenti attivi passano agli ID F0–F18 senza padding, secondo la sequenza approvata. Catalogo ordinato numericamente e tabella vecchi/nuovi ID disponibile; documenti storici mantengono i numeri originali con avviso e link aggiornati. Verifica PASS: 19 schede con ID/titoli/dipendenze/handoff coerenti e 1.144 collegamenti locali validi. Contenuti delle schede equivalenti salvo numerazione; storia preservata salvo percorsi aggiornati. Nessun test prodotto rieseguito; commit/push tracciati in Git.
