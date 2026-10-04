# F1 — Connessioni locale/SSH e autonomia Hermes

Status: draft tecnico; scelte di prodotto confermate, review spec/piano pendente.

Spec: docs/project/F1-connection-design.md. Piano: docs/project/F1-implementation-plan.md. Owner F1: registry, SSH, lifecycle host, routing sessioni/eventi. Shared files bridge/server/Chat/WorkspaceDialog solo per contratto host. Dipendenza F0 completa. D32/D33; D34 e Space multi-host conservati per altre chat.

Gate: due host/IDs collision, auth key/password volatile, stale reconnect senza retry, snapshot/migrazione, servizi persistenti indipendenti da UI/SSH, packaged sintetico. Registrazione servizi missing proposta da revieware; niente software runtime personale installato/aggiornato. Nessuna feature marcata completa prima dei gate reali.
