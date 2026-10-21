# Piano: adottare Effect in tutta la codebase TypeScript

## Goal

Portare il codice TypeScript proprietario di Hermes Studio a un modello coerente basato sul package `effect`, mantenendo invariati i contratti HTTP/UI/runtime e lasciando `runPromise` esclusivamente ai confini dell'applicazione.

## Current context / assumptions

- La codebase interessata è `desktop/upstream/src/**` e i relativi test in `desktop/upstream/tests/**` e `desktop/upstream/src/**/*.test.ts`; `desktop/electron/**` e `desktop/hermes/**/*.mjs` sono fuori dallo scope perché sono CommonJS/JavaScript e non fanno parte del grafo TypeScript.
- `desktop/upstream/package.json` è il manifest della sorgente OpenDots/TypeScript, mentre `desktop/package.json` è il manifest del packaging Electron. Il resolver effettivo del build è quello invocato dalla directory `desktop`; prima di installare dipendenze va verificata la posizione di `node_modules` e va aggiornato il lockfile corretto, senza duplicare `effect` in entrambi i manifest.
- I file upstream sono nel checkout del progetto e il build corrente include il renderer tramite `desktop/tsconfig.renderer.json` e il server/browser tramite `desktop/upstream/tsconfig.server.json`. Non si deve modificare il comportamento del runtime Hermes né creare un secondo executor.
- Stato di partenza osservato: `effect` non è presente nei manifest/lockfile; la maggior parte del codice usa `Promise`, `try/catch`, `fetch`, `AbortController`, timer e mappe di stato manuali. Punti di ingresso rappresentativi: `desktop/upstream/src/client/api.ts`, `desktop/upstream/src/client/conversation-submission.ts`, `desktop/upstream/src/client/editor/autosave.ts`, `desktop/upstream/src/server/app.ts`, `desktop/upstream/src/server/runner.ts`, `desktop/upstream/src/browser/transport.ts`.
- La migrazione è semantica, non cosmetica: non sostituire meccanicamente ogni `async` con `Effect`; ogni modulo deve dichiarare errori, interruzione, concorrenza e risorsa posseduta.
- Prima di ogni blocco l'implementatore deve ristampare lo stato, perché il repository contiene modifiche non correlate: `git status --short`, `git branch --show-current`, `git diff --check`.

## Architecture / proposed approach

Adottare un modello a tre livelli: moduli di dominio che restituiscono `Effect<A, E, R>`, adapter impuri che trasformano `fetch`/Node/Playwright/Hono/SDK in errori tipizzati, e soli entrypoint che eseguono gli effetti (`Effect.runPromise`, `Effect.runPromiseExit` o `Effect.runFork`). Usare `Schema` per payload/configurazione, `Data.TaggedError` per errori osservabili e `Context.Tag`/`Layer` per dipendenze sostituibili; usare `Scope`, `acquireRelease`, `Fiber`, `Schedule` e `Effect.timeout` solo dove sostituiscono una risorsa/concorrenza già esistente.

Migrare per vertical slices, dal nucleo non-UI agli adapter server/browser e infine al renderer React. Mantenere temporaneamente piccoli adapter `Promise` solo ai confini React/Hono/Node, ma vietare Promise nei moduli Effect interni; ogni slice deve avere test Vitest RED/GREEN e una ricerca automatizzata che impedisca l'introduzione di `try/catch`/`new Promise`/`runPromise` nei percorsi interni già migrati.

## Regole non negoziabili per l'implementatore

1. Importare da entrypoint pubblici (`effect/Effect`, `effect/Schema`, `effect/Context`, `effect/Layer`, `effect/Data`, `effect/Cause`, `effect/Scope`, `effect/Stream`, `effect/Queue`, `effect/Ref`, `effect/Duration`, `effect/Schedule`); non importare internals di `effect`.
2. Un errore atteso non viene rappresentato con `throw`: definire un `Data.TaggedError` o uno schema di errore e usare `Effect.fail`; gli errori inattesi possono essere catturati con `Effect.die`/`Effect.catchAllCause` alla boundary.
3. `Effect.runPromise`/`Effect.runFork`/`Effect.runPromiseExit` compaiono solo in: `desktop/upstream/src/client/main.tsx`, `desktop/upstream/src/server/index.ts`, `desktop/upstream/src/browser/index.ts`, adapter React/Hono esplicitamente marcati `// Effect boundary`.
4. Nessun `Effect.runSync` su operazioni I/O, timer, rete, database, audio, Playwright o SDK.
5. `AbortSignal` deve essere collegato all'interruzione Effect; non ignorare il segnale per fare passare il test.
6. Le API pubbliche dei componenti React e degli handler Hono restano compatibili, salvo una decisione esplicita documentata. La compatibilità può essere ottenuta con un adapter `Promise` alla boundary.
7. Non convertire file Markdown/JSON/fixture generati o codice MIT upstream non necessario al comportamento Studio; registrare ogni esclusione nel piano di migrazione.

