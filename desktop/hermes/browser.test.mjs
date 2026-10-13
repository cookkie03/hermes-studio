import test from 'node:test';import assert from 'node:assert/strict';
import {HermesBrowserService,sanitizeUrl} from './browser.mjs';
function fixture(transport) {
 const workspace={dot:()=>({id:'dot'}),requireThread:id=>({dotId:id==='other'?'other-dot':'dot'})};
 const bridge={gateway:{request:async()=>({sections:[{tools:[{name:'read_preview'},{name:'drive_preview'}]}]})},sessions:new Map([['thread',{runtimeId:'runtime-1',info:{profile_name:'qa'}}]]),transportGeneration:1};
 const connections={on(){},threadHost:()=>({connectionId:'local'}),statusFor:()=>({connected:true,name:'Synthetic host',mode:'local'}),slots:new Map([['local',{bridge}]])};
 return new HermesBrowserService({connections,workspace,transport});
}
test('browser does not invent running state before a real desktop transport mounts',async()=>{
 const manager=fixture();const status=await manager.getStatus('dot');assert.equal(status.configured,false);assert.equal(status.cookiesCount,null);
 await assert.rejects(()=>manager.mount({dotId:'dot'}),/desktop app/);
});
test('native DOM read/action results come from the transport, not manufactured strings',async()=>{
 const calls=[];const manager=fixture(async(method,args)=>{calls.push({method,args});if(method==='mount')return {configured:true,state:'running'};if(method==='read')return {kind:'url',url:'https://synthetic.example/',text:'Actual DOM'};throw Error('Element does not exist');});
 await manager.mount({dotId:'dot',threadId:'thread',bounds:{x:1,y:1,width:100,height:100}});
 assert.equal((await manager.handleNativeRequest({id:'read-1',method:'preview.read',params:{session_id:'runtime-1'}},{threadId:'thread',connectionId:'local'})).text,'Actual DOM');
 await assert.rejects(()=>manager.handleNativeRequest({id:'act-1',method:'preview.act',params:{session_id:'runtime-1',action:'click',ref:'missing'}},{threadId:'thread',connectionId:'local'}),/Element does not exist/);
 assert.equal(calls.at(-1).method,'act');
});
test('replayed mutations and foreign conversation callbacks never execute',async()=>{
 let calls=0;const manager=fixture(async()=>{calls++;return {configured:true};});await manager.mount({dotId:'dot',threadId:'thread'});
 await assert.rejects(()=>manager.handleNativeRequest({id:'act',method:'preview.act',replayed:true,params:{session_id:'runtime-1'}},{threadId:'thread',connectionId:'local'}),/replayed/i);
 await assert.rejects(()=>manager.handleNativeRequest({id:'foreign',method:'preview.act',params:{session_id:'runtime-1'}},{threadId:'other',connectionId:'local'}),/owned conversation/);
 assert.equal(calls,1);
});
test('browser mount validates Dot/thread identity and navigation protocols',async()=>{
 const manager=fixture(async()=>({configured:true}));await assert.rejects(()=>manager.mount({dotId:'dot',threadId:'other'}),/belong/);
 assert.throws(()=>sanitizeUrl('file:///tmp/private'),/HTTP/);assert.throws(()=>sanitizeUrl('https://user:password@example.com'),/credentials/);
 assert.equal(sanitizeUrl('https://synthetic.example'),'https://synthetic.example/');
});

test('warm sessions without native preview tools keep manual browsing and cannot grant agent control',async()=>{
 const manager=fixture(async()=>({configured:true}));manager.connections.slots.get('local').bridge.gateway.request=async()=>({sections:[{tools:[{name:'terminal'}]}]});
 await manager.mount({dotId:'dot',threadId:'thread'});assert.equal(manager.current.nativePreviewSupported,false);assert.throws(()=>manager.releaseControl('dot'),/not enabled desktop preview/);
 await assert.rejects(()=>manager.handleNativeRequest({id:'act',method:'preview.act',params:{session_id:'runtime-1',action:'click'}},{threadId:'thread',connectionId:'local'}),/not enabled desktop preview/);
});
