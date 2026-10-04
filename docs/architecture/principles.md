# Principi di architettura e manutenzione

2026-10-04. Norme per tutte le chat feature. La [review iniziale](feature-architecture-review.md) è storica; la [review F0](f00-review-2026-10-04.md) documenta la consegna. I [confini delle feature](feature-boundaries.md) fissano ownership condivisa; le direzioni sotto non dichiarano refactor già eseguiti.

## Moduli profondi e locality

Un module concentra comportamento dietro una piccola interface; questa comprende anche invarianti, ordine, errori e proprietà di persistenza. I chiamanti non devono conoscere il formato raw JSON-RPC o la sequenza di ripresa di Hermes. Una seam utile ha variazioni reali: runtime Hermes e adapter sintetico sono due adapter concreti. Non aggiungere wrapper pass-through soltanto per ottenere più cartelle.

Applicare il deletion test: eliminare il module disperderebbe conoscenza in N chiamanti? Se sì protegge locality; se no può essere shallow. Interface = test surface: prove delle operazioni reali, non soltanto copie del calcolo interno. Separare orchestrazione della Conversazione dalla presentazione senza estrarre ogni riga in un helper.

## Invarianti condivise

- Stato runtime autorevole. Invio, ammissione, lavoro e completamento sono distinti. Un timeout non autorizza un retry automatico.
- Identità di Dot, Bot, thread, sessione durevole ed esecuzione sono distinte. Nessuna associazione fondata soltanto sul nome visibile.
- Hermes esegue i suoi tool. Studio presenta/coordina capacità verificate, senza duplicare un executor o alterare permessi implicitamente.
- Metadata Studio distinti da memoria e archivio Hermes. Importazioni/migrazioni esplicite, revisioni e conflitti preservano bozze.
- Renderer senza Node/filesystem/shell generici. Privilegi Electron limitati; owner-token solo processo locale, mai nei log o nel renderer.
- API/eventi filtrati per sessioni possedute. Un evento di una sessione personale sconosciuta non deve raggiungere nessuna chat Studio.
- Chiudere pannello/client/socket non equivale a interrompere/cancellare un'esecuzione. Capability e lease hanno una durata esplicita.
- Segreti nel deposito sicuro appropriato, non database documenti, prompt di test, screenshot pubblici o Git.

## Organizzazione per feature

Mappa attuale: `desktop/electron/` ciclo applicazione; `desktop/hermes/` trasporto/orchestrazione; `desktop/upstream/src/client/` UI riusata; metadata upstream in `src/server/`; Sources SwiftUI baseline storica. Una cartella per feature è una possibile evoluzione, non un obbligo immediato di spostare tutti i file.

Ogni scheda nomina module responsabile, seam condivisa, file posseduti, input/eventi, persistenza e dipendenze. Un contratto cross-feature va discusso e documentato prima di modificare i chiamanti. Evitare un controller globale che possiede chat, routine, plugin, browser e file insieme. Non imporre una nuova astratta interface quando non esiste una seconda variazione reale.

## Quality gates

Per ogni incremento: leggere la scheda e baseline; test di comportamento/red-green per rischi veri; typecheck del codice spedito; prove del failure mode rilevante; smoke packaged se cambiano shell/privilegi/integrazione; confronto UI e tastiera se cambia un componente. Review Standards e Spec restano assi separati.

F0 ha separato i contratti Metadata dal tipo Platform CopilotKit: il grafo spedito renderer/metadata passa strict typecheck e build senza --noCheck. Il typecheck upstream completo e alcune suite storiche restano incompatibili nel vecchio executor inutilizzato. Il gate npm test riguarda il prodotto spedito; non dichiararlo audit completo del template storico.

Per Git: diff e index reali, scan segreti, nessun add indiscriminato di cache/DB/release/screenshot privati. Un commit verificato può essere un incremento parziale, ma la descrizione ne deve dichiarare limiti. Preservare history/remote. Test green, build e handshake non certificano feature non esercitate.

## Decisioni e review

ADR per variazioni costose a persistenza/identità/autenticazione/lifecycle. Proposta prima della scelta, decisione accettata dopo scelta. Nessun refactor automatico basato soltanto su un report della skill. Retro: trasformare bug ripetuti in verifiche deterministiche al seam giusto, senza aggiungere test che riscrivono l'implementation.

## Parità e osservabilità Hermes — D30

[Contratto F8](../features/F8-hermes-native-features-and-observability.md): preservare le funzioni native del runtime e mapparle a superfici UI o gap espliciti. UI semplificata non disabilita memory/skills/curator/tools nel backend. La memoria Hermes resta autoritativa, Studio presenta dati derivati scoped; niente nuovo archivio reiniettato. Eventi post-turn restano osservabili dopo la risposta, con origine/esito e persistenza provata; review, proposte pending e curator distinti. Parità funzionale obiettivo versionato, non certificazione automatica o implementazione di tutte le feature.
