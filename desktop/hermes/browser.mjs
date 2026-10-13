import { randomUUID, createHash } from 'node:crypto';
export function sanitizeUrl(raw) {
  if(typeof raw!=='string')throw new Error('A browser URL is required.');
  const url=new URL(raw.trim());
  if(!['http:','https:'].includes(url.protocol) || url.username || url.password)throw new Error('Only HTTP(S) browser URLs without embedded credentials are supported.');
  return url.href;
}
export class HermesBrowserService {
  constructor({connections,workspace,transport}={}) {this.connections=connections;this.workspace=workspace;this.transport=transport;this.current=null;this.snapshots=new Map();this.generation=0;this.toolChecks=new Map();
    connections?.on('update',event=>{const native=event.event;if(event.threadId===this.current?.threadId && native?.type==='preview.open' && typeof native.payload?.url==='string')void this.navigate(this.current.dotId,native.payload.url,'agent').catch(error=>{this.previewError=error.message;});});
  }
  async initialize() {} // Old browser-workspace.json demo records are preserved, never trusted.
  scope(dotId,threadId) {
    const dot=this.workspace?.dot(dotId);if(!dot)throw new Error('Dot not found.');
    if(threadId && this.workspace.requireThread(threadId).dotId!==dotId)throw new Error('Browser does not belong to this conversation.');
    const connectionId=threadId?this.connections.threadHost(threadId).connectionId:dot.nativeBinding?.connectionId ?? 'local';
    const host=this.connections.statusFor(connectionId), bridge=this.connections.slots.get(connectionId)?.bridge, session=threadId && bridge?.sessions.get(threadId);
    const profile=session?.info?.profile_name ?? dot.nativeBinding?.profile ?? null;
    const profileKey=createHash('sha256').update(JSON.stringify([connectionId,dotId,profile])).digest('hex');
    return {dotId,threadId:threadId??null,connectionId,host:host.name,remote:host.mode==='ssh',profile,profileKey,runtimeId:session?.runtimeId??null,transportGeneration:bridge?.transportGeneration,connected:host.connected};
  }
  async previewSupport(scope) {
    if(!scope.connected || !scope.runtimeId)return {supported:false,reason:'Open a connected native conversation first.'};
    const key=JSON.stringify([scope.connectionId,scope.runtimeId,scope.transportGeneration]);
    const cached=this.toolChecks.get(key);
    let check=cached && Date.now()-cached.at<5000 ? cached.promise : null;
    if(!check) {
      check=(async()=>{
        try {
          const gateway=this.connections.slots.get(scope.connectionId)?.bridge.gateway;
          const catalog=await gateway.request('tools.show',{session_id:scope.runtimeId,profile:scope.profile},15000);
          const names=new Set((catalog.sections??[]).flatMap(section=>section.tools??[]).map(tool=>tool.name));
          const supported=names.has('read_preview') && names.has('drive_preview');
          return {supported,reason:supported?null:'This native session has not enabled desktop preview tools. Existing live sessions keep their runtime toolsets.'};
        }catch(error){return {supported:false,reason:'Native preview tools could not be verified: '+error.message};}
      })();this.toolChecks.set(key,{at:Date.now(),promise:check});
    }
    return check;
  }
  async mount({dotId,threadId,bounds,visible=true}) {
    if(!this.transport)throw new Error('The native browser is available only in the packaged desktop app.');
    const next=this.scope(dotId,threadId), prior=this.current;
    const same=prior && prior.profileKey===next.profileKey && prior.threadId===next.threadId && prior.runtimeId===next.runtimeId && prior.transportGeneration===next.transportGeneration;
    const scope={...next,bounds,visible,generation:same?prior.generation:++this.generation};this.current=scope;
    const support=await this.previewSupport(scope);
    if(this.current?.generation!==scope.generation)throw new Error('The browser owner changed while checking its native tools.');
    scope.nativePreviewSupported=support.supported;scope.nativePreviewReason=support.reason;
    return this.issue('mount',{bounds,visible},scope);
  }
  async unmount(expected={}) {const scope=this.current;if(!scope || (expected.dotId && expected.dotId!==scope.dotId) || (expected.threadId && expected.threadId!==scope.threadId))return;this.current=null;++this.generation;await this.transport?.('unmount',{},scope);}
  async getStatus(dotId) {
    if(this.current?.dotId===dotId && this.transport){const actual=this.scope(dotId,this.current.threadId);if(actual.runtimeId!==this.current.runtimeId || actual.transportGeneration!==this.current.transportGeneration || actual.profileKey!==this.current.profileKey || Date.now()-(this.toolChecks.get(JSON.stringify([actual.connectionId,actual.runtimeId,actual.transportGeneration]))?.at ?? 0)>5000)return this.mount({dotId,threadId:this.current.threadId,bounds:this.current.bounds,visible:this.current.visible});return this.issue('status',{},this.current);}
    return { ...(this.snapshots.get(dotId) ?? {configured:false,state:'unavailable',reason:'Open the desktop browser surface.',tabs:[],history:[],audit:[],control:{holder:'human'},permissions:{enabled:false,browser:false,files:false,shell:false},cookiesCount:null,localStorageCount:null}),configured:false,state:'unavailable'};}
  owned(dotId) {if(!this.current || this.current.dotId!==dotId || !this.transport)throw new Error('This browser is not mounted in the selected conversation.');return this.current;}
  async issue(method,args,scope=this.current) {
    if(!scope || !this.transport)throw new Error('Native browser transport is unavailable.');
    const result=await this.transport(method,args,scope);
    if(scope.generation!==this.current?.generation)throw new Error('The browser owner changed while the operation was pending.');
    if(result.status)this.snapshots.set(scope.dotId,result.status);
    else if(result.configured!==undefined)this.snapshots.set(scope.dotId,result);
    return result;
  }
  validateRemoteUrl(scope,url) {
    const parsed=new URL(url);
    if(scope.remote && ['localhost','127.0.0.1','[::1]'].includes(parsed.hostname))throw new Error('The remote runtime URL points to its own loopback. An explicit tunnel is required; the Mac browser will not substitute its localhost.');
  }
  async navigate(dotId,url,actor='owner') {const scope=this.owned(dotId);url=sanitizeUrl(url);if(actor==='agent')this.validateRemoteUrl(scope,url);return this.issue('navigate',{url,actor},scope);}
  takeControl(dotId) {return this.issue('take',{},this.owned(dotId));}
  releaseControl(dotId) {const scope=this.owned(dotId);if(!scope.nativePreviewSupported)throw new Error(scope.nativePreviewReason || 'Native preview tools are unavailable.');return this.issue('resume',{},scope);}
  createTab(dotId,url) {return this.issue('tab-create',{url:url?sanitizeUrl(url):undefined},this.owned(dotId));}
  switchTab(dotId,tabId) {return this.issue('tab-switch',{tabId},this.owned(dotId));}
  closeTab(dotId,tabId) {return this.issue('tab-close',{tabId},this.owned(dotId));}
  clearData(dotId) {return this.issue('clear',{},this.owned(dotId));}
  command(dotId,action) {if(!['back','forward','reload'].includes(action))throw new Error('Unsupported browser command.');return this.issue(action,{},this.owned(dotId));}
  async executeAction() {throw new Error('Agent DOM actions are accepted only through owned native preview callbacks.');}
  async handleNativeRequest(frame,{threadId,connectionId}) {
    const scope=this.current;
    if(!scope || scope.threadId!==threadId || scope.connectionId!==connectionId || scope.runtimeId!==frame.params?.session_id || !scope.connected)throw new Error('Native preview is not attached to this owned conversation.');
    if(!scope.nativePreviewSupported)throw new Error(scope.nativePreviewReason || 'Native preview tools are unavailable.');
    if(frame.replayed && frame.method==='preview.act')throw new Error('A replayed browser mutation is not repeated. Inspect the page before requesting another action.');
    const actual=this.scope(scope.dotId,threadId);
    if(actual.runtimeId!==scope.runtimeId || actual.transportGeneration!==scope.transportGeneration || !actual.connected)throw new Error('Native preview session changed or disconnected.');
    if(frame.method==='preview.act' && frame.params?.action==='navigate')this.validateRemoteUrl(scope,sanitizeUrl(frame.params.to ?? frame.params.url));
    const result=await this.issue(frame.method==='preview.read'?'read':'act',{...frame.params,actor:'agent',requestId:frame.id},scope);
    return result;
  }
}
export function electronBrowserTransport(port) {
  if(!port)return undefined;
  const pending=new Map();
  port.on('message',event=>{const message=event.data ?? event;if(message.type!=='browser-response')return;const job=pending.get(message.id);if(!job)return;pending.delete(message.id);clearTimeout(job.timer);message.error?job.reject(new Error(message.error)):job.resolve(message.result);});
  return (method,args,scope)=>new Promise((resolve,reject)=>{const id=randomUUID(),timer=setTimeout(()=>{pending.delete(id);reject(new Error('Native browser response timed out. Inspect the page before retrying.'));},30000);pending.set(id,{resolve,reject,timer});port.postMessage({type:'browser-request',id,method,args,scope});});
}
