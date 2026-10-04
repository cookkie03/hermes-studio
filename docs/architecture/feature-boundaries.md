# Confini e collaborazione fra feature

2026-10-04. Riferimento trasversale per concordare ownership; non refactor implementato né autorizzazione a sviluppare più schede. Dipendenze/ambito dettagliati nel [catalogo](../features/README.md) e nella scheda selezionata. File esistenti negli ingressi delle schede; nomi di adapter futuri sono proposte.

| Comportamento condiviso | Owner del comportamento | Consumatori / confine |
|---|---|---|
| Connessione, autenticazione e routing host/profile/session | F1 | F2/F7/F11/F8 usano trasporto scoped; non aprono un secondo executor/socket globale |
| Conversazione/bozza/transcript/turn state | F2 | F17 audio e F8 note native forniscono eventi; F2 decide presentazione/owner, non inventa correlazioni |
| Root, file refs, listing/read/write/revisione/conflitto | F5 | F6 Space/editor e F9 memoria su file condividono writer; nessun store di testi divergente |
| Space, cartelle collegate, editor e review save | F6 | F5 operazioni file; F3 grants; le pagine MVP legacy sono preservate |
| Avatar/identità Dot e binding bot/profilo | F7 | F4 mostra identità; F14 collaborazione e F8 viewer usano binding verificato. Avatar locale non crea profilo |
| Richieste approvazione/grants/cancel/idempotenza | F3 | Tutte le feature sensitive; F4 è shell, non owner dei permessi |
| Memoria Markdown dello Space/preferenze legacy | F9 | F5 writer; F6 editor. Gestione built-in eventuale F9-C usa backend esistente, non nuovo archivio |
| Viewer memoria Hermes, note review e copertura native | F8 | F1 eventi, F2 timeline, F7 scope. Provider/profilo Hermes autoritativi; cache UI solo derivata |
| Skills/plugin/toolsets/MCP e manutenzione autorizzata | F11 | F8 rende visibili esiti/status; viewer non lancia curator/review/installazioni |
| Browser condiviso e presa controllo | F12 | F1 controller/routing, F3 grant; stessa pagina/profilo, niente browser parallelo |
| Computer, terminale, routine, voce | F16/F15/F10/F17 rispettivamente | Pannello condiviso F4; comportamento rimane feature specifica |
| Packaging e release | F13 | Distribuisce una versione/grafo selezionati, non implementa le altre capacità |

## Prima di modificare un file condiviso

Indicare la scheda e il singolo incremento, chiamanti del contratto e file da toccare. Separare owner semantico da ownership temporanea del file: nessuna chat possiede App.tsx o bridge.mjs interi. Concordare input/eventi, ordine, esiti, scope e prove prima dell'edit. Se emerge un prerequisito fuori feature, documentare il contratto e il gate; implementarlo nella stessa chat solo se l'utente ne include esplicitamente l'ambito.

Controllare scope locale vs host remoto, dati autorevoli vs derivati, esito applicato vs staged e retry di azione incerta. Per principi di moduli/quality gate leggere [principles](principles.md); per sequenza/skill leggere [workflow](../agents/feature-workflow.md).

## Settings e chat native — D34

F4 possiede la sezione Settings distinta in Hermes e Hermes Studio. F1 connessioni; F8 inventario impostazioni native/copertura; ogni feature possiede le proprie mutazioni, con F3 approvazioni. F2 presenta streaming/thinking/tool/codice/changes/approvals; F5/F15 conservano semantica file/terminale. Nessun settings endpoint generico o secondo writer config runtime per unificare la UI. F1 non implementa incidentalmente la parità chat o settings completa.
