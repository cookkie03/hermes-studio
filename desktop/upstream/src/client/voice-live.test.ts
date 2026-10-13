import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
const request=vi.hoisted(()=>vi.fn());vi.mock('./api',()=>({api:request}));
import {VoiceLiveSession,chunkForCommentary,toLiveHistory} from './voice-live';
let peer: FakePeer, track: {stop: ReturnType<typeof vi.fn>; enabled: boolean};
class FakeChannel extends EventTarget {readyState='open';send=vi.fn();close=vi.fn();emit(value:unknown){this.dispatchEvent(new MessageEvent('message',{data:JSON.stringify(value)}));}}
class FakePeer extends EventTarget {
 channel=new FakeChannel();iceGatheringState='complete';connectionState='connected';localDescription={sdp:'offer\r\n'};remote:Promise<void>=Promise.resolve();
 constructor(){super();peer=this;}
 addTrack(){}createDataChannel(){return this.channel;}async createOffer(){return {type:'offer',sdp:'offer\r\n'};}async setLocalDescription(){}async setRemoteDescription(){await this.remote;}close=vi.fn();
}
describe('native realtime transport ownership and lifecycle',()=>{
 beforeEach(()=>{
  track={stop:vi.fn(),enabled:true};vi.stubGlobal('window',globalThis);vi.stubGlobal('Audio',class {autoplay=false;srcObject=null;play=vi.fn(async()=>{});pause=vi.fn();});vi.stubGlobal('RTCPeerConnection',FakePeer);vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:vi.fn(async()=>({getAudioTracks:()=>[track],getTracks:()=>[track]}))}});
  request.mockReset().mockResolvedValue({ok:true,session:{id:'voice'},transport:{sdp:'native answer\r\n',type:'answer'}});
 });
 afterEach(()=>vi.unstubAllGlobals());
 it('uses exact owned thread and native SDP; duplicate delegation does not dispatch twice',async()=>{
  const delegated=vi.fn();const session=new VoiceLiveSession({onDelegation:delegated,onError:vi.fn(),onClosed:vi.fn()},'owned-thread');await session.start([]);
  expect(request).toHaveBeenCalledWith('/audio/voice-live/session','POST',{threadId:'owned-thread',history:[],sdp:'offer\r\n'});
  peer.channel.emit({type:'session.input_transcript.delta',delta:'Synthetic request',end_ms:100});peer.channel.emit({type:'session.delegation.created',delegation:{id:'work'}});peer.channel.emit({type:'session.delegation.created',delegation:{id:'work'}});
  expect(delegated).toHaveBeenCalledTimes(1);session.abort();expect(track.stop).toHaveBeenCalled();
 });
 it('closed during pending negotiation cannot resolve a usable session',async()=>{
  let resolveRemote!:()=>void;const closed=vi.fn();const session=new VoiceLiveSession({onDelegation:vi.fn(),onError:vi.fn(),onClosed:closed},'owned');
  const start=session.start([]);peer.remote=new Promise<void>(resolve=>{resolveRemote=resolve;});await vi.waitFor(()=>expect(request).toHaveBeenCalled());
  peer.channel.emit({type:'session.closed',reason:'connection_lost'});resolveRemote();await expect(start).rejects.toThrow('closed');expect(session.connected).toBe(false);expect(track.stop).toHaveBeenCalled();expect(closed).toHaveBeenCalledTimes(1);
 });
 it('stop releases a permission result that arrives after owner disposal',async()=>{
  let grant!:(value:MediaStream)=>void;vi.mocked(navigator.mediaDevices.getUserMedia).mockImplementation(()=>new Promise(resolve=>{grant=resolve;}) as Promise<MediaStream>);
  const session=new VoiceLiveSession({onDelegation:vi.fn(),onError:vi.fn(),onClosed:vi.fn()},'owned');const start=session.start([]);session.abort();grant({getTracks:()=>[track],getAudioTracks:()=>[track]} as unknown as MediaStream);await expect(start).rejects.toThrow('closed');expect(track.stop).toHaveBeenCalled();expect(request).not.toHaveBeenCalled();
 });
 it('history and spoken commentary are bounded without losing native roles',()=>{
  expect(toLiveHistory([{role:'user',text:'Request'},{role:'assistant',text:'Response'}])[1].content[0].type).toBe('output_text');expect(chunkForCommentary('x'.repeat(3000)).every(chunk=>chunk.length<=1400)).toBe(true);
 });
});
