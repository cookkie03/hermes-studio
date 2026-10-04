# Unsloth e Codex — componenti desktop

2026-10-04. Estrazione focalizzata sui componenti di chat/workspace, non audit esaustivo delle due applicazioni. [Sistema Hermes](../../design/component-system.md) separa osservazioni e scelte progettuali.

## Fonti

Screenshot forniti utente13:29:03 Unsloth e13:29:25 Codex, originali2940×1846 dichiarati attachment, copieprivate `.reference/ui-private/`. Ispezione Unsloth `ai.unsloth.studio` tramite nativecomputeruseAX e screenshot; accesso com.openai.codex negato, nessun bypass. Non conservati transcript/AXraw con altri titoli personali nella repo pubblica.

## Inventario osservato

Unsloth: navigationtoolbar collapse/back/forward; logosearch; azioniNewchat/Modelhub/Library/Images/Video/Audio/More; Projects/Recents disclosure; sidebar splitter valore280; accountbottom. HeaderSelectmodel/temporarychat/runsettings. Bubbleutente con navigazione varianti3/3. Responseplaintext, rowWorkedfor22s e copy/refresh/delete/more/timing. ComposerMessageinput/Askanything, Toolsattachments, permissionlevel, search/code, Dictate, Senddisabledinvuoto.

Codex screenshot: rail+sidebarprogetti/chat, selezioneconfillneutro, workspaceheader, chat+tools sidepanel con tabs/navigationaddress, toolbarcomposer model+effort/mic/send, allegatopreview, workstatus/collapsedsummaries. Non inferire popoveraperti, hover, tokensCSS o transizionidallo screenshot.

## Stato interattivo verificato

Click su Workedfor22s: collapsed→expanded, contenutodettaglio e Copyaction aggiunti; secondoclick torna collapsed. Descrivere disclosure dell'attività, senza copiare il contenuto privato di reasoning. Tentativo permissionpopover non ha prodotto cambiamento visibile; menu aperto non verificato. Non cambiati modello/permessi/config, nessun prompt, upload o chiamata eseguiti.

AXinclude controlli Runsettings nonostante screenshotmostri drawerchiuso: presenzaAX non è provadi visibilità. Questi parametri non sono trasferiti automaticamente aHermes. Focus/taborder/hover/composerautosize e animazionitemporali ancora da osservare; templatecapturecrossreferencefutureF01.

## Trasferimento a Hermes

Righe navigazione compatte e selectedstate; testo centrale conlarghezza massima; composercontoolbarsecondaria; azioni risposta fuori daltesto; disclosureprogressivedetails; pannelloutilitàcontestuale. StatoThinking tradotto in attivitàruntime/stepconfermati, non esposizioneragionamentonascosto. Delegazione/routine/plugin richiedono contratti delleloroschede prima dicontrolli attivi.

## Limiti

NessunatraversataWholeapp, resize375/768, motionGIF, letturaCSScomputed o streaming nuovo nei riferimenti. Valori dimensionali Hermes sono proposte, non misure pixelperfect del Codex. Screenshot interni non redistribuiti. Nuova richiesta componenti è implementata come spec anatomia/stati/gates, non nuovaUIcoding autorizzata.
