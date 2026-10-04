# F13 — Voce e telefonate

Stato: futura/documentata; nessuna implementazione autorizzata adesso. Specifica di ricerca conservata in ../future/voice-calls.md, da leggere prima di iniziare.

Obiettivo: conversazione vocale in-app, eventualmente chiamata al numero scelto dall'utente. Separare audio realtime/STT/TTS e rete telefonica. Moduli open source non eliminano necessità di numero/SIP/operatori, costi e consenso. Nessun OpenAI VoiceAPIkey obbligatorio è una scelta da validare, non una promessa telefonategratis.

Dipendenze F11/F16 e providerlocale scelto; call identity/session/agent con stato ringing/connected/ended/error, approvazione chiamata concreta e numero destinatario. Non attivare microfono o comporre numeri al lancio. Persistenza minima e scelta esplicita registrazione/audio provider. F05 collaborazione futura non implica telefonate disponibili.

Gate futuri: latenza/interruption/permesso negato/offline/outputdevice, consent e chiamata test autorizzata a destinatario esplicito. Nessuna chiamata personale in questa chat. Primo incremento vocein-app, PSTN successivo e separato.

> Sviluppa solo F13 a partire da voice-calls.md, prima ricerca e slice in-app con dati sintetici. Non chiamare numeri o installare provider/operatori senza ambito esplicito. Verifica reale realtime e costi/prerequisiti; nessun'altra feature.
