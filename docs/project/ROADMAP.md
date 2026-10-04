# Roadmap per feature

2026-10-04. D19–D23: consegna documentale, poi sviluppo scelto da Luca una feature per chat. [Catalogo](../features/README.md) e [piano corrente](feature-development-plan.md) sono canonici. Nessuna scadenza o completamento automatico dell'intero backlog.

| Passaggio | Risultato | Schede | Gate |
|---|---|---|---|
| Documentazione attuale | Ambiti autonomi e principi architetturali | F00–F17 | Fonti, dipendenze, prompt e criteri consultabili |
| Consolidamento MVP | Base leggibile, avviabile e persistente | F00, F01 | Limiti typecheck/UI dichiarati o risolti |
| Percorso ricerca e scrittura | Connessione, conversazione e documenti | F11, F02, F03, F15, F16 | Prova isolata di invio/risultato/salvataggio/ripresa |
| Strumenti | Browser, file, terminale, plugin, computer use | F07–F10, F17 | Capability reali, scope e risultati verificati |
| Collaborazione e routine | Bot durevoli, messaggi, deleghe e run | F04–F06 | Identità, ricevute, scheduler e continuità provati |
| Distribuzione | Software installabile con release GitHub | F12 | DMG, checksum, installazione pulita e limiti firma |
| Idee future | Voce/chiamate e specialisti Codex | F13, F14 | Solo dopo scelta esplicita |

Le righe non impongono di sviluppare tutte le feature: F12 può distribuire il solo MVP. I prerequisiti di ogni scheda prevalgono su questo ordine indicativo. Il fork è annullato. Dati personali, versioni del runtime, errori incerti, scope dei tool e file condivisi sono i rischi da verificare in ogni incremento pertinente.
