# Hermes Studio — redesign e modularità

2026-10-18. Brief e roadmap richiesti da Luca; proposte tecniche da valutare, nessuna implementazione prodotto eseguita in questo blocco.

## Metodo di collaborazione confermato

Aggiornamento successivo 2026-10-19: C approvata per procedere con migliorie successive. Prossimo incarico [prompt 04, implementazione prodotto](prompts/04-implement-direction-c.md), sul DES-05 già esistente. Report dell'altro agente letto; responsive/accessibilità/autosize/contrasto sono gate da verificare, non attestazioni acquisite. OpenClaw e backend futuri restano incrementi indipendenti.

Aggiornamento 2026-10-19: mockup A/B ricevuti e visti da Luca. Scelta ibrida (colori/forme/sidebar A, inspector/composer B, tool compatti A), qualità premium ancora da raggiungere. Il prossimo incarico è [affinamento design, prompt 03](prompts/03-design-refinement.md); implementazione prodotto rinviata alla revisione del risultato. Lo stato iniziale sotto è storico.

Questa chat serve a ragionare, selezionare incrementi, preparare prompt e valutare risultati. Luca incolla i prompt/goal in un altro agente sulla stessa cartella, dove dispone di più crediti. Nessun agente avviato o messaggio inoltrato automaticamente. Ogni incarico ha un risultato e un criterio di arresto; il backlog non è un goal globale di implementazione automatica. Primo incarico: [prompt ricerca design](prompts/01-design-evidence.md); secondo: [prompt modularità](prompts/02-functional-modularity.md).

## Requisiti confermati

