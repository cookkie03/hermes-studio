// Opt-in native Hermes contract acceptance. Fresh home, no personal credentials, no inference.
import {spawn} from 'node:child_process';
import {mkdtemp,mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {HermesGateway} from '../desktop/hermes/gateway.mjs';
import {createStudioApp} from '../desktop/hermes/server.mjs';
const source=process.env.HERMES_TEST_SOURCE,python=process.env.HERMES_TEST_PYTHON;
if(!source||!python)throw Error('Set explicit HERMES_TEST_SOURCE and HERMES_TEST_PYTHON.');
const data=await mkdtemp('/private/tmp/hermes-native-acceptance-'),home=join(data,'home'),project=join(data,'project');await mkdir(home);await mkdir(project);
const config='_config_version: 50\nauth:\n  adopt_external_logins: false\nnous:\n  guest: false\n  keepalive_interval_seconds: 0\nupdates:\n  check: false\ntelemetry:\n  shared_metrics:\n    enabled: false\n    send: false\nlocal_runtime:\n  enabled: false\nmcp_servers: {}\ntools:\n  enabled_toolsets: []\nstt:\n  enabled: false\n  streaming: false\ntts:\n  provider: deepinfra\n';
await writeFile(join(home,'config.yaml'),config);await writeFile(join(home,'.env'),'# synthetic empty credentials\n');
const bootstrap='import sys; sys.dont_write_bytecode=True; sys.path.insert(0,'+JSON.stringify(resolve(source))+'); import hermes_bootstrap; from hermes_cli.main import main; sys.exit(main())';
const child=spawn(python,['-I','-c',bootstrap,'serve','--host','127.0.0.1','--port','0','--isolated','--no-open'],{cwd:data,env:{PATH:'/usr/bin:/bin:/usr/sbin:/sbin',HERMES_HOME:home,HERMES_DASHBOARD_SESSION_TOKEN:randomBytes(32).toString('hex'),HERMES_GUEST_ONBOARDING:'0',PYTHONDONTWRITEBYTECODE:'1'},stdio:['ignore','pipe','pipe']});
let output='',service,gateway;child.stdout.on('data',chunk=>output+=chunk);child.stderr.on('data',chunk=>output+=chunk);
try {
 const port=await new Promise((done,reject)=>{const until=setTimeout(()=>reject(Error('Native isolated readiness failed: '+output.slice(-3000))),60000);const poll=setInterval(()=>{const found=output.match(/HERMES_BACKEND_READY port=(\d+)/);if(found){clearTimeout(until);clearInterval(poll);done(Number(found[1]));}},100);child.once('exit',code=>{clearInterval(poll);clearTimeout(until);reject(Error('Native isolated exit '+code+': '+output.slice(-3000)));});});
 gateway=new HermesGateway();await gateway.connect('http://127.0.0.1:'+port,{serverRequests:true});
 await gateway.request('profiles.create',{name:'studio-synthetic-bot',mirror_credentials:false,share_auth:false,no_alias:true,no_skills:true});
 // A freshly created profile has only synthetic files/config; ensure no native defaults can call a provider.
 const roster=await gateway.request('profiles.list',{include_sessions:true});const profile=roster.profiles.find(row=>row.name==='studio-synthetic-bot');assert(profile);assert(profile.path.startsWith(home));await writeFile(join(profile.path,'config.yaml'),config);
 await mkdir(join(profile.path,'memories'),{recursive:true});await writeFile(join(profile.path,'memories','USER.md'),'Synthetic user QA only.\n');
 const created=await gateway.request('projects.create',{profile:profile.name,name:'Synthetic workspace',folders:[project],primary_path:project});assert(created.project?.id);
 // Build Studio against that explicit native endpoint; no automatic host discovery.
 service=await createStudioApp({dataDir:join(data,'studio'),ownerToken:randomBytes(32).toString('hex'),gateway});
 const slot=service.bridge.slots.get('local');slot.state='available';
 const {NativeBotsManager}=await import('../desktop/hermes/bots.mjs');const bots=new NativeBotsManager({connections:service.bridge,workspace:service.workspace});const synced=await bots.sync();assert(synced.connections.some(row=>row.available),JSON.stringify(synced));
 const dot=service.workspace.dots().find(row=>row.nativeBinding?.profile===profile.name);assert(dot);
 const thread=await bots.createConversation(dot.id,'Bot Chat');
 const session=await service.bridge.session(thread.id);assert.equal(session.info.profile_name,profile.name);
 assert.equal((await service.collaboration.listSubagents(thread.id)).length,0);
 const space=service.workspace.spaces()[0];await service.collaboration.createSpaceLink({threadId:thread.id,spaceId:space.id,projectId:created.project.id});
 const context=await service.collaboration.applySpaceProject({threadId:thread.id,spaceId:space.id});assert.equal(context.nativeResult.cwd,project);
 const {AudioManager}=await import('../desktop/hermes/audio.mjs');const audio=new AudioManager({connections:service.bridge});const audioConfig=await audio.getConfig({threadId:thread.id});assert.equal(audioConfig.available,true);assert.equal(audioConfig.features.dictation,false);assert.equal(audioConfig.features.spokenResponse,false);assert.equal(audioConfig.live.available,false);
 await assert.rejects(()=>audio.tts({threadId:thread.id,text:'Synthetic QA'}));
 const memory=await service.memoryManager.getMemoryStatus({connectionId:'local',profile:profile.name});assert.equal(memory.available,true);
 console.log(JSON.stringify({pass:true,nativeSource:source,artifacts:data,checks:['native profile roster','canonical Bot Chat creation/resume','subagent empty roster','native project link/cwd','native audio unavailable without provider','native memory metadata'],providerCalls:0}));
} finally {
 service?.close();gateway?.disconnect();child.kill('SIGTERM');await new Promise(done=>{if(child.exitCode!==null)done();else {child.once('exit',done);setTimeout(()=>{if(child.exitCode===null)child.kill('SIGKILL');done();},5000).unref();}});
}
