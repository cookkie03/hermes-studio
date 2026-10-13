import test from 'node:test';import assert from 'node:assert/strict';import { NativeBotsManager } from './bots.mjs';
function fixture(){
 const calls=[];const roster={install_id:'install',bot_mode_protocol:true,profiles:[{name:'qa',canonical_session:{id:'canonical'}}]};
 const gateway={connected:true,async request(method,params){calls.push({method,params});if(method==='profiles.list')return roster;if(method==='session.list')return {sessions:[]};if(method==='session.create')return {session_id:'live-created',stored_session_id:'stored-created'};if(method==='session.title')return {};throw Error(method);}};
 const bridge={gateway,transportGeneration:1,bindings:new Map(),persistBindings:async()=>{}};
 const connections={slots:new Map([['host',{bridge}]]),connections:new Map([['host',{}]]),statusFor:()=>({connected:gateway.connected}),bindThread:async()=>{},forThread:()=>bridge};
 let botThread;const threads=new Map();const workspace={dot:()=>({nativeBinding:{connectionId:'host',installId:'install',profile:'qa'}}),nativeBotThread:()=>botThread,bindThread(id,dotId,title){const row={id,dotId,title};threads.set(id,row);return row;},requireThread:id=>threads.get(id)??{id,dotId:'dot'},bindNativeBotThread:(_dot,id)=>{botThread=id;}};
 return {calls,roster,bridge,gateway,manager:new NativeBotsManager({connections,workspace})};
}
test('concurrent Bot selection uses one local and native canonical chat',async()=>{
 const {manager,calls,bridge}=fixture();const [a,b]=await Promise.all([manager.createConversation('dot'),manager.createConversation('dot')]);assert.equal(a.id,b.id);assert.equal(bridge.bindings.get(a.id).storedId,'canonical');assert.equal(calls.filter(c=>c.method==='profiles.list').length,1);
});
test('new canonical Bot Chat title is applied using the selected native profile',async()=>{
 const {manager,calls,roster}=fixture();delete roster.profiles[0].canonical_session;await manager.ensureBinding('thread');assert.equal(calls.find(call=>call.method==='session.create').params.source,'desktop');assert.equal(calls.at(-1).method,'session.title');assert.equal(calls.at(-1).params.profile,'qa');assert.equal(calls.at(-1).params.session_id,'live-created');
});
test('reconnect during canonical lookup cannot persist stale binding',async()=>{
 const {manager,gateway,roster,bridge}=fixture();delete roster.profiles[0].canonical_session;const request=gateway.request.bind(gateway);gateway.request=async(method,params)=>{if(method==='session.list'){bridge.transportGeneration++;return {sessions:[{id:'old',title:'Bot Chat'}]};}return request(method,params);};
 await assert.rejects(()=>manager.ensureBinding('thread'),/connection changed/i);assert.equal(bridge.bindings.size,0);
});
test('saved binding verifies the live installation before reuse',async()=>{
 const {manager,roster,bridge}=fixture();bridge.bindings.set('thread',{storedId:'canonical',profile:'qa',nativeInstallId:'install'});roster.install_id='another-install';await assert.rejects(()=>manager.ensureBinding('thread'),/another Hermes installation/);assert.equal(bridge.bindings.get('thread').storedId,'canonical');
});
