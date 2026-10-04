# F13 — Voce e telefonate

Stato: futura/documentata; nessuna implementazione autorizzata adesso. Specifica di ricerca conservata in ../future/voice-calls.md, da leggere prima di iniziare.

Obiettivo: conversazione vocale in-app, eventualmente chiamata al numero scelto dall'utente. Separare audio realtime/STT/TTS e rete telefonica. Moduli open source non eliminano necessità di numero/SIP/operatori, costi e consenso. Nessun OpenAI VoiceAPIkey obbligatorio è una scelta da validare, non una promessa telefonategratis.

Dipendenze F11/F16 e providerlocale scelto; call identity/session/agent con stato ringing/connected/ended/error, approvazione chiamata concreta e numero destinatario. Non attivare microfono o comporre numeri al lancio. Persistenza minima e scelta esplicita registrazione/audio provider. F05 collaborazione futura non implica telefonate disponibili.

Gate futuri: latenza/interruption/permesso negato/offline/outputdevice, consent e chiamata test autorizzata a destinatario esplicito. Nessuna chiamata personale in questa chat. Primo incremento vocein-app, PSTN successivo e separato.


<!-- feature-guidance:start -->
## File e skill da leggere e usare

Prima seguire il [workflow comune guidato da ask-matt](../agents/feature-workflow.md): contiene le letture iniziali, le skill di implementazione/review e i criteri di uscita. Leggere poi i file specifici qui sotto. Il [catalogo completo di progetto e globali](../agents/skills-catalog.md) conserva tutte le raccolte; caricare il corpo delle skill soltanto quando pertinente.

### Skill specifiche

| Skill / percorso | Quando applicarla a questa feature |
|---|---|
| [research](<../../.agents/skills/research/SKILL.md>) | STT/TTS realtime e telefonia sono contratti distinti |
| [grill-with-docs](<../../.agents/skills/grill-with-docs/SKILL.md>) | Solo quando viene selezionata questa idea futura |
| [prototype](<../../.agents/skills/prototype/SKILL.md>) — condizionale | Risposta eseguibile a una domanda tecnica delimitata |
| [openai-docs](</Users/luca/.codex/skills/.system/openai-docs/SKILL.md>) — condizionale | Soltanto se si sceglie un prodotto OpenAI; non è requisito della voce locale |

### Punti di ingresso da leggere

- [docs/future/voice-calls.md](<../../docs/future/voice-calls.md>): Ipotesi, prerequisiti e limiti telefonia.
- [docs/features/F11-runtime-connection.md](<../../docs/features/F11-runtime-connection.md>): Host.
- [docs/features/F16-permissions-and-approvals.md](<../../docs/features/F16-permissions-and-approvals.md>): Permessi microfono/azioni.
- [desktop/upstream/src/client/useVoice.ts](<../../desktop/upstream/src/client/useVoice.ts>): Vecchio codice reference, non prova Hermes voice.
- [desktop/upstream/src/client/CallView.tsx](<../../desktop/upstream/src/client/CallView.tsx>): Superficie esistente da non attivare automaticamente.

Verificare percorsi e versione prima di lavorare; coordinare i file condivisi. Le letture non autorizzano altre feature o modifiche al runtime personale.
<!-- feature-guidance:end -->

> Prima segui docs/agents/feature-workflow.md e la sezione File e skill di questa scheda, leggendo i SKILL.md prima di applicarli. Sviluppa solo F13 a partire da voice-calls.md, prima ricerca e slice in-app con dati sintetici. Non chiamare numeri o installare provider/operatori senza ambito esplicito. Verifica reale realtime e costi/prerequisiti; nessun'altra feature.
