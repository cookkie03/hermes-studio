# Skill per il gusto nel design di applicazioni

Ricerca: 2026-10-04. Stato: **raccomandate, non installate**. Fonti: repository originali e catalogo skills.sh verificati durante questa ricerca. I numeri sono uno snapshot, non una prova di qualità del risultato.

## Esigenza di Hermes

L'utente ha scelto un carattere espressivo, agenti più caratterizzati e una vista team principale con chat secondaria. Serve una skill che aiuti a scegliere gerarchia, identità e comportamenti del prodotto; una skill soltanto per landing page non risponde alla richiesta. La piattaforma resta macOS nativa: Axiom governa convenzioni desktop, SwiftUI e materiali Apple.

## Candidati verificati

| Skill | Adozione osservata | Utilità per Hermes | Limite |
|---|---|---|---|
| **interface-design**, Dammyjay93 | skills.sh: 28,4K installazioni; API GitHub: 5.759 stelle | Prima scelta per definire una firma visiva e una gerarchia specifiche del prodotto. Scope dichiarato: dashboard, strumenti, impostazioni e prodotti interattivi; esclude marketing. | Molti esempi e valori sono web/CSS. Trasferire il ragionamento, senza portare componenti HTML o prescrizioni di font sul Mac. |
| **impeccable**, pbakaus | skills.sh: 310,6K installazioni; API GitHub: 75.375 stelle | Complemento per critique, polish, bolder/quieter, layout e copy. Distingue il modo Operate per app e strumenti e rispetta il brief scelto. | Tooling di iterazione e detector prevalentemente browser; i riferimenti native attuali coprono iOS/Android/adaptive, senza una guida macOS dedicata nel tree verificato. |

### Interface Design

Prima del codice richiede di identificare persona, compito e sensazione desiderata, poi esplorare dominio, colori, elemento distintivo e default da evitare. Rende esplicite le decisioni di composizione e favorisce un sistema persistente. Questo è pertinente al cambio di Hermes verso team e agenti riconoscibili.

Alcune prescrizioni generiche — sidebar dello stesso colore del canvas, evitare font di sistema come default, scale in pixel — non vanno applicate automaticamente a macOS. La scelta esplicita di San Francisco, dei controlli di sistema e del Liquid Glass rimane valida quando sostenuta da Axiom e dal brief.

### Impeccable

La skill offre 24 comandi e una separazione tra contesto prodotto e direzione visiva. Nel modo Operate, scanabilità, coerenza e aspettative native precedono l'espressione ornamentale. Il brief esplicito ha priorità sui divieti stilistici generici.

Il launcher può scaricare un binario al primo utilizzo. Non è stato eseguito in questa ricerca. Le regole deterministiche del detector non sono una verifica SwiftUI. Per macOS, usare critique/polish come metodo visivo e Axiom Accessibility/macOS come verifica della piattaforma.

## Raccomandazione

Adottare **interface-design** per la direzione del prodotto; aggiungere **impeccable** se serve un vocabolario di revisione e rifinitura. Nessuna sostituisce Axiom Design, macOS, SwiftUI, Accessibility o la guida Liquid Glass di OpenAI. Non applicare contemporaneamente regole divergenti: prima brief e convenzioni macOS, poi principi di craft compatibili.

Applicazione proposta, ancora da progettare: il team è il punto focale; nome, responsabilità e lavoro attuale rendono gli agenti riconoscibili; colore e ritratto aiutano l'identità senza diventare l'unico indicatore di stato. La conversazione si apre sul lavoro selezionato. La personalità deve aiutare a leggere le responsabilità, non simulare attività del backend.

## Installazione eventuale a livello di progetto

```bash
npx --yes skills@latest add Dammyjay93/interface-design --skill interface-design --agent codex hermes-agent --yes
npx --yes skills@latest add pbakaus/impeccable --skill impeccable --agent codex hermes-agent --yes
```

Comandi proposti, **non eseguiti**. Dopo l'installazione leggere le istruzioni e i riferimenti necessari prima di applicarli.

## Evidenze primarie

- [Interface Design su skills.sh](https://www.skills.sh/dammyjay93/interface-design/interface-design).
- [SKILL originale, commit verificato](https://github.com/Dammyjay93/interface-design/blob/2f9be3206855bcb2d1d0af262c8bae25cba6658d/.claude/skills/interface-design/SKILL.md).
- [Metadati repository Interface Design](https://api.github.com/repos/Dammyjay93/interface-design).
- [Impeccable su skills.sh](https://www.skills.sh/pbakaus/impeccable/impeccable).
- [SKILL originale per Codex, commit verificato](https://github.com/pbakaus/impeccable/blob/e103efe779e2dd01274dabae83531fef00bf2563/.agents/skills/impeccable/SKILL.md).
- [Audit native Impeccable](https://github.com/pbakaus/impeccable/blob/e103efe779e2dd01274dabae83531fef00bf2563/skill/reference/audit.native.md).
- [Metadati repository Impeccable](https://api.github.com/repos/pbakaus/impeccable).

Leaderboard e ricerca CLI iniziali eseguiti dall'agente principale. I candidati frontend-design di Anthropic e design-taste-frontend di leonxlnx non sono stati approfonditi qui: il primo è più generale e il secondo ha scope orientato alle landing page nel riscontro iniziale. Nessuna valutazione negativa della loro qualità è implicata.
