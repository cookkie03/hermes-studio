# Requisiti trasversali — contesto visibile e composer Hermes

2026-10-04. Richieste utente confermate; specifica, non implementation. Scheda trasversale alle feature esistenti, senza nuova feature numerata e senza modificare F0/F1. Owner: F4 shell/composer visivo, F2 conversazione e contesto turno, F6 Space/progetti, F5 riferimenti file, F7 identità, F11 cataloghi Hermes, F3 approvazioni, F8 capacità native.

## Vincolo: Studio è il frontend di Hermes

Hermes rimane backend, executor e fonte di verità per progetti, sessioni, bot, modelli/effort, skill/tool e permessi. Dots e Spaces sono nomi UI e associazioni esplicite alle entità Hermes. Studio non crea backend parallelo, scheduler, memoria reiniettata o API fittizie. Metadata di presentazione, bozze e riferimenti locali non diventano nuove capacità dell’agente. Una capability assente/non verificata si mostra indisponibile con motivo; nessuna simulazione o fallback verso un altro executor.

La matrice della singola feature deve riportare contratto backend/versione, dato effettivo e superficie Studio. Il catalogo di comandi/skill/tool non implica che ogni voce sia direttamente invocabile dall’utente. Nessuna nuova feature backend in queste chat frontend.

## Contesto sempre riconoscibile

Header persistente e composer mostrano il contesto della chat/bot attivo: **Space, host di esecuzione, modello e reasoning effort**. Dot/avatar e stato runtime restano riconoscibili. Non lasciare host o Space soltanto in un menu nascosto; la sidebar evidenzia lo Space della conversazione, distinto da hover/selezione di un documento.

| Campo | Autorità e comportamento |
|---|---|
| Space | Progetto Hermes scoped a connessione/profilo/projectId, con cartelle del progetto. Nome UI «Space»; nessuna associazione per solo nome |
| Host | Host effettivo della conversazione/bot, distinto dagli host delle cartelle e dal Mac client |
| Modello | Modello effettivamente confermato per sessione/turno, distinto dal default o dalla selezione pending |
| Effort | Valore supportato e confermato dal backend/modello. Mostrare «Non supportato» o «Non verificato» invece di inventare Medium |

Nessuno Space associato → «Senza Space» esplicito. Loading, offline e ultimo valore noto con stale label distinti; non mostrare dati di una chat precedente mentre si carica la nuova. Cambio modello/effort/Space tramite operazione Hermes supportata: selezione pending → ack/esito reale → aggiornamento. Un turno già avviato conserva origine/contesto effettivi anche dopo una selezione per il prossimo turno. Nessuna migrazione host/sessione implicita.

## Spaces come progetti Hermes

Richiesta aggiornata: collegare e presentare i progetti Hermes come Spaces, preservando cartelle e identità runtime, senza nuovo modello progetto backend. [Ricerca progetti/host](../research/hermes-projects-and-space-hosts.md): Project Hermes ha più folder ma scope a un backend/profilo; cartelle senza host proprio. Contratti projects.* e session.workspace.move nel sorgente sono riferimenti, non prove live.

F6 deve riusare/elencare/collegare progetti esistenti, creare o modificare solo tramite API Hermes comprovate e scelta esplicita. Il precedente requisito multi-host non autorizza un Project Hermes distribuito inesistente: si mostrano riferimenti scoped separati e host/cartelle effettivi. Cardinalità e UX dell’aggregazione da delimitare in F6; se il backend non supporta accesso cross-host, dichiararlo. Niente mount/copia/sync o nuovo executor per aggirare il limite.

## `@` — file e riferimenti precisi

Nel composer dello Space, digitare `@` apre suggerimenti dei file nelle sole cartelle autorizzate di quello Space, filtrati progressivamente mentre si scrive. Nome, percorso relativo, root/host e tipo distinguono file omonimi. Ricerca progressiva con paginazione; niente scansione/import di tutti i vault o risultati di altri profili. Loading/vuoto/errore/offline visibili, risultati tardivi non contaminano uno Space nuovo.

Selezione inserisce chip/riferimento modificabile e rimovibile; click apre il file e mantiene la bozza. Deve essere possibile agganciare **file intero, intervallo di righe o selezione di testo** dall’editor, non soltanto scrivere un nome nel prompt. Esempio visuale `notes.md · righe 12–28`: formato UI proposto, non sintassi RPC inventata.

