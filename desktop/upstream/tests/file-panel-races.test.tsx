import {afterEach, beforeEach, expect, it, vi} from 'vitest';
const harness=vi.hoisted(()=>({slots:[] as any[],cursor:0,effects:[] as Array<()=>void>,request:vi.fn()}));
vi.mock('../src/client/api',()=>({api:harness.request}));
vi.mock('react',async original=>({...(await original<any>()),
 useState(initial:any){const index=harness.cursor++;if(!(index in harness.slots))harness.slots[index]=typeof initial==='function'?initial():initial;return [harness.slots[index],(next:any)=>{harness.slots[index]=typeof next==='function'?next(harness.slots[index]):next;}];},
 useRef(initial:any){const index=harness.cursor++;return harness.slots[index]??=( {current:initial} );},
 useEffect(callback:()=>any,deps:any[]=[]){const index=harness.cursor++;const previous=harness.slots[index];if(!previous||deps.some((value,i)=>value!==previous.deps[i])){harness.slots[index]={deps};harness.effects.push(()=>{previous?.cleanup?.();harness.slots[index].cleanup=callback();});}},
}));
import {ComputerPanel} from '../src/client/ComputerPanel';
const dot:any={id:'qa-dot',name:'QA'};let tree:any;
const roots=[{id:'r1',host:'local',name:'QA one',path:'/synthetic/one'},{id:'r2',host:'local',name:'QA two',path:'/synthetic/two'}];
const pending=new Map<string,(value:any)=>void>();
function render(){harness.cursor=0;tree=ComputerPanel({dot,threadId:'qa-thread'});const effects=harness.effects.splice(0);effects.forEach(run=>run());return tree;}
function nodes(node:any,match:(node:any)=>boolean):any[]{if(!node||typeof node!=='object')return [];if(Array.isArray(node))return node.flatMap(child=>nodes(child,match));return [...(match(node)?[node]:[]),...nodes(node.props?.children,match)];}
function field(label:string){return nodes(tree,node=>node.props?.['aria-label']===label)[0];}
function button(text:string){return nodes(tree,node=>node.type==='button' && (node.props.children===text || nodes(node.props.children,item=>item.props?.children===text).length))[0];}
async function settle(){await new Promise(resolve=>setTimeout(resolve,0));render();await new Promise(resolve=>setTimeout(resolve,0));render();}
function response(rootId:string,path:string,content:string,revision='original'){return {rootId,host:'local',path,content,revision,size:content.length,isBinary:false,largeFile:false,updatedAt:1};}
beforeEach(()=>{
 harness.slots=[];harness.cursor=0;harness.effects=[];pending.clear();
 vi.stubGlobal('window',{confirm:vi.fn(()=>true),setInterval:()=>0,clearInterval:()=>{},addEventListener:()=>{},removeEventListener:()=>{}});
 harness.request.mockReset().mockImplementation((url:string,method='GET',body:any)=>{
  if(url==='/files/roots')return Promise.resolve(roots);
  if(url==='/files/receipts')return Promise.resolve([]);
  if(url.startsWith('/files/tree')){const rootId=new URL('http://qa'+url).searchParams.get('rootId');return Promise.resolve(['a.md','b.md'].map(path=>({rootId,path,name:path,kind:'file',size:10,revision:'original'})));}
  if(url.startsWith('/files/read')){const query=new URL('http://qa'+url).searchParams;return new Promise(resolve=>pending.set(`${query.get('rootId')}:${query.get('path')}`,resolve));}
  if(url==='/files/write')return new Promise(resolve=>pending.set('write',resolve));
  if(url.startsWith('/hermes/computer/captures'))return Promise.resolve({captures:[]});
  if(url.startsWith('/hermes/computer/activity'))return Promise.resolve({activity:[]});
  return Promise.resolve({connected:false,modes:[],driverStatus:'unavailable'});
 });
 render();button('Files').props.onClick();render();
});
afterEach(()=>{harness.slots.forEach(slot=>slot?.cleanup?.());vi.unstubAllGlobals();});
it('late file A cannot replace edited file B',async()=>{
 await settle();button('a.md').props.onClick();button('b.md').props.onClick();
 pending.get('r1:b.md')!(response('r1','b.md','B initial'));await settle();
 field('File content editor').props.onChange({target:{value:'B unsaved edits'}});render();
 pending.get('r1:a.md')!(response('r1','a.md','A late'));await settle();
 expect(field('File content editor').props.value).toBe('B unsaved edits');expect(button('Save Draft').props.disabled).toBe(false);
});
it('root changes invalidate pending reads and saves retain the selected file root',async()=>{
 await settle();button('a.md').props.onClick();field('Select file root').props.onChange({target:{value:'r2'}});await settle();
 pending.get('r1:a.md')!(response('r1','a.md','Wrong root'));await settle();expect(field('File content editor')).toBeUndefined();
 button('a.md').props.onClick();pending.get('r2:a.md')!(response('r2','a.md','Correct root'));await settle();
 field('File content editor').props.onChange({target:{value:'Root two edit'}});render();button('Save Draft').props.onClick();
 const write=harness.request.mock.calls.find(call=>call[0]==='/files/write');expect(write?.[2]).toMatchObject({rootId:'r2',relativePath:'a.md',content:'Root two edit'});
 pending.get('write')!({receipt:{id:'receipt',outcome:'applied'},newRevision:'saved'});await settle();
});
it('typing during a pending save retains newer edits and advances the saved revision',async()=>{
 await settle();button('b.md').props.onClick();pending.get('r1:b.md')!(response('r1','b.md','Initial'));await settle();
 field('File content editor').props.onChange({target:{value:'Submitted draft'}});render();button('Save Draft').props.onClick();render();
 field('File content editor').props.onChange({target:{value:'Newer unsaved draft'}});render();
 pending.get('write')!({receipt:{id:'receipt',outcome:'applied'},newRevision:'saved'});await settle();
 expect(field('File content editor').props.value).toBe('Newer unsaved draft');expect(button('Save Draft').props.disabled).toBe(false);
 button('Save Draft').props.onClick();expect(harness.request.mock.calls.filter(call=>call[0]==='/files/write').at(-1)?.[2].expectedRevision).toBe('saved');
});
