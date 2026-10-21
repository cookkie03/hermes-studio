# Valutazione del piano Effect — 2026-10-19

Oggetto: [piano](effect-typescript-migration-plan-2026-10-19.md), verificato contro il checkout corrente su `main` con modifiche preesistenti. Sola valutazione: nessuna migrazione selezionata o implementata.

## Giudizio

Direzione sensata per I/O, errori, cancellazione e cleanup; piano non ancora pronto come incarico esecutivo. Buone scelte: incrementi piccoli, niente secondo executor, separazione React/I/O, dipendenze iniettabili quando utili, test di cleanup, profili sintetici e niente retry indiscriminato. La conversione totale non ha ancora un beneficio dimostrato proporzionato al costo.

## Criticità

### 1. P1 — Separare prodotto e template inattivo

Piano righe 359–440, 466–475. `desktop/tsconfig.metadata.json` seleziona store/workspace/app/workspace-routes e dipendenze; il bootstrap prodotto è `desktop/hermes/server.mjs`, che li importa direttamente. `desktop/scripts/metadata-manifest.cjs` e `verify-package.cjs` escludono esplicitamente runner/dot-agent/platform/headless dal grafo distribuito. Migrare Runner/research/learning o `upstream/src/server/index.ts` non migliora automaticamente l'app Electron. Il browser nativo Studio è distinto dal browser upstream.

Correzione: inventario per raggiungibilità/ownership con prodotto, template inattivo e tooling separati. Definire la composizione JS/TS e chi possiede/chiude i Layer nel vero bootstrap: escludere gli edit JS senza questo contratto lascia il lifecycle incompleto. Rinviare il template a decisione separata. F0–F3 restano protette; questa review non autorizza il refactor F2.

### 2. P1 — Rendere riproducibili dipendenza e packaging

Piano righe 84–137. `desktop/package.json` non dichiara workspaces; il fallback installa in `desktop/upstream`, mentre release e builder usano `desktop` e il relativo manifest/lock. Un'installazione annidata può funzionare localmente ma non essere riprodotta dal `npm ci` della release.

Inoltre la allowlist runtime in `metadata-manifest.cjs` non comprende `effect`: un import server raggiungibile farebbe fallire `build:metadata`, anche con il package installato. Il piano non include questo adeguamento.

Correzione: per l'assetto attuale usare la dependency runtime di `desktop/package.json` e il suo lock; sottoporre a review l'estensione della allowlist. Verificare installazione pulita, build, packaging e avvio isolato della .app. Il controllo proposto sui soli percorsi di Effect, oggi assente, non identifica il proprietario delle altre dipendenze. Un nuovo assetto workspace sarebbe una modifica distinta.

### 3. P1 — Preservare il contratto degli errori pubblici

Piano righe 150–163 e 242–247. `return Effect.runPromise(apiEffect(...))` non basta a preservare `api()`: `App.tsx:129` riconosce il 401 con `instanceof ApiError`; `editor/autosave.ts:191` riconosce il conflitto tramite `status === 409`.

