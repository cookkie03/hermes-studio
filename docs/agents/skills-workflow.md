# Skill e percorso di lavoro

Percorso operativo corrente per una feature: [feature-workflow](feature-workflow.md). Elenco completo verificato sul disco: [skills-catalog](skills-catalog.md). Le 18 schede contengono ora skill principali, rami condizionali e file da leggere. Le sezioni sotto conservano il setup e i percorsi storici; prevalgono D19–D23 e ADR0006.

Setup progetto: 2026-10-04. Skill locali in `.agents/skills/`; Hermes Agent ha collegamenti in `.hermes/skills/`. Per Codex la directory `.agents/skills/` è il punto di lettura. La lettura esplicita permette l'applicazione in questa chat; non è stato verificato un comando slash hot-reloaded nell'interfaccia.

## Percorso scelto con ask-matt

Questo è un progetto nuovo su più sessioni, ma la prima versione è delimitata: assistente personale e progetti. Il percorso è chiarimento con documenti → spec → ticket verticali → implementazione per ticket → review → retro. Una `wayfinder` completa non è necessaria ora: l'incertezza principale è concentrata nella scelta del client e nell'integrazione, registrate nel ticket 01.

| Momento | Skill | Output |
|---|---|---|
| Scelta del flusso | ask-matt | Percorso adatto alla fase |
| Setup repository | setup-matt-pocock-skills | Tracker e documenti di dominio |
| Chiarimento | grill-with-docs + grilling + domain-modeling | Requisiti, glossario, ADR |
| Studio delle reference | ux-extract | Pattern con evidenze e limiti |
| Design Apple | axiom-design | Gerarchia, componenti, motion |
| Sintesi | to-spec | Spec sul tracker |
| Suddivisione | to-tickets | Un file per ticket e blocking edges |
| Piano dopo revisione del design | writing-plans | Piano dettagliato per l'ambito approvato |
| Implementazione | implement + tdd + codebase-design | Comportamenti verificati per un ticket |
| UI nativa | axiom-swiftui | Implementazione macOS dopo scelta dello stack |
| Accessibilità | axiom-accessibility | Verifica VoiceOver, tastiera, motion, contrasto |
| Chiusura del lavoro | code-review + pr | Review e descrizione PR quando esiste un remote |
| Continuità / apprendimento | handoff + retro | Passaggio di contesto e miglioramento del workflow |
| Documenti per agenti | writing-for-agents | Istruzioni e riferimenti leggibili |

## Stato delle fondazioni

Ricerca e proposta scritta sono autorizzate dalla richiesta dell'utente. Spec e backlog di questo setup sono bozze concrete per la revisione. Prima del codice prodotto completare la revisione del design e del piano prevista dal percorso `brainstorming`; questa fase non installa dipendenze dell'app né avvia implementatori.

Il setup locale adotta AGENTS.md perché la collaborazione richiesta è in Codex. I default sono documentati e modificabili; non è stato creato un servizio esterno. Le istruzioni dell'utente su autonomia e setup prevalgono sulle domande di configurazione predefinite delle skill.

## Riproducibilità dell'installazione

I comandi sono stati eseguiti tramite Bash e CLI skills.sh a livello di progetto; gli esiti sono conservati nel lockfile e verificabili leggendo i `SKILL.md`.

```bash
npx skills@latest add mattpocock/skills \
  --skill ask-matt setup-matt-pocock-skills grill-with-docs grilling \
  to-spec to-tickets implement tdd code-review domain-modeling \
  codebase-design handoff pr retro writing-for-agents \
  --agent codex hermes-agent --yes

npx skills@latest add charleswiltgen/axiom \
  --skill axiom-swiftui axiom-accessibility \
  --agent codex hermes-agent --yes

npx skills@latest add obra/superpowers --skill writing-plans \
  --agent codex hermes-agent --yes
```

`ux-extract`, `axiom-design` e `find-skills` erano già presenti e sono stati preservati. Non serve installare l'intero catalogo. Le skill orientano il lavoro; non concedono accesso a provider o dati del runtime.

## Aggiornamento nativo

2026-10-04: aggiunte e lette axiom-macos, liquid-glass da OpenAI, swiftui-expert-skill da AvdLee e swiftui-liquid-glass da Dimillian. Totale 25 skill. Applicazione e confronto in docs/design/native-reorientation.md. Il percorso OpenAI esatto è:

```bash
npx skills@latest add https://github.com/openai/plugins/tree/main/plugins/build-macos-apps/skills/liquid-glass --skill liquid-glass --full-depth --agent codex hermes-agent --yes
```

Le tre altre installazioni hanno usato i repository raccomandati e gli stessi agenti. Istruzione utente esplicita di iniziare lo sviluppo ricevuta dopo l'analisi; nessuna nuova conferma richiesta per il piano locale.

## Direzione attuale D14–D18

Il blocco fondazioni sopra descrive il setup iniziale. Sviluppo autonomo è stato successivamente autorizzato; non resta una nuova approvazione per iniziare il codice. Specv0.2 e piano OpenDots desktop sostituiscono la UI SwiftUI precedente. Skill native conservate per componenti futuri: non applicare LiquidGlass al renderer se altera il riferimento autorevole. Prove e gap effettivi in docs/project/skill-audit.md e desktop-acceptance.md.
