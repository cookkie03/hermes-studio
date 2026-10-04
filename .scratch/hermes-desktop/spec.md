# Hermes Studio — sviluppo per feature v0.3

Stato: documentazione pronta per selezione; implementazione di nuove feature sospesa su richiesta utente. D19–D23 e ADR0006 prevalgono. Baseline precedente: spec-opendots-v0.2.md; baseline iniziale: spec-initial-baseline.md.

## Prodotto

Applicazione macOS per assistente personale e progetti, disposizione OpenDots con Spaces, Dots, conversazioni e Computer. Componenti e gerarchia prendono spunto da Unsloth e Codex. Hermes è l'unico runtime degli agenti e strumenti. Repository indipendente; nessun progetto di fork o aggiornamento automatico upstream.

## Consegna attuale

MVP essenziale parzialmente funzionante preservato, catalogo docs/features/README.md con 19 schede e prompt pronti per chat dedicate, principi architetturali e review. Non implementare le feature documentate in questa fase. La feature F12 contiene il percorso GitHub/release/DMG da sviluppare separatamente.

## Storie e gate

L'utente sceglie una feature per chat; ogni chat conosce ambito, dipendenze, fonti, file condivisi e criteri di completamento. Routine e collaborazione hanno schede prioritarie. Nessuna UI dichiara capacità non confermata; prove sintetiche e live sono distinte. Preservare dati/credenziali, non importare archivi personali. Dati locali e metadati Hermes restano distinti.

## Percorso

Leggere docs/project/feature-development-plan.md, STATUS, MEMORY, GLOSSARY, ADR0006 e la scheda selezionata. Nessun refactor globale: candidate review prima, approfondimento di un module solo quando pertinente. Nuove release e chiamate telefoniche richiedono una chat esplicitamente dedicata.

## Revisione D25–D29 dopo F00

F00 completata; implementazione nuove feature ancora non selezionata. Spaces ora folder-backed F03/F10 (ADR0007), avatar scegliibili F04-A, browser unico persistente condiviso utente/Hermes F08, memoria profilo e Markdown Space F15, vocali e vocal chat in-app F13. Telefonate future separate. Fonti memoria ufficiali e confronto sorgente in docs/research/hermes-memory-system.md. Specifiche implementative definitive da delimitare nella singola chat; nessuna migrazione automatica.

D30: preservare capacità e memoria native Hermes, mostrarle e seguirne aggiornamenti nella UI tramite F18. La memoria resta backend, viewer e ricevute sono proiezioni; F15 Space/legacy distinto. Nessuna implementazione automatica.