## Step-by-step tasks

### 0. Catturare baseline e inventario migrabile

**File da creare:** `desktop/upstream/tests/effect-adoption-baseline.test.ts`.

1. Scrivere un test che documenti i confini consentiti. Il test deve fallire inizialmente perché il package non è installato:

```ts
import { expect, it } from 'vitest';
import * as Effect from 'effect/Effect';

it('loads Effect from the public package entrypoint', () => {
  expect(typeof Effect.succeed).toBe('function');
});
```

2. Eseguire dalla directory `desktop`:

```sh
npm exec vitest -- --root upstream run tests/effect-adoption-baseline.test.ts
```

**Output atteso RED:** errore di risoluzione `Cannot find package 'effect'`.

3. Non implementare ancora moduli. Eseguire l'inventario read-only e salvarne l'output in `.hermes/plans/effect-inventory.txt` (il file di inventario è opzionale e non è codice prodotto):

```sh
npm exec tsc -- --noEmit -p upstream/tsconfig.json
npm run typecheck:renderer
npm run test:metadata
npm exec eslint -- upstream/src upstream/tests
```

4. Elencare con `rg` tutti i punti che dovranno essere migrati o verificati:

```sh
rg -n "(async |Promise|try \{|catch \(|new Promise|fetch\(|setInterval|setTimeout|AbortController|runPromise|throw new)" upstream/src upstream/tests
```

5. Definire nella review dell'inventario queste colonne: file, boundary (`client/server/browser/shared`), effetto da introdurre, errore tipizzato, dipendenze (`R`), strategia di cancellazione, test esistente, rischio compatibilità. Non aggiungere un genericissimo `EffectService` senza una riga di ownership.

6. **Commit:**

```sh
git add upstream/tests/effect-adoption-baseline.test.ts .hermes/plans/effect-inventory.txt
git commit -m "test: capture Effect migration baseline"
```

**Criterio:** il commit contiene solo baseline/inventario; il test resta RED finché la dipendenza non viene installata.

### 1. Installare `effect` nel manifest corretto e stabilire gli script di verifica

**File:** `desktop/upstream/package.json`, `desktop/upstream/package-lock.json` oppure `desktop/package.json`, `desktop/package-lock.json` secondo l'esito della verifica del resolver.

1. Verificare dove risolve una dipendenza sorgente senza mutare file:

```sh
node -e "for (const p of ['./node_modules/effect/package.json','./upstream/node_modules/effect/package.json']) { try { console.log(p, require(p).version) } catch {} }"
```

2. Installare l'ultima versione compatibile con Node `>=24` nel manifest che possiede il grafo TypeScript. Usare npm, non modificare a mano il lockfile:

```sh
npm install --save effect --workspace=upstream
```

Se `--workspace=upstream` fallisce perché il repository non dichiara workspaces, eseguire invece dalla directory che contiene `desktop/upstream/package.json`:

```sh
cd upstream
npm install effect
```

Non eseguire entrambi i comandi. Il risultato deve avere un solo manifest proprietario della dipendenza e un solo lockfile aggiornato.

3. Aggiungere gli script espliciti al manifest proprietario, preservando gli script esistenti:

```json
"typecheck:effect": "tsc --noEmit -p tsconfig.effect.json",
"test:effect": "vitest run --root upstream tests/effect"
```

Se non si vuole introdurre un config separato, `typecheck:effect` può puntare a `upstream/tsconfig.json`; la scelta va motivata in `desktop/README.md`.

4. Eseguire il test scritto nello step 0:

```sh
npm exec vitest -- --root upstream run tests/effect-adoption-baseline.test.ts
```

**Output atteso GREEN:** `1 passed`.

5. Verificare che installazione e lock siano riproducibili:

```sh
npm ci
npm exec vitest -- --root upstream run tests/effect-adoption-baseline.test.ts
```

6. **Commit:**

```sh
git add upstream/package.json upstream/package-lock.json package.json package-lock.json
 git commit -m "build: add Effect dependency"
```

Aggiungere solo i file realmente modificati da npm; non committare `node_modules`.

### 2. Introdurre errori, runtime di test e convenzioni condivise

**File da creare:**

- `desktop/upstream/src/shared/effect-errors.ts`
- `desktop/upstream/src/shared/effect-runtime.ts`
- `desktop/upstream/tests/effect/effect-errors.test.ts`

