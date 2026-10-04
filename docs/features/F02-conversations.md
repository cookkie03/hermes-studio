# F02 — Conversazioni

Stato: specifica per una chat futura; baseline esistente parziale, feature non completa. Aggiornamento: 2026-10-04. La richiesta attuale è documentazione per feature e MVP quasi vuoto; non autorizza implementazioni ulteriori in questa chat.

## Risultato e confini

Preparare una domanda per un Dot, vedere che è stata inviata e distinguere la ricezione dal lavoro effettivo. Ritrovare bozza, messaggi e richieste di decisione senza duplicare un prompt durante una riconnessione.

Prima slice locale: creare/selezionare una conversazione, salvare la bozza e mostrare empty state. Il collegamento remoto è una slice successiva con dipendenza esplicita dalla feature runtime. Nessuna risposta simulata, invio automatico di suggerimenti, chiamata vocale, upload o delega automatica.

## Riferimenti e componenti

Leggere [component-system](../design/component-system.md) come norma visiva e libreria di evidenze Unsloth/Codex. OpenDots fornisce il layout centrale, avatar, composer, card di attività e review; i dettagli del tool disclosure devono rispettare la norma centrale. Una screenshot non prova streaming, animazione o comportamento del composer.

| Componente | Anatomia e interazione |
|---|---|
| Header Dot | Avatar/nome/ruolo a sinistra; stato operativo sotto; Computer e review a destra. Voce assente o future/disabled, mai attiva senza supporto. |
| Timeline | Messaggi utente distinti visivamente, risposta Markdown leggibile, fonti con destinazione reale; attività strumenti e decisioni associate alla conversazione corretta. Nessuna card intitolata Approved senza esito. |
| Composer | Testo multilinea, invio esplicito, pulsante con nome; Shift+Enter nuova riga, Enter invia solo fuori composizione IME. Allegati non disponibili finché il contratto non esiste. |
| Delivery indicator | Pending/received/uncertain sul messaggio utente, distinto dallo stato operativo del turno. |
| Activity card | Nome strumento, stato, input espandibile e risultato reale limitato; copy/download solo se supportati. Forme Unsloth/Codex derivate dalla norma, non aggiunte arbitrariamente. |
| Approval card | Comando/descrizione, ambito e sole scelte del backend. Pulsanti espliciti; nessuna scelta preapprovata. |
| Review document | Azione nominata Review response for Space; apre draft locale modificabile. Il salvataggio e la ricevuta appartengono a F03. |

## Token proposti e motion

Norma centrale prevalente. Proposta: header 64–72px, avatar 40px, corpo 14px/21px, codice 12px/18px monospace, timeline padding 24–32px; composer minimo 56–64px, altezza testo crescente con limite 150px, card raggio 12–16px. Larghezza di lettura massima circa 760px quando il pannello è chiuso; non restringere la colonna fino a centrare l’header. Questi valori non sono misure live Unsloth/Codex.

Nuovo messaggio: comparsa breve 100–160ms proposta, senza ritardare l’invio. Scroll automatico solo se l’utente era vicino al fondo; mentre legge sopra, mostrare un’indicazione nuovi messaggi. Non far pulsare l’intera risposta o animare ogni token. Avatar può spiegare un evento puntuale; niente bob infinito. Reduced motion disattiva spostamenti e mantiene stato testuale e focus. Annunci accessibili sintetici, non ripetere ogni delta.

## Tastiera, copia, focus e microstati

Applicare il contratto normativo del component-system. Enter/Shift+Enter rispettano IME; dopo invio il focus resta nel composer e il messaggio Pending compare senza salto di scroll se l’utente legge altrove. Tab attraversa header, contenuto interattivo e composer in ordine visivo. Disclosure strumenti operabile con Enter/Space; Escape chiude i popover e restituisce focus all’origine. Uno stato errore non ruba focus né elimina il draft.

Copy response, se introdotto nella slice, copia solo il testo della risposta scelta e non gli input tool, memorie o istruzioni nascoste. Successo Copied solo dopo esito clipboard; failure mostra alternativa selezionabile. Pulsanti iconici hanno nome persistente quando il testo visivo è nascosto. Hover, focus-visible, disabled, busy e error appartengono alla norma centrale: non introdurre un’animazione diversa per ogni strumento. Richiesta di approvazione e salvataggio pagina hanno semantica distinta e focus associato alla propria card.

## Contratto degli stati

