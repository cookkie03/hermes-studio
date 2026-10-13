import test from 'node:test';
import assert from 'node:assert/strict';
import { CollaborationManager } from './collaboration.mjs';

function fixture() {
  const calls=[];
  const gateway={connected:true, async request(method,params) { calls.push({method,params});
    if(method==='subagent.list')return {subagents:[{id:'child-real',status:'running',goal:'Native task'}]};
    if(method==='subagent.tail')return {output:'Actual native output'};
    if(method==='subagent.steer')return {status:'queued'};
    if(method==='subagent.interrupt')return {status:'interrupted'};
    if(method==='profiles.list')return {install_id:'synthetic-install',bot_mode_protocol:true,profiles:[{name:'qa'},{name:'peer'}]};
    if(method==='bot_relay.deliver')return {reply:'Native relay acknowledged',status:'queued'};
    if(method==='projects.get')return {project:{id:params.id,name:'QA project',folders:[{path:'/synthetic/project'}]}};
    throw Error('Unsupported method');
  }};
  const bridge={gateway,sessions:new Map([['thread-qa',{runtimeId:'runtime-qa',info:{profile_name:'qa'}}]])};
  const connections={forThread(id){assert.equal(id,'thread-qa');return bridge;},threadHost(){return {connectionId:'remote-qa',name:'QA remote',connected:gateway.connected};},history:async()=>({messages:[{id:'m-native',role:'assistant',content:'Actual project answer'}]})};
  const workspace={requireThread:()=>({id:'thread-qa',dotId:'dot-qa'}),dot:()=>({id:'dot-qa',nativeBinding:{connectionId:'remote-qa',profile:'peer'}}),canAccessSpace:()=>true,folderBindings:()=>[{host:'remote-qa',path:'/synthetic/project'}]};
  return {calls,gateway,manager:new CollaborationManager({connections,workspace})};
}

test('native subagent operations use the owning gateway/session, without invented execution',async()=>{
 const {manager,calls}=fixture();
 const tasks=await manager.listSubagents('thread-qa');assert.equal(tasks[0].subagentId,'child-real');
 const tail=await manager.getSubagentTail(tasks[0].id,16384,{threadId:'thread-qa'});assert.equal(tail.tail,'Actual native output');
 await manager.steerSubagent(tasks[0].id,'Focus',{threadId:'thread-qa'});
 await manager.interruptSubagent(tasks[0].id,{threadId:'thread-qa'});
 assert.deepEqual(calls.filter(c=>c.method!=='subagent.list').map(c=>c.method),['subagent.tail','subagent.steer','subagent.interrupt']);
 const steer=calls.find(c=>c.method==='subagent.steer');assert.equal(steer.params.text,'Focus');assert.equal(steer.params.session_id,'runtime-qa');
});

test('unsupported direct spawn cannot create a fake working child',async()=>{
 const {manager}=fixture();
 await assert.rejects(()=>manager.spawnSubagent({parentId:'thread-qa',goal:'Analyze'}),/delegate.*chat|not supported/i);
});

test('relay returns only native receipt and validates profile against actual roster',async()=>{
 const {manager,calls}=fixture();
 const receipt=await manager.sendBotMessage({threadId:'thread-qa',toProfile:'peer',content:'Synthetic request'});
 assert.equal(receipt.status,'queued');assert.equal(receipt.reply,'Native relay acknowledged');
 assert.equal(calls.at(-1).method,'bot_relay.deliver');assert.equal(calls.at(-1).params.profile,'peer');
 await assert.rejects(()=>manager.sendBotMessage({threadId:'thread-qa',toProfile:'fake',content:'Request'}),/profile|roster/i);
});

test('project links require a real native id and runtime verification',async()=>{
 const {manager,calls}=fixture();
 await assert.rejects(()=>manager.createSpaceLink({threadId:'thread-qa',spaceId:'space'}),/project.*required/i);
 const result=await manager.createSpaceLink({threadId:'thread-qa',spaceId:'space',projectId:'native-project'});
 assert.equal(result.projectId,'native-project');assert.equal(result.profile,'qa');assert.equal(result.connectionId,'remote-qa');
 assert.equal(calls.at(-1).method,'projects.get');assert.equal(calls.at(-1).params.profile,'qa');
});

test('recall is sourced from owned conversation messages, not local generated demos',async()=>{
 const {manager}=fixture();const results=await manager.searchRecall({threadId:'thread-qa',query:'project'});
 assert.equal(results[0].snippet,'Actual project answer');assert.equal(results[0].threadId,'thread-qa');
});

test('offline runtime cannot produce successful actions',async()=>{
 const {manager,gateway,calls}=fixture();gateway.connected=false;
 await assert.rejects(()=>manager.listSubagents('thread-qa'),/offline|connect/i);assert.equal(calls.length,0);
});
