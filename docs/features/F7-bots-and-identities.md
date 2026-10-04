# F7 — Dots collegati ai Bots Hermes e avatar

<!-- implementation-packet:start -->
## Incarico per la chat implementatrice

Quando questa scheda viene allegata come incarico di sviluppo, realizza e verifica **soltanto il frontend/collegamento F7**, seguendo il percorso sotto e le sezioni specifiche della scheda. L’allegato è il punto di ingresso: apri i file e i SKILL.md linkati nel workspace prima del codice. Le indicazioni «documentata/non implementata» descrivono la baseline, non impongono di fermarsi a un piano nella chat incaricata.

**Tipo di lavoro:** adattamento GUI e collegamento a capacità Hermes esistenti, non creazione della feature nel backend. La separazione Fxx serve a ownership, implementazione e prove in chat distinte: il prodotto rimane una sola GUI Hermes in stile OpenDots.

**Risultato:** Modificare avatar dei Dots e collegare identità UI a Bot/profilo Hermes tramite binding verificato.

**Backend e confine:** Avatar è metadata UI; Bot, conversazione canonica e profilo sono runtime Hermes, distinti da delegati temporanei. Studio è frontend/adapter di Hermes: nome/GUI possono cambiare, le capacità dell’agente e i gate restano native. Un contratto mancante è un gap esplicito, non una nuova feature backend da costruire.

**Contesto e interazioni pertinenti:** Applicare anche D36 qui sotto: pannello laterale per figli temporanei; Dots persistenti nella propria chat, messaggi attribuiti e attività confermata dal runtime. Create/Edit Dot include picker quattro avatar OpenDots; header mostra Bot/Space/host/modello/effort senza attribuire default globale al singolo bot. Leggi obbligatoriamente [requisiti GUI condivisi](gui-context-and-references.md); applica qui i requisiti indicati, lasciando le altre funzioni ai rispettivi owner.

**Dipendenze e letture aggiuntive:** A avatar locale indipendente; B binding richiede F1 e roster verificato. F6/F2 possiedono contesto Space/sessione, non derivarlo dal nome Dot. Leggi [MEMORY](../project/MEMORY.md), [STATUS](../project/STATUS.md), [workflow e skill](../agents/feature-workflow.md), [confini](../architecture/feature-boundaries.md), poi File e skill e gate di questa scheda. Verifica file/metodi/versione effettivi; i percorsi futuri non sono API già esistenti.

**Prove specifiche obbligatorie per l’incremento pertinente:** Avatar invalido/legacy/restart, omonimi, roster stale, bot offline, profili differenti, cambio selezione con eventi tardivi e nessuna copia delle memorie personali. Usa profili e dati sintetici; esercita l’interface reale. Fixture, build, handshake e test runtime isolati sono evidenze distinte.

**Consegna richiesta:** codice dell’incremento funzionante, test pertinenti con comandi/esiti registrati, typecheck/build del grafo modificato e smoke della .app proporzionato. Se cambia la UI: verifica tastiera/focus, IME quando pertinente, 900/1360px, accessibilità e Reduced Motion. Review del diff contro spec/principi, fix dei problemi trovati, stato/gate aggiornati nella scheda e MEMORY/STATUS/WORKLOG. Dichiarare prove non eseguite e blocchi esterni; completata solo quando i gate dell’incremento sono provati. Git: selezionare solo file propri dopo diff/index/segreti; push/pubblicazione secondo autorizzazione corrente.

Se manca uno scope essenziale, chiarisci solo quello; altrimenti usa requisiti confermati e scegli un incremento verticale coerente con la scheda, dichiarandolo prima degli edit. Dipendenze condivise si concordano, non si implementa il backlog. F0 resta manutenzione esplicita della baseline completata; F18 resta futura finché selezionata e supportata. Per gli altri ID procedi con implementazione e verifica entro autorizzazioni e capability reali, senza una nuova intervista generale.
<!-- implementation-packet:end -->


<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | Se schema/eventi upstream sono incerti: ricerca primaria documentata |
| [domain-modeling](<../../.agents/skills/domain-modeling/SKILL.md>) | Quando cambiano identità, stato o termini del dominio |
| [diagnosing-bugs](<../../.agents/skills/diagnosing-bugs/SKILL.md>) — condizionale | Se emerge un errore riproducibile di connessione o lifecycle |
| [react](</Users/luca/.codex/plugins/cache/openai-curated-remote/build-web-apps/0.1.2/skills/react-best-practices/SKILL.md>) — condizionale | Componenti React e stato del renderer |

### Punti di ingresso da leggere

- [docs/research/hermes-desktop-reference.md](<../../docs/research/hermes-desktop-reference.md>): Mappa identità e runtime.
- [desktop/hermes/bridge.mjs](<../../desktop/hermes/bridge.mjs>): Binding owned attuale.
- [desktop/upstream/src/server/workspace.ts](<../../desktop/upstream/src/server/workspace.ts>): Dot locali.
- [desktop/upstream/src/client/WorkspaceDialog.tsx](<../../desktop/upstream/src/client/WorkspaceDialog.tsx>): Configurazione locale.
- [Hermes: tools/bot_mode_dm.py](</Users/luca/.hermes/hermes-agent/tools/bot_mode_dm.py>): Bot canonici e gating; lettura sorgente alla versione fissata, non prova live.
- [docs/features/F1-runtime-connection.md](<../../docs/features/F1-runtime-connection.md>): Scope connessione.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Confine delle prove

