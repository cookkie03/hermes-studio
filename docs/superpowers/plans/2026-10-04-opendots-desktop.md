> Piano storico, superato da D19–D23 e ADR0006. Non riprendere implementazioni automaticamente. Piano corrente: docs/project/feature-development-plan.md.

# Hermes Studio — OpenDots desktop implementation plan

> **For agentic workers:** esecuzione task per task con agenti implementatori su file distinti e verifica indipendente. Metodo esplicitamente richiesto da Luca; non aspettare nuove conferme delle decisioni D14–D18. Leggere spec e screenshot prima di modificare UI.

**Goal:** app macOS installabile con esperienza OpenDots conforme allo screenshot utente, Spaces/Dots/chat/documenti/memoria e strumenti Hermes reali.

**Architecture:** renderer OpenDots riutilizzato e adattato, Electron come distribuzione macOS, servizio locale dedicato per metadata e bridge Hermes WebSocket. Il runtime Hermes esistente viene collegato, non avviato/terminato dal client per inerzia. Electron contiene il runtime Node necessario al servizio: nessun npm run dev per l'utente.

**Tech Stack:** React/TypeScript/Vite/Tiptap upstream; Node embedded Electron; bridge JSON-RPC/REST/SSE; electron-builder per app/DMG di sviluppo. Versioni verificate tramite installazione/lockfile prima di affidarsi ad API nuove.

**Spec:** docs/design/opendots-target.md; docs/project/MEMORY.md D14–D18; screenshot docs/design/references/opendots-user-reference-2026-10-04.png. Questo piano supera le attività di UI SwiftUI del piano notturno precedente. Le prove trasporto e protezione dati restano valide.

## Vincoli globali

- Fedeltà alla screenshot: sidebar Spaces/Dots, chat e header agente, Computer affiancato; Memory/Settings; avatar originali riutilizzati con licenza/provenienza.
- Runtime e strumenti Hermes, inclusi browser e web search; niente nuovo tool executor OpenDots in parallelo per sostituirli.
- Voce/call al telefono e Codex specialisti restano docs/future. Icona call non deve promettere capacità disponibile.
- Preservare Sources SwiftUI e storia Git. Snapshot pubblico isolato e ignorato .reference; codice incorporato nel prodotto con MIT e upstream SHA.
- Metadata app separati da cronologia/runtime, no accesso al DB Hermes né copie di credenziali.
- UI pronta solo su handshake reale; messaggi/tool/stati confermati dal runtime. Nessun dado dimostrativo mostrato come lavoro reale.
- Build ad hoc/DMG di sviluppo distinta da release firmata e notarizzata. Non pubblicare automaticamente artefatti non verificati.

## Review focus

1. Servizio interno fallisce all'avvio: finestra mostra errore recuperabile, mai pagina vuota/devserver mancante.
2. Backend assente/gated o socket cade: errore esplicito e bozza conservata, nessun retry invio automatico.
3. Approvazione stale: richiesta invalidata, risposta singola, nessuna approvazione automatica.
4. Pagina modificata esternamente o richiesta revisione vecchia: niente overwrite silenzioso; aggiornamento e conflitto espliciti.
5. Link esterno/IPC/redirect: token servizio non esce dal loopback; renderer senza Node; nessun caricamento arbitrario privilegiato.

## Proprietà dei file

| Responsabile | File | Interfaccia con gli altri |
|---|---|---|
| architecture_review | desktop/package.json, Electron shell, build scripts, copia baseline iniziale | child server.mjs + ready port, static dist/client |
| art_direction | desktop/upstream/src/client/ | API /api/hermes REST/SSE concordata col bridge; metadata API mantenute |
| taste_research | desktop/hermes/, upstream/src/server se necessario e coordinato | loopback port0, owner token, parentPort ready, runtime eventi/sessioni |
| root | documenti, piano, Git, revisione integrazione/smoke | nessuna modifica simultanea dei file assegnati |

File ownership trasferita prima di revisione/riparazione. Un agente non avvia build prodotto mentre altro la usa. Installazione unica per lockfile. Nessun Git dagli implementatori.

## Task 1 — reference e baseline (root + renderer)

- [x] Copiare screenshot originale nel progetto e verificarne integrità.
- [x] Descrivere layout osservato e decisioni superate in opendots-target.md/MEMORY.
- [x] Identificare upstream pubblico MIT e SHA c2569bb6a13a22e565cf3eb791c62267d06babb1.
- [x] Snapshot desktop/upstream con LICENSE/provenienza; preservare codice attuale.
- [ ] Mappa requisiti: Spaces/pagine, Dots/impostazioni, chat, memoria, computer/browser/files/terminal, review e salvataggio. Segnalare dipendenze backend non provate.

## Task 2 — packaging desktop (architecture_review)

Create desktop/electron/{main,preload,backend-bootstrap}.cjs; desktop/package.json; build/verification scripts. Interfaces: utilityProcess child esegue desktop/hermes/server.mjs, env HERMES_STUDIO_DATA_DIR/STATIC_DIR/OWNER_TOKEN, ready {type:'ready',port}; main carica URL loopback pronto, non devURL.

