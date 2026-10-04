# F17 — Messaggi vocali e conversazione vocale in-app

Stato: documentata D29, 2026-10-04; nessuna implementazione selezionata adesso. Voce e vocal chat sono feature autonome da sviluppare in una futura chat. Telefonate a numeri PSTN/SIP restano idea futura distinta in [voice-calls](../future/voice-calls.md).

<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | STT/TTS realtime e telefonia sono contratti distinti |
| [grill-with-docs](<../../.agents/skills/grill-with-docs/SKILL.md>) | Solo per delimitare requisiti ancora incerti dell’incremento scelto |
| [prototype](<../../.agents/skills/prototype/SKILL.md>) — condizionale | Risposta eseguibile a una domanda tecnica delimitata |
| [openai-docs](</Users/luca/.codex/skills/.system/openai-docs/SKILL.md>) — condizionale | Soltanto se si sceglie un prodotto OpenAI; non è requisito della voce locale |

### Punti di ingresso da leggere

- [docs/future/voice-calls.md](<../../docs/future/voice-calls.md>): Ipotesi, prerequisiti e limiti telefonia.
- [docs/features/F1-runtime-connection.md](<../../docs/features/F1-runtime-connection.md>): Host.
- [docs/features/F3-permissions-and-approvals.md](<../../docs/features/F3-permissions-and-approvals.md>): Permessi microfono/azioni.
- [desktop/upstream/src/client/useVoice.ts](<../../desktop/upstream/src/client/useVoice.ts>): Vecchio codice reference, non prova Hermes voice.
- [desktop/upstream/src/client/CallView.tsx](<../../desktop/upstream/src/client/CallView.tsx>): Superficie esistente da non attivare automaticamente.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

## Fonti ufficiali e baseline