Stato: **documented, not implemented** (2026-10-04). Questa specifica descrive una futura slice di Hermes Studio; codice upstream disponibile non significa capability collegata nell’app. Evidenze: lettura del checkout sorgente `/Users/luca/.hermes/hermes-agent`, non esecuzione live, nessun prompt/configurazione/database personale. Riferimento autorevole: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). La versione remota può cambiare: prima di implementare fissare SHA e ripetere i contract test.

Leggere prima `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` e `desktop/hermes/README.md`. UI OpenDots scelta dall’utente; Hermes resta l’unico executor. Gli endpoint Studio sotto descritti sono **proposte**, non API esistenti.

## D26 — Avatar OpenDots selezionabile

Richiesta confermata: nella finestra Create Dot e Edit Dot scegliere l’avatar desiderato e vedere un’anteprima. Incremento **F7-A**, locale e selezionabile indipendentemente dal binding Hermes F7-B; non richiede connessione, nuovo profilo o credenziali runtime.

Evidenza sorgente Studio: `public/dots/` contiene quattro immagini OpenDots (`blue.png`, `mint.png`, `orange.png`, `purple.png`). Mascot.tsx sceglie oggi il personaggio dall’hash dell’identità; WorkspaceDialog non espone una scelta avatar. Non sono state trovate altre immagini avatar in questo snapshot. Usare il catalogo locale completo degli asset disponibili; icone di navigazione/favicon non sono automaticamente personaggi. Asset extra, upload o avatar generati sono futuri, non richiesti dalla prima slice.

Form: griglia con quattro anteprime e nomi leggibili, selezione visibile anche senza colore, preview accanto a nome/ruolo. Salvataggio esplicito insieme ai dati del Dot; Cancel non persiste. In Edit caricare la scelta già salvata. Sidebar/header/chat/team riusano il medesimo avatar. Se immagine manca, fallback stabile e leggibile, mai cambio casuale a ogni render.

Proposta dati: `avatarId` con allowlist e ID stabile, distinta da dotId, profilo Hermes e stato attività. Non accettare path/URL arbitrari come avatarId. I Dots esistenti senza campo conservano l’attuale personaggio deterministico finché l’utente non sceglie. Cambiare avatar non ricrea sessioni, non cambia ruolo/tool/permessi e non modifica `profiles.set_asset` del runtime implicitamente.

Skill aggiuntive per F7-A: [frontend-design](../../.agents/skills/frontend-design/SKILL.md), [axiom-accessibility](../../.agents/skills/axiom-accessibility/SKILL.md) per tastiera/focus/etichette, React e UI-test già indicati sopra. Leggere [Mascot.tsx](../../desktop/upstream/src/client/Mascot.tsx), [WorkspaceDialog.tsx](../../desktop/upstream/src/client/WorkspaceDialog.tsx), [types.ts](../../desktop/upstream/src/shared/types.ts), [workspace.ts](../../desktop/upstream/src/server/workspace.ts), [workspace-routes.ts](../../desktop/upstream/src/server/workspace-routes.ts) e [PROVENANCE](../../desktop/upstream/PROVENANCE.md). Conservare licenza degli asset.

Gate F7-A: ogni asset selezionabile; create/edit/save/reopen/restart persistono stessa scelta; Cancel e save fallito preservano identità precedente; fallback legacy e asset mancante; keyboard/radiogroup/focus; ID invalido rifiutato server-side. Nessuna chiamata Hermes necessaria. Il completamento di F7-A non completa F7-B.

## Obiettivo e casi d’uso

Priorità utente: riconoscere bot persistenti, aprire la loro conversazione corretta e utilizzarli nei progetti. Distinguere un Dot locale con role guidance da un vero profilo Hermes; associare un Dot a un bot scelto esplicitamente; riconoscere omonimi su host diversi; ritrovare la Bot Chat dopo compressione o riavvio. Non confondere bot Hermes con bot Telegram o un processo sempre attivo.

## Dominio e contratto runtime verificato

`profiles.list {include_sessions:true}` restituisce `profiles`, `bot_mode_protocol`, `install_id`; ogni riga può avere `canonical_session`, `worker_session`, asset e metadata. `profiles.describe`, `profiles.configure`, `profiles.create`, `profiles.get_asset/set_asset` sono RPC distinti. Creare un profilo può copiare credenziali per default (`mirror_credentials`): non usare la creazione come innocuo cambio avatar.

Upstream desktop definisce la Bot Chat canonica mediante **profilo + titolo esatto `Bot Chat`**, ricerca `session.list {title,include_hidden:true}` e registry canonicale; non sceglie la sessione più recente e non mantiene un semplice ID pin come autorità. Compressione può cambiare il tip. Una chat laterale non sostituisce la Bot Chat. La modalità Bot deve essere confermata dal runtime, non attivata rinominando una conversazione Studio.