- Ripensare completamente design e UX di Hermes Studio usando Humla, Unsloth Studio e Codex come riferimenti di qualità. La richiesta supera il precedente obbligo di fedeltà visiva OpenDots come direzione futura; il nuovo layout concreto è ancora da scegliere. Conservare capacità, dati e attribuzioni della baseline.
- Modularità funzionale come paradigma: moduli coesi, contratti piccoli, dipendenze esplicite. Separare UI e dettagli del backend; aggiungere un provider futuro deve richiedere un adapter e wiring delimitato. Hermes è l'unico backend attuale, nessun secondo agente è richiesto.
- Valutare Rust + TypeScript/Tauri con criteri misurabili, senza confondere stack e qualità della UI. Migrazione non decisa.
- Distribuzione automatizzata sul modello operativo di Hermes Agent, con DMG. Trigger e periodicità da studiare; release per ogni commit è un'ipotesi, non una decisione.
- Webapp/PWA su Debian, container Docker e accesso Tailscale. Discovery Hermes locale/remota, autenticazione e disponibilità delle capacità vanno verificate per ciascuna topologia.
- OpenClaw (`ai.openclaw.mac`, nome corretto dall'utente) è riferimento funzionale per browser integrato e ciclo voce → trascrizione → invio → risposta mostrata/letta. Pipeline STT/chat/TTS e audio realtime nativo devono restare distinti. Repository/versione e flussi ancora da verificare; nessuna scelta estetica derivata da OpenClaw.

## Skill selezionabili

Conteggi esposti da skills.sh consultati il 18 ottobre 2026: indicano diffusione, non una prova di qualità o compatibilità.

| Skill | Installazioni / stelle riportate | Ruolo proposto |
|---|---|---|
| [frontend-design, Anthropic](https://skills.sh/anthropics/skills/frontend-design) | 1,0M / 181,8K | Direzione visiva e componenti; una versione locale è già presente, equivalenza con upstream non verificata |
| [web-design-guidelines, Vercel](https://skills.sh/vercel-labs/agent-skills/web-design-guidelines) | 753,2K / 32,6K | Review di interazioni, accessibilità e implementazione |
| [ui-ux-pro-max](https://skills.sh/nextlevelbuilder/ui-ux-pro-max-skill/ui-ux-pro-max) | 402,5K / 136,9K | Supporto opzionale per token e varianti, subordinato ai riferimenti reali |

Verificati anche i repository [Anthropic](https://github.com/anthropics/skills), [Vercel](https://github.com/vercel-labs/agent-skills), [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill). Nessuna skill installata. `find-skills` usata per la ricerca; `ux-extract` per delimitare le prove; `reverse-engineer-anything` per riuso del dossier; `brainstorming` per separare proposta e implementazione; `writing-for-agents` per gli incarichi. Skill lette non equivale a workflow di implementazione completato.

## Evidenze disponibili e limiti

1. Humla 0.69.1, osservazione AX dell'app installata: Settings ha tab per funzione; Appearance offre Warm/Graphite e System/Light/Dark; il testo descrive cream paper, Hanken Grotesk e accento gold. Nessuna preferenza cambiata, registrazione avviata o nota letta. Osservazione testuale della singola schermata, non misura visuale/motion. [Sorgente pubblico](https://github.com/michaelwilhelmsen/humla): Tauri/Rust/Swift e frontend React; percentuali dei linguaggi non misurate.
2. [Unsloth](../ux-extracts/unsloth/pattern-library.md) e [componenti desktop](../ux-extracts/desktop-components/pattern-library.md): estrazioni locali storiche, con copertura e limiti dichiarati. Non ricatturate in questa chat.
3. `codex-rea/evidence-ledger.md` e `focused-analysis-overview.md`, già locali e ignorati da Git: target storico Codex 26.1007.30912, REA 6.4.0; grafo statico parziale, due bundle hanno esaurito heap. Nessuna prova runtime. Evidence statica `ev_0bd32710b9b66e5a2a62d0ebfaa81db60c36fe23ebf505d68685696dbfcbc7d9`. Query MCP `get_evidence_bundle(detail=summary, filters.evidence_id=...)` restituisce zero record nella sessione corrente: fonti sono i file salvati, non una nuova analisi. Non pubblicare bundle/codice estratto né dedurne automaticamente la UX.
4. `.github/workflows/release.yml` già esistente: push di tag `v*` o avvio manuale, build macOS arm64, DMG/manifest/checksum, smoke e release draft. Non eseguita né auditata completamente. Non prova upload/installazione, firma Apple o notarizzazione. Trigger manuale/versione/notes richiedono verifica.
5. Workflow upstream [Hermes Agent](https://github.com/NousResearch/hermes-agent/tree/main/.github/workflows) individuato, policy di rilascio e periodicità ancora da ricostruire a SHA fissata.

## Proposta da valutare

Tre strade: rifinire la shell attuale (meno rischio ma cambiamento limitato); ridisegnare i flussi con renderer condiviso desktop/web (raccomandata); riscrivere il contenitore in Tauri (solo dopo misure, maggiore rischio di integrazione). Nessuna scelta dello stack ratificata da questa proposta.

Direzione proposta: navigazione compatta e stabile, superfici sobrie, gerarchia tipografica leggibile, composer e contenuto centrali, dettagli strumenti in inspector contestuale. Stati offline/pending/errore/unsupported riconoscibili e distinti dagli esiti runtime. Palette chiara/scura da confrontare con esempi concreti. Evitare che il cambio estetico nasconda host, profilo, Space o capacità native.

Per i moduli: partire dai seam già esistenti, mantenere le estensioni Hermes dove necessarie, evitare un'interfaccia universale con metodi vuoti per ogni funzione. Provider, host, profilo e identità di sessione sono concetti distinti. Il renderer dipende dai contratti delle capacità usate; l'adapter Hermes traduce eventi/errori/cancel e mantiene gli scope. Un fake è una prova contrattuale sintetica, non un altro backend implementato.

## Todoist e ordine del lavoro

[Task padre Hermès Studio](https://app.todoist.com/app/task/6hjmXFpv5H5m3wh2), progetto e sezione esistenti preservati. Creati 13 sottotask, anche annidati nei task REA e PWA già presenti. Nessuna modifica alla vista dell'intero progetto.

| Blocco | Task ID | Dipendenze / risultato |
|---|---|---|
| DES-01 Skill | 6hp8FcX2HRq7wP55 | Shortlist disponibile sopra; installazione non richiesta |
| DES-02 Humla | 6hp8FcWFgcMVXgx5 | Primo riscontro AX; estrazione completa aperta |
| DES-03 Unsloth | 6hp8Fcfr2rWq6J55 | Completare lacune delle estrazioni |
| DES-04 Codex/REA | 6hp8FcVPPV8Jhr3X | Sotto il task REA esistente; traduzione in pattern ancora aperta |
| ARCH-01 Rust/TS | 6hp8Fcfww9CgvxH5 | Misure e decisione prima di migrare |
| ARCH-02 Modularità | 6hp8HGJj2G8CRRc5 | Mappa coupling, ADR proposto e prima slice delimitata |
| DES-05 Redesign | 6hp8FcfcrjCcg445 | DES-01/02/03/04, confini ARCH-02; proposta → scelta → implementazione/verifica |
| REL-01 Policy upstream | 6hp8Fcg7g876jVRX | SHA e trigger verificati |
| REL-02 DMG CI | 6hp8FcgW6JcH6jm5 | REL-01 + acceptance versione selezionata |
| WEB-01 PWA/Docker | 6hp8FcWvwqHwWqjX | Sotto il task PWA Debian esistente, allineare ARCH-02 |
| NET-01 Tailscale/discovery | 6hp8FcWVM4pVW6R5 | WEB-01; matrice rete e prove locali/remote |
| REF-01 OpenClaw browser | 6hp8HRGXCHqhj74X | Reference F12, repo/versione/licenza e flussi da verificare |
| REF-02 OpenClaw voce | 6hp8HRHrpm3QP3gX | Reference F17, ciclo completo e distinzione realtime da verificare |

Prossimo blocco consigliato: ricerca UX delimitata e direzioni confrontabili. Modularità è il secondo incarico prima del refactor strutturale; browser/voce e distribuzione restano incrementi separati. L'utente trasferisce il prompt; questa chat revisiona artefatti e prove prima del goal successivo.
