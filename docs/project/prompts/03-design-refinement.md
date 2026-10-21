# Prompt 03 — affinamento del design scelto

Pronto da incollare nell'altro agente sulla stessa cartella. Questo incarico precede l'implementazione prodotto e sostituisce la richiesta di scegliere semplicemente A oppure B.

```text
Lavora in /Users/luca/Documents/ChatGPT/Hermes App 2. Obiettivo: una proposta C interattiva e rifinita di Hermes Studio, partendo dal feedback esplicito di Luca sui due HTML già renderizzati. Leggi AGENTS.md, docs/project/MEMORY.md, STATUS.md, docs/project/redesign-roadmap-2026-10-18.md e docs/design/redesign-proposals/recommendation-summary.md. Controlla Git e preserva file/modifiche concorrenti. Segui le skill di progetto pertinenti leggendo SKILL.md: frontend-design, ux-extract, axiom-design per convenzioni macOS, accessibilità web per controlli HTML. SwiftUI è riferimento di qualità percepita, non stack selezionato.

Scelte confermate:
- Colori e forme: A, direction-a-warm-studio.html.
- Pannello sinistro: A.
- Pannello destro: B, direction-b-graphite-technical.html.
- Funzionalità della textbox/composer: B.
- Compattazione/raggruppamento degli strumenti usati dall'agente: A.
- Entrambe le proposte attuali non raggiungono la qualità UX premium/macOS percepita in Unsloth, ChatGPT/Codex e Humla. La composizione ibrida è una base da rifinire, non design finale approvato.

1. Leggi integralmente A e B e inventaria esattamente i controlli del composer B, la struttura dell'inspector B e la disclosure tool A. Mostra la corrispondenza fra requisito, elemento sorgente e comportamento conservato. Non interpretare pannello destro B come cambio automatico al tema Graphite: conserva funzione/composizione B dentro un linguaggio Warm coerente. Chiarisci le scelte residue nel report invece di attribuirle all'utente.
2. Studia le evidenze locali di Unsloth/Codex/Humla e completa solo le osservazioni necessarie a gerarchia, densità e comportamento. Se un comportamento non è osservabile, dichiaralo proposta. Font, token e durate nei commenti degli HTML precedenti non costituiscono evidenza delle app originali. REA soltanto per domande sull'artefatto che richiedono quel tipo di prova; sorgente e screenshot non dimostrano movimento o fluidità. Evita account/conversazioni/registrazioni personali.
3. Affina composizione, proporzioni, allineamenti, baseline tipografiche, iconografia, selezione e contrasto delle superfici. Riduci chrome/card/bordi quando non aiutano la gerarchia. Conserva gli elementi esplicitamente scelti da Luca. La sensazione premium deve emergere dall'uso e dalla coerenza: gradiente, blur o più raggi non sono criteri sufficienti. Se scegli font specifici, caricali localmente con licenza appropriata oppure dichiara il fallback effettivo.
4. Crea un prototipo autonomo, con dati sintetici e banner Mockup, in docs/design/redesign-proposals/direction-c-refined-studio.html e un report refinement-review.md. Mantieni A/B e il codice prodotto integri. Usa pulsanti/input semantici, focus visibile, tastiera, Escape con ritorno focus, disclosure tool e apertura/chiusura inspector. Composer multilinea adattivo con allegati/selettori di B, stati invio/stop e controlli voce riconoscibili. Le azioni non collegate sono etichettate/disabilitate con motivo; i risultati sintetici non sono esiti Hermes.
5. Mostra tre scenari con lo stesso contenuto: chat vuota; scambio con gruppo di strumenti espandibile e inspector; offline/errore. Verifica a 900 e 1360 px, con testo lungo e pannello aperto/chiuso. Motion breve e coerente per feedback e pannelli, Reduced Motion funzionante; nessuna animazione per token o ritardo artificiale. Confronta almeno quattro punti prima/dopo e spiega come ciascuno migliora uso e leggibilità.
6. Consegna una preview utilizzabile e, se strumenti disponibili, un breve walkthrough delle interazioni e screenshot alle due larghezze. Distingui test eseguiti, sola ispezione del sorgente e verifiche mancanti. Aggiorna recommendation-summary.md, MEMORY/STATUS/WORKLOG con i risultati senza dichiarare implementato il prodotto.

Arresto: proposta C pronta da usare e valutare, mappa delle cinque preferenze rispettate, confronto prima/dopo e limiti salvati. Nessun refactor provider, migrazione SwiftUI/Rust, nuova integrazione voce/browser, release/deploy o modifica rete. OpenClaw resta una reference funzionale futura; oggi Hermes è l'unico backend. Nessun commit/push o altro goal avviato automaticamente.

Risposta finale: percorsi prototipo/report, istruzioni per provare le interazioni, quattro miglioramenti concreti, verifiche e questioni residue. Luca riporterà il risultato nella chat di coordinamento per la revisione; non passare direttamente all'implementazione.
```
