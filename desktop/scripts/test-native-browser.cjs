// Packaged browser -> private utility transport -> actual WebContentsView -> native callback fixture.
const {_electron}=require('playwright');const fs=require('node:fs/promises');const path=require('node:path');const {spawn}=require('node:child_process');const assert=require('node:assert/strict');
(async()=>{
 const root=path.resolve(__dirname,'..'),data=await fs.mkdtemp('/private/tmp/hermes-native-browser-');
 const fixture=spawn('python3',['-u',path.join(root,'../Verification/RuntimeWebSocketFixture.py'),'--conversations'],{stdio:['ignore','pipe','pipe']});let app,page;
 try {
  const port=await new Promise((resolve,reject)=>{let output='';fixture.stdout.on('data',chunk=>{output+=chunk;if(/^\d+\n/.test(output))resolve(Number(output.split('\n')[0]));});fixture.on('error',reject);});const endpoint=`http://127.0.0.1:${port}`;
  const executablePath=process.env.HERMES_STUDIO_TEST_APP||path.join(root,'release/repair-20261013/mac-arm64/Hermes Studio.app/Contents/MacOS/Hermes Studio');
  const launch=async()=>{app=await _electron.launch({executablePath,args:[`--user-data-dir=${data}`],env:{...process.env,HERMES_STUDIO_DISABLE_AUTOCONNECT:'1'},timeout:45000});page=await app.firstWindow({timeout:50000});await page.getByText('SPACES',{exact:true}).waitFor();};await launch();
  const ids=await page.evaluate(async endpoint=>{
   const req=async(url,body)=>{const response=await fetch('/api'+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const value=await response.json();if(!response.ok)throw Error(url+': '+JSON.stringify(value));return value;};
   await req('/hermes/connections',{id:'local',name:'Synthetic browser host',mode:'local',endpoint});await req('/hermes/connect',{connectionId:'local'});
   const workspace=await req('/workspace'),dotId=workspace.dots[0].id;
   const thread=await req('/conversations',{dotId,title:'Synthetic browser'}),session=await req('/hermes/sessions',{threadId:thread.id});
   await window.hermesStudioDesktop.browser.mount({dotId,threadId:thread.id,bounds:{x:300,y:180,width:650,height:450},visible:true});
   const nav=await req(`/computers/${dotId}/navigate`,{url:endpoint+'/fixture/page'});return {dotId,threadId:thread.id,runtimeId:session.runtimeId,status:nav};
  },endpoint);
  await page.reload();
  await page.locator('.thread-list').getByRole('button',{name:/Synthetic browser/}).click();
  await page.getByRole('button',{name:'Show computer',exact:true}).click();
  await page.getByRole('textbox',{name:'Browser URL',exact:true}).fill(endpoint+'/fixture/page');
  await page.getByRole('button',{name:'Go',exact:true}).click();
  await page.waitForTimeout(500);
  const loaded=await page.evaluate(async id=>(await fetch(`/api/computers/${id}`)).json(),ids.dotId);
  assert.equal(loaded.activeTitle,'QA browser page',JSON.stringify(loaded));assert(loaded.cookiesCount>=1);assert.equal(loaded.localStorageCount,1);
  const command=async(action)=>page.evaluate(async({dotId,action})=>{const res=await fetch(`/api/computers/${dotId}/${action}`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!res.ok)throw Error(await res.text());return res.json();},{dotId:ids.dotId,action});await command('release');
  let seq=0;const callback=async(method,params={},id='browser-'+(++seq))=>{
   await fetch(endpoint+'/fixture/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({session_id:ids.runtimeId,id,method,params})});
   for(let i=0;i<100;i++){const rows=await(await fetch(endpoint+'/fixture/decisions')).json();const row=rows.find(row=>row.id===id);if(row)return JSON.parse(row.result.value);await new Promise(resolve=>setTimeout(resolve,50));}throw Error('Native preview callback timed out');
  };
  const read=await callback('preview.read');assert(read.text.includes('Actual native DOM'));assert.equal(read.kind,'url');
  const elements=await callback('preview.act',{action:'elements'});const button=elements.elements.find(item=>item.text==='Increment');assert(button?.ref);
  assert.equal((await callback('preview.act',{action:'click',ref:button.ref},'one-click')).success,true);
  await callback('preview.act',{action:'click',ref:button.ref},'one-click'); // exact duplicate MUST reuse receipt.
  assert((await callback('preview.read')).text.includes('1'));
  assert.equal((await callback('preview.act',{action:'click',ref:'missing'})).success,false);
  assert.equal((await callback('preview.act',{action:'type',selector:'#field',text:'Actual typing'})).success,true);
  const capture=await callback('preview.act',{action:'capture'});assert(capture.data_url.startsWith('data:image/png;base64,'));
  await command('take');assert.equal((await callback('preview.act',{action:'click',ref:button.ref})).success,false);
  await fs.writeFile(path.join(data,'native-page.png'),Buffer.from(capture.data_url.split(',')[1],'base64'));
  await page.screenshot({path:path.join(data,'native-browser.png')});
  await app.close();app=null;await launch();
  const restored=await page.evaluate(async(ids)=>{
   const req=async(url,body)=>{const res=await fetch('/api'+url,{method:body?'POST':'GET',headers:{'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});if(!res.ok)throw Error(await res.text());return res.json();};
   await req('/hermes/connect',{connectionId:'local'});await req('/hermes/sessions',{threadId:ids.threadId});return window.hermesStudioDesktop.browser.mount({dotId:ids.dotId,threadId:ids.threadId,bounds:{x:300,y:180,width:650,height:450},visible:true});
  },ids);assert.equal(restored.activeUrl,endpoint+'/fixture/page');
  await page.waitForTimeout(500);
  const restoredStatus=await page.evaluate(async id=>(await fetch(`/api/computers/${id}`)).json(),ids.dotId);assert(restoredStatus.cookiesCount>=1);assert.equal(restoredStatus.localStorageCount,1);
  console.log(JSON.stringify({pass:true,artifacts:data,checks:['private transport','actual DOM','cookies/storage','native read/elements/type/click/capture','duplicate mutation receipt','human takeover refusal','restart profile restoration']}));
 }finally{if(app)await app.close();fixture.kill('SIGTERM');}
})().catch(error=>{console.error(error);process.exitCode=1;});
