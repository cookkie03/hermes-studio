# Hermes Studio

Vocabolario per l'assistente personale e i suoi progetti. Le definizioni riguardano il prodotto, non la sua implementazione.

## Linguaggio

**Agente**: assistente identificabile con una responsabilità, istruzioni e strumenti assegnati.
Nell’interfaccia OpenDots richiesta, **Dot** è il nome visibile dell’agente; non implica un processo sempre attivo.

**Team**: gruppo di agenti che collaborano su un incarico con un responsabile riconoscibile.
_Evitare_: sciame, azienda.

**Progetto**: contesto di lavoro che raccoglie conversazioni, incarichi e risultati verso un obiettivo comune.

**Conversazione**: scambio di messaggi dell'utente con uno o più agenti.
_Evitare_: incarico come sinonimo di chat.

**Incarico**: responsabilità persistente affidata a un agente, con obiettivo, ambito, limiti e criteri di completamento. Può attraversare più conversazioni ed esecuzioni.

**Esecuzione**: singolo tentativo di portare avanti un incarico, con stato e risultato propri.
_Evitare_: agente come sinonimo di processo in corso.

**Delega**: assegnazione di una parte dell'incarico a un altro agente, sotto la responsabilità del coordinatore.

**Risultato**: contenuto o file prodotto da un'esecuzione e presentato all'utente con la sua provenienza.
_Evitare_: completamento dedotto da una semplice risposta testuale.

**Revisione**: richiesta di valutare un risultato o scegliere la direzione del lavoro.

**Approvazione**: consenso dell'utente a un'azione concreta entro un ambito e una durata definiti.
_Evitare_: revisione come sinonimo di autorizzazione.

**Memoria**: informazioni conservate per orientare il lavoro futuro. È distinta dalla cronologia di una conversazione.

**Attività ricorrente**: incarico riattivato da una pianificazione; ogni riattivazione produce un'esecuzione distinta.

**Host**: macchina su cui gli agenti eseguono il lavoro. La sua disponibilità determina se gli incarichi possono avanzare quando il client è chiuso.


**Space**: contesto di progetto collegato a una o più cartelle reali, con documenti su file e conversazioni associate. Uno stesso agente può lavorare in più Space; scollegare una cartella non cancella i file.

**Documento dello Space**: file modificabile in una cartella collegata, con origine e revisione distinte dalla chat che lo usa.
_Evitare_: pagina interna come sinonimo di file reale.

**Pagina legacy**: documento interno del prototipo conservato nei metadata; preservato, non convertito automaticamente in file.

**Computer**: superficie per osservare gli strumenti e l’ambiente operativo di un agente. La disponibilità di browser, file, terminale e presa di controllo dipende dalle capacità reali del runtime.

**Bot Hermes**: identità persistente e conversazione canonica gestite dal runtime. Un Dot può rappresentarla dopo un binding verificato; non coincide con un delegato temporaneo.

**Messaggio fra bot**: consegna indirizzata a un altro Bot con mittente e ricevuta tracciabili; accodamento e risposta sono esiti distinti. Non equivale a una delega.

**Routine**: nome visibile dell'attività ricorrente. Conserva pianificazione, profilo proprietario e destinazione; ogni attivazione produce un'esecuzione con consegna separata.

**Plugin**: estensione installabile o configurabile che può rendere disponibili strumenti. Installazione, abilitazione e autorizzazione sono distinte.

**Capacità**: operazione effettivamente supportata dal runtime collegato, entro il suo scope. La presenza di un controllo nell'interfaccia non la dimostra.

**Memoria dello Space**: documento di progetto su file che conserva decisioni e stato verificato; distinto dai ricordi del profilo Hermes.

**Profilo browser**: ambiente di navigazione persistente condiviso tra utente e controllo Hermes autorizzato, distinto dalla memoria del Dot.

**Conversazione vocale**: scambio parlato in-app con un Dot; distinta da una telefonata a un numero.
