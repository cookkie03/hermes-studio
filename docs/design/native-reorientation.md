> Numerazione storica: gli ID nel testo precedono il riordino; i link alle schede puntano ai file attuali. [Corrispondenza vecchi/nuovi ID](../features/numbering-2026-10-04.md).

> Documento/evidenze storici. Per stato corrente leggere [STATUS](../project/STATUS.md); requisiti e gate attuali nel [catalogo feature](../features/README.md). Il contenuto sotto non autorizza nuove attività né certifica lo stato successivo a F00.

# Revisione nativa — 2026-10-04

L'utente ha richiesto esplicitamente installazione, applicazione delle quattro skill e avvio dello sviluppo macOS. Questa istruzione supera la precedente attesa di revisione dei draft. Il primo incremento è la shell locale; non equivale al completamento M1 con runtime.

## Analisi applicata

- Axiom macOS: NavigationSplitView per sidebar/detail, inspector non modale, Settings e comandi standard. La finestra principale usa WindowGroup. Selezione e dati identificati da UUID stabili.
- OpenAI Liquid Glass: eliminare il chrome custom del wireframe; lasciare che sidebar e toolbar usino materiali di sistema. Controlli standard prima dei glass custom. Nessun vetro dietro al testo della conversazione.
- SwiftUI Expert: store Observable posseduto dalla App, sotto-viste piccole, Binding espliciti per le modifiche, identità stabili e nessun dato remoto nelle preview. Stato persistente indipendente dalla ricostruzione delle view.
- Dimillian Liquid Glass: API native, disponibilità macOS verificata in compilazione, fallback di sistema. Glass solo sul controllo principale. Non trasportare automaticamente pattern iOS sul Mac; nessuna animazione di morphing se manca un cambio di gerarchia utile.

## Incremento scelto

macOS 14+; Swift 6 e SwiftUI senza dipendenze esterne. SwiftPM permette build con Command Line Tools disponibili; packaging .app locale ad hoc, non distribuzione notarizzata. SDK disponibile macOS 27, API glass gated macOS 26. Build e test locali stabiliscono compatibilità con questo SDK; macOS 14/26 non testati dal vivo.

Conversazioni reali locali, creazione chat e bozze persistenti. Nessun transcript di esempio scambiato per lavoro reale. Invio al runtime disabilitato con stato esplicito. Inspector mostra dettagli locali e configurazione ancora mancante. La connessione, streaming, approvazioni e attività persistenti restano ticket successivi.

## Confine della verifica

Test sul contratto pubblico di persistenza locale: riapertura bozza/selezione, dati corrotti e versione sconosciuta preservati. Smoke UI su bundle .app. Non dichiarare accessibilità completa, streaming o 24/7 sulla base della shell.

## Revisione confermata D04–D09

Il primo workspace ricerca/scrittura sostituisce la chat centrale: team e brief al centro, pannello strumenti affiancato con browser e documento Markdown. Conversazione raggiungibile dalla sidebar. Avatar illustrato Hermes, movimento mirato senza attività simulata. Prima capacità reale locale: browser manuale e documento persistente; browser use/computer use del runtime ancora da integrare. Nessun team fittizio viene presentato come operativo.
