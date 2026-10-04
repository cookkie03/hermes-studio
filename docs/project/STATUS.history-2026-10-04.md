> Snapshot storico prima del consolidamento del 2026-10-04. Contiene stati e istruzioni superati; leggere [STATUS corrente](STATUS.md) e [indice documentazione](../README.md). Il corpo originale è conservato integralmente sotto. SHA256 originale: `093289d254690f4f03227edea50db1140fabb06c1a1b4bfbf9d8ab0d29208877`.

# Hermes Studio — stato corrente

Aggiornato 2026-10-04. **F00 completata: baseline MVP verificata e consolidata; nessuna nuova feature da implementare automaticamente.** D19–D23 e ADR0006 prevalgono sul lavoro notturno. Piano: [feature-development-plan](feature-development-plan.md). Catalogo: [F00–F18](../features/README.md).

## Consegna documentale

19 schede autonome (incluse capacità native/visibilità F18): base, componenti, conversazioni, Spaces/documenti, bot, collaborazione, routine, plugin, browser, computer use, file, runtime, release DMG, voce, specialisti, memoria, approvazioni e terminale. Ogni feature sarà scelta in una chat separata. Principi e review architetturale salvati; candidati Conversazione e Metadata non selezionati né refattorizzati. Proposta fork/upstream annullata; licenze e provenienza del codice riusato conservate.

Riferimento visivo OpenDots autorevole; sistema componenti ispirato a Unsloth e Codex. Disclosure attività Unsloth verificata dal vivo. Codex analizzato dallo screenshot fornito: accesso live negato dallo strumento; animazioni e popover non dichiarati osservati. Screenshot personali esclusi da Git.

## Baseline tecnica preservata

Client Electron con servizio Node embedded e renderer OpenDots MIT adattato; codice SwiftUI storico conservato. App arm64 e DMG locali di sviluppo prodotti; firma ad hoc, non notarizzati né pubblicati. La .app è stata ricostruita e verificata in F00; il DMG storico non è stato rigenerato con questo incremento. Non presentarlo come release finale. Evidenze: [development-artifacts](../releases/development-artifacts.md).

Prove precedenti: 27 test documenti upstream, 14 fixture renderer e typecheck dedicato; 13 bridge/server e 2 fixture di rete; bootstrap/link esterni verificati. App packaged: memoria, Space, Markdown/autosave e riapertura verificati con dati sintetici; test a 900 px senza overflow. Probe Node live health/ready su Hermes 0.21.5 senza prompt o cronologia.

## Gate ancora aperti, da assegnare alle feature

- Chat reale con profilo isolato, streaming, interruzione e ripresa: F02/F11.
- Review/salvataggio dalla chat end-to-end: prova non conclusa; F02/F03.
- Typecheck metadata RISOLTO in F00: strict senza --noCheck. Template executor upstream completo e alcune suite storiche restano incompatibili con SDK legacy, escluso dal prodotto.
- Confronto finale delle proporzioni della .app dopo ultimo fix, focus/VoiceOver e motion: F01.
- Browser live, computer use, plugin, collaborazione e routine non dimostrati nel client: rispettive schede, non capacità disponibili.
- Release GitHub, firma Apple/notarizzazione e installazione pulita: F12. Nessuna durata 24h verificata.

## Continuità

MEMORY e WORKLOG conservano decisioni e prove. Automazione riallineata al lavoro documentale e sospesa alla consegna (stato PAUSED confermato dal tool): nessuna ripresa automatica di nuove feature. Git origin verificato: git@github.com:cookkie03/hermes-studio.git. Modifiche del precedente incremento sono preservate; un commit documentale non equivale alla consegna di tutto il codice o di una release.

Indicazione storica prima della consegna F00: consolidare la baseline. Superata dalla consegna F00 sotto; scegliere ora una feature dal catalogo aggiornato.

## F00 selezionata — 2026-10-04

Luca richiede risultato della scheda F00: review del codice, build/test, correzioni essenziali e commit MVP. Incremento delimitato ai Metadata locali: contratti strutturali delle route separati dai tipi del vecchio executor, typecheck senza --noCheck; preservati store, API e dati. Review a due assi su HEAD 91f3644 e baseline WIP/untracked. Correzioni essenziali emerse: invio dopo cold resume di turno runtime attivo/incerto; stato offline nella schermata vuota e cancellazione della navigazione prima di cambiare selezione. Fixture di rete richiedono porte localhost fuori sandbox; rerun sintetico PASS (2 test). Build packaged e gate finali ancora in corso. Nessuna selezione di altre feature o pubblicazione release.

## Consegna F00 — verificata 2026-10-04

Review Standards/Spec conclusa: cold resume attivo/incerto, offline iniziale e navigazione annullata corretti. npm test PASS (18 fixture +55 test, due typecheck e bootstrap/link); package:dir e smoke .app PASS su userData sintetico, inclusi persistenza al riavvio, errore salvataggio, conflitto, focus visibile, 900px e Reduced Motion. Baseline SwiftUI conservata: build e runner sintetici PASS. [Review ed evidenze](../architecture/f00-review-2026-10-04.md). Commit locale della baseline; nessuna pubblicazione release. Le feature successive richiedono selezione utente.

Aggiornamento D24: 18 schede corredate di skill principali/condizionali e file da leggere, workflow ask-matt comune e inventario completo delle raccolte. Inventario di percorsi leggibili, non certificazione dei tool attivi; implementazione ancora sospesa.

## Revisione dopo prova utente F00 — D25–D29

Aggiornate specifiche, non codice: Space-folder/file reali F03/F10; picker avatar F04-A; browser integrato stesso profilo/pagina F08; memoria Hermes/Markdown Space F15; messaggi vocali e vocal chat F13. SOUL, MEMORY/USER, cronologia, review e curator analizzati nel prospetto ufficiale con link e sorgente fissato e1e82d7. Gate reali di queste feature ancora aperti. Nessun profilo/vault personale letto, mic/runtime avviato o provider installato. Schede e prompt pronti per selezione in chat dedicate; telefonate future.

Validazione D25–D29:212 link locali e18 guidance/handoff PASS; diff whitespace pulito. Nessuna build richiesta per modifiche soltanto documentali.

## D30 — Feature native e memoria visibile

Catalogo aggiornato a19 schede F00–F18. F18 documenta conservazione delle capacità Hermes, viewer memoria runtime e riepiloghi post-turn nella chat. Memory autoritativa nel backend, niente seconda memoria Studio; F15 Space/legacy distinto. Sorgente desktop/runtime verificato per review.summary e byte/status; persist/replay e viewer contenuto ancora gate futuri. Sole modifiche documentali, nessuna implementazione o accesso personale.
