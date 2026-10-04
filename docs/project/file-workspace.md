> Documento/evidenze storici. Per stato corrente leggere [STATUS](STATUS.md); requisiti e gate attuali nel [catalogo feature](../features/README.md). Il contenuto sotto non autorizza nuove attività né certifica lo stato successivo a F00.

# File della ricerca

2026-10-04. Incremento nativo per il percorso ricerca/scrittura: modulo indipendente ResearchFiles in HermesCore e vista ResearchFilesView utilizzabile come tab strumenti. Non modifica il modello delle conversazioni e non introduce un editor universale.

## Comportamento

La cartella viene scelta esplicitamente con NSOpenPanel; nessuna cartella personale si apre automaticamente. L’albero mostra cartelle e documenti `.md`, `.markdown`, `.txt`, senza file nascosti, package o collegamenti simbolici. I sottolivelli vengono letti quando si espandono, fino a otto livelli. Ogni lettura esamina al massimo 200 elementi, con avviso se l’elenco è incompleto; l’ordine di selezione dei primi elementi dipende dal filesystem, poi l’elenco visibile viene ordinato.

L’editor accetta testo UTF-8 fino a 2 MiB. Non crea, elimina o rinomina file. Le modifiche restano in memoria finché l’utente preme Salva; il salvataggio sostituisce atomicamente il file scelto. Cambiare file, cartella o premere Chiudi con una bozza modificata chiede se scartarla. Gli errori sono visibili e non eliminano la bozza.

Prima del salvataggio il modulo confronta i byte correnti con quelli aperti: se un altro programma ha cambiato il file, conserva la bozza e rifiuta la sostituzione. La nuova versione si può leggere riaprendo il file, dopo aver copiato o salvato altrove la propria bozza. Il percorso deve restare dentro la cartella selezionata; percorsi esterni e componenti simbolici sono rifiutati sia all’apertura sia prima della scrittura.

## Accesso e limiti

L’accesso alla cartella dura nella sessione della vista e viene rilasciato quando si chiude la cartella o viene distrutto il modello. Il lifetime helper richiama startAccessingSecurityScopedResource e bilancia stop soltanto se start ha restituito true; se l’accesso non è security-scoped, le normali operazioni filesystem decidono se la cartella è leggibile. Riferimento: [Apple Foundation](https://developer.apple.com/documentation/foundation/nsurl/startaccessingsecurityscopedresource()). Non vengono salvati bookmark o riaperte cartelle al rilancio. Il bundle attuale è una build locale ad hoc, senza una verifica di distribuzione sandboxed: accesso sandbox, bookmark persistenti e restore sono incrementi successivi.

Il controllo dei byte evita sovrascritture comuni tra editor, ma non è un lock tra processi e non protegge contro una sostituzione ostile del percorso tra controllo e operazione. Il salvataggio usa Foundation atomic; non promette coordinamento distribuito/iCloud o identità invariata sotto modifiche concorrenti. Le operazioni locali sono sincrone e limitate; un filesystem remoto molto lento può comunque bloccare temporaneamente l’interfaccia. Non viene scandito ricorsivamente un intero progetto.

Le bozze del file non sono ancora salvate nell’archivio locale dell’app. Chiudere l’app con modifiche non salvate può perderle: il pulsante Salva è il punto di persistenza per questo incremento. Il cambio tab non è equivalente a salvare o chiudere la cartella.

## Verifica

Sei gruppi di scenari Foundation passati, tramite scripts/check-research-files.sh e Verification/ResearchFilesChecks.swift: round trip, rifiuto di conflitti esterni con bozza conservata, symlink/escape senza modifiche al target, limite dimensione/UTF-8/estensione, listing superficiale ed esclusioni, scansione limitata anche con file non supportati. Fixture esclusivamente temporanee. Build dell’app e smoke UI sono coordinati dal parent; questo documento non li dichiara già passati.
