# F2 — Invio scoped e bozze: verifica incremento

Lavoro avviato 2026-10-04; chiusura 2026-10-05 (Europe/Amsterdam). Baseline Studio `ecdddfa473015f4aee47405a6f8813de44e16e72`. Scheda selezionata dall’utente: [F2](../features/F2-conversations.md). Incremento consegnato: sicurezza della preparazione/invio e conservazione bozze. **Non certifica F2 completa.**

## Risultato e ownership

`ConversationSubmission` possiede lock per preparazione/dispatch e chiusura della vista. Dopo un await ricontrolla l’eligibilità runtime; chiusura chat o scelta host invalida l’owner, senza cancellare lavoro già ricevuto dal backend. Un risultato HTTP tardivo non modifica una vista nuova. Chat legge anche la fase runtime corrente e invalida l’invio sincronicamente su lavoro/disconnessione/stream perso. L’ID di invio diventa stabile prima del POST; nella chat pagina la riga Pending compare dopo il salvataggio, un limite esplicito della baseline più ampia.

Bozze: scritture serializzate per thread anche attraverso remount; flush all’uscita dalla vista prima del debounce. Una bozza nuova durante dispatch resta; lo svuotamento intenzionale persiste. Errori conservano la copia locale; il flush al quit brusco/process kill non è una garanzia di fsync. Nessuna migrazione distruttiva.

Bridge: ack/error correlati al requestId ancora corrente; ack tardivo non regredisce Working e non altera un turno successivo. La delivery archiviata del messaggio originario viene aggiornata, senza emettere uno stato del turno sbagliato. `clientSubmissionId` accompagna l’ack per aggiornare la riga esatta.

Contratto condiviso F1/F2: `ConversationHost.onChanging?` invalida il preparatore prima del PUT; `onChanged` in finally rinnova la vista sia dopo successo sia dopo errore. F1 resta owner di routing/binding; F2 dell’invio. `PageConversation` e writer F6 non modificati: si usa il loro beforeSend (flush + lettura revisione salvata).

## Matrice requisiti → contratto → codice → prova

Sorgente Hermes riletto a SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`, solo file pubblici: `tui_gateway/methods_prompt.py` prompt.submit, `methods_session.py` session.create/resume/interrupt e close_on_disconnect, `contracts/events.py` message.delta/complete. È evidenza sorgente, non collaudo di un modello live. Prove integrazione con fixture HTTP/WebSocket stdlib, profilo Studio sintetico e SSE/REST reali.

| Requisito | Contratto/autorità | File | Esito/prova |
|---|---|---|---|
| Doppio invio, preparazione cancellata, stato rivalidato | Ciclo submission frontend; runtime autorevole | conversation-submission.ts/test, Chat.tsx | 6 test comportamentali PASS; packaged doppio Enter e preparazione cancellata |
| Ack dopo delta/terminale/nuovo turno | prompt.submit, message.delta/complete | bridge.mjs/test | Regressione red: accepted sostituiva running; green PASS, nessun evento sul turno successivo |
| Cambio chat durante HTTP/stream | REST send + SSE scoped F1 | Chat.tsx, script packaged F2 | PASS: Beta resta vuota e conserva draft; nessun secondo POST |
| Cambio host mentre preparazione attende | thread-host PUT, callback F1/F2 | ConversationHost.tsx, Chat.tsx | PASS: PUT tenuto prima della trasmissione, salvataggio liberato, zero invii; binding poi confermato |
| Page chat dopo close, revisione salvata | beforeSend F6, pageReference validato nel server | Chat.tsx; caller PageConversation invariato | PASS: nessun invio dopo close; invio esplicito con id/spaceId/revision identici alla pagina salvata |
| Bozza nuova, clear, remount/restart/origin | Draft API Studio, non memoria Hermes | Chat.tsx, script packaged F2 | PASS: due bozze separate, clear prima del debounce, riavvio su nuova porta/origin |
| Delta precoce e output tool tardivo | Eventi nativi proiettati dal bridge | bridge, Chat, fixture | PASS: una riga utente/assistant, risultato tool dopo terminale; nessun contenuto personale |
| Scope negato, cancel approval, disconnect/resume | Contratti baseline F1/F3 | Test bridge/connections/network esistenti | Suite PASS; prova fixture/unit/network, non nuovo collaudo GUI/live approvals o reconnect F2 |
| UI accessibile e responsive | Component system esistente | Script packaged F2 | PASS: IME Enter non invia, Shift+Enter newline, focus-visible, 900/1360 senza overflow, Reduced Motion; VoiceOver/zoom non collaudati |

## Comandi ed evidenze

- `cd desktop && npm test`: **PASS**, 36 Node e 61 metadata/display (11 file); typecheck renderer/metadata, bootstrap e external-link boundary PASS.
- `cd desktop && npm run package:dir`: **PASS**, build renderer/metadata, manifest 13 moduli, verify:package e firma ad hoc/deep resource verification; non notarizzata, nessuna release.
- `cd desktop && npm run test:packaged-conversations`: **PASS** finale. Renderer reale → REST/SSE → bridge → HTTP/WS fixture. SSH alternativo solo registro sintetico offline `fixture.invalid`, autoConnect false: nessuna connessione SSH esterna.
- `python3 -m py_compile Verification/RuntimeWebSocketFixture.py`, `node --check desktop/scripts/test-packaged-conversations.cjs`, `git diff --check`: PASS.

Artefatti sintetici finali fuori Git: `/private/tmp/hs-conversations-ui-V0zZIW/chat-1360.png`, `chat-900.png`. Profilo e screenshot temporanei conservati per verifica. Browser plugin/skill non disponibile; usato Playwright Electron del progetto per la vera .app. Nessun framework overlay o pageerror osservato; controlli nominati, timeline e composer presenti. A 900px Computer usa l’overlay baseline F4: il test prova assenza di overflow e focus, non una nuova review completa del layout OpenDots.

Primo packaging/suite nel sandbox bloccati da rete/EPERM sui socket/servizi sintetici; ripetuti con escalation approvata, PASS. Smoke iniziale fallito perché route.fetch bypassava l’iniezione auth Electron; ritardo spostato nel fetch browser originale senza esporre owner-token. Il test restart ha fatto emergere flush/debounce: corretto e verificato con nuovo pacchetto. Preparazione host inizialmente aveva barriera già vera: sostituita con gate HTTP esplicito prima della trasmissione.

## Review e limiti

Review Standards/Spec indipendenti, contro baseline dichiarata e diff working tree: trovata finestra evento-before-render e gap test preparation/host; corretti. Rilettura finale: **0 findings aperti per asse**. Skill lette/applicate: ask-matt, implement, codebase-design, tdd (seam già richieste da F2: ciclo pubblico/bridge/GUI), react-best-practices, frontend-testing-debugging, code-review, documentation-and-adrs. Retro letta: rendere le attese su esiti osservabili; preservare injection auth nelle prove Electron; nuovi seam test inclusi nel gate npm test. Nessuna nuova policy globale o CI introdotta.

Gate F2 ancora aperti: modello reale in Hermes isolato, interrupt/resume GUI e reconnect completi, thinking emesso, modello/effort/Space effettivi, @/ / degli owner, roster/Bot Chat F7, F8 note post-turn, F3 approvals complete, F14 collaborazione, troncamento e autoscroll senza disturbo. Non leggere/importare credenziali/sessioni personali per queste prove. Non sintetizzare capability mancanti o avviare backend alternativo. L’attuale .app e la fixture non certificano parità Hermes o durata24h.
