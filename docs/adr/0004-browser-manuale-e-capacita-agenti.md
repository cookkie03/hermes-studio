---
status: accepted
---
> Ambito storico SwiftUI/WebKit non persistente, superato come target prodotto da [ADR0005](0005-opendots-desktop.md) e [F08](../features/F08-browser.md) (browser condiviso persistente D27). Preservare questa prova; non applicarla al browser Studio futuro.

# Browser manuale prima dell'automazione degli agenti

2026-10-04. Il percorso confermato è ricerca e scrittura con team e strumenti affiancati. La visione comprende browser use e computer use, ma il client non ha ancora un contratto runtime collaudato.

Scelta del primo incremento: browser WebKit nativo manuale su macOS 26+ e documento Markdown locale persistente con export. Il browser parte vuoto, non carica automaticamente siti, usa archivio WebKit non persistente. Il trasporto degli agenti non può controllare questa pagina nella build corrente. Sulle versioni precedenti il browser spiega il requisito; altre superfici mantengono target macOS 14.

Alternative: aprire sempre browser esterno spezza il workspace; implementare WKWebView per macOS 14 aggiunge subito un adapter senza requisito di supporto reale verificato; aggiungere automazione senza capability testate prometterebbe controllo non esistente.

Conseguenze: cronologia/cookie browser non durano oltre la sessione, nessuna sincronizzazione documenti, nessun universal editor ancora. Il target minimo del package non implica tutte le feature su ogni versione. API verificate con SDK 26.5 locale, non solo esempi delle skill. Prima dell'automazione definire azione corrente, destinazione, consenso, log e modalità di interruzione su runtime isolato.
