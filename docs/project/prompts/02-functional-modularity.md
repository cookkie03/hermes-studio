# Prompt 02 — architettura modulare

Da usare dopo aver riportato il risultato del primo incarico e selezionato questo blocco con Luca.

```text
Lavora in /Users/luca/Documents/ChatGPT/Hermes App 2. Obiettivo di questo incarico: proposta tecnica revisionabile per rendere la modularità funzionale il paradigma di Hermes Studio e consentire backend futuri con adattatori delimitati. Hermes è l'unico backend da mantenere implementato: nessun altro agente/provider richiesto.

Leggi AGENTS.md, docs/project/MEMORY.md, STATUS.md, GLOSSARY.md, docs/project/redesign-roadmap-2026-10-18.md, docs/agents/feature-workflow.md, docs/architecture/feature-boundaries.md, gli ADR pertinenti e le skill codebase-design/domain-modeling prima di applicarle. Controlla lo stato Git e preserva modifiche concorrenti.

Ricostruisci dal sorgente i confini reali: renderer React, API/metadata, trasporto/connessioni, adapter Hermes, Electron e capacità native. Cita file e linee; individua dove gli identificatori o contratti Hermes attraversano UI/storage. Distingui backend provider, host, profilo, sessione, Space e capability.

Proponi moduli funzionali coesi e contratti pubblici piccoli, con dependency direction e composition root espliciti. Conserva le estensioni native Hermes attraverso capacità opzionali ben tipizzate; evita un'interfaccia universale con metodi vuoti, un framework di plugin dinamico o riscritture senza un seam concreto. Definisci stati di capability unavailable/unsupported/offline e i contratti di stream, errori, cancellazione e autorizzazioni senza appiattirne differenze o scope. Chiusura UI, disconnessione e cancellazione lavoro restano distinti.

Confronta almeno due approcci e raccomanda il più piccolo che riduce il coupling reale. Produci ADR con stato proposed, mappa requisiti→modulo→file→contratto→test, e sequenza di slice reversibili. Definisci una prima slice su un seam reale e una prova contrattuale sintetica: sostituibilità a test senza aggiungere un secondo backend prodotto. Valuta riuso desktop/web senza decidere una migrazione Tauri per ragioni estetiche. F0–F3 restano protette; se la slice richiede un loro cambiamento, rendilo esplicito come dipendenza da selezionare.

Aggiorna MEMORY/STATUS/WORKLOG e riferisci il risultato a Luca con percorsi, decisioni aperte e prima slice raccomandata. Arresto al design/ADR proposto: il refactor sarà un goal separato dopo la revisione. Nessuna modifica ai sorgenti prodotto, al runtime personale, alla rete, nessun commit/push/deploy né nuovo goal automatico.
```
