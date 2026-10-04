> Ricerca storica della fase nativa. Stack corrente Electron e stato delle skill nel [workflow/catalogo](../agents/skills-workflow.md); risultati e numeri sotto restano uno snapshot, non istruzioni attive.

# Skill per Hermes macOS e Liquid Glass

Ricerca del 2026-10-04 tramite find-skills: leaderboard skills.sh, CLI Bash `npx skills@latest find 'liquid glass'`, schede e sorgenti. App in attesa su richiesta utente. Nessuna nuova installazione: 21 skill presenti. Scelta dello stack ancora aperta.

## Raccomandazione per un client nativo

| Skill | Uso | Stato |
|---|---|---|
| axiom-design | HIG, gerarchia, materiali e Liquid Glass | Già presente |
| axiom-swiftui | Stato, navigazione, layout, composizione, animazioni e debugging | Già presente |
| axiom-accessibility | Tastiera, VoiceOver, contrasto e preferenze accessibilità | Già presente |
| axiom-macos | Finestre, menu, AppKit, sandbox, distribuzione e differenze desktop | Prima aggiunta consigliata |
| liquid-glass — openai/plugins | Adozione e revisione Liquid Glass specifica per macOS | Aggiunta mirata consigliata |
| swiftui-liquid-glass — dimillian/skills | Guida compatta alle API glass, orientata a iOS | Alternativa, sovrapposizione con Axiom |
| swiftui-expert-skill — avdlee/swiftui-agent-skill | Revisione e implementazione SwiftUI, performance, API moderne | Seconda opinione, ampia sovrapposizione |
| axiom-testing | Router indicato da SwiftUI per problemi dei test UI | Valutare durante implementazione |
| axiom-swift / axiom-concurrency | Linguaggio e concorrenza del client | Valutare dopo scelta stack |

Design contiene già `skills/liquid-glass.md`, `liquid-glass-ref.md` e `liquid-glass-auditor.md`: non occorre installare singolarmente le vecchie skill glass. SwiftUI gestisce l'interfaccia; Swift riguarda la logica e il linguaggio, non sostituisce Design. I router locali sono stati letti; testing e concurrency non sono stati esaminati integralmente in questo blocco.

La guida OpenAI parte dalle strutture e dai controlli standard macOS, poi dalle superfici glass personalizzate. È particolarmente pertinente per sidebar, toolbar e inspector di Hermes. Questa è una raccomandazione, non una verifica su app costruita; le API andranno controllate contro SDK e deployment target reali. Skill SwiftUI non decidono automaticamente la scelta rispetto al client web upstream.

## Evidenze di adozione e qualità

Contatori indicativi e variabili; non equivalgono a qualità verificata:

- Axiom: repository circa 1.2K stelle; macOS circa 1.1K installazioni.
- OpenAI Liquid Glass: 66 installazioni; repository ufficiale circa 7.3K stelle. Bassa adozione, ma provenienza verificata e SKILL.md letto integralmente.
- Dimillian: CLI circa 5K installazioni, scheda web 4.7K, circa 4K stelle. Conservata la discrepanza tra rilevazioni. Sorgente letto: esempi e disponibilità impostati su iOS.
- AvdLee: circa 33.7K installazioni e 3.6K stelle secondo scheda. Scheda letta; link ipotizzato al SKILL.md restituisce 404, verifica diretta incompleta.

Risultati Shopify Liquid e GPU esclusi perché fuori contesto. Nessun audit indipendente o test di prodotto svolto.

## Fonti

- [Axiom macOS sorgente](https://github.com/charleswiltgen/axiom/blob/main/axiom-codex/skills/axiom-macos/SKILL.md), [contatori](https://www.skills.sh/charleswiltgen/axiom/axiom-macos).
- [OpenAI Liquid Glass sorgente](https://github.com/openai/plugins/blob/main/plugins/build-macos-apps/skills/liquid-glass/SKILL.md), [contatori](https://www.skills.sh/openai/plugins/liquid-glass).
- [Dimillian sorgente](https://github.com/Dimillian/Skills/blob/main/swiftui-liquid-glass/SKILL.md), [scheda](https://www.skills.sh/dimillian/skills/swiftui-liquid-glass).
- [AvdLee scheda](https://www.skills.sh/avdlee/swiftui-agent-skill/swiftui-expert-skill).
- Guide locali: `.agents/skills/axiom-design/SKILL.md`, `.agents/skills/axiom-swiftui/SKILL.md`.

## Comandi pronti, non eseguiti

```bash
npx skills@latest add charleswiltgen/axiom --skill axiom-macos --agent codex hermes-agent --yes
npx skills@latest add openai/plugins --skill liquid-glass --agent codex hermes-agent --yes
```

Alternative facoltative:

```bash
npx skills@latest add dimillian/skills --skill swiftui-liquid-glass --agent codex hermes-agent --yes
npx skills@latest add avdlee/swiftui-agent-skill --skill swiftui-expert-skill --agent codex hermes-agent --yes
```