Fonti primarie: `tui_gateway/contracts/profiles_vault_complete_foreign_subagents.py:150–225`; `apps/desktop/src/AGENTS.md` sezione Bot Mode; `apps/desktop/src/plugins/hermes-bots/routing.ts`, `roster-actions.ts`, test `bot-row-opens-canonical-chat.test.ts` e `reclaim-refresh-in-place.test.ts`. Contratto di connessione/profilo: `apps/desktop/src/sdk/profile-routing.test.ts`.

## UX e stati

Lista Dots con tipo visibile “Dot locale” o “Bot Hermes”, identità `{connectionId,installId,profile}`, ruolo/avatar e stato documentato. “Collega bot” mostra roster autorizzato; preview non apre/transmette cronologia. Stati: disconnected, discovering, available, resolving canonical chat, connected, capability unavailable, stale route, identity conflict. Click ripetuti adottano la stessa chat; nessun intro prompt automatico Studio durante discovery.

## Seam, ownership e dipendenze

Per F7-B implementare adapter read-only identità in nuovi `desktop/hermes/bots.mjs`, contratti `bots.test.mjs` e UI `BotBindingDialog.tsx`; modifiche concordate a bridge/server, shared types e WorkspaceDialog. Mapping Studio separato, versionato, `{dotId,connectionId,installId,profile,kind}`; non sovrascrivere config/profile Hermes. F7-B dipende da F1 connessione/profile routing e F2 conversazioni; F7-A avatar dipende solo dalla base locale e F4; abilita F14/F10. Creazione/configurazione bot è incremento separato dopo roster e canonical resolver.

## Privacy, migrazione e non-obiettivi

Mostrare il roster non autorizza import di tutte le chat o clonazione credenziali. Migrare Dots esistenti come locali, senza conversione automatica. Una binding non confermata resta inattiva; import esplicito di chat esterne richiede gate diverso dall’attuale whitelist owned. Non gestire canali Telegram, copie SOUL/MEMORY o cancellazione profili in questa slice.

## Accettazione e DoD

Fixture due host/profili omonimi: nessuna collisione; canonical hidden e lineage corrette; side-chat più recente non adottata; backend disconnect mantiene metadata; race doppio click non crea due chat; profilo sconosciuto rifiutato. Prova isolata successiva dimostra canonical resume senza lettura di altri archivi. DoD: UI+adapter+schema migration reversibile, test proprietà/routing, build packaged, documentazione e STATUS/WORKLOG aggiornati; capability mostrata soltanto dopo risposta runtime.

## Requisito condiviso: contesto e composer Hermes

Leggere [contesto visibile, Spaces/progetti, @ file/righe e / skill/tool](gui-context-and-references.md). Header identifica Space, host, modello ed effort effettivi della chat/bot. Capacità e mutazioni rimangono nel backend Hermes; non simulare valori o azioni non supportati. Ownership specifica nella scheda trasversale.

## D36 — Attività e messaggi nella conversazione del Dot

Ogni Dot persistente mostra attività nella sidebar e nel proprio header quando Hermes conferma che sta lavorando. Separare inattivo, in coda, in esecuzione, in attesa di approvazione, completato, fallito e stato sconosciuto/stale nei limiti dei dati effettivamente esposti. Non dedurre Working dall’invio di un messaggio o da un ack queued.

Quando un altro Bot gli manda un messaggio, il destinatario conserva la sua conversazione canonica: selezionando quel Dot si vede il messaggio ricevuto, attribuito al mittente, e il lavoro del destinatario. Il badge non letto segnala il messaggio effettivamente disponibile e resta indipendente dall’attività. Identità scoped a connessione/profilo/sessione, non al nome dell’avatar. Non trasformare un figlio delegate_task in Dot persistente e non mostrare Dots nel pannello sub-agent.

Gate: A manda a B, B riceve e lavora; passando a B messaggio e stato sono corretti, senza eventi di A o di un Bot omonimo su altro host. Se la ricezione o l’esecuzione non sono confermate, mostrare il limite; un Dot attivo non viene marcato letto solo perché ha iniziato a lavorare.

## Prompt pronto per una nuova chat Codex

> Prima segui docs/agents/feature-workflow.md e File e skill della scheda. Implementa solo l’incremento scelto: F7-A avatar locali oppure F7-B binding bot. Per F7-A usa tutti i quattro asset OpenDots disponibili, picker in Create/Edit Dot, avatarId validato e persistente, fallback legacy stabile e stessa resa ovunque. Preserva identità/sessioni/permessi e non configurare Hermes per un cambio estetico. Per F7-B segui roster/canonical resolver e prove isolate descritti sotto. Nessun altro incremento automatico; aggiorna gate e documenti. Segui anche Incarico per la chat implementatrice di F7: consegna codice verificato e prove, con il contesto GUI/backend specificato, non soltanto un piano. I gate di capability e le eccezioni F0/F18 restano validi.