1. Scrivere prima il test RED per una discriminazione stabile degli errori:

```ts
import { expect, it } from 'vitest';
import * as Effect from 'effect/Effect';
import { ApiRequestError, decodeEffectError } from '../../src/shared/effect-errors';

it('keeps HTTP status and message in a tagged error', async () => {
  const error = await Effect.runPromise(
    Effect.fail(new ApiRequestError({ method: 'GET', path: '/health', status: 503, message: 'offline' }))
      .pipe(Effect.mapError(decodeEffectError)),
  ).catch((cause) => cause);
  expect(error).toMatchObject({ _tag: 'ApiRequestError', status: 503, message: 'offline' });
});
```

2. Verificare RED:

```sh
npm exec vitest -- --root upstream run tests/effect/effect-errors.test.ts
```

3. Implementare il minimo contratto. Il codice deve essere equivalente a questo, adattando solo il percorso `.js` se richiesto dal `moduleResolution`:

```ts
// desktop/upstream/src/shared/effect-errors.ts
import * as Data from 'effect/Data';

export class ApiRequestError extends Data.TaggedError('ApiRequestError')<{
  method: string;
  path: string;
  status?: number;
  message: string;
}> {}

export class DecodeError extends Data.TaggedError('DecodeError')<{
  message: string;
  cause?: unknown;
}> {}

export type EffectError = ApiRequestError | DecodeError;
export const decodeEffectError = (error: EffectError): EffectError => error;
```

```ts
// desktop/upstream/src/shared/effect-runtime.ts
import * as Effect from 'effect/Effect';

export const runAtApplicationBoundary = <A, E>(effect: Effect.Effect<A, E>) =>
  Effect.runPromise(effect);
```

4. Rendere il test più utile: aggiungere casi per `DecodeError` e per la presenza di `_tag`; rieseguire.

**Output atteso GREEN:** `2 passed` o il numero esatto dei casi aggiunti, zero failure.

5. Eseguire i check correnti:

```sh
npm run typecheck
npm run test:metadata -- --run tests/effect/effect-errors.test.ts
```

6. **Commit:** `git add upstream/src/shared/effect-errors.ts upstream/src/shared/effect-runtime.ts upstream/tests/effect/effect-errors.test.ts && git commit -m "feat: define shared Effect errors"`.

### 3. Migrare l'adapter HTTP client (`api.ts`) senza cambiare i chiamanti ancora esistenti

**File:**

- `desktop/upstream/src/client/api.ts`
- `desktop/upstream/tests/effect/api.test.ts` (creare)

1. Scrivere RED sul comportamento già richiesto: status non-OK, JSON invalido e body JSON devono produrre errori tipizzati. Usare `vi.stubGlobal` e ripristino automatico:

```ts
import { afterEach, expect, it, vi } from 'vitest';
import * as Effect from 'effect/Effect';
import { apiEffect } from '../../src/client/api';

afterEach(() => vi.unstubAllGlobals());

it('fails with ApiRequestError and preserves status for a failed response', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
    new Response(JSON.stringify({ error: 'offline' }), { status: 503 }),
  ));
  const result = await Effect.runPromiseExit(apiEffect('/health'));
  expect(result._tag).toBe('Failure');
  if (result._tag === 'Failure') expect(result.cause).toMatchObject({ _tag: 'Fail' });
});
```

2. Verificare RED, poi implementare `apiEffect<T>(...) => Effect.Effect<T, ApiRequestError | DecodeError>` con `Effect.tryPromise`, `Effect.flatMap`, `Effect.try`, `Effect.mapError` e `Effect.interruptible`. La funzione deve conservare token, metodo, header, serializzazione del body e `AbortSignal` di `api`.

3. Solo dopo che il test passa, aggiungere l'adapter compatibile:

```ts
export function api<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  return Effect.runPromise(apiEffect<T>(path, method, body, signal));
}
```

4. Aggiungere test per `GET`, mutazione con `Content-Type`, token, risposta valida e `AbortSignal`. Verificare:

```sh
npm exec vitest -- --root upstream run tests/effect/api.test.ts src/client/manual-space-review.test.ts src/client/conversation-submission.test.ts
npm run typecheck:renderer
```

**Output atteso:** nuovi test verdi e test client esistenti verdi; nessuna modifica necessaria ai componenti che continuano a usare `api`.

5. **Commit:** `git add upstream/src/client/api.ts upstream/tests/effect/api.test.ts && git commit -m "feat: model client HTTP with Effect"`.

### 4. Migrare la submission delle conversazioni con interruzione strutturata

**File:**

