> Documento/evidenze storici. Per stato corrente leggere [STATUS](../project/STATUS.md); requisiti e gate attuali nel [catalogo feature](../features/README.md). Il contenuto sotto non autorizza nuove attività né certifica lo stato successivo a F00.

# Direzione artistica — studio di ricerca

2026-10-04. Applicazione esplicita di frontend-design, adattata al brief macOS e alle decisioni D04–D09. La skill web suggerisce una direzione riconoscibile; Axiom Design e il brief nativo governano font, controlli e materiali.

## Idea

Un atelier editoriale: il lavoro e il documento sono protagonisti, Hermes è una presenza riconoscibile al loro fianco. Titolo in New York tramite font serif di sistema; testo e controlli in San Francisco. Tre sezioni numerate, «Il team», «L’incarico», «Il lavoro in corso», danno ritmo e gerarchia senza trasformare ogni informazione in una card.

Inchiostro blu riservato a marcatori e ritratto. Il contenuto usa colori semantici, il fondo segue il sistema. L’accento dispone di varianti chiara/scura e diventa bianco/nero con contrasto aumentato. Il ritratto vettoriale originale ha elmo alato e silhouette semplice. Non vengono inventati membri del team o stati operativi.

## Interazione e materiali

Controlli macOS standard, separatori leggeri, colonna di testo con larghezza massima leggibile e scrolling. Il footer del brief passa a disposizione verticale tramite ViewThatFits quando la larghezza non basta. La bozza resta nello store, indipendente dalla disposizione.

Nessuna animazione continua o ingresso decorativo. Il ritratto rimane fermo finché esistono eventi reali che giustifichino una risposta visiva; le future animazioni dovranno rispettare Reduce Motion. Liquid Glass resta nel chrome e nei controlli già definiti dal client; non si aggiunge dietro il brief o il testo.

## Implementazione e prove

Applicata in Sources/HermesDesktop/TeamWorkspaceView.swift e DesignTheme.swift. Il contratto pubblico della vista resta invariato. Fonte dello stato «Non collegato» è ancora la precedente shell: l’integrazione runtime dovrà sostituire quel testo con lo stato confermato del backend.

Revisione sorgente eseguita: semantica dei titoli, label del brief, ritratto accessibile senza annunciare ogni forma, assenza di loop animati. Build, ispezione live, contrasto misurato, VoiceOver e resize devono ancora essere verificati dal coordinatore; non sono risultati già passati.
