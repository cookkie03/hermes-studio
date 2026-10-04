---
status: proposed
---

# Separare il client dal runtime persistente

Gli incarichi devono continuare quando il client desktop è chiuso. Proponiamo un client che osserva e controlla un runtime Hermes con persistenza propria, prima locale per verificare il contratto, poi su un host sempre acceso. Legare la durata dell'esecuzione alla finestra dell'app ridurrebbe la complessità iniziale ma non soddisferebbe il requisito 24/7. Questa separazione non implica che Hermes recuperi automaticamente un turno dopo un crash: va verificato.
