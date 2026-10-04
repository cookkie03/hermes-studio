# ADR0005 — riuso UI OpenDots e distribuzione desktop

Data: 2026-10-04. Stato: accettata per incremento di sviluppo; artefatto e sicurezza da verificare. Supera ADR0002 per il client principale; conserva il lavoro SwiftUI e le prove trasporto come baseline, senza eliminarli.

## Contesto

Luca richiede la stessa schermata ed esperienza OpenDots, con Spaces/Dots/documenti/chat/memoria e backend Hermes. Il requisito rigido è un'app macOS installabile DMG/release; la riscrittura SwiftUI è un'opzione. La repository resta indipendente. Screenshot salvato in docs/design/references.

## Decisione

Riutilizzare renderer/asset/componenti del sorgente MIT OpenDots fissato a SHA documentato. Preparare Electron con servizio locale Node embedded e bridge al gateway Hermes già avviato. Mantenere metadata app separati dal runtime. Usare strumenti Hermes, non i tool executor OpenDots, e un trasporto locale privo di wizard OpenAI/CopilotKit per il percorso Hermes.

## Alternative

SwiftUI rewrite: integra bene Mac e lavoro esistente ma richiede riscrivere editor ricco, componenti e comportamenti, aumentando rischio di distanza dalla reference. Tauri: wrapper possibile, ma aggiunge Rust/sidecar Node e differenze WebKit; da rivalutare soltanto se Electron fallisce requisiti materiali. Dashboard Hermes incorporata: non realizza esperienza OpenDots richiesta. La repository esistente va preservata; il riuso MIT conserva le attribuzioni.

## Conseguenze e gate

App più pesante rispetto a SwiftUI; sicurezza renderer/IPC/server locale richiede verifica esplicita. DMG ad hoc non equivale a distribuzione firmata/notarizzata. Preservare LICENSE/attribuzioni/upstream SHA. Modifiche concentrate renderer e bridge aiutano futuri aggiornamenti ma non garantiscono merge automatici. OpenDots main differisce dalla screenshot: adattare layout al riferimento, non clonare ciecamente. Voce telefonica resta futura.
