# Workflow di lettura e applicazione per una feature

2026-10-04. Router: [ask-matt](../../.agents/skills/ask-matt/SKILL.md). Applicazione al tracker locale già predisposto; questa guida non autorizza lo sviluppo di feature non selezionate.

## Letture comuni: prima della feature

1. [AGENTS](../../AGENTS.md), [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md): verificare ambito, stato e quali incrementi sono effettivamente versionati.
2. [GLOSSARY](../../GLOSSARY.md), [ADR0005](../adr/0005-opendots-desktop.md), [ADR0006](../adr/0006-feature-by-feature.md): stack, termini e una feature per chat.
3. [Piano corrente](../project/feature-development-plan.md), [principi](../architecture/principles.md) e la scheda selezionata nel [catalogo](../features/README.md).
4. [Tracker](issue-tracker.md) prima di ticket; [domain docs](domain.md) se cambiano termini o decisioni. [Desktop README](../../desktop/README.md), package.json e test reali per i comandi: verificare lo stato del codice invece di riprodurre una lista obsoleta.

Poi leggere le skill e i file indicati nella sezione iniziale della scheda. I percorsi sorgente sono punti di ingresso: seguire import/contratti pertinenti, limitando gli edit all’ownership concordata. File upstream nel checkout Hermes sono fonti alla versione fissata, non codice Studio da modificare né prova live. File pianificati ma assenti nella scheda restano proposte: definirli prima di crearli.

## Flusso ask-matt adattato

| Condizione | Skill da leggere e applicare | Criterio di uscita |
|---|---|---|
| Inizio della chat feature | [ask-matt](../../.agents/skills/ask-matt/SKILL.md) | Scelta del ramo e del solo incremento |
| Requisito ancora ambiguo | [grill-with-docs](../../.agents/skills/grill-with-docs/SKILL.md), [grilling](../../.agents/skills/grilling/SKILL.md), [domain-modeling](../../.agents/skills/domain-modeling/SKILL.md) | Decisioni mancanti chiarite; quelle già confermate restano valide |
| Più incrementi/sessioni necessari | [to-spec](../../.agents/skills/to-spec/SKILL.md), [to-tickets](../../.agents/skills/to-tickets/SKILL.md), [writing-plans](../../.agents/skills/writing-plans/SKILL.md) | Ticket locali verticali con dipendenze e prove; niente riapertura dell’intero backlog |
| Feature scelta, piano sufficiente | [implement](../../.agents/skills/implement/SKILL.md), [codebase-design](../../.agents/skills/codebase-design/SKILL.md), [tdd](../../.agents/skills/tdd/SKILL.md) | Comportamento rischioso verificato attraverso l’interface reale; test proporzionati, non copie dell’implementation |
| Bug difficile emerso | [diagnosing-bugs](../../.agents/skills/diagnosing-bugs/SKILL.md) | Riproduzione stretta, causa e regressione pertinente |
| Attrito architetturale concreto | [improve-codebase-architecture](../../.agents/skills/improve-codebase-architecture/SKILL.md) | Candidato documentato e scelto prima di interface/refactor |
| Prima di commit/consegna | [code-review](../../.agents/skills/code-review/SKILL.md), [documentation-and-adrs](../../.agents/skills/documentation-and-adrs/SKILL.md) | Review Standards/Spec su base Git dichiarata; gate e limiti registrati |
| Passaggio a nuova chat | [handoff](../../.agents/skills/handoff/SKILL.md), [writing-for-agents](../../.agents/skills/writing-for-agents/SKILL.md) | Documenti autosufficienti con fonti, file, esito e prossima azione |
| Chiusura di un incremento | [retro](../../.agents/skills/retro/SKILL.md); [pr](../../.agents/skills/pr/SKILL.md) se PR richiesta | Miglioramenti del workflow concreti; PR solo nell’ambito autorizzato |

`implement-spec` è un ramo per task graph e agenti paralleli autorizzati, non il default di queste schede. Setup iniziale già eseguito: `setup-matt-pocock-skills` si consulta solo se il tracker/layout richiesti mancano. Tutte le altre skill sono nel [catalogo completo](skills-catalog.md).

## Stack e tool

Il prodotto corrente è Electron/React. Skill web/React delle schede si applicano al renderer; quelle SwiftUI e Liquid Glass native si applicano soltanto quando è selezionato un incremento SwiftUI reale. Per quel ramo leggere `axiom-macos`, `axiom-swiftui`, `swiftui-expert-skill`, `axiom-accessibility` e la skill Liquid Glass pertinente dal catalogo di progetto. Non migrare stack per applicare una skill.

Le skill globali/cache richiedono presenza corrente e tool effettivamente esposti. Seguire il protocollo UI della chat; un pacchetto Playwright o una skill browser non autorizza ad aggirare un diniego del tool. Usare dati sintetici e profilo isolato. Una skill per delega CLI si usa solo quando è autorizzata quella delega; leggere un catalogo non avvia agenti né invia messaggi.

## Registro della chat

WORKLOG: skill effettivamente lette, ramo applicato, file toccati, prove e limiti. MEMORY: decisioni confermate; STATUS: stato reale e gate. Catalogate, lette, applicate e workflow esaurito sono stati diversi. Ogni SKILL.md va letto prima di applicarlo; nessun documento può concedere credenziali, privilegi o pubblicazioni oltre l’autorizzazione utente.
