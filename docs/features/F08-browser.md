# F08 — Browser integrato condiviso tra utente e Hermes

Stato: specifica aggiornata D27, 2026-10-04; non implementata né provata nel client. Obiettivo finale: un browser visibile dentro Hermes Studio, controllato dagli strumenti esistenti di Hermes e utilizzabile direttamente dall'utente, con profilo, cookie, storage e cronologia persistenti. Ricevute, URL e screenshot sono incrementi intermedi e non completano questa feature.

<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Verificare browser tool vs controller |
| [codebase-design](<../../.agents/skills/codebase-design/SKILL.md>) | Lease e scope del browser |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Componenti React e stato del renderer |
| [ui-test](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/frontend-testing-debugging/SKILL.md>) — condizionale | Verifica UI packaged con dati sintetici e tool realmente disponibili |
| [ux-extract](<../../.agents/skills/ux-extract/SKILL.md>) — condizionale | Solo osservazioni del browser panel che mancano |

### Punti di ingresso da leggere

- [docs/features/F11-runtime-connection.md](<../../docs/features/F11-runtime-connection.md>): Autenticazione necessaria al controller.
- [docs/features/F16-permissions-and-approvals.md](<../../docs/features/F16-permissions-and-approvals.md>): Permessi.
- [desktop/upstream/src/client/ComputerPanel.tsx](<../../desktop/upstream/src/client/ComputerPanel.tsx>): Pannello corrente.
- [desktop/electron/external-links.cjs](<../../desktop/electron/external-links.cjs>): Apertura URL protetta.
- [Hermes: tools/browser_tool.py](</Users/luca/.hermes/hermes-agent/tools/browser_tool.py>): Tool browser; lettura sorgente alla versione fissata, non prova live.
- [Hermes: tui_gateway/methods_browser_control.py](</Users/luca/.hermes/hermes-agent/tui_gateway/methods_browser_control.py>): Controller e gates; lettura sorgente alla versione fissata, non prova live.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Fonti e scelta tecnica da verificare

Leggere [ricerca del browser integrato](../research/hermes-integrated-browser.md) e [desktop ufficiale Hermes](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). Checkout studiato: `e1e82d782f353766c7a22db6e5ac4fa58bbff325`; capacità sorgente, non test live. Ulteriori ingressi pubblici: `apps/desktop/src/app/chat/right-rail/preview-pane.tsx`, `tools/drive_preview_tool.py`, `tools/read_preview_tool.py`, `tools/browser_extension_router.py`, `tools/browser_tool_cdp.py`, `gateway/browser_control_broker.py` e `tui_gateway/methods_browser_control.py`.

L'upstream ha già un webview persistente (`persist:hermes-preview`) con callback `read_preview`/`drive_preview`. Il controller `browser_*` e la connessione CDP sono altri percorsi esistenti. La stessa pagina controllata dai tool `browser_*` non è dimostrata dalla sola presenza del webview. Prima implementare una prova verticale e scegliere il percorso supportato più integrato; non aggiungere un secondo catalogo di tool o un browser parallelo. Endpoint/adapter Studio da definire dopo la prova, non inventare API già disponibili.

## Esperienza richiesta

- Pannello Browser affiancato alla chat: schede, URL, indietro/avanti/ricarica, pagina reale, attività e proprietario visibili. Aprire un risultato della ricerca Hermes può navigare questa stessa superficie su azione esplicita.
- Utente e agente vedono e modificano **la stessa pagina e le stesse schede**, senza copie o screenshot spacciati per browser interattivo. Web search e browser use sono capacità distinte del backend.
- Profilo dedicato persistente: cookie, login, localStorage e cronologia devono sopravvivere al riavvio. La history persistente va implementata/verificata: non è garantita dal solo partition persistente.
- Take over assegna il controllo all'utente e sospende/revoca i comandi browser dell'agente. Resume esplicito; nessuna gara su click/typing e nessuna cancellazione implicita dell'intero incarico.
- Chiudere il pannello non cancella profilo o lavoro. Cambiare Dot/sessione mantiene associazioni verificabili e impedisce che il vecchio owner controlli il nuovo browser.
- Una disconnessione mostra browser non controllabile e conserva la pagina; nessuna ripetizione automatica di click o passaggio nascosto a headless/cloud/altro browser.

