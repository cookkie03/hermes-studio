# Indice delle ricerche e delle evidenze

Ricerche raccolte il 2026-10-04. Una fonte pubblica o un contratto nel sorgente non prova il funzionamento del backend collegato a Studio. Per esiti prodotto usare [STATUS](../project/STATUS.md); per requisiti scegliere la [scheda](../features/README.md). Non aggiornare i risultati storici con supposizioni: una nuova verifica deve indicare data, versione, metodo e limiti.

| Report | Evidenza e versione | Uso e limite |
|---|---|---|
| [Memoria Hermes](hermes-memory-system.md) | Documentazione ufficiale e codice pubblico SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325` | F15/F18/F07; livelli, curator, notifiche e provider. Nessun archivio personale o runtime esercitato |
| [Browser integrato](hermes-integrated-browser.md) | Codice alla stessa SHA `e1e82d7` | F08: controller/callback/CDP candidati, persistenza e takeover ancora gate |
| [Desktop ufficiale](hermes-desktop-reference.md) | Lettura sorgenti alla SHA precedente `1cb26bf248e150f715ce8a487fdef2a2bef6b541` | Ingressi F02/F11/F16 e ownership; non il pin degli audit memoria/browser successivi |
| [Contratto runtime iniziale](runtime-integration-findings.md) | Sorgenti alla SHA `1cb26b…`, baseline SwiftUI storica | Architettura/protocollo come riferimento, non stack attuale o verifica live |
| [Hermes UI osservata](hermes-live-features.md) | App v0.21.5+6453, inventario e albero AX | Funzioni esposte, non contratti API testati; versione distinta dal checkout |
| [OpenDots](opendots-reference.md) | Sorgenti pin `c2569bb6a13a22e565cf3eb791c62267d06babb1` | Composizione UI, MIT e limiti template; screenshot utente resta autorevole |
| [Fonti iniziali](sources.md) | Link upstream e osservazioni datate | Provenienza, non lista delle funzionalità completate |
| [Liquid Glass/skill](liquid-glass-skills.md) | Ricerca catalogo/CLI iniziale, prima della scelta stack | Storia della selezione nativa; stato installazioni corrente nel catalogo skill |
| [Gusto/design](design-taste-skills.md) | Ricerca iniziale skills.sh/repository | Raccomandazioni e dati di adozione storici, non approvazione del nuovo design |

Per UI/componenti: [target](../design/opendots-target.md), [component-system](../design/component-system.md) e [libreria delle osservazioni](../ux-extracts/desktop-components/pattern-library.md). Unsloth ha riscontri UI/AX; Codex screenshot utente e limite di accesso registrato. Token e durate proposti non sono misure del prodotto osservato.

Per skill disponibili/applicate leggere [catalogo](../agents/skills-catalog.md) e WORKLOG della chat. Le ricerche di installazione non sono un inventario aggiornato. Link pubblici a `main` o alla documentazione possono cambiare: verificare la versione prima di implementare il contratto scelto.
