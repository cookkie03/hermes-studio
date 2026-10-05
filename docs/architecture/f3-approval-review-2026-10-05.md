# F3 — identità e lifecycle delle decisioni

2026-10-05. Baseline Git `7e6fad3`. Incremento frontend/adapter soltanto F3.

## Contratto e ownership

Sorgente locale Hermes `e1e82d782f353766c7a22db6e5ac4fa58bbff325`: `tui_gateway/contracts/server_requests.py` ApprovalRequestParams/ApprovalResult/RequestCancelPayload e `tui_gateway/server.py` approval handler. Contratto letto, non prova runtime live. RPC `approval`, risposta sul medesimo ID; choices once/session/always/deny, cancel timeout/interrupted/shutdown/resolved/session_closed.

Il bridge è il decision module esistente; non aggiunto executor o policy concorrente. Ogni card riceve decisionId effimero. REST manager richiede thread posseduto, bridge del relativo host e decisionId corrente; il bridge preserva l’identità sui replay aperti e la rinnova dopo cancel/reconnect. Il parametro opzionale al bridge conserva la compatibilità dei chiamanti fidati interni; REST richiede sempre decisionId. Una lease attiva sullo stesso host è necessaria al dispatch; una view può aprire l’indicatore di altra chat. Choices inviate devono appartenere sia all’enum del contratto sia alla richiesta. Nessun auto-approve, retry, tool/config attivato.

Card OpenDots con Dot/host/conversazione, comando e descrizione native; labels Allow once/for this session/permanently/Deny soltanto se offerte. Pending, sending, sent, cancelled, expired e uncertain distinti. `sent` conferma il dispatch locale sul socket, non una ricevuta di applicazione runtime né completamento del tool. Cancellazione scoped per decisionId; error HTTP incerto non abilita retry. Disconnect rimuove card non più affidabili; nuove richieste arrivano da replay. Le card terminali sono stato della view, non archivio persistente di grants.

## Matrice

| Requisito | File | Prova/esito |
|---|---|---|
| Vecchia card dopo reconnect con RPC omonimo | bridge.mjs, connections.mjs, Chat.tsx | Test red prima della correzione, green dopo: vecchio decisionId rifiutato, nuovo inoltrato una volta |
| Replay, scelte fuori enum, handler sparito | bridge.mjs | Fixture bridge PASS, replay conserva identità, enum inventato/lease assente non inviano |
| Host/chat omonimi | connections.mjs | Fixture due host con stesso runtime/RPC ID PASS, risposta solo al host posseduto |
| Lifecycle, doppio click, cancel e riuso ID | Chat.tsx | .app → REST/SSE → HTTP/WS sintetico PASS, Allow once una volta, timeout, nuova card omonima, Deny |
| Tastiera/layout/motion | Chat.tsx | Pulsante Deny focus e Enter, 900/1360px senza overflow card, Reduced Motion PASS; nessun pageerror |

## Comandi e review

Da `desktop`: `npm test`, `npm run package:dir`, `node scripts/test-packaged-approvals.cjs`. Suite finale 45 Node + 61 metadata/display, typecheck renderer/metadata, bootstrap/external-links PASS. Build renderer/metadata e package arm64/firma ad hoc PASS; warning bundle >500kB preesistente. Sandbox iniziale impediva listen/service/download; esecuzione con accesso appropriato alle fixture/download PASS.

Review Standards e Spec via due agenti secondo skill code-review: entrambi hanno trovato la dedupe per requestId delle card terminali; corretta con decisionId per ricezione/cancel/resolved e verificata nel packaged smoke con timeout → nuova richiesta omonima. Nessun altro problema concreto segnalato nell’incremento. Skill lette: ask-matt, implement, codebase-design, tdd, axiom-design e hig, frontend-design, code-review, documentation-and-adrs.

## Gate aperti

Hermes reale isolato/model acceptance non eseguiti; nessun runtime/credenziale/chat personale usato. Full VoiceOver, ritorno focus dopo rimozione pulsante, persistente storico grant e ambiti Space/profilo/modello/effort completi non certificati da questo smoke. Indicatori background/lease capability erano già presenti; lifecycle completo dell’indicatore background dopo cancel non chiuso. Grants folder/browser/memory/voice e GUI approve/discard `/memory pending` non aggiunti: dipendono da contratti/owner selezionati. Nessuna ricevuta runtime inventata. F3 completa non dichiarata. Push/release non eseguiti; modifiche documentali concorrenti preservate.