## Contratto e architettura

Separare BrowserProfile, schede/navigation, BrowserController e lease di controllo da ricevute/tool activity. Proposte di responsabilità, non tipi già implementati. Riutilizzare la famiglia browser Hermes o i callback desktop già esistenti secondo la modalità verificata; nessun executor OpenDots alternativo.

Il controller RPC richiede identità autenticata non-internal, derivata dal server, oltre a protocollo, flag e capability supportati. L'attach anonimo attuale Studio non concede register automaticamente. Lease legato a principal/profilo/sessione/controller/browser_profile/trasporto; heartbeat, scadenza e risultato da owner esatto. Raw CDP/evaluate richiedono gates distinti: un viewer non concede Developer Mode.

CDP configurato tramite `BROWSER_CDP_URL`/`browser.cdp_url` evita avvio di un altro browser, ma compatibilità del guest Electron e isolamento devono essere provati. Non modificare config globale o runtime personale per collegare una finestra. Il percorso scelto deve preservare scope per profilo; remoto Hermes non vede automaticamente il browser del Mac.

F11 possiede connessione/autenticazione; F08 profilo browser, controller e superficie; F16 grant/takeover; F07 discovery delle capacità. ComputerPanel.tsx è condiviso con F09/F10/F17: concordare ownership prima del codice. Nessun refactor globale necessario solo per mostrare una scheda.

## Privacy e stati

Dedicated profile Studio come default proposto; nessuna copia automatica di cookie Chrome/Safari o import dei profili personali. Conservare dati browser fuori Git/log; retention e clear history/data sono operazioni esplicite, non azioni al lancio. Mantenere sandbox, context isolation, CSP, policy navigazione, pop-up e download. Nessun iframe arbitrario nella UI privilegiata.

Stati: manuale, collegamento controller, controllo agente, controllo utente, scollegato, errore. Successo tool solo dopo esito; storico tool non è controller ancora attivo. Indicatore discreto e testo comprensibile, no viewport fittizio. Reference componenti: [component-system](../design/component-system.md).

## Gate e Definition of done

1. Prova sintetica packaged: comando Hermes naviga → snapshot → click/type → esito sulla stessa pagina mostrata; azione manuale modifica DOM visibile al tool. Dimostrare binding profilo/sessione e modalità scelta.
2. Sito locale sintetico: cookie/login fittizio, storage, due schede e history; quit/restart ripristina secondo contratto documentato. Nessun account reale.
3. Takeover durante comandi in volo, resume, session switch, lease scaduto, connessione persa e risultato tardivo: nessun comando al nuovo owner o retry di azioni incerte.
4. Permesso negato/controller anonimo/stale principal/profilo remoto non compatibile restano indisponibili; nessun fallback nascosto. Navigation/download/URL non sicuri gestiti senza allentare sandbox.
5. Test tastiera/focus/900px/Reduced Motion, privacy screenshot e assenza credenziali nei log. Receipt-only resta parziale finché controllo e persistenza non superano questi gate.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e File e skill di F08. Implementa solo l'incremento selezionato del browser condiviso, leggendo la ricerca browser e verificando SHA/contratti Hermes. Parti dalla prova stessa-pagina manuale + tool e scegli fra percorsi Hermes esistenti; nessun browser/tool parallelo o config personale mutata. Mantieni autenticazione, owner e permessi. Verifica persistenza, takeover e nessun retry incerto su dati sintetici nella .app. Ricevute/screenshot non completano F08. Aggiorna scheda, prove e memoria di progetto; non implementare F09 o altre feature incidentalmente.