| Evento/prova | Stato visibile | Regola |
|---|---|---|
| Click Send valido | Riga utente Pending immediata | ID di invio stabile prima di attese rete; testo conservato. |
| HTTP202 | In dispatch/attesa Hermes | Non significa risposta ricevuta, Running o completion. Bloccare secondo invio fino a fase certa. |
| Ack runtime | Ricevuto | Aggiorna la stessa riga; non crearne un’altra. |
| Delta/tool.start reale | Working | Solo evento effettivo dell’esecuzione, non connessione o timer. |
| Complete confermato | Completato/errore/interrotto | Delta e risultato finale si riconciliano una volta. Nessun successo dedotto dal testo. |
| Stream perso | Delivery/stato da verificare | Conservare bozza; osservare/reconnettere senza reinviare né cancellare lavoro. |
| Approval request | Decisione richiesta | ID, thread/sessione e scelte exact; cancel/resolved rimuovono la card. |
| Altra chat richiede decisione | Avviso con navigazione | Nessun comando privato nella notifica generale; aprire la conversazione corretta. |

Una bozza digitata durante un invio precedente non si cancella all’arrivo dell’ack. Memorizzazione locale e disco devono preservare anche la scelta intenzionale di una bozza vuota. Cronologia restaurata può avere stringhe o parti di testo: gestire il formato documentato, non convertirlo silenziosamente in vuoto. Tool.start e complete usano il vero `tool_id`; una vecchia start non regredisce una completion nuova. Conservare provenienza di contenuto troncato e non presentarlo come completo.

## Contratto di integrazione proposto dalla baseline

La baseline ha REST locale e SSE; verificarli sulla versione corrente prima del codice. `/hermes/send` riceve `threadId`, `text`, `clientSubmissionId`; gli eventi distinguono dispatch/admission/turn/runtime. `/hermes/history?threadId&refresh=1` restituisce messaggi, stato effettivo, toolEvents e pendingRequests. `/conversations/:id/draft` conserva la bozza nel profilo client. Non assumere che questi endpoint siano lo stesso contratto del gateway Hermes pubblico.

Le lease delle approvazioni esistono solo mentre il relativo handler/stream è montato. Settings Connect non attiva di nascosto server requests; scollegare il client non autorizza autoapprove. Rispondere solo alle scelte annunciate. Una conversazione legata a pagina richiede `beforeSend`: flush editor riuscito, lettura pagina salvata, invio di `{id,spaceId,revision}` validato dal backend. Mai usare contenuto editor non salvato senza dirlo all’utente.

## Baseline e limiti delle prove

Esistono Chat.tsx, ChatTranscript.tsx e reducer di display. Quattordici fixture renderer/review sono passate durante il prototipo; le prove rete sintetiche e handshake hanno confini separati. Handshake non è prova di un incarico live completato. Il prototipo e le sue fixture sono materiale riutilizzabile, non accettazione automatica della nuova feature. Nessun test deve usare conversazioni o credenziali personali per costruire screenshot.

## Dipendenze, ownership e reversibilità

F01 per shell; F03 per review/documento; specifica runtime per invio/stream/approvazioni. La slice locale non dipende da Hermes. F11 è il prerequisito della connessione/invio; F16 soltanto delle approvazioni, che possono restare fuori dalla prima slice remota. Ownership futura: Chat.tsx, ChatTranscript.tsx, hermes-display.ts e fixture; PageConversation.tsx solo coordinandosi con F03. Non cambiare gateway/server/shared contracts senza accordo e review. Non coinvolgere packaging salvo verifica finale coordinata.

Profilo client sintetico separato; thread locali non creano sessioni remote finché non c’è invio esplicito. Nessun import automatico della cronologia personale. Migrazioni non distruttive; errore di storage preserva bozza e byte. Close, disconnect e interrupt sono azioni diverse; interrupt esplicito con esito, non terminate del processo runtime.

## Definition of done

Slice locale: vuota al primo avvio, conversazione creabile, bozza ripristinata dopo cambio chat e riavvio con nuova origin, tastiera/IME e nomi accessibili verificati. Slice remota: fixture su HTTP/WS reali sintetici per delta prima di HTTP, ack lento, doppio invio, disconnect, errore terminale, cancel approval, reopen e storia/toolcards. Verificare messaggi in ordine, nessuna duplicazione o retry automatico, bozza nuova preservata, ambiti approval rispettati. Collaudo del runtime reale solo isolato e autorizzato; documentare il risultato effettivo. UI in.app 1360/900px e reduced motion. Review salva solo con scelta esplicita e ricevuta F03.

## Prompt per una nuova chat

> Implementa soltanto la slice di F02 esplicitamente selezionata, leggendo AGENTS.md, MEMORY/STATUS, GLOSSARY, component-system e questa spec. Prima verifica se il prerequisito runtime è pronto; in caso contrario realizza soltanto conversazioni/bozze locali, senza simulare risposte. Riusa il prototipo dove utile e non riscrivere server o shell fuori ownership. Mantieni Pending, ack, Working e terminale distinti; niente auto retry o approvazioni automatiche. Usa profilo e gateway sintetici, salva le prove dei race test e della vera.app. PageConversation richiede flush e revisione salvata ad ogni invio. Aggiorna documentazione e consegna limiti verificati; non riprendere il piano notturno globale.