La [documentazione ufficiale v3](https://effect.website/docs/v3/getting-started/running-effects) mostra il rejection di `runPromise` come `FiberFailure`, non come errore tagged restituito direttamente. Il test step 2 presume invece quest'ultimo comportamento. Il test HTTP step 3 controlla soltanto una causa Fail, senza verificare status/messaggio o il chiamante.

Correzione: scegliere la major e verificare la semantica della sua boundary; estrarre il fallimento atteso tramite API pubbliche e convertirlo nell'attuale `ApiError` alla boundary Promise, distinguendo difetti/interruzione. Testare 401/autenticazione, 409/conflitto, messaggi e abort attraverso i chiamanti. Precisare JSON invalido: oggi `api()` applica un fallback, il piano introduce `DecodeError`, quindi cambia comportamento osservabile.

### 4. P2 — Definire una sola regola per le boundary

Piano righe 26, 195–198, 276, 429, 454. Consente esecuzione in entrypoint/Hono ma poi vieta `runPromise` in tutto `src/server`; propone un wrapper esecutivo in `src/shared`, anch'esso vietato. Mantiene `send()` Promise vietando esecuzione nella classe, senza indicare dove avviene.

Correzione: un elenco unico di file/funzioni autorizzati, includendo bootstrap reale e proprietà delle risorse. Evitare un wrapper globale che nasconda chi avvia lavoro. Un commento non basta a rendere qualsiasi file una boundary; controlli su import/chiamate sono più affidabili di regex che perdono alias o colpiscono commenti.

### 5. P2 — Correggere comandi e baseline dei gate

Piano righe 109–115, 510–537. `test:effect` con `--root upstream` funziona se lo script vive in `desktop`, non nel manifest upstream suggerito dal fallback. `tsconfig.effect.json` è invocato senza uno step che lo crei e definisca la copertura. Il full upstream è richiesto verde insieme alla correzione di problemi preesistenti: questo allarga implicitamente il refactor.

Verifica attuale: `npm run typecheck:upstream` termina con exit 2, con incompatibilità `RunAgentInput`/messaggi in dot-agent e firma incompatibile in `tests/page-routes.test.ts:27`, fra le diagnostiche. Effect non è installato: questi fallimenti precedono la migrazione.

Correzione: cwd/manifest univoci, config definito e nuovi test inclusi nel typecheck. Registrare diagnostiche iniziali; gate del prodotto e assenza di nuove diagnostiche sugli altri grafi, riparazioni full-upstream tracciate separatamente.

### 6. P2 — Conservare funzioni pure e proporzionare i test

Piano righe 318–324. `mergePageSnapshot` è già pura: avvolgerla in `Effect.succeed` aumenta il contratto senza gestire risorse/errori. `openPageLink` aggiorna l'hash e non cerca una destinazione mancante: quel requisito aggiunge semantica nuova. `Effect.Option` non è il riferimento corretto al modulo `Option`.

I casi submission close/busy sono già coperti e verdi prima della migrazione; imporre un nuovo RED per ogni refactor incentiva requisiti inventati. Il test di package assente verifica installazione, non comportamento; non serve conservarlo in un commit deliberatamente rosso.

Correzione: funzioni pure restano pure e vengono composte dagli effetti. Test esistenti per refactor conservativi; nuovi test sui rischi reali: richieste abortite, stale result, cleanup e duplicati. La chiusura del client non deve cancellare il lavoro nativo Hermes già avviato.

### 7. P2 — Persistenza incrementale dei progressi

Piano riga 507: aggiornare MEMORY/STATUS/WORKLOG solo dopo successo finale contraddice AGENTS.md, che richiede persistenza dopo ogni blocco significativo. Correggere in aggiornamenti incrementali di stato/prove/limiti; solo la dichiarazione di completamento dipende dal gate finale.

## Primo incremento consigliato — proposta

1. Inventario del solo grafo distribuito e scelta della major. Le fonti ufficiali espongono documentazione v3 e v4: non mescolare esempi di una major con una dipendenza scelta come “latest”.
2. Pilota I/O HTTP con compatibilità `api()` verificata su errori, token, serializzazione e cancellazione. Nessuna modifica automatica alla submission F2 protetta.
3. Manifest/lock e allowlist, installazione pulita, typecheck renderer/metadata, test pertinenti, build e avvio packaged sintetico.
4. Confronto prima/dopo di complessità lifecycle, cancellazione, bundle e avvio. Proseguire dove emerge un beneficio concreto, senza obiettivo numerico di funzioni convertite.

## Prove e limiti

- Ispezionati piano, configurazioni, manifest, grafo importato dal servizio Electron e chiamanti client; consultate fonti ufficiali Effect.
- Da `desktop`: `npm exec vitest -- --root upstream run src/client/conversation-submission.test.ts tests/autosave.test.ts tests/page-snapshots.test.ts`: **3 file / 14 test PASS**.
- `npm run typecheck:upstream`: **FAIL pre-migrazione**, exit 2.
- `git diff --check` prima degli edit documentali: PASS.
- Nessuna installazione, modifica al prodotto/runtime personale, commit o push. Piano originale conservato. Build/package e backend live non verificati in questa review.
- Skill lette: ask-matt e codebase-design. Applicata valutazione architetturale documentale; nessun workflow implementativo o delega.
