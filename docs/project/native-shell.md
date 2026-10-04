# Build di sviluppo Hermes

```bash
bash scripts/build-app.sh
bash scripts/check-persistence.sh
open build/Hermes.app
```

Bundle locale ad hoc, non release distribuita o notarizzata. SwiftPM senza dipendenze. Lo script seleziona SDK 26.5 perché lo SDK 27 presente nei CLT non include SwiftUIMacros richiesto dal nuovo State. Override: HERMES_MACOS_SDK. Nessuna modifica globale xcode-select.

Workspace: team, breve incarico locale, documento Markdown e browser manuale affiancati. Conversazioni e titoli locali, bozze, inspector e Settings. Nessun runtime Hermes collegato: invio, delega, browser/computer use e scheduling ancora assenti. Markdown ha un'anteprima SwiftUI di base, non un universal editor o un renderer completo.

Persistenza nello spazio dedicato HermesDesktop-Development; nessuna lettura o modifica diretta del profilo Hermes personale. Unknown/corrupt archive conservato, modifiche disabilitate. Riferimenti invalidi non sovrascrivono un archivio valido. Documenti v1 precedenti caricati con documento inizialmente vuoto.

Test: XCTest è assente nei CLT, quindi swift test resta non eseguibile in questo ambiente. scripts/check-persistence.sh compila ed esegue sei verifiche Foundation sugli stessi comportamenti pubblici, inclusa compatibilità degli archivi precedenti e documento Markdown alla riapertura. Le quattro prove XCTest originarie restano disponibili per un ambiente Xcode.

Browser nativo richiede macOS 26; macOS 14 non testato dal vivo. Nessuna prova 24/7, reale integrazione agenti o audit completo VoiceOver concluso. ADR 0003/0004 spiegano queste scelte e i limiti.