- `desktop/upstream/src/client/conversation-submission.ts`
- `desktop/upstream/src/client/conversation-submission.test.ts`
- `desktop/upstream/tests/effect/conversation-submission-effect.test.ts` (creare)

1. Estendere prima i test esistenti con un caso RED: una submission chiusa mentre `prepare` è sospesa non deve eseguire `dispatch`; una seconda submission deve restituire `busy`.
2. Eseguire:

```sh
npm exec vitest -- --root upstream run src/client/conversation-submission.test.ts
```

3. Introdurre `sendEffect` come implementazione interna con risultato `Effect.Effect<SubmissionResult, never>`, usando `Effect.acquireUseRelease` o `Effect.ensuring` per resettare `pending`. Non usare `Effect.runPromise` dentro la classe. Mantenere `send(...)` come adapter Promise per i chiamanti React.
4. Il test deve asserire anche che `close()` interrompe il lavoro attivo o lo rende stale senza chiamare `dispatch`; non rendere `close()` una semplice variabile ignorata.
5. Eseguire:

```sh
npm exec vitest -- --root upstream run src/client/conversation-submission.test.ts tests/effect/conversation-submission-effect.test.ts
npm run typecheck:renderer
```

6. **Commit:** `git add upstream/src/client/conversation-submission.ts upstream/src/client/conversation-submission.test.ts upstream/tests/effect/conversation-submission-effect.test.ts && git commit -m "feat: model conversation submission with Effect"`.

### 5. Migrare autosave, conflitti e timeout come macchina a effetti

**File:**

- `desktop/upstream/src/client/editor/autosave.ts`
- `desktop/upstream/tests/autosave.test.ts`
- `desktop/upstream/tests/effect/autosave-effect.test.ts` (creare)

1. Prima di cambiare implementazione, aggiungere test RED per: save cancellato quando arriva una nuova generazione; timeout; conflitto di revision; retry esplicito; `flush()` non lascia una richiesta pending.
2. Eseguire il singolo file e osservare il fallimento:

```sh
npm exec vitest -- --root upstream run tests/effect/autosave-effect.test.ts
```

3. Separare in `autosave.ts` tre moduli interni: `draft` puro, `saveEffect(page, draft, signal)`, orchestrazione `PageAutosave`. Usare `Effect.timeout`, `Effect.catchTag`, `Effect.retry` solo per retry richiesto dal contratto e `Effect.ensuring` per abort/reset. Conservare `getSnapshot`, `subscribe`, `dirty`, `receive`, `update` e `flush` per non cambiare il renderer.
4. Non trasformare i timer React in un loop Effect globale: mantenere un solo timer posseduto dall'istanza e testare che ogni timer venga cancellato in `dispose`/cambio pagina.
5. Eseguire:

```sh
npm exec vitest -- --root upstream run tests/effect/autosave-effect.test.ts tests/autosave.test.ts
npm run typecheck:renderer
```

6. **Commit:** `git add upstream/src/client/editor/autosave.ts upstream/tests/autosave.test.ts upstream/tests/effect/autosave-effect.test.ts && git commit -m "feat: model autosave lifecycle with Effect"`.

### 6. Migrare client-side editor e servizi di pagina in piccoli slice

Applicare RED/GREEN separatamente, un commit per slice, ai seguenti file. Non fare una conversione massiva:

| Slice | Implementazione | Test RED da aggiungere prima | Semantica Effect richiesta |
|---|---|---|---|
| Markdown | `desktop/upstream/src/client/editor/markdown.ts` | `desktop/upstream/tests/effect/markdown-effect.test.ts` | `DecodeError`/errore parse, nessun `throw` per input non valido |
| Navigazione | `desktop/upstream/src/client/page-navigation.ts` | `desktop/upstream/tests/effect/page-navigation-effect.test.ts` | `Effect.Option`/`Effect.fail` per destinazione mancante |
| Context | `desktop/upstream/src/client/page-context.ts` | estendere `desktop/upstream/tests/page-context.test.ts` | contesto non pronto come errore tagged, non eccezione anonima |
| Snapshot | `desktop/upstream/src/client/page-snapshots.ts` | estendere `desktop/upstream/tests/page-snapshots.test.ts` | merge puro in `Effect.succeed`, invarianti preservate |
| Review | `desktop/upstream/src/client/page-review-decision.ts` | estendere `desktop/upstream/src/client/manual-space-review.test.ts` | `apiEffect` + errore tagged; adapter Promise solo alla chiamata UI |
| Chat requests | `desktop/upstream/src/client/page-chat-requests.ts` e `conversation-submission.ts` | `desktop/upstream/tests/effect/page-chat-request-effect.test.ts` | interruzione e stale request esplicite |
| Runtime connections | `desktop/upstream/src/client/runtime-connections.ts` | `desktop/upstream/tests/effect/runtime-connections-effect.test.ts` | timeout/retry e cleanup della connessione |

