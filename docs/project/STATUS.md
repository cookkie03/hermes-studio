# Hermes Studio — stato corrente

Aggiornato 2026-10-04. **Ambito attuale: documentazione per feature, MVP parziale preservato; nessuna nuova feature da implementare automaticamente.** D19–D23 e ADR0006 prevalgono sul lavoro notturno. Piano: [feature-development-plan](feature-development-plan.md). Catalogo: [F00–F17](../features/README.md).

## Consegna documentale

18 schede autonome: base, componenti, conversazioni, Spaces/documenti, bot, collaborazione, routine, plugin, browser, computer use, file, runtime, release DMG, voce, specialisti, memoria, approvazioni e terminale. Ogni feature sarà scelta in una chat separata. Principi e review architetturale salvati; candidati Conversazione e Metadata non selezionati né refattorizzati. Proposta fork/upstream annullata; licenze e provenienza del codice riusato conservate.

Riferimento visivo OpenDots autorevole; sistema componenti ispirato a Unsloth e Codex. Disclosure attività Unsloth verificata dal vivo. Codex analizzato dallo screenshot fornito: accesso live negato dallo strumento; animazioni e popover non dichiarati osservati. Screenshot personali esclusi da Git.

## Baseline tecnica preservata

Client Electron con servizio Node embedded e renderer OpenDots MIT adattato; codice SwiftUI storico conservato. App arm64 e DMG locali di sviluppo prodotti; firma ad hoc, non notarizzati né pubblicati. L'ultima ricostruzione della .app precede la sospensione dell'implementazione; il DMG non è stato rigenerato dopo l'ultimo ritocco layout. Non presentarlo come release finale. Evidenze: [development-artifacts](../releases/development-artifacts.md).

Prove precedenti: 27 test documenti upstream, 14 fixture renderer e typecheck dedicato; 13 bridge/server e 2 fixture di rete; bootstrap/link esterni verificati. App packaged: memoria, Space, Markdown/autosave e riapertura verificati con dati sintetici; test a 900 px senza overflow. Probe Node live health/ready su Hermes 0.21.5 senza prompt o cronologia.

## Gate ancora aperti, da assegnare alle feature

- Chat reale con profilo isolato, streaming, interruzione e ripresa: F02/F11.
- Review/salvataggio dalla chat end-to-end: prova non conclusa; F02/F03.
- Typecheck completo metadata/upstream: conflitto legacy SDK; transpiling metadata usa --noCheck, da risolvere o delimitare in F00.
- Confronto finale delle proporzioni della .app dopo ultimo fix, focus/VoiceOver e motion: F01.
- Browser live, computer use, plugin, collaborazione e routine non dimostrati nel client: rispettive schede, non capacità disponibili.
- Release GitHub, firma Apple/notarizzazione e installazione pulita: F12. Nessuna durata 24h verificata.

## Continuità

MEMORY e WORKLOG conservano decisioni e prove. Automazione riallineata al lavoro documentale e sospesa alla consegna (stato PAUSED confermato dal tool): nessuna ripresa automatica di nuove feature. Git origin verificato: git@github.com:cookkie03/hermes-studio.git. Modifiche del precedente incremento sono preservate; un commit documentale non equivale alla consegna di tutto il codice o di una release.
