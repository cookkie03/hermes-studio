import {renderToStaticMarkup} from 'react-dom/server';import {expect,it} from 'vitest';
import {RuntimeContextLabels} from '../src/client/RuntimeContextBadge';
it('reports the selected native host/model/effort rather than global connected defaults',()=>{
 const html=renderToStaticMarkup(<RuntimeContextLabels context={{connected:false,host:'Synthetic SSH host',info:{profile_name:'qa',model:'native-model',reasoning_effort:'low'}}}/>);
 expect(html).toContain('Synthetic SSH host');expect(html).toContain('offline');expect(html).toContain('native-model');expect(html).toContain('low');expect(html).not.toContain('This Mac');expect(html).not.toContain('Standard');
});
it('unknown session context is explicitly not reported',()=>{const html=renderToStaticMarkup(<RuntimeContextLabels/>);expect(html).toContain('Not reported');expect(html).not.toContain('Standard');});