Per ogni riga:

1. Scrivere un solo caso di comportamento non coperto.
2. Eseguire il test specifico e registrare RED.
3. Implementare il minimo cambiamento con `Effect.gen` e gli errori condivisi.
4. Eseguire il test specifico più i test esistenti dello slice.
5. Eseguire `npm run typecheck:renderer`.
6. Fare commit con schema `feat: migrate <slice> to Effect`.

**Criterio di uscita:** nessun modulo dello slice chiama `Effect.runPromise` internamente; l'API esterna può ancora restituire Promise soltanto se il chiamante React non è stato migrato in quello stesso slice.

### 7. Migrare browser transport e sicurezza senza indebolire i gate SSRF

**File:**

- `desktop/upstream/src/browser/transport.ts`
- `desktop/upstream/src/browser/security.ts`
- `desktop/upstream/tests/transport.test.ts`
- `desktop/upstream/tests/security.test.ts`
- `desktop/upstream/tests/effect/browser-transport-effect.test.ts` (creare)

1. Aggiungere RED per: URL non valido, DNS validation fallita, redirect rifiutato, risposta oltre 5 MB, abort del request e risposta valida.
2. Eseguire:

```sh
npm exec vitest -- --root upstream run tests/effect/browser-transport-effect.test.ts tests/transport.test.ts tests/security.test.ts
```

3. Implementare `readResourceEffect(input, signal?)` con `Effect.async`/`Effect.tryPromise`, `Effect.acquireRelease` per distruggere la request/response, `Effect.timeout` solo se il contratto già ha un timeout, e errori tagged che non espongano credenziali. Mantenere `readResource()` come adapter Promise se `browser/index.ts` non è ancora migrato.
4. Testare che la cancellazione chiuda davvero la request e che un redirect continui a fallire prima che Playwright riceva la Location.
5. **Commit:** `git add upstream/src/browser upstream/tests/transport.test.ts upstream/tests/security.test.ts upstream/tests/effect/browser-transport-effect.test.ts && git commit -m "feat: model browser transport with Effect"`.

### 8. Migrare servizi server e layer di dipendenze

Creare i moduli di layer solo quando servono davvero a sostituire una dipendenza globale. File previsti:

- `desktop/upstream/src/server/effect-services.ts`
- `desktop/upstream/src/server/store.ts`
- `desktop/upstream/src/server/file-service.ts`
- `desktop/upstream/src/server/workspace.ts`
- `desktop/upstream/src/server/pages.ts`
- `desktop/upstream/src/server/page-service.ts`
- `desktop/upstream/src/server/parallel.ts`
- `desktop/upstream/src/server/research.ts`
- `desktop/upstream/src/server/learning.ts`
- `desktop/upstream/src/server/voice.ts`
- test esistenti corrispondenti in `desktop/upstream/tests/**` e nuovi test in `desktop/upstream/tests/effect/**`.

Ordine obbligatorio:

1. **Store/file/workspace:** scrivere RED per errore I/O, conflitto, transazione e cleanup; introdurre `FileSystem`/`Sqlite` come interfacce `Context.Tag` soltanto se l'implementazione reale può essere iniettata nei test. Il fake deve essere in-memory e sintetico.
2. **Pages/page-service:** avvolgere letture/scritture in Effect e mantenere invariati schema, revision e ordine di eventi; testare conflitti e rollback.
3. **Research/parallel/learning:** rappresentare timeout, provider non configurato, stream fallito e cancellation; usare `Schedule` solo per il retry già previsto dal contratto.
4. **Voice:** rappresentare le call attive con `Scope`/`Fiber`; testare expiry, abort, doppio stop e cleanup del timer in `desktop/upstream/tests/voice.test.ts`.
5. **Runner:** introdurre un `RunnerEffect` interno per `tick`, claim, lease, abort e stop. Non usare un `Effect.runPromise` per ogni tick; avviare una sola fibra dal boundary server e interromperla con `Fiber.interrupt` in `stop`.

Per ogni servizio il ciclo è sempre: test RED mirato, comando Vitest mirato, implementazione minima, test GREEN, `npm run typecheck`, commit separato. Non accorpare tutti i servizi in un commit “migrate server”.

Esempio di contratto minimo per il layer da usare come riferimento, non da copiare dove non necessario:

