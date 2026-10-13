import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStudioApp } from './server.mjs';
class MockGateway extends EventEmitter {
  connected=true;calls=[];disconnect(){}
  async request(method,params){this.calls.push({method,params});
    if(method==='subagent.list')return {subagents:[{subagent_id:'native-child',status:'running',accepting_steer:true}]};
    if(method==='subagent.tail')return {available:true,text:'Native child output'};
    if(method==='subagent.steer')return {status:'queued'};
    if(method==='subagent.interrupt')return {found:true};
    if(method==='profiles.list')return {install_id:'fixture-install',profiles:[{name:'qa'},{name:'peer'}]};
    if(method==='bot_relay.deliver')return {reply:'Native reply'};
    throw Error('Unsupported fixture RPC '+method);
  }
}
test('collaboration API validates owner, native children and truthful relay receipts',async()=>{
 const dataDir=await mkdtemp(join(tmpdir(),'hermes-collab-'));const ownerToken='synthetic-owner-token-with-enough-length';const gateway=new MockGateway();
 const service=await createStudioApp({dataDir,ownerToken,gateway});
 const request=(path,method='GET',body,authenticated=true)=>service.app.request('http://127.0.0.1'+path,{method,headers:{...(authenticated?{Authorization:`Bearer ${ownerToken}`} : {}),'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
 try {
  const dot=service.workspace.dots()[0];const thread=service.workspace.bindThread('qa-thread',dot.id,'Synthetic QA');
  const bridge=service.bridge.forThread(thread.id);bridge.sessions.set(thread.id,{runtimeId:'native-parent',info:{profile_name:'qa'}});
  // Isolated in-memory transport ownership; no host discovery or personal configuration.
  service.bridge.threadHost=()=>({connectionId:'local',name:'Fixture',connected:true});
  assert.equal((await request('/api/hermes/collaboration/subagents?parentId=qa-thread','GET',undefined,false)).status,401);
  const children=await request('/api/hermes/collaboration/subagents?parentId=qa-thread');assert.equal(children.status,200);assert.equal((await children.json())[0].subagentId,'native-child');
  const tail=await request('/api/hermes/collaboration/subagents/native-child/tail?threadId=qa-thread');assert.equal((await tail.json()).tail,'Native child output');
  const steer=await request('/api/hermes/collaboration/subagents/native-child/steer','POST',{threadId:thread.id,message:'Focus on synthetic records'});assert.equal(steer.status,200);assert.equal(gateway.calls.at(-1).params.text,'Focus on synthetic records');
  assert.equal((await request('/api/hermes/collaboration/subagents/foreign/tail?threadId=qa-thread')).status,404);
  assert.equal((await request('/api/hermes/collaboration/subagents','POST',{parentId:thread.id,goal:'Unsupported direct spawn'})).status,400);
  const relay=await request('/api/hermes/collaboration/messages','POST',{threadId:thread.id,toProfile:'peer',content:'Synthetic request',fromProfile:'forged'});assert.equal(relay.status,200);
  const receipt=await relay.json();assert.equal(receipt.status,'reply_observed');assert.equal(receipt.deliveryId,null);assert.equal(gateway.calls.at(-1).params.from_profile,'qa');
  assert.equal((await request('/api/hermes/collaboration/space-link','POST',{threadId:thread.id,spaceId:'space'})).status,400);
 }finally{service.close();await rm(dataDir,{recursive:true,force:true});}
});
