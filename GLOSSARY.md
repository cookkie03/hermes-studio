# Hermes Desktop

Vocabolario per l'assistente personale e i suoi progetti. Le definizioni riguardano il prodotto, non la sua implementazione.

## Linguaggio

**Agente**: assistente identificabile con una responsabilità, istruzioni e strumenti assegnati.
_Evitare_: dot, bot usati come nomi del dominio.

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
