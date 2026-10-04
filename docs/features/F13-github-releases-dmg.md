# F13 — Packaging macOS e release GitHub DMG

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F13**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** distribuzione del client, distinta dalle capacità del backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Produrre release installabile della versione selezionata con .app/DMG, manifest/checksum e limiti verificabili.

**Backend e confine:** Packaging di Studio e compatibilità con Hermes scelto; nessun nuovo backend o installazione runtime personale implicita. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Primo avvio, stato connessione/host e capability onesti; funzionalità non incluse dichiarate, non demo del backlog. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** Distribuire solo feature già verificate; pubblicazione/firma/credenziali segue autorizzazione della chat. DMG storico non prova release nuova. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Build shipped graph, installazione pulita, avvio senza npm devserver, checksum/firma/notarizzazione dichiarata, upgrade/dati preservati e nessun segreto nel bundle. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


Stato: documentata, da sviluppare in una chat dedicata. Un DMG locale ad-hoc esiste; pipeline e release pubbliche non sono completate. Questo è il documento di handoff richiesto dall'utente.


<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [writing-plans](<../../.agents/skills/writing-plans/SKILL.md>) | Pipeline con gate build/verifica/pubblicazione |
| [documentation-and-adrs](<../../.agents/skills/documentation-and-adrs/SKILL.md>) | Versione, prerequisiti e limiti release |
| [wizard](<../../.agents/skills/wizard/SKILL.md>) — condizionale | Solo credenziali di firma o CI da fornire da parte dell’utente |
| [pr](<../../.agents/skills/pr/SKILL.md>) — condizionale | Se si crea una PR |
| [security-diff](</Users/luca/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.31/skills/security-diff-scan/SKILL.md>) — condizionale | Se è richiesta review del workflow/diff di packaging |

### Punti di ingresso da leggere

- [desktop/package.json](<../../desktop/package.json>): Comandi e versione.
- [desktop/electron-builder.config.cjs](<../../desktop/electron-builder.config.cjs>): Packaging.
- [desktop/scripts/sign-development.cjs](<../../desktop/scripts/sign-development.cjs>): Firma ad hoc di sviluppo.
- [desktop/scripts/verify-package.cjs](<../../desktop/scripts/verify-package.cjs>): Manifest e verifiche.
- [docs/releases/development-artifacts.md](<../../docs/releases/development-artifacts.md>): Evidenze storiche.
- [Hermes: apps/desktop/BUILDING.md](</Users/luca/.hermes/hermes-agent/apps/desktop/BUILDING.md>): Reference distribuzione Hermes; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Obiettivo

Dalla repository `cookkie03/hermes-studio` ottenere release versionate con DMG installabile, checksum, note chiare e istruzioni per utenti. L'utente scarica, apre DMG e trascina .app in Applications; non deve installare Node/npm né lanciare npm run dev. Il runtime Hermes è prerequisito esplicito finché una feature separata non ne gestisce l'installazione.

## Base concreta e scelta di versione

`desktop/package.json`, package-lock, electron-builder.config.cjs, scripts/sign-development.cjs, electron/main.cjs e README contengono packaging arm64. Fonte build/prove ../releases/development-artifacts.md. Il SHA256 storico non deve essere riutilizzato dopo un rebuild. Sources SwiftUI storico non è il prodotto principale da impacchettare per questa release.

Scegliere il tag/versione e insieme di feature realmente inclusi. Nessun repository derivato, nessun cambio origin o merge automatico da progetti esterni. Preservare LICENSE/PROVENANCE e notice delle dipendenze. Licenza del codice nuovo e branding/icon devono essere definite prima di dichiarare una release pubblica definitiva.

## Scope della chat

1. Verificare remote/GH CLI e branch/commit; working tree pulito o snapshot esplicito. Confermare versione, architetture supportate e baseline delle feature.
2. Script riproducibili install lock→typecheck shipped→fixture→build production→verify package→app→DMG→manifest checksum/size/commit/version/arch.
3. CI macOS con cache versionata, permessi minimi, workflow source-reviewed; separare build/verify e publish. Node/npm sono strumenti dello sviluppatore/CI, inclusi nel prodotto dove necessari.
4. DMG contiene .app e collegamento Applications; Electron/Node embedded e servizio UI posseduto. Nessun devserver/localhost hardcoded, secret/config/runtime/database personali incluso.
5. Firma: canale sviluppo ad-hoc dichiarato; release Apple Developer/notarization/stapling solo con account/credenziali forniti in secureCI. Non inventare identità o aggirare Gatekeeper. Se manca account, mantenere draft/devrelease chiaramente etichettata e spiegare prerequisito.
6. Generare release notes con supporto macOS/arch, feature incluse, runtime setup, limiti, install/upgrade/uninstall con dati preservati. Repo README orientato a download utente, CONTRIBUTING orientato allo sviluppo.
7. Preparare GitHub release draft associata al tag/commit verificato, allegare DMG+SHA256+manifest. Pubblicazione solo se autorizzata nella chat F13 e tutti i gate passano; non pubblicare semplicemente perché builder exit0.

Auto-updater non è obbligatorio per prima release; non aggiungere account backend/certificati o feed di aggiornamento come deviazione. Intel/universal vanno provati nativamente prima di prometterli; arm64 attuale non prova x64.

## Gate e prove

Fresh build sul commit scelto e runner pulito; firma effettiva ispezionata, codesign deep strict, integrità DMG e mount in sola lettura; .app da mount/copiata avviata senza toolchain di sviluppo esterno; userData sintetico nuovo e runtime assente significativo, poi fixture isolata per chat/error/persistenza. Richieste di permessi comprensibili e upgrade metadata senza perdita di dati. Audit di segreti e artefatti, licenza/notice/icon/privacy docs. Release assets scaricati dal draft/pubblicato e hash comparato ai locali; tag remoto e GitHub API confermano identità. Non confondere upload avviato con asset completo o release creata con pubblicata.

## Ownership e dipendenze

F0 gate della base e versione selezionata delle feature; ownership packaging/CI/docs release. Non modificare browser, Bots, routine o chat per completare F13. Se gate app fallisce, registrare blocker e correzione delimitata, non ampliare il prodotto. In questa chat di preparazione non sono creati tag, Actions o release.

## Prompt da passare a Codex

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Trasforma la repository GitHub cookkie03/hermes-studio in software macOS distribuibile seguendo esclusivamente docs/features/F13-github-releases-dmg.md. Leggi AGENTS.md, MEMORY/STATUS, ADR0006 e principles.md; verifica stato, remote e artifact reali. Prepara build riproducibile e CI, .app+DMG+checksums+note, installazione senza npm per utenti e GitHub release draft. Preserva dati, licenze e credenziali; non implementare altre feature o repository derivate. Non dichiarare notarizzazione senza prova. Prima di pubblicare verifica tutti i gate e l'autorizzazione esplicita della chat. Consegna URL release/commit e checksum confermati oppure prerequisiti precisi. Segui anche Incarico per la chat implementatrice di F13: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