Ogni riferimento conserva origine Space/host/root, identità file, percorso, revisione/hash e range/testo selezionato. Il writer F5 gestisce revisioni; file cambiato/rimosso o range non più valido richiede rilettura/riassociazione visibile, non invio silenzioso di contenuto diverso. Bozza dell’editor e versione su disco distinti. Invio al runtime solo con attachment/context contract Hermes verificato; se range nativo manca, definire un adattamento al formato di contesto già supportato, senza costruire retrieval/backend alternativo. Il path Mac non diventa leggibile dal server remoto per essere menzionato.

## `/` — cataloghi skill, comandi e strumenti Hermes

Popover contestuale con categorie **Comandi, Skill, Strumenti**, ricerca progressiva, nome/descrizione, stato abilitato/disponibile e scope host/profilo/sessione. Mostrare tutte le voci esposte dai cataloghi backend autorizzati, distinguendo assenti, disabilitate o non direttamente invocabili. Non usare le skill di Codex di questa chat come catalogo del bot Hermes.

Evidenza sorgente e1e82d7: `tui_gateway/contracts/tools_commands.py` definisce commands.catalog con commands/skills; `methods_tools.py` lo costruisce dal registro e configurazione; `model_switch.py` gestisce modello/reasoning. Verificare il metodo reale del catalogo tool e relativo schema/capability prima dell’implementazione; non presumere tools.list o esecuzione diretta universale.

Skill/comando: inserimento o invocazione tramite contratto Hermes disponibile, comportamento identificato nella voce. Tool: informazione/contesto agente oppure azione esplicita solo se esiste API supportata, con parametri e F3 gate. Selezionare una voce non installa, abilita, avvia routine o concede permessi. Non inventare slash command per ogni tool né esporre RPC/shell generici. Cambiare host invalida cataloghi stale; ricaricare anche dopo un cambiamento di skill/tool confermato dal runtime.

## Qualità della GUI e microinterazioni

Layout OpenDots autorevole; pattern componenti Codex/Unsloth e [component-system](../design/component-system.md). Applicare [axiom-design](../../.agents/skills/axiom-design/SKILL.md) per gerarchia/feedback/accessibilità Apple, e [frontend-design](../../.agents/skills/frontend-design/SKILL.md) per composizione React; niente migrazione SwiftUI per applicare una skill.

- Header leggibile e stabile, metadati secondari ma sempre presenti; nomi lunghi distinguibili, root/host accessibili senza troncare tutta l’identità.
- Popover ancorati al composer/controllo, focus visibile, frecce per navigare, Enter/Tab coerenti, Escape chiude e restituisce focus. Con menu aperto Enter seleziona, non invia la chat; IME rispettato.
- Feedback immediato sulla scelta; spinner solo mentre c’è lavoro, errore nello stesso controllo, conferma dopo risposta backend. Motion breve segue i token proposti, non ritarda invio né anticipa successo.
- Reduced Motion elimina spostamenti mantenendo stati testuali; colori non sono l’unico segnale. Tastiera/VoiceOver, contrasto, testo ingrandito e ritorno focus obbligatori.

## Gate per le chat implementatrici

Due Space con file omonimi, due host e profili, modelli/effort diversi: nessuna contaminazione di header, cataloghi o richieste. Cambio chat durante fetch/stream, offline/reconnect e turno pending non falsano contesto. `@` filtra file autorizzati, allega e riapre righe/testo corretto; conflitto revisione gestito. `/` riflette cataloghi runtime e non esegue azioni per sola selezione; gate e dinieghi preservati. Verifiche su profili/file sintetici, app packaged 900/1360px, zoom/IME/tastiera/VoiceOver/Reduced Motion. Dati e risultato backend reali prima di dichiarare il percorso completo.

## Handoff PM

Prima leggere questa scheda, la sola Fxx selezionata, MEMORY/STATUS e i contratti pubblici pertinenti. Sviluppare un solo incremento, concordando ownership dei componenti condivisi. Studio resta frontend Hermes; registrare contratto/fatto/gap invece di implementare capacità backend mancanti. Aggiornare scheda e prove, senza sviluppare tutte le feature elencate incidentalmente.
