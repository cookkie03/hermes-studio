import { resolveThreadScope, assertCurrentScope } from './native-scope.mjs';
const audioURL = /^data:(audio\/[\w.+-]+|video\/webm)(?:;[^,]*)?;base64,([A-Za-z0-9+/]+={0,2})$/;
const publicProvider = value => ({ mode: typeof value?.mode === 'string' ? value.mode : 'unavailable', provider: typeof value?.provider === 'string' ? value.provider : null, model: typeof value?.model === 'string' ? value.model : null, reason: typeof value?.reason === 'string' ? value.reason : null });
const usableProvider = provider => !['unavailable','disabled'].includes(provider.mode) && !['stt disabled','tts disabled','no credentials'].includes((provider.reason ?? '').toLowerCase());
export class AudioManager {
  constructor({ connections } = {}) { this.connections=connections; }
  async request(owner,path,{body,timeout=90000}={}) {
    if(typeof owner.gateway.http!=='function')throw new Error('Native audio HTTP transport is not available.');
    const result=await owner.gateway.http(`${path}?profile=${encodeURIComponent(owner.profile)}`,{method:body===undefined?'GET':'POST',body,timeout});
    assertCurrentScope(this.connections,owner);return result;
  }
  async getConfig({threadId}={}) {
    try {
      const owner=resolveThreadScope(this.connections,threadId);
      const config=await this.request(owner,'/api/audio/voice-config');
      if(config.ok!==true || !config.stt || !config.tts)throw new Error('Hermes did not report its audio contract.');
      let live={available:false,mode:'unavailable',reason:'Native realtime voice status is not available.'};
      try {const status=await this.request(owner,'/api/audio/voice-live/status');live={available:status.ok===true && status.available===true,mode:status.mode,reason:status.reason ?? null,model:status.model ?? null,voice:status.voice ?? null};}catch{}
      const stt=publicProvider(config.stt),tts=publicProvider(config.tts);
      return {available:true,connectionId:owner.connectionId,profile:owner.profile,stt,tts,live,features:{dictation:usableProvider(stt),spokenResponse:usableProvider(tts)},reason:'Audio is processed by the selected Hermes profile; provider failures remain explicit.'};
    }catch(error){return {available:false,features:{dictation:false,spokenResponse:false},live:{available:false},reason:error.message};}
  }
  async transcribe({threadId,data_url,audio,mimeType='audio/webm'}={}) {
    if(!data_url && typeof audio==='string')data_url=`data:${mimeType};base64,${audio}`;
    const match=typeof data_url==='string' && data_url.match(audioURL);
    if(!match || data_url.length>8*1024*1024)throw new Error('A valid audio recording is required (maximum 8 MiB encoded).');
    const owner=resolveThreadScope(this.connections,threadId);
    const result=await this.request(owner,'/api/audio/transcribe',{body:{data_url,mime_type:match[1]}});
    if(result.ok!==true || typeof result.transcript!=='string')throw new Error('Hermes did not return a valid transcription.');
    return {text:result.transcript,provider:result.provider ?? null,profile:owner.profile};
  }
  async tts({threadId,text}={}) {
    if(typeof text!=='string' || !text.trim() || text.length>20000)throw new Error('Text of 1–20,000 characters is required for speech.');
    const owner=resolveThreadScope(this.connections,threadId);
    const result=await this.request(owner,'/api/audio/speak',{body:{text}});
    if(result.ok!==true || typeof result.data_url!=='string' || !audioURL.test(result.data_url))throw new Error('Hermes did not return valid speech audio.');
    return {data_url:result.data_url,mime_type:result.mime_type,provider:result.provider ?? null,profile:owner.profile};
  }
  async createLiveSession({threadId,sdp,history=[]}={}) {
    if(typeof sdp!=='string' || !sdp.trim() || sdp.length>200000)throw new Error('A valid voice SDP offer is required.');
    const owner=resolveThreadScope(this.connections,threadId);
    const status=await this.request(owner,'/api/audio/voice-live/status');
    if(status.available!==true)throw new Error(status.reason || 'Native realtime voice is not configured.');
    const result=await this.request(owner,'/api/audio/voice-live/session',{body:{sdp,history:history.slice(-20)}});
    if(result.ok!==true || typeof result.transport?.sdp!=='string')throw new Error('Hermes did not return a voice SDP answer.');
    return {ok:true,transport:{sdp:result.transport.sdp,type:'answer'},session:result.session?.id ? {id:result.session.id} : undefined};
  }
}
