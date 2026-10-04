# OpenDots come riferimento per Hermes

2026-10-04. Repository pubblico [CopilotKit/OpenDots](https://github.com/CopilotKit/OpenDots), albero sorgenti fissato a `c2569bb6a13a22e565cf3eb791c62267d06babb1`. Ricerca con ux-extract limitata ai pattern agenti/documenti/chat/strumenti. Nessuna installazione, esecuzione o modifica del riferimento. Nessuna UI live osservata da questo agente; lettura del codice non certifica accessibilità, prestazioni o comportamento del servizio.

## Documentazione upstream, non prove nostre

Il README descrive un template self-hosted iniziale: Spaces per documenti, Dots specialisti, chat persistenti, computer isolati, review prima di salvare e chiamate. Distingue test locali, fixture e integrazioni connesse. Precisa che chat di gruppo tra Dots e delega automatica restano lavoro futuro; Slack e delega vocale richiedono ancora prove dedicate. Non basta questo repository per dichiarare Hermes multiagente o disponibile 24/7. [README](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/README.md)

Le note delle registrazioni dichiarano walkthrough con dati di esempio, modificati in velocità e con attese tagliate; non misurano latenza o fluidità. Questa ricerca non ha riprodotto o verificato quei servizi. [Note demo](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/docs/demos/README.md)

## Composizione riscontrata nel codice

| Superficie | Riscontro sorgente | Riutilizzo per Hermes |
|---|---|---|
| Navigazione | Rail laterale; sidebar con Dots, Spaces, chat recenti, scheduled/activity, memories, settings. La selezione porta agente e conversazione corretti al centro. | Conservare queste categorie distinte nel client Hermes Studio; il progetto/documento non diventa un agente. |
| Centro | Dot nuovo mostra avatar, nome, istruzioni e composer; chat attiva monta Chat. Space alterna libreria e documento. | Non convertire ogni superficie nella nostra pagina «team + incarico». L’utente ora indica la composizione upstream come riferimento preciso. |
| Strumenti | Toggle apre pannello computer affiancato; error banner e pausa restano a livello workspace. | Browser/file/editor/attività restano contestuali, senza sottrarre la navigazione principale. |

Riferimenti: [App.tsx](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/App.tsx#L336), [ThreadList.tsx](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/ThreadList.tsx), [SpaceWorkspace.tsx](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/SpaceWorkspace.tsx#L83).

CSS finale: rail 48 px, sidebar 220 px, fondi chiari, separatori fini; topbar 64 px; testo navigazione 13 px. Sono misure web trovate nel codice, non valori HIG da applicare automaticamente al Mac. Alcuni badge presenti nel JSX vengono nascosti dal CSS `.template-app`; il JSX da solo non descrive ciò che appare. [style.css](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/style.css#L3103)

## Identità e feedback

Mascot assegna uno dei quattro avatar plush mediante hash stabile dell’ID. Lo stesso nome/identità viene usato nella sidebar e in chat, con alternativa testuale quando l’immagine non è decorativa. Non è un generatore di avatar unici per ciascun agente. [Mascot.tsx](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/Mascot.tsx)

La chat distingue pausa, lavoro, connessione e disponibilità. Mostra un controllo per salvare la conversazione come pagina e aprirla, più scheduling. Errori offrono reconnect, senza fingere una risposta. La presenza di questi controlli non dimostra che un backend Hermes supporti gli stessi eventi. [Chat.tsx](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/Chat.tsx#L225)

L’avatar «working» ha bob infinito di due secondi, disattivato con prefers-reduced-motion; complete/needs-input inclinano l’immagine, paused desatura. Per D06 Hermes conviene mantenere identità/pose ma valutare movimento finito sugli eventi; la preferenza confermata non richiede bob continuo. Questo è giudizio di progetto, non un difetto verificato dal vivo. [CSS motion](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/style.css#L437)

## Risultati e approvazioni

PageReviewCard recupera prima una ricevuta già salvata, limita doppie decisioni mentre busy, mostra errori e retry. Dopo esito positivo offre il link alla pagina e continua la conversazione; l’invio della risposta al tool include pageId/spaceId. Il testo distingue controllo ricevuta, mancato salvataggio e approvazione. Questi stati sono un buon contratto UX da mantenere quando si traduce il protocollo Hermes. [PageReviewCard.tsx](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/PageReviewCard.tsx#L42)

L’autosave ha stati saved/dirty/saving/error/conflict, invia expectedRevision e conserva la bozza quando arriva una revisione più nuova. PageDocument espone indicatori, retry e gestione del conflitto, oltre alla protezione beforeunload. È una base di comportamento utile per il documento; non equivale alla protezione di quit nativo o alla persistenza su file del nostro incremento SwiftUI. [autosave.ts](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/editor/autosave.ts), [PageDocument.tsx](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/PageDocument.tsx)

## Computer e controllo umano

ComputerPanel distingue configurazione assente, caricamento, errore, stato esecuzione e titolare del controllo. Tabs Browser/Files/Terminal/Activity. Take over/Return control aspettano trasferimento e gating su permessi; controlli manuali vengono abilitati per il titolare umano. Questo chiarisce la distinzione fra il browser manuale locale di Hermes Studio e un computer realmente controllato da un agente. Il pannello non prova compatibilità col runtime Hermes. [ComputerPanel.tsx](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/src/client/ComputerPanel.tsx#L158)

## Conseguenze per D04–D09 e richiesta recente

D04 e D06 trovano un riferimento più preciso negli avatar plush e nell’identità stabile. D07 è ben rappresentata dalla continuità fra chat, pagina e strumenti. D08 può essere provata come richiesta → fonti → bozza → review → documento persistente. D09 rimane compatibile con una sidebar ordinata e strumenti laterali.

D05 «team principale, chat secondaria» non corrisponde esattamente a OpenDots, che mette al centro il Dot/chat o il documento selezionato, senza vista di collaborazione simultanea fra agenti. D14–D19 hanno confermato il layout OpenDots; D21 annulla la proposta di fork.

La nuova preferenza visuale rende il nostro atelier serif una proposta superata o da tenere come alternativa, non la direzione attuale. Nel client indipendente mantenere struttura, avatar, densità e componenti upstream prima di adattare backend/tool Hermes. Evitare un redesign simultaneo: la fedeltà si valuta sulla stessa schermata e sugli stessi stati, non soltanto sull’intenzione.

## Strategia proposta, non adottata

1. Conservare uno snapshot upstream e licenza MIT con attribuzione. [LICENSE](https://github.com/CopilotKit/OpenDots/blob/c2569bb6a13a22e565cf3eb791c62267d06babb1/LICENSE)
2. Definire adapter backend: sessioni, eventi, tool, approvazioni e capacità. Non sostituire Intelligence/AG-UI con Hermes assumendo equivalenza.
3. Separare desktop shell e runtime: nessuna decisione su Electron, Tauri, WKWebView o SwiftUI presa da questa ricerca.
4. Verificare ricerca/scrittura e recovery con dati isolati; attivare strumenti solo su capacità confermate.
5. Trattare voce/chiamate come incremento distinto: disponibilità di UI upstream non risolve provider, microfono, interruption o continuità col compute Hermes.

## Mancano alla UX extraction

Nessun screenshot live, hover/focus/tab order, errore provocato, transizione registrata o resize osservato. Nessuna libreria esaustiva di pattern completata. Codice scaricato solo in cartella temporanea per lettura; non eseguito. Serve un demo locale autorizzato e isolato prima di fare un confronto visivo e interattivo completo.
