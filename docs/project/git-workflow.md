# Commit e push per incrementi

Autorizzazione: Luca ha richiesto il 2026-10-04 di preparare commit e push periodici mentre inizializza Git.

Verifica 2026-10-04 F00: branch main; baseline HEAD 91f3644 prima del commit MVP; origin git@github.com:cookkie03/hermes-studio.git confermato. Conservare destinazione e storia. La richiesta F00 corrente include commit locale; pubblicazione release appartiene a F12.

Per ogni incremento coerente: completare build e verifiche pertinenti, aggiornare memoria/stato/registro, controllare diff e file aggiunti per credenziali e dati personali, selezionare esplicitamente i file, controllare index e poi commit. Escludere bundle, cache, log, archivi del runtime e credenziali. Le skill e il tracker sono parte del progetto come indicato in .gitignore.

Push dopo un commit verificato solo quando esiste una destinazione confermata. Segnalare un push riuscito solo dopo esito del comando o verifica del remote. Nessun cron o automazione è stato creato: periodico significa al completamento degli incrementi durante il lavoro autorizzato.
