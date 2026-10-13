import { useEffect, useRef, useState, type MutableRefObject } from 'react';
import { Mic, Volume2, Square, AudioLines } from 'lucide-react';
import { api } from './api';
import { VoiceLiveSession, toLiveHistory, type LiveTranscriptFragment } from './voice-live';

interface AudioConfig { available: boolean; reason?: string; features: {dictation: boolean; spokenResponse: boolean}; live: {available: boolean; reason?: string} }
export interface VoiceReply { delta(text: string): void; complete(text?: string): void; fail(reason: string): void }
export function AudioControls({threadId, connected, canSend, messages, onDraft, onSubmit, reply}: {
  threadId: string; connected: boolean; canSend: boolean; messages: Array<{role: 'user'|'assistant'; content: string}>;
  onDraft(text: string): void; onSubmit(text: string, id: string): Promise<boolean>;
  reply: MutableRefObject<VoiceReply | null>;
}) {
  const [config, setConfig] = useState<AudioConfig>();
  const [mode, setMode] = useState<'idle'|'recording'|'transcribing'|'speech'|'starting'|'live'>('idle');
  const [error, setError] = useState(''); const [caption, setCaption] = useState(''); const [muted, setMuted] = useState(false);
  const epoch = useRef(0); const recording = useRef<MediaRecorder | null>(null); const microphone = useRef<MediaStream | null>(null);
  const player = useRef<HTMLAudioElement | null>(null); const speechURL = useRef<string | null>(null); const live = useRef<VoiceLiveSession | null>(null);
  const delegation = useRef<{id: string; text: string} | null>(null); const latest = useRef({onDraft, onSubmit, canSend}); latest.current = {onDraft, onSubmit, canSend};
  function stop() {
    epoch.current++; if(recording.current) recording.current.onstop = null;
    if(recording.current?.state === 'recording') recording.current.stop(); recording.current = null;
    microphone.current?.getTracks().forEach(track => track.stop()); microphone.current = null;
    player.current?.pause(); player.current = null;
    if(speechURL.current) URL.revokeObjectURL(speechURL.current); speechURL.current = null;
    const session = live.current; live.current = null; session?.abort(); delegation.current = null;
    setMode('idle'); setMuted(false);
  }
  useEffect(() => {
    let active = true; setConfig(undefined);
    if(connected) void api<AudioConfig>(`/audio/config?threadId=${encodeURIComponent(threadId)}`).then(value => {if(active) setConfig(value);}).catch(cause => {if(active) setError(cause.message);});
    if(!connected) stop();
    return () => { active = false; stop(); };
  }, [threadId, connected]);
  useEffect(() => {
    const handlers: VoiceReply = {
      delta(text) { if(delegation.current) delegation.current.text += text; },
      complete(text) { const pending = delegation.current; if(!pending) return; delegation.current = null; live.current?.speak(pending.id, text || pending.text || 'Hermes completed the turn without a text response.'); },
      fail(reason) { const pending = delegation.current; delegation.current = null; if(pending) live.current?.speak(pending.id, reason); }
    };
    reply.current = handlers; return () => {if(reply.current === handlers) reply.current = null;};
  }, [reply]);
  async function dictate() {
    const current = ++epoch.current; setError(''); setMode('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({audio: true});
      if(current !== epoch.current) {stream.getTracks().forEach(track => track.stop()); return;}
      microphone.current = stream; const chunks: Blob[] = []; const recorder = new MediaRecorder(stream); recording.current = recorder;
      recorder.ondataavailable = event => { if(event.data.size) chunks.push(event.data); if(chunks.reduce((sum,chunk) => sum + chunk.size,0) > 5*1024*1024) recorder.stop(); };
      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop()); microphone.current = null; recording.current = null;
        if(current !== epoch.current) return; setMode('transcribing');
        void (async () => {
          const blob = new Blob(chunks, {type: recorder.mimeType || 'audio/webm'});
          const data_url = await new Promise<string>((resolve,reject) => {const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(Error('Recording could not be read.')); reader.readAsDataURL(blob);});
          const result = await api<{text: string}>('/audio/transcribe','POST',{threadId,data_url});
          if(current === epoch.current) {latest.current.onDraft(result.text); setMode('idle');}
        })().catch(cause => {if(current === epoch.current) {setError(cause.message); setMode('idle');}});
      };
      recorder.start(250); setMode('recording');
    } catch(cause) {if(current === epoch.current) {stop(); setError(cause instanceof Error ? cause.message : 'Microphone unavailable.');}}
  }
  async function speak() {
    const text = [...messages].reverse().find(item => item.role === 'assistant' && item.content.trim())?.content;
    if(!text) return; const current = ++epoch.current; setMode('speech'); setError('');
    try {
      const result = await api<{data_url: string}>('/audio/tts','POST',{threadId,text});
      if(current !== epoch.current) return;
      const match=result.data_url.match(/^data:([^;,]+)(?:;[^,]*)?;base64,(.+)$/);
      if(!match) throw Error('Invalid native speech audio.');
      const bytes=Uint8Array.from(atob(match[2]),char=>char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes],{type:match[1]}));
      if(current !== epoch.current) {URL.revokeObjectURL(url); return;}
      speechURL.current = url; const audio = new Audio(url); player.current = audio;
      audio.onended = () => stop(); audio.onerror = () => {stop(); setError('Speech audio could not be played.');}; await audio.play();
    } catch(cause) {if(current === epoch.current) {stop(); setError(cause instanceof Error ? cause.message : 'Speech unavailable.');}}
  }
  async function startLive() {
    const current = ++epoch.current; setMode('starting'); setError(''); setCaption('');
    const session = new VoiceLiveSession({
      onTranscript(fragment) {if(current === epoch.current) setCaption(previous => (previous + fragment.text).slice(-1200));},
      onClosed(reason) {if(current === epoch.current) {live.current = null; delegation.current = null; setMode('idle'); if(reason !== 'close_requested') setError(`Voice ended: ${reason}`);}},
      onError(message) {if(current === epoch.current) setError(message);},
      onDelegation(id, context: LiveTranscriptFragment[]) {
        if(current !== epoch.current) return;
        if(!latest.current.canSend || delegation.current) {session.speak(id,'Hermes is busy. Wait for the current turn to finish.'); return;}
        const text = context.map(fragment => `${fragment.speaker}: ${fragment.text}`).join('\n').slice(-16000);
        if(!text.trim()) {session.speak(id,'I did not receive a request transcript. Please repeat it.'); return;}
        delegation.current = {id, text: ''};
        void latest.current.onSubmit(`Spoken conversation context:\n${text}\n\nHandle the latest user request using this Hermes session.`, `voice:${id}`).then(sent => {
          if(!sent && delegation.current?.id === id) {delegation.current = null; session.speak(id,'The request could not be sent. Check the conversation.');}
        }).catch(cause => {if(delegation.current?.id === id) delegation.current = null; session.speak(id,cause.message);});
      }
    },threadId);
    live.current = session;
    try {await session.start(toLiveHistory(messages.map(item => ({role:item.role,text:item.content})))); if(current !== epoch.current || live.current !== session) {session.abort(); return;} setMode('live');}
    catch(cause) {if(current === epoch.current) {stop(); setError(cause instanceof Error ? cause.message : 'Voice unavailable.');}}
  }
  return <div className="hermes-audio-controls" aria-label="Hermes audio">
    <button type="button" className="icon-button" aria-label={mode === 'recording' ? 'Finish dictation' : 'Dictate a draft'} title={config?.features.dictation ? 'Dictate an editable draft' : config?.reason || 'Dictation unavailable'} disabled={mode !== 'recording' && (mode !== 'idle' || !connected || !config?.features.dictation)} onClick={() => mode === 'recording' ? recording.current?.stop() : void dictate()}><Mic size={18}/></button>
    <button type="button" className="icon-button" aria-label="Read latest response aloud" disabled={mode !== 'idle' || !config?.features.spokenResponse || !messages.some(item => item.role === 'assistant' && item.content.trim())} onClick={() => void speak()}><Volume2 size={18}/></button>
    <button type="button" className="icon-button" aria-label="Start voice conversation" title={config?.live.reason || 'Live voice with Hermes'} disabled={mode !== 'idle' || !canSend || !config?.live.available} onClick={() => void startLive()}><AudioLines size={18}/></button>
    {mode === 'live' && <button type="button" onClick={() => {live.current?.setMuted(!muted); setMuted(!muted);}}>{muted ? 'Unmute' : 'Mute'}</button>}
    {mode !== 'idle' && <button type="button" className="icon-button" aria-label="Stop audio" onClick={stop}><Square size={16}/></button>}
    <span role="status">{mode !== 'idle' ? mode : ''}</span>
    {caption && <details><summary>Voice captions</summary><p>{caption}</p></details>}
    {error && <span role="alert">{error}</span>}
  </div>;
}
