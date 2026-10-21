# Proposta di Redesign Hermes Studio — Sintesi

## Direzione C approvata — 2026-10-19

Luca: «Direi di procedere con questa e poi al massimo applichiamo delle migliorie». C è la base selezionata per l'implementazione visuale nel prodotto, con affinamenti successivi. [Prompt 04](../../project/prompts/04-implement-direction-c.md) pronto per l'agente scelto da Luca; nessuna implementazione eseguita da questa chat. Le raccomandazioni e i gate elencati sotto sono storia delle proposte: OpenClaw voce e provider futuri restano task separati.

Il report C è evidenza delle dichiarazioni dell'altro agente, non nuova verifica live di questa chat. Ispezione del sorgente: assenti regole esplicite @media/prefers-reduced-motion e gestione keydown/scrollHeight; chiusura inspector su span e chip div. Accessibilità, responsive, autosize e contrasto devono essere verificati nel prodotto senza riaprire la scelta visiva.

## Esito revisione utente — 2026-10-19

Luca sceglie colori/forme e pannello sinistro di A; pannello destro e funzionalità della textbox prompt di B; compattazione dei tool dell'agente di A. Entrambe le proposte non raggiungono ancora la qualità UX premium percepita nei riferimenti Unsloth, ChatGPT/Codex e Humla. Base ibrida selezionata, design finale e implementazione non approvati. Prossimo passo: [incarico di affinamento](../../project/prompts/03-design-refinement.md), non creazione automatica di un altro task implementazione.

La raccomandazione originale sotto resta conservata come proposta storica. OpenClaw è reference browser/voce e non dipendenza obbligatoria del redesign. Hermes è l'unico backend attuale: nessuna migrazione di provider multipli richiesta. La parola SwiftUI nel feedback descrive qualità percepita, non una decisione di riscrittura.

## Direzioni Visive
- **Direzione A (Warm Editorial):** Stile Humla con cream paper, Hanken Grotesk, gold accent. Adatto per meeting notes, interfaccia amichevole, focus su contenuti e conversazione.
- **Direzione B (Graphite Technical):** Stile tecnico con SF Pro, DM Mono, grigio scuro su bianco. Adatto per backend, configurazione, strumenti tecnici, focus su efficienza e chiarezza.

## Raccomandazione
**Scegliere Direzione A** come base per il redesign completo. Motivi:
1. Allinea alla direzione Humla già adottata come riferimento.
2. Offre calore e accessibilità per l'utente finale.
3. Mantiene coerenza con l'identità visiva OpenDots.
4. Il fallback tecnico (Direzione B) può essere usato per pannelli interni o modalità developer.

## Gate Mancanti
- Validazione dei token colore e contrasto WCAG 2.1.
- Test di navigazione su dispositivi mobili.
- Integrazione con OpenClaw per funzionalità voce.
- Migrazione graduale dei provider backend esistenti.

## Prove e Limiti
- Estrazioni Unsloth e componenti desktop usate come riferimento.
- Codex REA statico, non prova di UX live.
- Humla 0.69.1 osservato solo in Settings, non audit completo.
- Nessuna prova di motion o animazioni.

## Prossimi Passi
1. Luca sceglie la direzione preferita.
2. Creare task implementazione in Todoist.
3. Avviare il goal di implementazione su un altro agente.

**File prodotti:**
- docs/design/redesign-proposals/direction-a-warm-studio.html
- docs/design/redesign-proposals/direction-b-graphite-technical.html
- docs/design/redesign-proposals/recommendation-summary.md
