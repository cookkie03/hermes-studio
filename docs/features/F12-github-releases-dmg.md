# F12 — Rendere Hermes Studio software distribuibile su GitHub

Stato: documentata, da sviluppare in una chat dedicata. Un DMG locale ad-hoc esiste; pipeline e release pubbliche non sono completate. Questo è il documento di handoff richiesto dall'utente.

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
7. Preparare GitHub release draft associata al tag/commit verificato, allegare DMG+SHA256+manifest. Pubblicazione solo se autorizzata nella chat F12 e tutti i gate passano; non pubblicare semplicemente perché builder exit0.

Auto-updater non è obbligatorio per prima release; non aggiungere account backend/certificati o feed di aggiornamento come deviazione. Intel/universal vanno provati nativamente prima di prometterli; arm64 attuale non prova x64.

## Gate e prove

Fresh build sul commit scelto e runner pulito; firma effettiva ispezionata, codesign deep strict, integrità DMG e mount in sola lettura; .app da mount/copiata avviata senza toolchain di sviluppo esterno; userData sintetico nuovo e runtime assente significativo, poi fixture isolata per chat/error/persistenza. Richieste di permessi comprensibili e upgrade metadata senza perdita di dati. Audit di segreti e artefatti, licenza/notice/icon/privacy docs. Release assets scaricati dal draft/pubblicato e hash comparato ai locali; tag remoto e GitHub API confermano identità. Non confondere upload avviato con asset completo o release creata con pubblicata.

## Ownership e dipendenze

F00 gate della base e versione selezionata delle feature; ownership packaging/CI/docs release. Non modificare browser, Bots, routine o chat per completare F12. Se gate app fallisce, registrare blocker e correzione delimitata, non ampliare il prodotto. In questa chat di preparazione non sono creati tag, Actions o release.

## Prompt da passare a Codex

> Trasforma la repository GitHub cookkie03/hermes-studio in software macOS distribuibile seguendo esclusivamente docs/features/F12-github-releases-dmg.md. Leggi AGENTS.md, MEMORY/STATUS, ADR0006 e principles.md; verifica stato, remote e artifact reali. Prepara build riproducibile e CI, .app+DMG+checksums+note, installazione senza npm per utenti e GitHub release draft. Preserva dati, licenze e credenziali; non implementare altre feature o repository derivate. Non dichiarare notarizzazione senza prova. Prima di pubblicare verifica tutti i gate e l'autorizzazione esplicita della chat. Consegna URL release/commit e checksum confermati oppure prerequisiti precisi.
