# Fonti ed evidenze

Raccolta: 2026-10-04. Le osservazioni dell'app installata e i sorgenti/documenti upstream possono appartenere a versioni diverse.

## Fonti primarie

| ID | Fonte | Uso nel progetto | Verifica |
|---|---|---|---|
| U1 | [Unsloth repository](https://github.com/unslothai/unsloth) | Identificazione di Studio/Desktop e riscontro dei componenti | README, HEAD e lettura sparse frontend; note nel riscontro sorgenti |
| U2 | App macOS `ai.unsloth.studio` | Pattern di shell e chat | Osservazione diretta, schermate locali; UI indica v0.1.900-beta |
| D1 | [Dots, pagina ufficiale](https://chatgpt.com/features/dots/) | Responsabilità persistente, revisione e controllo dell'utente | Pagina consultata; nessun test di Dots autenticato |
| H1 | [Hermes repository](https://github.com/NousResearch/hermes-agent) | Punto di accesso al runtime | README consultato; HEAD via `git ls-remote` |
| H2 | [Architecture](https://hermes-agent.nousresearch.com/docs/developer-guide/architecture) | Confine client/runtime, entry point e delegazione | Documentazione consultata |
| H3 | [Programmatic Integration](https://hermes-agent.nousresearch.com/docs/developer-guide/programmatic-integration) | Scelta del protocollo per il client | Documentazione consultata; chiamate non testate |
| H4 | [Scheduled Tasks](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron) | Automazioni pianificate | Consultata come riferimento; nessun job creato |
| H5 | [TUI & Desktop from Worktrees](https://hermes-agent.nousresearch.com/docs/developer-guide/worktree-ui-dev) | Valutare il riuso del client upstream | Documentazione consultata |
| S1 | [Matt Pocock skills](https://github.com/mattpocock/skills) e [catalogo](https://skills.sh/mattpocock/skills) | Percorso engineering | Skill selezionate installate e lette localmente |
| S2 | [Axiom](https://github.com/charleswiltgen/axiom) | Design Apple, SwiftUI, accessibilità | Skill locali lette; due suite aggiuntive installate |

## Provenienza/versioni

- Unsloth HEAD pubblico iniziale: `124e89a64d681e5428e95039f1909487a9719cb9`. Copia sparse successivamente letta: `689e1b0cf5b814fe3d0431d05fbb80c97a7a91b3`; repository avanzato durante la ricerca.
- Hermes Agent HEAD pubblico: `158fd638da1629c8e62caf9ade1515d162def8ab`.
- Questi SHA identificano le versioni upstream al momento della lettura, non le app installate sul Mac.
- `skills-lock.json` conserva le sorgenti e gli hash delle skill installate. Non equivale a un pin del runtime Hermes.

## Risultati che cambiano l'architettura

Hermes documenta ACP, TUI gateway JSON-RPC e API HTTP/SSE. La proposta deve confrontarli attraverso prove isolate prima di fissare il trasporto. La presenza documentata di un client desktop richiede una verifica di riuso prima di scegliere una nuova implementazione. Fonte: H3/H5.

La continuità su un server sempre acceso è un requisito del progetto tratto dall'allegato. Non è stato verificato un deploy locale o remoto. La documentazione di cron non prova da sola recupero dopo un crash, riconciliazione degli eventi o disponibilità 24/7.

## Confine delle evidenze

- **Osservato:** visibile nella UI acquisita e/o confermato dall'esito di un comando.
- **Documentato:** dichiarato da una fonte primaria, senza prova nel nostro ambiente.
- **Proposto:** scelta di progetto, ancora modificabile.
- **Da verificare:** parte indispensabile che richiede una prova successiva.

L'allegato contiene affermazioni precedenti su altri prodotti, distribuzione iOS e sicurezza. Sono contesto, non evidenze utilizzate per decidere questo MVP. Le pagine HIG Apple visitate con il lettore web richiedono JavaScript; le regole pratiche di design qui usate provengono dai riferimenti locali Axiom, non da una lettura diretta completa di quelle pagine.