```ts
import * as Context from 'effect/Context';
import * as Effect from 'effect/Effect';
import * as Layer from 'effect/Layer';
import * as Data from 'effect/Data';

export class StoreError extends Data.TaggedError('StoreError')<{
  operation: string;
  message: string;
  cause?: unknown;
}> {}

export interface StoreService {
  readonly claim: () => Effect.Effect<Claim | undefined, StoreError>;
}

export class Store extends Context.Tag('Store')<Store, StoreService>() {}

export const StoreLive = (store: StoreService) =>
  Layer.succeed(Store, store);

export const claim = Effect.gen(function* () {
  const service = yield* Store;
  return yield* service.claim();
});
```

Il codice reale deve sostituire `Claim` con il tipo già presente in `desktop/upstream/src/server/store.ts`; non introdurre un tipo duplicato.

### 9. Migrare Hono route handler e bootstrap server

**File:**

- `desktop/upstream/src/server/app.ts`
- `desktop/upstream/src/server/page-routes.ts`
- `desktop/upstream/src/server/file-routes.ts`
- `desktop/upstream/src/server/workspace-routes.ts`
- `desktop/upstream/src/server/computer-routes.ts`
- `desktop/upstream/src/server/index.ts`
- test route esistenti (`desktop/upstream/tests/app.test.ts`, `page-routes.test.ts`, `workspace.test.ts`, `computer.test.ts`, `f15-terminal.test.ts`).

1. Per ogni gruppo di route aggiungere prima un test RED che verifica lo stesso status/body/header con il servizio Effect che fallisce.
2. Creare un adapter unico, ad esempio `desktop/upstream/src/server/effect-http.ts`, con una funzione `respondEffect(c, effect)` che esegue l'effetto una volta, mappa errori tagged a status HTTP e converte cause inattese in 500 senza serializzare stack/secret. Il file deve essere coperto da `desktop/upstream/tests/effect/effect-http.test.ts`.
3. Gli handler Hono devono limitarsi a decodificare input, costruire l'effetto e chiamare `respondEffect`; non devono contenere catene `try/catch` replicate.
4. In `index.ts`, costruire i Layer live, avviare il Runner con una sola boundary e chiudere server/store/workspace/fibre in ordine deterministico. Mantenere il controllo esistente su `OWNER_TOKEN`, host e database.
5. Verificare ogni gruppo:

```sh
npm exec vitest -- --root upstream run tests/effect/effect-http.test.ts tests/app.test.ts tests/page-routes.test.ts tests/workspace.test.ts tests/computer.test.ts
npm run typecheck:upstream
npm run build:metadata
```

6. **Commit per gruppo** (`feat: migrate <route group> to Effect`), poi commit separato per bootstrap (`feat: run server lifecycle through Effect`).

### 10. Migrare browser entrypoint e React boundary

**File:**

- `desktop/upstream/src/browser/index.ts`
- `desktop/upstream/src/browser/transport.ts`
- `desktop/upstream/src/client/main.tsx`
- `desktop/upstream/src/client/App.tsx`
- componenti che chiamano direttamente gli adapter migrati, individuati dall'inventario.

1. Scrivere test RED per un mount/unmount o un request cancellato in `desktop/upstream/tests/effect/react-boundary.test.tsx`; usare fake runtime, mai conversazioni personali o backend reale.
2. Spostare gli effetti lunghi fuori dai componenti in funzioni Effect pure/adapters (`useEffect` deve solo avviare/cancellare una boundary). Ogni cleanup deve interrompere la fibra o l'AbortController associato.
3. Consentire `Effect.runPromise` solo in `main.tsx`, `useEffect` wrapper espliciti o adapter con commento `// Effect boundary`; aggiungere una regola di lint/script che fallisca se `runPromise` appare in `src/shared`, `src/server` o nei moduli client di dominio.
4. Non trasformare lo stato locale React (`useState`, `useReducer`) in `Ref`/`SubscriptionRef` senza un test e un beneficio concreto; Effect governa I/O, errori e lifecycle, React governa presentazione.
5. Eseguire:

```sh
npm exec vitest -- --root upstream run tests/effect/react-boundary.test.tsx
npm run typecheck:renderer
npm run test:metadata
```

6. **Commit:** `git add upstream/src/client upstream/src/browser upstream/tests/effect/react-boundary.test.tsx && git commit -m "feat: isolate Effect execution at React boundaries"`.

### 11. Migrare voice, computer, routines, collaboration e capability slices residui

Usare l'inventario per lavorare sui rimanenti file, senza riscrivere componenti puramente presentazionali. Ordine e file owner:

