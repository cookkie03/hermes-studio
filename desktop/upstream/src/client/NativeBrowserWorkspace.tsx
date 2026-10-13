import { useEffect,useRef,useState } from 'react';
import { api } from './api';
type BrowserState={configured:boolean;state:string;activeUrl?:string;activeTitle?:string;activeTabId?:string;holder?:string;nativePreviewAvailable?:boolean;nativePreviewReason?:string;profile?:string;cookiesCount?:number|null;localStorageCount?:number|null;tabs:Array<{id:string;title?:string;url?:string}>;history?:Array<{url:string;title?:string}>};
type SurfaceBridge={mount:(options:unknown)=>Promise<BrowserState>;unmount:(options?:unknown)=>Promise<unknown>};
export function NativeBrowserWorkspace({dotId,threadId}:{dotId:string;threadId?:string}) {
 const frame=useRef<HTMLDivElement>(null),input=useRef<HTMLInputElement>(null),[status,setStatus]=useState<BrowserState>(),[url,setUrl]=useState(''),[error,setError]=useState(''),[history,setHistory]=useState(false);
 useEffect(()=>{
  const bridge=(window as typeof window & {hermesStudioDesktop?:{browser?:SurfaceBridge}}).hermesStudioDesktop?.browser;
  if(!bridge){setError('The native browser is available in the desktop app.');return;}
  let active=true,raf=0;
  const mount=()=>{cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{if(!frame.current||!active)return;const rect=frame.current.getBoundingClientRect();const visible=rect.width>0&&rect.height>0&&!document.querySelector('[role="dialog"]');void bridge.mount({dotId,threadId,bounds:{x:rect.x,y:rect.y,width:rect.width,height:rect.height},visible}).then(value=>{if(active)setStatus(value);}).catch(cause=>{if(active)setError(cause.message);});});};
  const observer=new ResizeObserver(mount);observer.observe(frame.current!);
  const dialogs=new MutationObserver(()=>{const dialog=!!document.querySelector('[role="dialog"]');if(dialog!==hidden){hidden=dialog;mount();}});let hidden=false;dialogs.observe(document.body,{childList:true,subtree:true});
  window.addEventListener('resize',mount);document.addEventListener('scroll',mount,true);mount();
  const poll=setInterval(()=>void api<BrowserState>(`/computers/${encodeURIComponent(dotId)}`).then(value=>{if(active){setStatus(value);if(document.activeElement!==input.current)setUrl(value.activeUrl==='about:blank'?'':value.activeUrl??'');}}).catch(cause=>{if(active)setError(cause.message);}),2000);
  return()=>{active=false;cancelAnimationFrame(raf);clearInterval(poll);observer.disconnect();dialogs.disconnect();window.removeEventListener('resize',mount);document.removeEventListener('scroll',mount,true);void bridge.unmount({dotId,threadId}).catch(()=>{});};
 },[dotId,threadId]);
 const command=async(path:string,body?:unknown)=>{try{setError('');const result=await api<BrowserState>(path,'POST',body??{});setStatus(result);}catch(cause){setError(cause instanceof Error?cause.message:'Browser operation failed.');}};
 const base=`/computers/${encodeURIComponent(dotId)}`;
 return <section className="hermes-browser-workspace native-browser-workspace" role="tabpanel" aria-label="Native browser workspace">
  <p>Real browser · native Hermes preview tools{status?.profile?` · ${status.profile}`:''}</p>
  <div className="browser-tabs-bar">{(status?.tabs??[]).map(tab=><span key={tab.id}><button aria-pressed={tab.id===status?.activeTabId} onClick={()=>void command(base+'/tabs',{action:'switch',tabId:tab.id})}>{tab.title||'New tab'}</button><button aria-label={`Close tab ${tab.title||'New tab'}`} onClick={()=>void command(base+'/tabs',{action:'close',tabId:tab.id})}>×</button></span>)}<button aria-label="Open new browser tab" disabled={!status?.configured} onClick={()=>void command(base+'/tabs',{action:'create'})}>+</button></div>
  <form className="browser-nav-bar" onSubmit={event=>{event.preventDefault();void command(base+'/navigate',{url});}}>
   <button type="button" aria-label="Go back" disabled={!status?.configured} onClick={()=>void command('/browser/command',{dotId,action:'back'})}>←</button>
   <button type="button" aria-label="Go forward" disabled={!status?.configured} onClick={()=>void command('/browser/command',{dotId,action:'forward'})}>→</button>
   <button type="button" aria-label="Reload page" disabled={!status?.configured} onClick={()=>void command('/browser/command',{dotId,action:'reload'})}>↻</button>
   <input ref={input} aria-label="Browser URL" placeholder="https://example.com" value={url} onChange={e=>setUrl(e.target.value)}/><button disabled={!status?.configured||!url.trim()}>Go</button>
  </form>
  <div className="browser-lease-banner"><span>{status?.holder==='bot'?'Hermes preview tools enabled':'Manual control'}</span><button type="button" disabled={!status?.configured||(status.holder!=='bot'&&!status.nativePreviewAvailable)} onClick={()=>void command(base+(status?.holder==='bot'?'/take':'/release'))}>{status?.holder==='bot'?'Take Over':'Allow Hermes preview tools'}</button></div>
  {status?.nativePreviewReason&&<p role="status">{status.nativePreviewReason}</p>}
  {error&&<p role="alert">{error}</p>}
  <div ref={frame} className="native-browser-frame" aria-label="Shared browser page"><span>{status?.configured?'Native page surface':'Opening native browser…'}</span></div>
  <div className="native-browser-meta"><span>{status?.cookiesCount==null?'Cookies not reported':`${status.cookiesCount} cookies`}</span><span>{status?.localStorageCount==null?'Storage not reported':`${status.localStorageCount} storage keys`}</span><button aria-label="Toggle browsing history" onClick={()=>setHistory(!history)}>History</button><button aria-label="Reset profile and storage" disabled={!status?.configured} onClick={()=>{if(window.confirm('Clear this dedicated browser profile’s cookies and storage?'))void command(base+'/clear');}}>Reset</button></div>
  {history&&<ul>{(status?.history??[]).map((entry,index)=><li key={index}><button onClick={()=>void command(base+'/navigate',{url:entry.url})}>{entry.title||entry.url}</button></li>)}</ul>}
 </section>;
}
