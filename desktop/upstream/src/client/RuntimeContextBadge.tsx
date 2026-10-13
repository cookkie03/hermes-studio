import { useEffect, useState } from 'react';
import { api } from './api';
import type { NativeSessionInfo } from './ConversationContext';
type Context = { connected: boolean; host?: string; info?: NativeSessionInfo | null };
export function RuntimeContextLabels({ context }: { context?: Context }) {
  const report = (value: unknown) => typeof value === 'string' && value ? value : 'Not reported';
  return <div className="topbar-context-badge" aria-label="Hermes chat context">
    <span className="context-pill">Host: {report(context?.host)}{context?.connected === false && ' · offline'}</span>
    <span className="context-pill">Profile: {report(context?.info?.profile_name)}</span>
    <span className="context-pill">Project: {report(context?.info?.project?.name)}</span>
    <span className="context-pill">Model: {report(context?.info?.model)}</span>
    <span className="context-pill">Effort: {report(context?.info?.reasoning_effort)}</span>
  </div>;
}
export function RuntimeContextBadge({ threadId }: { threadId?: string }) {
  const [context,setContext]=useState<Context>();
  useEffect(()=>{let active=true;const controller=new AbortController();setContext(undefined);
    if(!threadId)return()=>controller.abort();
    const load=()=>void api<Context>(`/hermes/context?threadId=${encodeURIComponent(threadId)}`,'GET',undefined,controller.signal).then(value=>{if(active)setContext(value);}).catch(()=>{if(active)setContext({connected:false});});
    load();const timer=setInterval(load,2000);return()=>{active=false;clearInterval(timer);controller.abort();};
  },[threadId]);
  return <RuntimeContextLabels context={context}/>;
}