- voice: `desktop/upstream/src/client/voice-live.ts`, `useVoice.ts`, `AudioControls.tsx`, `desktop/upstream/src/server/voice.ts`, test voice esistenti;
- computer/browser: `desktop/upstream/src/client/ComputerPanel.tsx`, `ComputerToolCard.tsx`, `NativeBrowserWorkspace.tsx`, `desktop/upstream/src/server/computer-service.ts`, `computer-tools.ts`, `computer-store.ts`, `computer-routes.ts`, test computer/browser;
- routines: `desktop/upstream/src/client/RoutineEditor.tsx`, `RoutineRunHistory.tsx`, `RoutinesView.tsx`, server `pages.ts`/runner paths interessati, `desktop/upstream/tests/f10-routines.test.ts`;
- collaboration/capabilities: `desktop/upstream/src/client/CollaborationPanel.tsx`, `CapabilitiesView.tsx`, `RuntimeConnections.tsx`, server `slack-channel.ts`, `dot-agent.ts`, `runtime-scope.ts`, test `dot-agent-channel.test.ts`, `slack-channel*.test.ts`, `runtime-scope.test.ts`.

Per ciascun blocco: aggiungere un test di errore/cancellazione prima del refactor, eseguire RED, usare i service/layer già creati, eseguire i test di regressione, typecheck, e fare un commit. Non introdurre un layer unico globale per “voice/computer/everything”: un layer deve avere un owner e una responsabilità stretta.

### 12. Enforcement, rimozione degli adapter temporanei e documentazione

**File:**

- `desktop/scripts/check-effect-boundaries.cjs` (creare)
- `desktop/package.json`
- `desktop/README.md`
- `docs/project/MEMORY.md`
- `docs/project/STATUS.md`
- `docs/project/WORKLOG.md`
- eventuale `docs/architecture/feature-boundaries.md` solo se cambiano ownership/termini.

1. Scrivere prima `desktop/scripts/check-effect-boundaries.test.cjs` o un test Node equivalente che fallisca quando un file interno contiene `Effect.runPromise`, `Effect.runFork`, `new Promise`, `try {` o `throw new` nei pattern vietati. Consentire le eccezioni dichiarate in una allowlist piccola e verificata.
2. Implementare lo script in modo deterministico, con path relativi e output utile:

```sh
node scripts/check-effect-boundaries.cjs
```

**Output atteso:** `Effect boundary check passed: <N> files scanned, <M> allowed boundaries.`

3. Collegarlo a `npm run typecheck` o `npm run test` prima dei test applicativi. Non nascondere errori con `|| true`.
4. Rimuovere gli adapter Promise temporanei solo quando tutti i chiamanti dello slice usano l'effetto o una boundary dichiarata. Cercare residui:

```sh
rg -n "Effect\.run(Promise|Fork|PromiseExit)|new Promise|try \{|catch \(|throw new|Promise<" upstream/src
```

Ogni match deve essere: boundary autorizzata, API esterna necessaria, o riga documentata in allowlist; nessun match deve essere ignorato “perché upstream”.
5. Aggiornare `desktop/README.md` con: dipendenza e versione lockata, regola dei confini, comandi `npm run typecheck`, `npm run test`, `npm run test:effect`, limiti noti e punti esclusi (JS/CJS).
6. Aggiornare `MEMORY.md`, `STATUS.md`, `WORKLOG.md` solo dopo che la verifica finale è realmente passata, indicando cosa è migrato e cosa resta fuori. Non dichiarare parità Effect se rimangono moduli TypeScript proprietari non censiti.
7. **Commit:** `chore: enforce Effect boundaries and document migration`.

### 13. Verifica finale riproducibile

Eseguire dalla directory `desktop`, in questo ordine:

```sh
git diff --check
npm ci
npm run typecheck
npm run typecheck:upstream
npm run typecheck:renderer
npm run test:effect
npm run test:metadata
npm run test
npm run build
npm run verify:package
node scripts/check-effect-boundaries.cjs
```

**Output minimo atteso:** ogni comando termina con exit code 0; Vitest stampa tutti i test verdi; TypeScript non produce diagnostiche; `verify:package` stampa esito positivo; il boundary checker stampa il messaggio di passaggio.

Eseguire anche una smoke test con dati sintetici e profilo Hermes isolato:

```sh
npm run test:bootstrap
npm run test:external-links
```

Se la pipeline completa fallisce per un test preesistente non causato dalla migrazione, isolare il test con `npm exec vitest -- --root upstream run <file>` e correggere la causa reale; non ridurre la suite o aggiornare snapshot alla cieca.

## Tests / validation

Ogni task segue RED → GREEN → REFACTOR:

