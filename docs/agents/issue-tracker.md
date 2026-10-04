# Tracker: Markdown locale

Scelto per il setup iniziale perché questo repository non ha un remote. L'utente ha richiesto di impostare le skill e le basi del progetto in questa cartella; nessun tracker esterno è stato creato.

- Spec canonica: `.scratch/hermes-desktop/spec.md`.
- Un ticket per file: `.scratch/hermes-desktop/issues/NN-slug.md`.
- Ogni ticket dichiara `Status`, `Blocked by`, risultato per l'utente e criteri di accettazione.
- `draft`: proposta ancora da rivedere; `ready-for-agent`: ambito e dipendenze approvati; `in-progress`: assegnato e in lavorazione; `blocked`: impedimento concreto descritto; `done`: tutti i criteri verificati con evidenze.
- I ticket attuali sono **draft**, non un'autorizzazione implicita all'implementazione.
- Prima di iniziare controllare che ogni blocker sia `done` e che la revisione del design necessaria al percorso scelto sia completata.
- Aggiornamenti ed evidenze vanno in `## Evidence`; discussioni in `## Comments`.
- Quando una skill dice “publish”, scrivere il file locale. Quando dice “fetch”, leggere quel file integralmente.
- Nessuna skill `triage` installata: non servono mapping o etichette di triage. I ticket generati dal piano non passano per triage.

Per migrare a GitHub/Linear servirà una scelta esplicita del repository/tracker; mantenere gli ID e le dipendenze.
