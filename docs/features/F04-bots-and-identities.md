# F04 — Bots, identità e Dot

## Confine delle prove

Stato: **documented, not implemented** (2026-10-04). Questa specifica descrive una futura slice di Hermes Studio; codice upstream disponibile non significa capability collegata nell’app. Evidenze: lettura del checkout sorgente `/Users/luca/.hermes/hermes-agent`, non esecuzione live, nessun prompt/configurazione/database personale. Riferimento autorevole: [Hermes apps/desktop](https://github.com/NousResearch/hermes-agent/tree/main/apps/desktop). La versione remota può cambiare: prima di implementare fissare SHA e ripetere i contract test.

Leggere prima `AGENTS.md`, `docs/project/STATUS.md`, `GLOSSARY.md`, ADR0006, `docs/architecture/principles.md`, `.scratch/hermes-desktop/spec.md`, `docs/design/opendots-target.md` e `desktop/hermes/README.md`. UI OpenDots scelta dall’utente; Hermes resta l’unico executor. Gli endpoint Studio sotto descritti sono **proposte**, non API esistenti.

## Obiettivo e casi d’uso

Priorità utente: riconoscere bot persistenti, aprire la loro conversazione corretta e utilizzarli nei progetti. Distinguere un Dot locale con role guidance da un vero profilo Hermes; associare un Dot a un bot scelto esplicitamente; riconoscere omonimi su host diversi; ritrovare la Bot Chat dopo compressione o riavvio. Non confondere bot Hermes con bot Telegram o un processo sempre attivo.

## Dominio e contratto runtime verificato

`profiles.list {include_sessions:true}` restituisce `profiles`, `bot_mode_protocol`, `install_id`; ogni riga può avere `canonical_session`, `worker_session`, asset e metadata. `profiles.describe`, `profiles.configure`, `profiles.create`, `profiles.get_asset/set_asset` sono RPC distinti. Creare un profilo può copiare credenziali per default (`mirror_credentials`): non usare la creazione come innocuo cambio avatar.

Upstream desktop definisce la Bot Chat canonica mediante **profilo + titolo esatto `Bot Chat`**, ricerca `session.list {title,include_hidden:true}` e registry canonicale; non sceglie la sessione più recente e non mantiene un semplice ID pin come autorità. Compressione può cambiare il tip. Una chat laterale non sostituisce la Bot Chat. La modalità Bot deve essere confermata dal runtime, non attivata rinominando una conversazione Studio.

Fonti primarie: `tui_gateway/contracts/profiles_vault_complete_foreign_subagents.py:150–225`; `apps/desktop/src/AGENTS.md` sezione Bot Mode; `apps/desktop/src/plugins/hermes-bots/routing.ts`, `roster-actions.ts`, test `bot-row-opens-canonical-chat.test.ts` e `reclaim-refresh-in-place.test.ts`. Contratto di connessione/profilo: `apps/desktop/src/sdk/profile-routing.test.ts`.

## UX e stati

Lista Dots con tipo visibile “Dot locale” o “Bot Hermes”, identità `{connectionId,installId,profile}`, ruolo/avatar e stato documentato. “Collega bot” mostra roster autorizzato; preview non apre/transmette cronologia. Stati: disconnected, discovering, available, resolving canonical chat, connected, capability unavailable, stale route, identity conflict. Click ripetuti adottano la stessa chat; nessun intro prompt automatico Studio durante discovery.

## Seam, ownership e dipendenze

Prima implementare adapter read-only identità in nuovi `desktop/hermes/bots.mjs`, contratti `bots.test.mjs` e UI `BotBindingDialog.tsx`; modifiche concordate a bridge/server, shared types e WorkspaceDialog. Mapping Studio separato, versionato, `{dotId,connectionId,installId,profile,kind}`; non sovrascrivere config/profile Hermes. Dipende da F11 connessione/profile routing e da F01 chat; abilita F05/F06. Creazione/configurazione bot è incremento separato dopo roster e canonical resolver.

## Privacy, migrazione e non-obiettivi

Mostrare il roster non autorizza import di tutte le chat o clonazione credenziali. Migrare Dots esistenti come locali, senza conversione automatica. Una binding non confermata resta inattiva; import esplicito di chat esterne richiede gate diverso dall’attuale whitelist owned. Non gestire canali Telegram, copie SOUL/MEMORY o cancellazione profili in questa slice.

## Accettazione e DoD

Fixture due host/profili omonimi: nessuna collisione; canonical hidden e lineage corrette; side-chat più recente non adottata; backend disconnect mantiene metadata; race doppio click non crea due chat; profilo sconosciuto rifiutato. Prova isolata successiva dimostra canonical resume senza lettura di altri archivi. DoD: UI+adapter+schema migration reversibile, test proprietà/routing, build packaged, documentazione e STATUS/WORKLOG aggiornati; capability mostrata soltanto dopo risposta runtime.

## Prompt pronto per una nuova chat Codex

> Implementa F04 leggendo questa specifica e i documenti iniziali elencati. Parti da roster read-only e canonical chat resolver con fixture isolate. Preserva Dots locali e separa connection/install/profile dai session ID. Riuso dei contratti upstream apps/desktop, nessun prompt o clone credenziali automatico. Concorda ownership di bridge/server/client prima di modificare file. Completa test, migrazione reversibile, smoke dell’app e DoD; aggiorna STATUS/WORKLOG distinguendo sintesi, sorgente e prova live.
