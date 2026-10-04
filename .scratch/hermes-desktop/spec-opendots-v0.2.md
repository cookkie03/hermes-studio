> Archivio storico, superato dalla spec v0.3 e ADR0006; non autorizza implementazione.

# Hermes Studio — OpenDots desktop v0.2

Status: ready-for-agent. 2026-10-04. Prodotto Luca; coordinamento Codex. Decisioni D14–D18 prevalgono. Baseline precedente conservata in spec-initial-baseline.md.

## Problem Statement

Luca vuole l’esperienza esatta mostrata nello screenshot OpenDots, disponibile come applicazione macOS installabile. Vuole ritrovare agenti, conversazioni, documenti e memoria nello stesso posto e utilizzare i propri strumenti Hermes, senza avviare un dev server o configurare un provider CopilotKit separato.

## Solution

Applicazione desktop con sidebar Spaces/Dots, chat principale e pannello Computer affiancato. I risultati diventano pagine persistenti nello Space; la revisione precede il salvataggio quando richiesto. Hermes continua a eseguire gli strumenti e fornire stati reali, mentre il client gestisce UI e documenti senza ricostruire un secondo agente.

## User Stories

1. Come utente voglio installare una .app dal DMG, per aprire Hermes come le altre app Mac.
2. Voglio stessa disposizione, colori, densità e avatar del riferimento OpenDots, per avere l’esperienza scelta.
3. Voglio Spaces separati dai Dots, per distinguere documenti dagli agenti.
4. Voglio creare uno Space e una pagina, per organizzare la ricerca.
5. Voglio scrivere e ritrovare il documento dopo riapertura, per non perdere il lavoro.
6. Voglio essere avvisato di una revisione cambiata, per evitare overwrite silenziosi.
7. Voglio creare e riconoscere un Dot con istruzioni, per affidargli un compito preciso.
8. Voglio conversazioni associate a quel Dot e accesso ai documenti pertinenti.
9. Voglio collegare il runtime Hermes locale esistente, senza inserire chiavi di un altro backend.
10. Voglio vedere subito il messaggio inviato e distinguere attesa/accettazione/esito incerto.
11. Voglio leggere delta e risultato finale Hermes, per seguire il lavoro reale.
12. Voglio conservare la bozza se invio o connessione falliscono, senza retry automatico.
13. Voglio interrompere esplicitamente un lavoro, sapendo che chiudere il client non significa interrupt.
14. Voglio approvare o rifiutare una richiesta reale, senza rispondere a una richiesta annullata.
15. Voglio vedere strumenti Hermes browser/search/files/shell e risultati con provenienza, non azioni simulate.
16. Voglio il pannello Computer e controlli disponibili solo dove il runtime li supporta.
17. Voglio revisionare un risultato e salvarlo nello Space scelto, con collegamento alla conversazione.
18. Voglio gestire memoria persistente e sapere se è condivisa con Hermes o solo nell’app.
19. Voglio Settings pertinenti a Hermes, senza obbligo di Intelligence/OpenAI Voice per la chat.
20. Voglio riaprire l’app e recuperare chat/documenti/bozze senza confondere ID locali e runtime.
21. Voglio navigare con tastiera e leggere UI in finestre più strette senza sovrapposizioni.
22. Voglio distinguere capacità future e disponibili, per non aspettarmi telefonate o takeover non implementati.
23. Voglio che il client termini solo i processi che possiede, preservando il runtime Hermes.
24. Voglio un artefatto di release con limiti di firma/notarizzazione dichiarati e verifiche riproducibili.

## Implementation Decisions

Riusare frontend/componenti/asset OpenDots MIT fissati a versione con provenienza. Electron contiene il runtime Node per un servizio locale autenticato e un renderer isolato. Metadata Spaces/Dots/pagine/memorie separati dall’archivio personale Hermes. Bridge al gateway JSON-RPC WebSocket attach-first, con REST/SSE verso UI; token solo memoria, loopback e nessun bypass authgate. Strumenti eseguiti solo dal runtime Hermes. Manteniamo codice SwiftUI storico, senza usarlo come nuovo layout.

## Testing Decisions

Verificare comportamenti attraverso servizio HTTP e app confezionata, con dati sintetici e directory temporanee. Riutilizzare test upstream di editor/pagine/autosave/metadata. Fixture gateway per streaming, errore, richieste e disconnessione, distinguendole dalle prove live. Smoke completo chat/documento/memoria/reopen; confronto screenshot desktop e finestra stretta. La prova di handshake non chiude il gate chat.

## Out of Scope

Telefonate e voce realtime al cellulare, specialisti Codex, automatic delegation multi-Dot, derivazione della repository e manutenzione upstream automatica. Non promettere 24h prima di una prova durata24h, né notarizzazione senza credenziali di firma. Queste idee restano in docs/future.

## Further Notes

Screenshot utente salvato e hash verificato è riferimento autorevole anche se upstream main è cambiato. Proposta di derivazione annullata da D21. Per file/firme precise usare piano attivo e acceptance matrix; non considerare tutta la visione iniziale esaurita da un primo artefatto desktop.
