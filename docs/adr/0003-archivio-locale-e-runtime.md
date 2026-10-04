---
status: accepted
---
# Archivio locale distinto dallo stato del runtime

2026-10-04. La prima build deve essere utile anche senza collegamento Hermes, senza alterare le conversazioni personali. La continuità richiesta impone salvataggio di bozze e documenti indipendente dalla ricostruzione delle viste.

Scelta: un archivio JSON versionato in Application Support/HermesDesktop-Development. WorkspaceRepository espone load/save, valida riferimenti e scrive atomicamente. Il documento aggiunto è opzionale nel decode degli archivi v1 precedenti. Uno store main-actor possiede il Workspace e presenta errori di lettura/scrittura. Un archivio illeggibile o di versione sconosciuta disabilita le modifiche; il file originale resta conservato.

Non memorizzare qui lo stato autorevole degli incarichi Hermes. Quello appartiene al runtime, come proposto in ADR 0001. L'archivio locale potrà evolvere dopo aver verificato trasporto e recupero dello stato.

Alternative: UserDefaults semplice per preferenze ma inadatto ai documenti; database embedded prematuro per pochi dati locali; scrivere nel database personale Hermes introdurrebbe accoppiamento e rischio non autorizzati.

Conseguenze: nessun lock multi-processo o storage multiutente in questa build. Salvataggio sincrono di piccoli dati; rivalutare quando dimensioni e frequenza effettive lo richiedono. Errori mostrati senza fingere che il dato sia salvato. Controlli sulla persistenza attraversano load/save; prove dello store e conflitti tra processi restano lavoro da valutare nella review.
