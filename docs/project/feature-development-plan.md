# Piano corrente: una feature per chat

Consolidato 2026-10-04. D20/ADR0006: sviluppo globale sospeso; F0 completata. Attività corrente: rinumerazione D31. La sequenza F1–F18 segue l’ordine concordato; F1 è il prossimo incremento consigliato, da selezionare in chat dedicata. [Catalogo](../features/README.md) seleziona le schede, [STATUS](STATUS.md) riporta gate/esiti, [decisioni](decisions.md) preserva la direzione.

## Percorso della prossima chat

1. L'utente sceglie Fxx e un incremento verticale della scheda. Numero di feature e roadmap non autorizzano il resto.
2. Leggere MEMORY/STATUS, scheda, ADR pertinenti e [workflow](../agents/feature-workflow.md); verificare dipendenze reali e [ownership](../architecture/feature-boundaries.md).
3. Delimitare file/contratto/prove. Se manca un prerequisito, mantenere lo scope e documentare il gap; niente feature simulate.
4. Implementare solo quanto selezionato; prove sintetiche e profilo isolato, review Standards/Spec proporzionata.
5. Aggiornare scheda, STATUS, MEMORY se cambia direzione e WORKLOG. Verificare diff/index/segreti, commit e push sul remote confermato. Release solo in chat F13 autorizzata.

## Percorsi possibili, non selezionati

- Cartelle e documenti: primo incremento F5 locale, poi integrazione Space F6; F9 per memoria progetto su file.
- Dialogo Hermes: F1 → F2; F3 per approvazioni; F8-A per note post-turn e F8-B per viewer read-only.
- Avatar: F7-A locale indipendente dal binding Hermes; F7-B prima di collaborazione bot F14.
- Routine/plugin/browser/computer/terminale/voce: scheda rispettiva con backend/capability/grants verificati. Telefonate e specialisti restano future.
- Prima distribuzione: F13 può pubblicare solo MVP, con funzionalità e limiti dichiarati; non richiede tutto il backlog.

Una chat per feature e nessuna nuova chat creata automaticamente. Piani notturni e ticket precedenti sono storia. Consolidare documenti non seleziona refactor, nuovo runtime o migrazione dei dati.
