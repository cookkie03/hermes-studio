import {renderToStaticMarkup} from 'react-dom/server';
import {describe,it,expect} from 'vitest';
import {NativeBrowserWorkspace} from '../src/client/NativeBrowserWorkspace';
describe('Native desktop browser presentation',()=>{
 it('labels the actual native preview family without a fake viewport or storage counts',()=>{
  const html=renderToStaticMarkup(<NativeBrowserWorkspace dotId="synthetic-dot"/>);
  expect(html).toContain('native Hermes preview tools');expect(html).toContain('Shared browser page');
  expect(html).toContain('Cookies not reported');expect(html).not.toContain('3 cookies');expect(html).not.toContain('Welcome to Hermes Browser');
 });
 it('provides explicit navigation, dedicated profile reset and preview takeover controls',()=>{
  const html=renderToStaticMarkup(<NativeBrowserWorkspace dotId="synthetic-dot"/>);
  expect(html).toContain('aria-label="Browser URL"');expect(html).toContain('aria-label="Go back"');expect(html).toContain('Allow Hermes preview tools');expect(html).toContain('aria-label="Reset profile and storage"');
 });
});
