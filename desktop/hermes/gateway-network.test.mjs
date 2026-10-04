import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { HermesGateway } from './gateway.mjs';

test('actual synthetic WebSocket preserves out-of-order RPC, streaming, timeout recovery and disconnect failures', { timeout: 20000 }, async () => {
  const fixture = fileURLToPath(new URL('../../Verification/RuntimeWebSocketFixture.py', import.meta.url));
  const child = spawn('python3', ['-u', fixture], { stdio: ['ignore', 'pipe', 'pipe'] });
  const gateway = new HermesGateway(); const events = []; gateway.on('event', event => events.push(event));
  try {
    const port = await new Promise((resolve, reject) => {
      let output = ''; const deadline = setTimeout(() => reject(new Error('Synthetic fixture failed to become ready.')), 5000);
      child.stdout.on('data', data => { output += data; const line = output.split('\n')[0]; if (output.includes('\n') && /^\d+$/.test(line)) { clearTimeout(deadline); resolve(Number(line)); } });
      child.on('error', error => { clearTimeout(deadline); reject(error); });
      child.on('exit', code => { if (!output.includes('\n')) { clearTimeout(deadline); reject(new Error(`Synthetic fixture exited ${code}.`)); } });
    });
    await gateway.connect(`http://127.0.0.1:${port}`);
    const order = [];
    await Promise.all([gateway.request('fixture.slow').then(result => order.push(result.tag)), gateway.request('fixture.fast').then(result => order.push(result.tag))]);
    assert.deepEqual(order, ['fast', 'slow']);
    await gateway.request('fixture.events');
    assert.deepEqual(events.filter(event => event.type.startsWith('message.')).map(event => [event.type, event.payload.text]), [['message.delta', 'Ciao '], ['message.complete', 'Ciao fixture.']]);
    assert.equal((await gateway.request('fixture.malformed')).ok, true);
    await assert.rejects(gateway.request('fixture.wait', {}, 120), /timed out/);
    assert.equal((await gateway.request('fixture.fast')).tag, 'fast');
    await assert.rejects(gateway.request('fixture.drop'), /disconnected/);
    assert.equal(gateway.connected, false);
  } finally { gateway.disconnect(); child.kill(); await once(child, 'exit').catch(() => {}); }
});

test('HTTP redirects are rejected before forwarding a synthetic process token', { timeout: 10000 }, async () => {
  let destinationHits = 0;
  const destination = createServer((_request, response) => { destinationHits++; response.end('should not be reached'); });
  destination.listen(0, '127.0.0.1'); await once(destination, 'listening');
  const redirect = createServer((_request, response) => { response.writeHead(302, { Location: `http://127.0.0.1:${destination.address().port}/capture` }); response.end(); });
  redirect.listen(0, '127.0.0.1'); await once(redirect, 'listening');
  const gateway = new HermesGateway(); gateway.endpoint = `http://127.0.0.1:${redirect.address().port}`; gateway.token = 'synthetic-only';
  try { await assert.rejects(gateway.get('/api/sessions', true)); assert.equal(destinationHits, 0); }
  finally { redirect.closeAllConnections(); destination.closeAllConnections(); await Promise.all([new Promise(resolve => redirect.close(resolve)), new Promise(resolve => destination.close(resolve))]); }
});
