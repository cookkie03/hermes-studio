import test from 'node:test';
import assert from 'node:assert/strict';
import { AudioManager } from './audio.mjs';
function fixture() {
 const calls=[];const gateway={connected:true,async http(path,options){calls.push({path,options});
  if(path.startsWith('/api/audio/voice-config'))return {ok:true,stt:{mode:'relay',provider:'local',api_key:'synthetic-secret'},tts:{mode:'relay',provider:'edge'}};
  if(path.startsWith('/api/audio/voice-live/status'))return {ok:true,available:false,mode:'chained',reason:'No realtime provider'};
  if(path.startsWith('/api/audio/transcribe'))return {ok:true,transcript:'Actual native transcript',provider:'local'};
  if(path.startsWith('/api/audio/speak'))return {ok:true,data_url:'data:audio/wav;base64,UklGRg==',mime_type:'audio/wav',provider:'edge'};
  throw Error('unsupported');
 }};
 const owner={gateway,sessions:new Map([['thread',{runtimeId:'runtime-id',info:{profile_name:'qa'}}]])};
 const connections={forThread:()=>owner,threadHost:()=>({connected:gateway.connected,connectionId:'native-remote',name:'Remote'})};
 return {calls,gateway,audio:new AudioManager({connections})};
}
test('audio configuration is a secret-free projection of native profile routes',async()=>{
 const {audio}=fixture();const config=await audio.getConfig({threadId:'thread'});
 assert.equal(config.features.dictation,true);assert.equal(config.profile,'qa');assert.equal(JSON.stringify(config).includes('synthetic-secret'),false);assert.equal(config.live.available,false);
});
test('transcription and TTS route to the actual native profile with real payloads',async()=>{
 const {audio,calls}=fixture();const transcription=await audio.transcribe({threadId:'thread',data_url:'data:audio/wav;base64,UklGRg=='});
 assert.equal(transcription.text,'Actual native transcript');assert.equal(calls.at(-1).path,'/api/audio/transcribe?profile=qa');
 assert.equal(calls.at(-1).options.body.data_url,'data:audio/wav;base64,UklGRg==');
 const speech=await audio.tts({threadId:'thread',text:'Synthetic QA response'});assert.equal(speech.data_url,'data:audio/wav;base64,UklGRg==');assert.equal(calls.at(-1).path,'/api/audio/speak?profile=qa');
});
test('missing provider and malformed payload cannot produce synthetic success',async()=>{
 const {audio,gateway}=fixture();await assert.rejects(()=>audio.transcribe({threadId:'thread',text:'Pretend transcript'}),/audio.*required/i);
 gateway.http=async()=>{throw Error('Native STT unavailable');};await assert.rejects(()=>audio.transcribe({threadId:'thread',data_url:'data:audio/wav;base64,UklGRg=='}),/Native STT unavailable/);
});
test('offline audio is unavailable and does not call another host',async()=>{
 const {audio,gateway,calls}=fixture();gateway.connected=false;const config=await audio.getConfig({threadId:'thread'});assert.equal(config.available,false);assert.equal(calls.length,0);
});

test('realtime voice preserves the native nested SDP contract and owner',async()=>{
 const {audio,gateway,calls}=fixture();gateway.http=async(path,options)=>{calls.push({path,options});return path.includes('/status') ? {ok:true,available:true} : {ok:true,session:{id:'native-voice'},transport:{sdp:'native answer\r\n',type:'answer'}};};
 const result=await audio.createLiveSession({threadId:'thread',sdp:'offer\r\n'}); assert.equal(result.transport.sdp,'native answer\r\n');assert.equal(result.session.id,'native-voice');assert.equal(calls.at(-1).path,'/api/audio/voice-live/session?profile=qa');
});

test('native relay fallback with disabled STT or missing credentials does not advertise ready audio',async()=>{
 const {audio,gateway}=fixture();gateway.http=async path=>path.includes('/voice-config')?{ok:true,stt:{mode:'relay',reason:'stt disabled'},tts:{mode:'relay',reason:'no credentials'}}:{ok:true,available:false,mode:'chained'};
 const result=await audio.getConfig({threadId:'thread'});assert.equal(result.available,true);assert.equal(result.features.dictation,false);assert.equal(result.features.spokenResponse,false);
});

test('disabling client-direct voice preserves working native server relay',async()=>{
 const {audio,gateway}=fixture();const http=gateway.http.bind(gateway);
 gateway.http=async(path,options)=>path.includes('/voice-config')?{ok:true,stt:{mode:'relay',reason:'voice.client_direct disabled'},tts:{mode:'relay',reason:'voice.client_direct disabled'}}:http(path,options);
 const config=await audio.getConfig({threadId:'thread'});assert.equal(config.features.dictation,true);assert.equal(config.features.spokenResponse,true);
 assert.equal((await audio.transcribe({threadId:'thread',data_url:'data:audio/wav;base64,UklGRg=='})).text,'Actual native transcript');
});
