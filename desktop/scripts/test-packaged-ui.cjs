// Synthetic packaged-app UI smoke. Does not connect to Hermes or send prompts.
const { _electron } = require('playwright');
const fs = require('node:fs/promises'); const path = require('node:path');
(async () => {
 const data = await fs.mkdtemp('/private/tmp/hermes-studio-flow-'), root=path.resolve(__dirname,'..'); let app;
 try {
  app=await _electron.launch({executablePath:path.join(root,'release/mac-arm64/Hermes Studio.app/Contents/MacOS/Hermes Studio'),args:[`--user-data-dir=${data}`],timeout:45000});
  let page=await app.firstWindow({timeout:50000}); const errors=[];
  const watch = current => { current.on('pageerror',e=>errors.push(e.message)); current.on('console',m=>{if(m.type()==='error' && !/status of (409|503)/.test(m.text()))errors.push(m.text())}); };
  watch(page);
  await page.getByText('SPACES',{exact:true}).waitFor({timeout:20000});
  await page.getByText('Hermes disconnected · local workspace available',{exact:true}).waitFor();
  const status = await page.evaluate(async () => (await fetch('/api/hermes/status')).json());
  if (status.connected) throw Error('Fresh app unexpectedly connected to Hermes');
  await page.screenshot({path:path.join(data,'startup.png')});
  await page.getByRole('button',{name:'Memory',exact:false}).click();
  await page.getByRole('button',{name:/Add memory/i}).click();
  await page.getByRole('textbox',{name:'Preference or context',exact:true}).fill('Synthetic QA preference: write concise notes.');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await page.getByText('Synthetic QA preference: write concise notes.',{exact:true}).waitFor();
  await page.screenshot({path:path.join(data,'memory.png')});
  await page.getByRole('button',{name:'Create Space',exact:true}).click();
  await page.getByRole('textbox',{name:'Name',exact:true}).fill('QA Research');
  await page.getByRole('textbox',{name:'What belongs here?',exact:true}).fill('Synthetic research notes');
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await page.getByRole('button',{name:'QA Research',exact:true}).click();
  await page.getByRole('button',{name:'New page',exact:true}).first().click();
  await page.getByRole('textbox',{name:'Page title',exact:true}).fill('Synthetic research document');
  await page.getByRole('button',{name:'Page actions',exact:true}).click();
  await page.getByRole('menuitem',{name:'Markdown source',exact:true}).click();
  await page.getByRole('textbox',{name:'Page Markdown',exact:true}).fill('# Synthetic evidence\n\nSaved from the packaged macOS app.');
  await page.getByRole('textbox',{name:'Page Markdown',exact:true}).press('Meta+s');
  await page.getByText('All changes saved',{exact:true}).waitFor();
  await page.screenshot({path:path.join(data,'document.png')});
  await page.getByRole('button',{name:'All pages',exact:true}).click();
  await page.getByText('Synthetic research document',{exact:true}).first().click();
  await page.getByRole('textbox',{name:'Page title',exact:true}).waitFor();
  if ((await page.getByRole('textbox',{name:'Page title',exact:true}).inputValue()) !== 'Synthetic research document') throw Error('Title not restored');
  // Exercise real revision conflict while retaining an unsaved editor draft.
  const documentPath = await page.evaluate(() => {
    const match = location.hash.match(/^#\/spaces\/([^/]+)\/pages\/([^/]+)$/);
    if (!match) throw Error('Document URL missing');
    return `/api/spaces/${match[1]}/pages/${match[2]}`;
  });
  await page.getByRole('button',{name:'Page actions',exact:true}).click();
  await page.getByRole('menuitem',{name:'Markdown source',exact:true}).click();
  // Hold autosave while a second writer advances the actual server revision.
  await page.route('**/api/spaces/**/pages/**', async route => {
    if(route.request().method()==='PATCH') await route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Synthetic save failure'})});
    else await route.continue();
  });
  await page.getByRole('textbox',{name:'Page Markdown',exact:true}).fill('Unsaved synthetic conflict draft');
  await page.getByRole('textbox',{name:'Page Markdown',exact:true}).press('Meta+s');
  await page.getByRole('button',{name:'Retry save',exact:true}).waitFor();
  await page.evaluate(() => { window.confirm = () => false; });
  await page.getByRole('button',{name:'Memory',exact:false}).click();
  if((await page.getByRole('textbox',{name:'Page Markdown',exact:true}).inputValue())!=='Unsaved synthetic conflict draft') throw Error('Cancelled navigation lost draft');
  await page.unroute('**/api/spaces/**/pages/**');
  await page.evaluate(async path => {
    const current = await (await fetch(path)).json();
    const response = await fetch(path,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:'Saved by a synthetic second writer',expectedRevision:current.revision})});
    if(response.status!==200) throw Error('Second writer failed');
  }, documentPath);
  await page.getByText('Changes need review',{exact:true}).waitFor({timeout:10000});
  if((await page.getByRole('textbox',{name:'Page Markdown',exact:true}).inputValue())!=='Unsaved synthetic conflict draft') throw Error('Conflict replaced draft');
  await page.screenshot({path:path.join(data,'conflict.png')});
  await page.evaluate(() => { window.confirm = () => true; });
  await page.getByRole('button',{name:'Load latest',exact:true}).click();
  await page.getByText('All changes saved',{exact:true}).waitFor();
  await app.close(); app=undefined;
  app=await _electron.launch({executablePath:path.join(root,'release/mac-arm64/Hermes Studio.app/Contents/MacOS/Hermes Studio'),args:[`--user-data-dir=${data}`],timeout:45000});
  page=await app.firstWindow({timeout:50000}); watch(page);
  await page.getByRole('button',{name:'Memory',exact:false}).click();
  await page.getByText('Synthetic QA preference: write concise notes.',{exact:true}).waitFor();
  await page.getByRole('button',{name:'QA Research',exact:true}).click();
  await page.getByText('Synthetic research document',{exact:true}).first().click();
  await page.getByRole('textbox',{name:'Page title',exact:true}).waitFor();
  await page.getByRole('button',{name:'Page actions',exact:true}).click();
  await page.getByRole('menuitem',{name:'Markdown source',exact:true}).click();
  if((await page.getByRole('textbox',{name:'Page Markdown',exact:true}).inputValue())!=='Saved by a synthetic second writer') throw Error('Restart did not restore saved revision');
  await page.emulateMedia({reducedMotion:'reduce'});
  const moving = await page.evaluate(() => [...document.querySelectorAll('*')].some(element => {
    const style = getComputedStyle(element);
    return style.animationName !== 'none' || style.transitionDuration.split(',').some(value => parseFloat(value) > 0);
  }));
  if(moving) throw Error('Reduced motion leaves an animation or transition active');
  await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].setSize(900,700));
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if(overflow) throw Error('900 px window overflows horizontally');
  await page.getByRole('textbox',{name:'Page title',exact:true}).focus();
  await page.keyboard.press('Tab');
  const focus = await page.evaluate(() => {
    const active = document.activeElement, style = getComputedStyle(active);
    return active !== document.body && active.matches(':focus-visible') && style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2;
  });
  if(!focus) throw Error('Keyboard focus indicator missing');
  await page.screenshot({path:path.join(data,'restart-narrow.png')});
  if(errors.length) throw Error('Renderer errors: '+errors.join('; ')); console.log(JSON.stringify({result:'fresh offline, memory/Space/document persistence, write failure, cancelled navigation, revision conflict, restart, 900px and keyboard focus through packaged UI',errors,dataDirectory:data}));
 } finally {if(app)await app.close()}
})().catch(e=>{console.error(e.message);process.exitCode=1});
