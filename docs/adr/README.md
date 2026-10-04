# Indice degli ADR

Le decisioni utente stanno nel [registro D01–D31](../project/decisions.md); questi file preservano scelte tecniche e motivazioni. Non eliminare ADR superati.

| ADR | Ambito/stato corrente |
|---|---|
| [0001](0001-client-e-runtime.md) | Proposta lifecycle runtime indipendente; continuità/crash/24h da verificare |
| [0002](0002-scelta-client.md) | Client SwiftUI storico, superato da 0005 |
| [0003](0003-archivio-locale-e-runtime.md) | Storage nativo storico; principio di separazione runtime preservato |
| [0004](0004-browser-manuale-e-capacita-agenti.md) | Browser WebKit manuale/non persistente storico; target attuale F12/D27 |
| [0005](0005-opendots-desktop.md) | Client prodotto Electron/UI riusata, scelta corrente; gate F0/F13 distinti |
| [0006](0006-feature-by-feature.md) | Una feature per chat, nessuno sviluppo globale automatico |
| [0007](0007-folder-backed-spaces.md) | Filesystem autoritativo per Spaces, requisito non migrazione implementata |

Data/status di un ADR non prova implementazione o release: consultare STATUS e i gate della scheda.
