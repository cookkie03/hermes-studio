# Registro delle decisioni di Hermes Studio

Consolidato 2026-10-04. Questo file registra le decisioni utente; [MEMORY](MEMORY.md) è il riepilogo operativo, [STATUS](STATUS.md) contiene esiti e gate, [WORKLOG](WORKLOG.md) la cronologia delle prove. Le righe storiche non autorizzano lavoro corrente. Ultima direzione: D19–D31; [ADR0006](../adr/0006-feature-by-feature.md), [ADR0007](../adr/0007-folder-backed-spaces.md) e schede specificano le conseguenze.

## Decisioni operative

| ID | Decisione conservata | Applicazione corrente |
|---|---|---|
| D01 | Assistente personale e progetti, oltre il coding | Visione prodotto |
| D02 | Persistenza continua su file dopo blocchi significativi | MEMORY/STATUS/WORKLOG e documenti interessati |
| D06 | Avatar illustrati, movimento mirato | F7-A e component-system |
| D07 | Team, documenti e strumenti nello stesso workspace | Visione; incrementi per feature |
| D08 | Primo percorso ricerca e scrittura | F2/F6/F12/F5/F1, non parità già completata |
| D10 | Collegamento al runtime Hermes esistente, dati personali preservati | F1, prove isolate |
| D11 | frontend-design per direzione artistica | Linguaggio attuale OpenDots, atelier precedente storico |
| D12 | PM/orchestrazione durante sviluppo autorizzato | Ownership e integrazione; delega nei limiti della chat |
| D13 | Commit e push periodici verificati | git-workflow; release separata |
| D14 | Esperienza/layout OpenDots del riferimento utente | Screenshot autorevole, non dati demo reali |
| D15 | App macOS installabile DMG/release, niente devserver per l'utente | Stack Electron scelto ADR0005; distribuzione F13 |
| D16 | Repository indipendente e storia preservata | Provenienza MIT; aggiornamenti esterni non in piano |
| D17 | Telefonate al cellulare e specialisti fra idee future | docs/future, ripresa solo su scelta |
| D19 | Componenti/gerarchia/motion anche da Unsloth/Codex | component-system, evidenze distinte da proposte |
| D20 | Una feature per chat; fermare sviluppo automatico globale | Catalogo F0–F18, scelta utente dell'incremento |
| D21 | Annullare repository derivata/sincronizzazione upstream | Repository indipendente; attribuzioni preservate |
| D22 | Bots, collaborazione, routine, plugin e strumenti con schede proprie | Contratti Hermes, esiti reali e ownership |
| D23 | Software GitHub/DMG in chat dedicata; niente refactor automatico | F13 e principi architetturali |
| D24 | Skill e file da leggere in tutte le schede; catalogo progetto/globali | feature-workflow e skills-catalog, disponibilità distinta da uso |
| D25 | Spaces collegati a cartelle reali con file visibili e accesso specialisti scoped | F6/F5/ADR0007; dati legacy preservati |
| D26 | Scelta avatar OpenDots in Create/Edit Dot | F7-A locale, distinta da binding runtime F7-B |
| D27 | Browser unico visibile, manuale/agente, cookie/storage/history persistenti | F12; trasporto e persistenza ancora da verificare |
| D28 | Memoria Markdown Space e analisi completa memoria Hermes | F9 file Space, report memoria e F8 viewer runtime |
| D29 | Dettatura/vocali/TTS/vocal chat in-app | F17; telefonate separate future |
| D30 | Preservare tutte le capacità/memorie Hermes e mostrarne gli aggiornamenti | F8; Hermes autoritativo, UI derivata senza doppio archivio |
| D31 | Rinumera schede e ID F0–F18 secondo l’ordine di sviluppo concordato | [Corrispondenza](../features/numbering-2026-10-04.md); F1 runtime come prossimo passo consigliato, implementazione non avviata |

## Decisioni storiche superate

| ID | Direzione iniziale | Superata o delimitata da |
|---|---|---|
| D03 | Avvio SwiftUI/macOS e skill native | ADR0005 per prodotto Electron; codice/prove nativi preservati |
| D04 | Carattere espressivo, agenti caratterizzati | D14 definisce il layout; avatar espressivi compatibili |
| D05 | Team principale, chat secondaria | D14 screenshot OpenDots |
| D09 | Workspace ordinato team/incarico e strumenti | D14/D25; nessuna stanza 3D richiesta |
| D18 | Continuazione autonoma durante la notte | D20 e ADR0006 sospendono sviluppo globale |

La rinumerazione D31 cambia identificativi e ordine, non comportamento delle feature. Dettaglio e origine delle formulazioni iniziali: [memoria storica](MEMORY.history-2026-10-04.md) e WORKLOG. I gate tecnici delle decisioni stanno nelle schede, non in questo registro.