- [x] Dipendenze installate una volta e lockfile verificato; licenza snapshot inclusa.
- [ ] Main avvia solo proprio servizio e termina solo quello alla chiusura; backend Hermes resta indipendente.
- [ ] contextIsolation, sandbox, nodeIntegration off; preload minimo; token mai esposto al renderer; navigation/redirect esterni controllati.
- [ ] Build production renderer+servizio; avvio app senza npm/devserver; timeout startup e errore visibile.
- [ ] .app e DMG arm64 di sviluppo; installazione/prova da artefatto, non solo Electron dev.

## Task 3 — bridge Hermes e metadata (taste_research)

Create desktop/hermes/{gateway,bridge,server}.mjs e tests fixture. Exact request/event schema deve essere salvato e inviato al renderer prima della relativa implementazione.

- [ ] Local gateway attach: ledger metadata → health → root token in memoria → gateway.ready; niente config/DB personali e no login bypass.
- [ ] REST/SSE connect/status/session/send/interrupt/approval; stored ID e runtime ID distinti, eventi/tool in ordine e sessione corretta.
- [ ] Fixture ready/out-of-order/delta/complete/timeout/disconnect/error; nessun reinvio incerto.
- [ ] Approvals server request + cancel; capability abilitata solo quando handler/UI completi.
- [ ] Metadata Spaces/Dots/pages/memory nella directory app dedicata, riusando API/stores upstream quando possibile; revision checks e nessuna CopilotKit/OpenAI key obbligatoria per Hermes.
- [ ] Browser/search/files/shell Hermes restano esecutori reali; conservare tool events e provenienza. Computer takeover non simulato se backend non espone contratto equivalente.

## Task 4 — renderer fedele (art_direction)

Modify desktop/upstream/src/client/. Interface: metadata API upstream e bridge/schema concordato task3. Reuse componenti e asset originali, modifiche concentrate per mantenere leggibilità delle differenze upstream.

- [ ] Sidebar singola conforme immagine (non rail aggiuntivo), Spaces sopra Dots con preview/ora; Memory/Settings/account in basso.
- [ ] Header Dot/avatar/ruolo/stato, chat centrale e composer; computer panel dismissible con tabs Browser/Files/Terminal.
- [ ] Spaces con documenti/editor e collegamento alla chat; memoria gestibile; impostazioni Hermes invece di wizard credenziali CopilotKit.
- [ ] Chat vera via bridge, bozza persistente e stati autorevoli; review card prima salvataggio con destinazione e esito reale.
- [ ] Voce non disponibile resa onesta; placeholder computer no fake preview Running/Takeover.
- [ ] Screenshot comparativo stessa dimensione + viewport stretto, keyboard focus e reduced motion/contrast. Registrare differenze e correggere quelle principali.

## Task 5 — integrazione e revisione (root + revisori)

- [ ] Typecheck/build/test specifici passati; test sicurezza Electron e regressioni metadata/runtime.
- [ ] Smoke UI: nuovo Space/Dot, scrittura/autosave documento, memoria, chat sintetica, errore/interruzione, review/save, riapertura app e recupero.
- [ ] Tool browser/search Hermes osservato in sessione sintetica senza effetti personali; separare fonte fixture e live.
- [ ] Revisione Standards+Spec e audit screenshot; repair dei problemi materiali prima di consegna.
- [ ] DMG reale generato e .app lanciata; report chiaro firma/notarizzazione e limiti rimasti.

## Task 6 — documentazione, commit e consegna (root)

- [ ] Aggiornare README quick start per utente desktop e sviluppo; STATUS/MEMORY/WORKLOG/piano a ogni blocco.
- [ ] Audit skill: non confondere asset copiato con UX extraction completa o fixture con live.
- [ ] Commit incrementi verificati, scan segreti/privacy/index; push solo origin confermato cookkie03/hermes-studio e esito verificato.
- [ ] Release di sviluppo con artefatti solo dopo verifica e senza promessa di notarizzazione. Se manca firma account, documentare gate, non installare certificati inventati.

## Self-review e ripresa

D14 coperta task1/4/5; D15 task2/5/6; D16 task1/6; D17 task6 e future; D18 esecuzione agenti/heartbeat aggiornato. Screenshot prevale sulle preferenze UI precedenti. Contratti iniziali sono coordinati tra agenti prima di editing; se cambiano, aggiornare blocco Interfaces prima di task dipendenti. Non chiamare done un gate non provato. Prerequisiti esterni (backend/provider, certificati) non impediscono build locale e fixture ma restano espliciti. Piano precedente conserva prove e storia, non detta nuovo layout.

### Gate corrente ripresa
Packaging `.app` PASS e apertura da artefatto PASS con userData sintetico. Blocchi prima DMG: overlay Computer su Memoria (art_direction), lifecycle capability approval (taste_research + art_direction), smoke documenti/riapertura e review incrociata (root + architecture_review). Non avviare build concorrenti: lock architecture_review.