1. **RED:** un test minimo nuovo esprime un comportamento osservabile e fallisce per la ragione prevista; registrare il comando e l'errore nel commit/PR.
2. **GREEN:** implementare la minima trasformazione Effect necessaria, senza refactor laterali; rieseguire il test specifico e poi la regressione dello slice.
3. **REFACTOR:** solo con test verdi, ridurre duplicazione, estrarre un error type/layer condiviso o correggere naming; rieseguire typecheck e test.
4. **Commit frequenti:** un commit per dipendenza, errori condivisi, adapter HTTP, submission, autosave, ogni servizio/route group e enforcement. Nessun commit deve mescolare redesign UI o documentazione storica non necessaria.
5. **Gates di fine lavoro:** typecheck renderer/server, test Effect, suite metadata completa, test Node Hermes, build Vite/server, package verification, boundary checker e `git diff --check`.
6. **Prove di cancellazione:** ogni operation I/O o loop che prima aveva `AbortController`, timer o `setInterval` deve avere un test che verifichi cleanup/interruption, non solo il valore di ritorno.
7. **Prove di errori:** ogni adapter deve avere almeno un test per errore atteso tagged e uno per errore inatteso/cause; i messaggi HTTP pubblici non devono includere stack o secret.

## Files likely to change

- Dipendenze: `desktop/upstream/package.json`, `desktop/upstream/package-lock.json` oppure i corrispondenti file `desktop/*` se il resolver lo impone.
- Shared: `desktop/upstream/src/shared/effect-errors.ts`, `desktop/upstream/src/shared/effect-runtime.ts`.
- Client: `desktop/upstream/src/client/api.ts`, `conversation-submission.ts`, `editor/autosave.ts`, servizi pagina e adapter React.
- Browser: `desktop/upstream/src/browser/transport.ts`, `security.ts`, `index.ts`.
- Server: `desktop/upstream/src/server/effect-services.ts`, `effect-http.ts`, store/workspace/page/research/learning/voice/runner e route handlers.
- Test: nuovi `desktop/upstream/tests/effect/**/*.test.ts(x)` più i test esistenti dei relativi slice.
- Enforcement/docs: `desktop/scripts/check-effect-boundaries.cjs`, `desktop/package.json`, `desktop/README.md`, documentazione di progetto prevista da `AGENTS.md`.

## Risks, tradeoffs, and open questions

- **Scope “tutta la codebase”:** il piano interpreta la richiesta come tutti i moduli TypeScript proprietari nel grafo `desktop/upstream`. Se l'intento include anche i `.mjs` in `desktop/hermes` o il codice Electron, serve una decisione separata: prima convertirli a TypeScript o definire un adapter Effect senza una migrazione cosmetica.
- **Provenienza OpenDots:** modificare molti file sotto `desktop/upstream` può aumentare il delta rispetto all'upstream MIT. Conservare `upstream/PROVENANCE.md`, non aggiornare il codice upstream esterno automaticamente e valutare se la migrazione debba essere limitata ai moduli Studio-owned.
- **Doppio package manifest:** installare `effect` nel posto sbagliato crea build che passano solo grazie a `node_modules` locale. Il gate `npm ci` da una checkout pulita è obbligatorio.
- **Effect non è una policy di stile:** sostituire ogni Promise con `Effect.succeed` peggiora il design. Promise può restare alle boundary dichiarate; il criterio è ownership di errori/lifecycle/concorrenza.
- **React:** cambiare tutte le funzioni asincrone in tipi Effect può rendere l'integrazione con hook e librerie più difficile. Il piano conserva adapter boundary e migra prima la logica, non lo stato di presentazione.
- **Hono/SDK/Playwright:** alcuni callback richiedono Promise native. Usare un adapter piccolo e testato, non forzare Effect dentro callback che non possono rappresentarlo.
- **Versione Effect:** non fissare una versione inventata nel piano; usare quella risolta da npm al momento dell'implementazione, controllare le API contro il package installato e committare il lockfile.
- **API di Effect in evoluzione:** se `Data.TaggedError`, `Effect.async`, `Layer` o le API timer differiscono nella versione installata, consultare i type definition del package e adattare i test; non importare API interne o inventare overload.
- **Database/SDK non interruptible:** l'interruzione Effect non può annullare magicamente una query o una chiamata SDK. Documentare il limite e garantire almeno che il risultato tardivo non aggiorni stato/lease dopo la cancellazione.
- **Open questions da risolvere prima dell'implementazione:** (1) Effect deve essere una dependency di produzione o del solo `upstream`? (2) i moduli CommonJS Hermes sono esplicitamente esclusi? (3) la migrazione deve includere anche test/fixture soltanto o solo codice eseguito? (4) si accetta un delta ampio da OpenDots oppure si limita il lavoro ai moduli Studio-owned? Le risposte non devono cambiare i contratti senza una decisione documentata.
