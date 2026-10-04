# Artefatti di sviluppo osservati

2026-10-04. Evidenze storiche della baseline; non certificano una release finale né pubblicata. Il build successivo di layout può avere hash diverso: rigenerare/verificare il manifest prima di distribuire.

## Incremento packaging realizzato

Snapshot MIT/provenienza importato in desktop/upstream senza .git o file .env. Electron44.5.1 ed electron-builder26.15.3 installati e fissati; lockfile locale. Binario Electron scaricato e runtime verificato: Node24.21.0, Chromium152.0.7977.130, node:sqlite DatabaseSync disponibile. npm iniziale aveva drift peer transitive: override alle versioni originali upstream openai-base0.12.1 e menu Tiptap3.31.3, confermato nel lockfile.

Shell in desktop/electron con utilityProcess, ready port validato, timeout45s, errori visibili, token soltanto main/service. Renderer sandbox/contextIsolation, Nodeoff, permessi defaultdeny, popup arbitrari e webview negati; link fonti HTTP(S) aperti solo dopo click attendibile e validazione, redirect verso altro origin cancellato prima invio. Solo UIservice posseduto termina al quit; Hermes indipendente. LICENSE e PROVENANCE inclusi nei file packaged.

Prove sintetiche bootstrap passate: port valid/invalid, credenziali provider non ereditate, timeout termina proprio child, early exit fallisce collegamento. Syntax main/preload/bootstrap/scripts passata. Sono prove packaging, non smoke app/DMG; produzione renderer/service e lancio bundle restano gate integrazione coordinato.

### Packaged development artifact — 2026-10-04

`npm run package:dir` completed with exit 0. Artifact: `desktop/release/mac-arm64/Hermes Studio.app`. Renderer/shared strict typecheck, Vite production build and 13-module metadata manifest passed. MIT notice/provenance included; original legacy executor JS excluded. The preserved upstream full typecheck still fails in inactive CopilotKit/TanStack AG-UI types, so metadata transpilation uses `--noCheck` with separate Hermes behavior fixtures. Electron 44.5.1 embeds Node 24.21.0 and builtin SQLite. The first artifact retained an incomplete linker ad-hoc signature. The final generated app now receives a full local ad-hoc signature with sealed resources and passes deep strict verification; it uses the default Electron icon and is not Apple-signed, notarized or published. Parent integration QA verified actual packaged launch, Memory entry creation, Space creation, document title/Markdown save and reopen with no renderer errors. A complete process restart against the same synthetic userData restored Memory and Markdown despite a new loopback origin. These are metadata/UI tests; no claim of runtime prompt completion is made.

Following that first smoke, the product runtime dependencies were reduced to four audited roots: Hono, @hono/node-server, Zod and the MCP SDK. The copied upstream manifest remains intact; remaining build/template dependencies moved to development dependencies. No dynamic imports or runtime require calls were found in the adapter and reachable metadata modules. Final lean package rebuild passed; app size fell from 847 MB to 304 MB. The same packaged metadata UI smoke passed with no errors, and independent 900 px QA verified Memory/dialog/sidebar layout.

### Final local DMG verification

Artifact: `desktop/release/Hermes Studio-0.1.0-arm64.dmg` (131,188,031 bytes). SHA-256: `8b91311058aa38500332074a14df5fc9a84228817c2e097dac211cad456d0c77`. Production build and package commands completed with exit 0. `hdiutil verify` reported a valid image; read-only mount showed Hermes Studio.app and the Applications shortcut. Mounted app passed `codesign --verify --deep --strict`. Actual signature: ad-hoc, identifier `com.cookkie03.hermes-studio`, sealed resources present, TeamIdentifier not set. No Apple Developer certificate, notarization or publishing occurred. Archive inspection confirmed MIT LICENSE/provenance, production assets/adapter, and absence of legacy executor modules and CopilotKit runtime packages. The image was detached; nothing was installed into Applications. Synthetic runtime chat/approval/tool/save acceptance is tracked by parent integration QA separately from these packaging checks.

### Consolidamento F00 — 2026-10-04

Nuova .app arm64 ricostruita con renderer e Metadata strict typecheck senza --noCheck; firma ad hoc e codesign deep strict PASS. Smoke finale con profilo temporaneo: offline, memoria/Space/Markdown, errore di scrittura, conflitto, navigazione annullata, riavvio,900px,focus visibile e Reduced Motion PASS; nessun renderer error. Review e comandi in ../architecture/f00-review-2026-10-04.md. DMG sopra è storico: non contiene necessariamente questo incremento, non rigenerato/pubblicato in F00.
