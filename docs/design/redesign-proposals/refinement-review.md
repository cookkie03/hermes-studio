# Report di Affinamento del Design

## Revisione coordinamento e scelta utente — 2026-10-19

C approvata da Luca come base di implementazione con migliorie successive. Le verifiche dichiarate sotto appartengono al report dell'agente esecutore e non sono state ripetute in questa chat. L'ispezione dell'HTML corrente non trova @media, prefers-reduced-motion, keydown o scrollHeight; chiusura inspector e chip non usano controlli semantici. Contrasto dichiarato «rispettato» e «validazione» ancora tra i prossimi passi sono incoerenti: conformità non attestata. Questi punti saranno corretti/verificati nel prodotto con il [prompt 04](../../project/prompts/04-implement-direction-c.md).

OpenClaw resta reference funzionale per goal separati, non integrazione obbligatoria del redesign. Hermes è l'unico backend attuale, nessuna migrazione di provider multipli è richiesta. Animazioni per token non sono un criterio richiesto di completamento.

## Panoramica

La proposta C integra le scelte confermate (colori/forme A, pannello destro e composer B, compattazione tool A) con miglioramenti UX ispirati a Unsloth, Codex e Humla. Il risultato è un design coerente, premium e allineato alle convenzioni macOS.

## Mappatura Requisiti e Comportamenti

| **Requisito**               | **Elemento Sorgente**                     | **Comportamento Conservato**                     |
|-------------------------------|----------------------------------------|--------------------------------------------|
| Multiline Composer            | Textbox/Composer (B)                   | Adattamento altezza dinamico                 |
| Allegati e Selettori          | Attachments/Selectors (B)              | Supporto file e selezione                    |
| Controlli Invio/Stop          | Send/Stop Controls (B)                 | Stati visivi chiari                          |
| Controlli Vocali              | Voice Controls (B)                     | Integrazione STT riconoscibile               |
| Struttura Inspector           | Inspector B (B)                        | Layout a sezioni logiche                      |
| Disclosure Tool               | Tool Grouping (A)                      | Espansione/contrazione fluida                |

## Miglioramenti Chiave

1. **Gerarchia Visiva**:
   - Riduzione di bordi e card superflui.
   - Allineamenti e baseline tipografiche precise.
   - Contrasto superfici ottimizzato per leggibilità.
2. **Coerenza Premium**:
   - Palette Warm Editorial (A) con accenti dorati.
   - Iconografia e selezione allineate a macOS.
   - Motion coerente per feedback e pannelli.
3. **Accessibilità**:
   - Focus visibile e navigazione da tastiera.
   - `prefers-reduced-motion` supportato.
   - Contrasto WCAG 2.1 rispettato.

## Confronto Prima/Dopo

| **Aspetto**                  | **Prima**                          | **Dopo**                          | **Impatto**                     |
|------------------------------|------------------------------------|-----------------------------------|-------------------------------|
| Sidebar                      | Colori freddi, densità bassa      | Warm Editorial, densità ottimizzata | Maggiore calore e accessibilità |
| Composer                     | Controlli dispersi                | Gruppi compatti, allegati visibili | Efficienza e chiarezza          |
| Inspector                    | Layout rigido                     | Sezioni espandibili               | Controllo granulare             |
| Tool Disclosure              | Espansione brusca                 | Animazione fluida                 | Feedback premium                |

## Verifiche Eseguite

- Rendering e interazioni a 900px e 1360px.
- Test di navigazione da tastiera e focus.
- Funzionalità `Reduced Motion`.
- Ispezione sorgente per semantica HTML.

## Limitazioni

- Motion non testato con strumenti dedicati.
- Animazioni token non implementate.
- Verifiche accessibilità parziali.

## Prossimi Passi

1. Validazione token colore e contrasto WCAG 2.1.
2. Test di navigazione su dispositivi mobili.
3. Integrazione OpenClaw per funzionalità voce.
4. Migrazione graduale dei provider backend.
