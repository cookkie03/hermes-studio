# Audit delle skill richieste

2026-10-04. Letta/applicata non significa workflow esaurito. Nessun completamento retroattivo.

| Skill citata | Applicazione concreta | Cosa resta |
|---|---|---|
| ux-extract | Ricerca Unsloth, pattern library e screenshot di riferimento salvati | Copertura esaustiva schermate/stati, tastiera/motion/responsive e confronto con nuova app non conclusi |
| axiom-design | Gerarchia nativa, disclosure, feedback, Liquid Glass riservato ai controlli | Audit visivo/accessibilità della nuova build |
| ask-matt | Percorso decisioni → spec → 8 ticket → implementazione e docs | TDD completo per slice, code-review finale e retro non conclusi; non fingere esecuzione integrale del router |
| find-skills | Ricerca Liquid Glass e gusto con fonti/qualità; quattro skill autorizzate installate | Le raccomandazioni interface-design/impeccable non sono installazioni già fatte |
| axiom-macos | Scene macOS, finestre, inspector e interop verificati sul SDK | Smoke completo resize/tastiera e distribuzione |
| liquid-glass OpenAI | Controlli glass gated macOS26, fallback e trasparenza ridotta | Validazione UI dei diversi contesti; non tutti gli effetti della skill sono requisiti di questa app |
| swiftui-expert-skill | Observation, ownership State, API correnti e WebKit | Revisione finale stato/concorrenza e prestazioni |
| swiftui-liquid-glass | Applicazione mirata glass senza ricoprire contenuti | Prove contrasto e fallback |
| grilling | Round Q1–Q6, risposte e D04–D09 persistite; composizione confermata | Non esaurisce ogni decisione della visione intera; rifare solo frontiere nuove |
| documentation-and-adrs | MEMORY/STATUS/WORKLOG, README, glossary, ADR0001–0004 | Docs correnti da riallineare; ADR trasporto, API e gotcha nuovi, verifica checklist finale |
| improve-codebase-architecture | Analisi delegata, vocabulary codebase-design, due candidati e report HTML | Apertura report, scelta candidato e grilling/refactoring successivo non conclusi |
| frontend-design | Direzione atelier editoriale, implementazione TeamWorkspace/DesignTheme e doc art-direction | Build integrata e prova UI dopo modifiche; principi web adattati al brief nativo |
| gestione file tree (riferimento utente, nome non identificato) | Requisito aggiunto al piano e agente dedicato | Non affermare una skill specifica applicata; file tree è in implementazione, editor locale non equivale a tree |

Task e prove: ../superpowers/plans/2026-10-04-overnight-hermes.md. Il piano resta vivo e aggiornato; i dettagli di verifica sono in WORKLOG e report dei singoli incrementi.

## Riallineamento OpenDots — D14–D18

Il piano attivo è `../superpowers/plans/2026-10-04-opendots-desktop.md`; i risultati SwiftUI sopra sono storici e non chiudono i gate Electron. `frontend-design` ora segue il riferimento utente senza reinterpretarlo: riuso componenti/avatar upstream e adattamento sidebar/chat/Computer. `documentation-and-adrs` ha prodotto ADR0005 e specv0.2 sul tracker. `domain-modeling` riallinea Dot/Space/Page/Computer nel glossario. `frontend-testing-debugging` guida prove Playwright Electron con profilo temporaneo: il plugin browser specifico non è disponibile, quindi si usa il pacchetto Playwright installato per verificare la vera app.

`code-review`: review incrociata Standards (architecture_review) e Spec (taste_research), adattata a un incremento additivo non ancora committato rispetto6c84b4b e allo snapshot upstream. Baseline scelta dal PM nel lavoro autonomo autorizzato, non fornita dall'utente; non dichiarare esecuzione letterale integrale della skill. Findings materiali: overlay Computer su Memoria, cancelapproval stale, gapsecondsubmit dopo202, lifecycle capability e citazioni esterne. Riparazioni e regressioni in corso. UX extraction OpenDots resta documentale/asset e confronto screenshot; nessuna copertura esaustiva live inventata. Accessibilità assistiva/VoiceOver e notarizzazione ancora aperte.

## Consegna per feature — D19–D23

`documentation-and-adrs`: ADR0006, catalogo di 18 schede, piano e continuità riallineati. `improve-codebase-architecture` e `codebase-design`: review delegata su hotspot desktop, due candidati con deletion test/locality/leverage, principi persistenti e report HTML temporaneo; nessuna interface concreta o refactor scelto. La fase successiva di grilling dipende dalla scelta di un candidato e non viene dichiarata esaurita.

`ux-extract`: estrazione mirata dei componenti, screenshot personali esclusi da Git, disclosure Unsloth verificata dal vivo; Codex solo screenshot per diniego dello strumento. Durate/token sono proposte, non misurazioni. Non è audit esaustivo delle due app. Le skill SwiftUI/Liquid Glass restano applicazioni della baseline storica: non equivalgono a validazione del renderer Electron. Il design corrente è codificato nel component-system e nelle schede F01/F02/F03. Nessuna nuova feature implementata nella fase documentale.

Report architetturale richiesto nel pannello Codex: apertura accodata per questa chat; file temporaneo architecture-review-20261004-134503.html. Scelta/refactor restano fuori dall’ambito attuale.
