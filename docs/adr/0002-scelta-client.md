---
status: superseded
---
> Superato per il client principale da [ADR0005](0005-opendots-desktop.md). Decisione e codice SwiftUI storici conservati.

# Client macOS nativo

2026-10-04: l'utente richiede esplicitamente avvio del client macOS dopo applicazione delle skill native e Liquid Glass. Scelta: SwiftUI, deployment macOS 14+, glass su macOS 26+ con fallback. Upstream Electron resta riferimento per il protocollo, non base del client scelto. Costo accettato: adattatore e manutenzione separati. Prima shell SwiftPM, poi contratto runtime verificato; nessun requisito 24/7 soddisfatto dalla sola UI.
