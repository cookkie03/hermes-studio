import test from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createStudioApp } from './server.mjs';
class NoRuntime extends EventEmitter {connected=false;disconnect(){}}
test('authenticated audio handlers report unavailable runtime and reject fake transcripts',async()=>{
	const dataDir=await mkdtemp(join(tmpdir(), 'hermes-audio-api-')),ownerToken='synthetic-owner-token-with-enough-length';
 const service=await createStudioApp({dataDir,ownerToken,gateway:new NoRuntime()});
 const request=(path,body)=>service.app.request('http://127.0.0.1/api'+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+ownerToken,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
 try {
  assert.equal((await service.app.request('http://127.0.0.1/api/audio/config')).status,401);
  const config=await request('/audio/config');assert.equal(config.status,200);assert.equal((await config.json()).available,false);
  const transcribe=await request('/audio/transcribe',{text:'Invented transcript'});assert.equal(transcribe.status,400);assert.match((await transcribe.json()).error,/audio.*required/i);
  const tts=await request('/audio/tts',{});assert.equal(tts.status,400);assert.match((await tts.json()).error,/Text/);
 }finally{service.close();await rm(dataDir,{recursive:true,force:true});}
});
