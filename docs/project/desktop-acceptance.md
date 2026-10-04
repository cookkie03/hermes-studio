# Gate della prima build OpenDots desktop

2026-10-04. Esecuzione e prove del nuovo client; le verifiche SwiftUI precedenti non chiudono questi gate. Dati sintetici in directory temporanea; nessuna lettura delle conversazioni personali.

| Percorso | Risultato da provare | Stato |
|---|---|---|
| Apertura .app da artefatto | finestra significativa, servizi gestiti, nessun devserver o Node esterno | PASS primo artefatto arm64; ripetere dopo pruning |
| Sidebar screenshot | Spaces sopra Dots, avatar/lista, Memory/Settings; confronto screenshot | pendente |
| Space/documento | creazione, editor, autosave e riapertura; conflitto revisione preserva dati | packaged UI creazione/source/autosave/riavvio PASS; conflitto fixture409 PASS |
| Dot | creazione/istruzioni persistenti, thread associato; niente keygate CopilotKit | pendente |
| Memoria | aggiunta/eliminazione esplicita persistente; chiarire uso del runtime | aggiunta/riapertura/riavvio PASS; eliminazione non ancora UI |
| Collegamento Hermes | health/ready e stato offline autentico, niente prompt automatico | bridge Node live handshake PASS Hermes0.21.5, nessuna sessione/prompt |
| Chat | invio sintetico, delta/finale/errore e riapertura; sessioni stored/runtime distinte | pendente |
| Interruzione | richiesta esplicita e terminal event separati; perdita socket non cancella | pendente |
| Approvazione | ID corretto, richiesta annullata non approvabile, singola risposta | pendente |
| Strumenti | eventi Hermes browser/search/files/shell reali e provenienza | pendente |
| Computer | mostra solo capacità supportate; assenza di takeover spiegata | pendente |
| Sicurezza | api owner-token, origin, renderer isolato, redirect senza token, chiusura solo processo proprio | pendente |
| DMG | artefatto montabile e .app funzionante, firma/notarizzazione riportate precisamente | pendente |
| Commit/push | diff/index/segreti verificati e esito comando confermato | pendente incremento desktop |

Voice telefonica, Codex specialisti, automatico upstream merge e prova24h non appartengono al gate di questa build. Non considerare proprietà UI come permessi del runtime senza enforce reale. Registra ciascuna prova con comando/ambiente/esito e limita le affermazioni a ciò che è osservato.
