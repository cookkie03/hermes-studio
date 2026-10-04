# ADR0006 — MVP essenziale e sviluppo una feature per chat

Data: 2026-10-04. Stato: accettata per istruzione esplicita dell'utente. Supera il piano di implementazione automatica integrale D14–D18; conserva stack e lavoro verificato dell'ADR0005.

## Contesto

Luca vuole scegliere ogni feature in una chat Codex dedicata. La base deve essere piccola e mantenibile, con UI OpenDots e componenti Unsloth/Codex. Le funzionalità Hermes vanno adattate attraverso contratti reali, non replicate sulla base di nomi o schermate.

## Decisione

Catalogo canonico docs/features/README.md, una scheda autonoma per feature con prerequisiti, scope, stati, dati, ownership, fonti, gate e prompt di handoff. Il lavoro corrente produce documenti e una baseline MVP con limiti dichiarati. Nessuna nuova feature, refactor o pubblicazione automatica. La repository resta indipendente; ritirata la manutenzione di una derivazione della repository di riferimento. Conservare attribuzioni MIT del codice riusato.

Collaborazione Bots/Dots e routine sono feature esplicite. Release GitHub con DMG è F12, selezionabile come le altre; artefatto locale esistente non equivale a pipeline/release pubblicata.

## Alternative

Continuare l'implementazione notturna di tutte le capacità: respinta dall'ultima istruzione. Riscrivere subito la codebase per cartelle feature: non richiesto; prima review dei module e scelta di un incremento che migliori locality. Collegare UI a un secondo executor: incompatibile con l'uso degli strumenti Hermes.

## Conseguenze

Preservare il codice attuale, separare osservazioni e proposte, non marcare la visione completa come finita. Le chat future leggono questa decisione prima dei piani storici. Ciascuna feature può essere consegnata/revertita/verificata senza implicare completamento delle altre.
