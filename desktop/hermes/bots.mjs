import { randomUUID } from 'node:crypto';
export class NativeBotsManager {
  constructor({ connections, workspace }) { this.connections=connections;this.workspace=workspace;this.jobs=new Map();this.conversationJobs=new Map(); }
  async roster(connectionId) {
    const slot=this.connections.slots.get(connectionId);
    if (!slot?.bridge.gateway.connected || !this.connections.statusFor(connectionId).connected) throw new Error('The native Bot host is offline.');
    const generation=slot.bridge.transportGeneration;
    const result=await slot.bridge.gateway.request('profiles.list',{include_sessions:true});
    if(generation!==slot.bridge.transportGeneration || !slot.bridge.gateway.connected)throw new Error('Bot roster connection changed.');
    if(typeof result.install_id!=='string' || !result.install_id.trim() || result.bot_mode_protocol!==true || !Array.isArray(result.profiles))throw new Error('This backend did not report a native Bot roster and installation identity.');
    return result;
  }
  async sync() {
    const results=await Promise.all([...this.connections.connections.keys()].filter(id=>this.connections.statusFor(id).connected).map(async connectionId=>{
      try {const roster=await this.roster(connectionId);this.workspace.reconcileNativeBots(connectionId,roster.install_id,roster.profiles);return {connectionId,available:true,count:roster.profiles.length};}
      catch(error){return {connectionId,available:false,error:error.message};}
    }));return {connections:results};
  }
  createConversation(dotId,title) {
    if(this.conversationJobs.has(dotId))return this.conversationJobs.get(dotId);
    const job=this.openConversation(dotId,title).finally(()=>this.conversationJobs.delete(dotId));
    this.conversationJobs.set(dotId,job);return job;
  }
  async openConversation(dotId,title) {
    const dot=this.workspace.dot(dotId);if(!dot)throw new Error('Dot not found.');
    if(!dot.nativeBinding)return this.workspace.bindThread(randomUUID(),dotId,title);
    const existing=this.workspace.nativeBotThread(dotId);
    const thread=existing?this.workspace.requireThread(existing):this.workspace.bindThread(randomUUID(),dotId,'Bot Chat');
    this.workspace.bindNativeBotThread(dotId,thread.id);
    await this.ensureBinding(thread.id);
    return thread;
  }
  ensureBinding(threadId) {
    if(this.jobs.has(threadId))return this.jobs.get(threadId);
    const job=this.bind(threadId).finally(()=>this.jobs.delete(threadId));this.jobs.set(threadId,job);return job;
  }
  async bind(threadId) {
    const thread=this.workspace.requireThread(threadId), dot=this.workspace.dot(thread.dotId), native=dot?.nativeBinding;
    if(!native)return;
    await this.connections.bindThread(threadId,native.connectionId);
    const bridge=this.connections.forThread(threadId);
    const saved=bridge.bindings.get(threadId);
    if(saved && (saved.profile!==native.profile || (saved.nativeInstallId && saved.nativeInstallId!==native.installId)))throw new Error('This chat is already bound to a different native Bot.');
    const gateway=bridge.gateway, generation=bridge.transportGeneration;
    const check=()=>{
      if(gateway!==bridge.gateway || generation!==bridge.transportGeneration || !gateway.connected || this.connections.forThread(threadId)!==bridge)throw new Error('Bot connection changed while binding the conversation.');
    };
    const request=async(method,params)=>{check();const result=await gateway.request(method,{...params,profile:native.profile});check();return result;};
    const roster=await this.roster(native.connectionId);
    if(roster.install_id!==native.installId)throw new Error('This host now reports another Hermes installation. Reconcile its Bots explicitly.');
    const profile=roster.profiles.find(p=>p.name===native.profile);
    if(!profile)throw new Error('The selected native Bot is no longer in the authorized roster.');
    check();
    let storedId=profile.canonical_session?.resolved_id || profile.canonical_session?.id;
    if(!storedId) {
      const list=await request('session.list',{title:'Bot Chat',include_hidden:true,limit:200});
      const canonical=(list.sessions ?? []).find(s=>s.title==='Bot Chat');
      storedId=canonical?.resolved_id || canonical?.id;
      if(!storedId) {
        const created=await request('session.create',{source:'desktop',title:'Bot Chat',hidden:true,follow_profile_config:true,close_on_disconnect:false,idempotency_key:`studio-bot:${native.installId}:${native.profile}`});
        if(!created.session_id || !created.stored_session_id)throw new Error('Hermes did not confirm the canonical Bot Chat identity.');
        try {await request('session.title',{session_id:created.session_id,title:'Bot Chat'});}
        catch(error) {
          check();const winner=await request('session.list',{title:'Bot Chat',include_hidden:true,limit:200});
          const canonical=winner.sessions?.find(row=>row.title==='Bot Chat');
          if(!canonical)throw error;
          storedId=canonical.resolved_id || canonical.id;
        }
        storedId ||= created.stored_session_id;
      }
    }
    check();
    if(saved) {if(saved.storedId!==storedId)throw new Error('The canonical Bot Chat changed. The previous conversation was preserved.');return;}
    bridge.bindings.set(threadId,{storedId,profile:native.profile,nativeInstallId:native.installId,nativeBot:true});
    try {await bridge.persistBindings();check();}catch(error){bridge.bindings.delete(threadId);throw error;}
  }
}
