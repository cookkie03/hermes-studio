# Hermes Studio

App macOS per assistente personale e progetti: layout OpenDots, componenti Unsloth/Codex e runtime/strumenti Hermes. Client Electron/React con servizio Node embedded; baseline SwiftUI storica conservata. Repository indipendente con attribuzione MIT del codice riusato.

## Parti da qui

[Indice della documentazione](docs/README.md) distingue decisioni, stato, feature, fonti e storia. Il [catalogo F00–F18](docs/features/README.md) contiene 19 schede con skill, file, gate e prompt per chat dedicate. F00 è completata; altre capacità documentate/parziali si sviluppano solo dopo selezione dell'utente.

- [Stato verificato e gate](docs/project/STATUS.md).
- [Direzione corrente](docs/project/MEMORY.md) e [decisioni](docs/project/decisions.md).
- [Piano per una feature](docs/project/feature-development-plan.md), [workflow](docs/agents/feature-workflow.md) e [confini](docs/architecture/feature-boundaries.md).
- [UI autorevole](docs/design/opendots-target.md) e [componenti](docs/design/component-system.md).
- [Memoria/capacità native Hermes](docs/features/F18-hermes-native-features-and-observability.md); memoria Markdown degli Spaces distinta in F15.
- [Release GitHub e DMG](docs/features/F12-github-releases-dmg.md).

## Sviluppo e distribuzione

Comandi e dipendenze: [desktop/README](desktop/README.md) e desktop/package.json. Artefatti locali sono build di sviluppo ad hoc, non release notarizzate; il DMG storico non incorpora necessariamente F00. L'utente finale dovrà installare la .app, senza devserver: F12 specifica il percorso.

Le prove runtime usano profili/dati sintetici e preservano dati/credenziali personali. Build e handshake non dimostrano chat, strumenti o continuità di 24 ore. [AGENTS](AGENTS.md) descrive l'avvio del lavoro e la persistenza richiesta.