Leggere [Voice Mode — Hermes Agent](https://hermes-agent.nousresearch.com/docs/user-guide/features/voice-mode/) e [guida Voice Mode](https://hermes-agent.nousresearch.com/docs/guides/use-voice-mode-with-hermes/). Sorgente pubblico studiato alla SHA `e1e82d782f353766c7a22db6e5ac4fa58bbff325`: `website/docs/user-guide/features/voice-mode.md`, `tui_gateway/contracts/prompt_voice.py`, `tui_gateway/methods_voice.py`, `tools/transcription_tools.py`, `tools/tts_tool.py`, `tools/voice_client_config.py`; desktop `apps/desktop/src/app/chat/composer/hooks/use-voice-recorder.ts`, `use-voice-conversation.ts`, `use-voice-live-conversation.ts`, `apps/desktop/src/lib/voice-client-direct.ts` e `voice-live.ts`.

Upstream offre STT/TTS, voice RPC e superfici desktop; non prova voce funzionante nel bridge Studio. `voice.record` può registrare sul dispositivo dell'host: backend remoto non è il microfono Mac. La cattura desktop deve essere sul client, con upload/provider routing del profilo verificato. I vecchi useVoice/CallView OpenDots sono reference UI, non executor da abilitare.

Il desktop upstream distingue catena mic → STT → turno Hermes → TTS e modalità live alternativa dipendente dal provider. La catena può riusare provider locali/configurati senza imporre OpenAI Voice API Key; locale non significa modello già incluso o latenza garantita. Edge TTS senza chiave resta servizio di rete, non completamente locale. Non installare/downloadare motori o cambiare il provider personale da questa scheda.

## Incrementi e UX

| Incremento | Comportamento e stato |
|---|---|
| F17-A — Dettatura | Mic registra su azione esplicita, stop trascrive e inserisce bozza modificabile; nessun prompt inviato senza conferma |
| F17-B — Messaggio vocale | Registrazione con durata/preview/play/delete e Send esplicito; contratto attachment/transcript/runtime verificato, non file locale finto allegato |
| F17-C — Risposta parlata | Play/Stop sul messaggio o preferenza esplicita; errore audio non nasconde testo; device e provider disponibili visibili |
| F17-D — Vocal chat | Start voice apre superficie in-app del Dot corrente, listening/transcribing/working/speaking/interrupted/reconnecting/ended; Mute/End, transcript, barge-in dove supportato |

Sono incrementi della stessa scheda, selezionabili uno per chat. Composer/microfono e superficie chat seguono component-system Unsloth/Codex; andamento audio solo da livello reale, non animazione decorativa. Stato work e microfono aperto distinguibili, testi/controlli accessibili e alternativa tastiera. Escape chiude/termina secondo stato definito, restituisce focus e rilascia device; non cancella implicitamente task Hermes.

Vocal chat mantiene strumenti, memoria e approvazioni **del runtime Hermes**. Parole dette non aggirano F3: azioni sensibili richiedono la stessa revisione visibile. Cambiare Dot/profilo non sposta audio/risposte nella sessione nuova; chiusura libera stream/TTS. Una risposta incerta non viene ritrasmessa automaticamente creando doppio turno.

## Contratto tecnico da validare

RPC documentate nel sorgente: `voice.toggle`, `voice.record`, `voice.tts`; eventi `voice.transcript`/interrupted e readiness dipendono da versione/provider/capture. Queste RPC non equivalgono da sole a trasporto audio browser remoto. Il desktop usa anche route `/api/audio/voice-config` e `/api/audio/voice-live/status`; adattare solo percorsi supportati dal backend collegato.

Owner immutabile per operazione: connection/profile/session/turn, cancellazione e risultati tardivi gestiti. F1 possiede trasporto/availability; F17 cattura, playback e conversazione; F2 associa transcript/turno e stato, F3 grants. Contratti testabili separati da componenti UI, nessuna seconda chat engine.

Preferire segreti nel backend/main process. Reference client-direct upstream consegna credenziali alla memoria renderer: non copiarla ciecamente; scegliere routing sicuro e documentare compromesso prima del codice. Profilo remoto con STT/TTS locali richiede relay previsto, non software nuovo imposto. Provider/model/voice attivi letti dal runtime; eventuali override solo nell'ambito scelto, niente API key nei log/storage renderer.

## Privacy e prerequisiti

Microfono macOS e Electron solo dopo gesto/permesso; negato/revocato/device assente hanno rimedio e fallback testo. Niente always-on o wake word nel primo incremento. Esplicitare audio inviato a provider/host e conservazione; default proposto nessuna registrazione permanente, transcript secondo chat. Upload dimensione/formato/timeout, cleanup temporanei e no log PCM/transcript personale.

Dipendenze: F2/F1 per invio/conversazione; F3 per grants; F4 per superficie, non redesign globale. STT e TTS indipendenti: STT pronto non implica playback o realtime. Motori locali/modelli e rete/cloud verificati separatamente. Voce in-app non chiama un telefono e non richiede numero/operatore.

## Definition of done

Dati e audio sintetici: permission denied/revoked, device absent/change, silence/no speech, cancel, errore trascrizione, bozza manuale preservata; invio singolo ed esito runtime. Playback stop, fallback testo e cleanup. Vocal chat: conversazione reale bidirezionale, latenza misurata, interruzione/echo, mute/end, turn ordering, profile/session switch, disconnect senza retry incerto e release mic al quit. Verifica packaged macOS, focus/tastiera/Reduced Motion e zero credenziali nei log. Build o file audio non dimostrano realtime. Non effettuare chiamate o registrare utente durante sviluppo non autorizzato.

## Prompt per una nuova chat

> Prima segui docs/agents/feature-workflow.md e File e skill F17. Leggi Voice Mode ufficiale e verifica contratti audio desktop/runtime alla SHA attuale. Implementa solo l'incremento F17-A/B/C/D selezionato usando strumenti/provider Hermes, cattura sul Mac e owner/sessione corretti; nessun executor voce OpenDots alternativo. Non imporre OpenAI Voice API Key, installare motori o cambiare profili personali automaticamente. Prova permessi, audio sintetico, ordine dei turni, cleanup e barge-in se supportato nella .app. Telefonate PSTN/SIP e wake word restano fuori incremento. Aggiorna prove/documenti e fai review prima del commit.
