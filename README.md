# Hermes Studio

Fondazione di un'app macOS per Hermes: disposizione OpenDots, componenti ispirati a Unsloth/Codex, runtime e strumenti Hermes. Client Electron parziale presente; SwiftUI precedente conservato come storia. Repository indipendente con provenienza del codice riusato, senza piano di fork.

## Una feature per chat

Il lavoro attuale consegna **18 schede**, non implementa automaticamente il backlog. Parti dal [catalogo delle feature](docs/features/README.md), scegli una scheda e usa il suo prompt di handoff in una nuova chat Codex.

| Documento | Scopo |
|---|---|
| [Stato](docs/project/STATUS.md) | Evidenze, baseline e gate ancora aperti |
| [Memoria](docs/project/MEMORY.md) | Decisioni confermate e continuità |
| [Piano corrente](docs/project/feature-development-plan.md) | Ambito documentale e sviluppo selezionato |
| [Principi](docs/architecture/principles.md) | Qualità della codebase e ownership |
| [Review architettura](docs/architecture/feature-architecture-review.md) | Due candidati, nessun refactor automatico |
| [Componenti](docs/design/component-system.md) | Anatomia, dimensioni e motion proposti |
| [Riferimento Hermes desktop](docs/research/hermes-desktop-reference.md) | Fonti e mappa del runtime ufficiale |
| [Release DMG](docs/features/F12-github-releases-dmg.md) | Handoff per prodotto GitHub installabile |
| [Registro](docs/project/WORKLOG.md) | Cronologia di ricerca e verifiche |

## Baseline di sviluppo

Vedi [desktop/README](desktop/README.md) per build e dipendenze. App e DMG locali sono artefatti di sviluppo ad hoc; non sono una release notarizzata. Test metadata e handshake non provano chat reale o strumenti integrati. Il cliente finale dovrà installare una .app, senza npm run dev: F12 specifica questa consegna e la verifica su installazione pulita.

Usare profili e dati sintetici; nessuna riconfigurazione o import automatico del runtime Hermes personale. `AGENTS.md` descrive la persistenza continua richiesta dall'utente.
