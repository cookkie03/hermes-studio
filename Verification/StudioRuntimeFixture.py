#!/usr/bin/env python3
"""Packaged UI synthetic integration fixture. In-memory data; no Hermes calls/files."""
import argparse
import json
import struct
import threading
import time
import uuid
from http.server import ThreadingHTTPServer
from urllib.parse import urlparse
from RuntimeWebSocketFixture import Handler as BaseHandler

SESSIONS = {}
LOCK = threading.RLock()
COUNTS = {'connections': 0, 'prompts': 0, 'interrupts': 0, 'capabilities': []}

class Handler(BaseHandler):
    def do_GET(self):
        if urlparse(self.path).path == '/fixture/summary':
            with LOCK:
                self.respond(json.dumps({**COUNTS, 'sessions': len(SESSIONS)}))
        else:
            super().do_GET()

    def ws(self):
        send_lock = threading.Lock()
        with LOCK:
            COUNTS['connections'] += 1

        def send(value, opcode=1):
            body = json.dumps(value).encode() if opcode == 1 else value
            length = len(body)
            header = bytes([0x80 | opcode])
            header += bytes([length]) if length < 126 else bytes([126]) + struct.pack('!H', length) if length < 65536 else bytes([127]) + struct.pack('!Q', length)
            try:
                with send_lock:
                    self.connection.sendall(header + body)
            except OSError:
                pass

        def result(request_id, value):
            send({'jsonrpc': '2.0', 'id': request_id, 'result': value})

        def event(name, sid, payload):
            send({'jsonrpc': '2.0', 'method': 'event', 'params': {'type': name, 'session_id': sid, 'payload': payload}})

        def snapshot(session):
            return {'session_id': session['id'], 'session_key': session['stored'], 'running': session['running'],
                    'status': 'streaming' if session['running'] else 'idle', 'hydrating': False,
                    'messages': list(session['messages']), 'open_requests': []}

        def turn(session, stop):
            sid = session['id']
            tool_id = 'synthetic-tool-' + str(uuid.uuid4())
            time.sleep(0.4)
            event('tool.start', sid, {'tool_id': tool_id, 'name': 'read_file', 'args': {'path': 'synthetic-report.md'}, 'preview': 'Synthetic fixture document'})
            time.sleep(0.3)
            event('tool.complete', sid, {'tool_id': tool_id, 'name': 'read_file', 'result_text': 'Synthetic-only source: packaged integration fixture.', 'summary': 'Synthetic source received', 'duration_s': 0.3})
            chunks = ['# Synthetic integration report\n\n', 'The packaged UI received real HTTP/WebSocket fixture events.\n\n', '- Source: synthetic-report.md\n', '- No personal Hermes data or live agent execution.\n']
            text = ''
            for chunk in chunks:
                if stop.wait(0.45):
                    with LOCK:
                        session['running'] = False
                    event('message.complete', sid, {'text': text, 'status': 'interrupted'})
                    return
                text += chunk
                event('message.delta', sid, {'text': chunk})
            with LOCK:
                session['messages'].append({'id': str(uuid.uuid4()), 'role': 'assistant', 'content': text})
                session['running'] = False
            event('message.complete', sid, {'text': text, 'status': 'complete'})

        send({'jsonrpc': '2.0', 'method': 'event', 'params': {'type': 'gateway.ready', 'payload': {'heartbeat': True, 'change_events': True, 'replay_epoch': 'synthetic-studio'}}})
        try:
            while True:
                first = self.rfile.read(2)
                if len(first) != 2:
                    return
                opcode, length = first[0] & 15, first[1] & 127
                if length == 126:
                    length = struct.unpack('!H', self.rfile.read(2))[0]
                elif length == 127:
                    length = struct.unpack('!Q', self.rfile.read(8))[0]
                if length > 1_000_000:
                    return
                mask = self.rfile.read(4) if first[1] & 128 else b''
                payload = self.rfile.read(length)
                if mask:
                    payload = bytes(value ^ mask[i % 4] for i, value in enumerate(payload))
                if opcode == 8:
                    send(struct.pack('!H', 1000), 8)
                    return
                if opcode == 9:
                    send(payload, 10)
                    continue
                if opcode != 1:
                    continue
                request = json.loads(payload)
                method, rid, params = request.get('method'), request.get('id'), request.get('params', {})
                with LOCK:
                    if method == 'client.capabilities':
                        COUNTS['capabilities'].append(params.get('server_requests'))
                        result(rid, {'server_requests': ['approval'], 'declines_not_shown': True})
                    elif method == 'gateway.ping':
                        result(rid, {'ok': True})
                    elif method == 'session.create':
                        key = params.get('idempotency_key')
                        session = next((s for s in SESSIONS.values() if s['key'] == key), None)
                        if not session:
                            identity = str(uuid.uuid4())
                            session = {'id': 'synthetic-live-' + identity, 'stored': 'synthetic-stored-' + identity, 'key': key, 'running': False, 'messages': []}
                            SESSIONS[session['id']] = session
                        result(rid, snapshot(session))
                    elif method == 'session.resume':
                        session = next((s for s in SESSIONS.values() if params.get('session_id') in [s['id'], s['stored']]), None)
                        if session:
                            result(rid, snapshot(session))
                        else:
                            send({'jsonrpc': '2.0', 'id': rid, 'error': {'code': -32602, 'message': 'Synthetic session not found'}})
                    elif method == 'prompt.submit' and params.get('session_id') in SESSIONS:
                        session = SESSIONS[params['session_id']]
                        if session['running']:
                            send({'jsonrpc': '2.0', 'id': rid, 'error': {'code': -32602, 'message': 'Synthetic turn already running'}})
                            continue
                        COUNTS['prompts'] += 1
                        session['messages'].append({'id': str(uuid.uuid4()), 'role': 'user', 'content': params.get('text', '')})
                        session['running'] = True
                        session['stop'] = threading.Event()
                        result(rid, {'admitted': True})
                        threading.Thread(target=turn, args=(session, session['stop']), daemon=True).start()
                    elif method == 'session.interrupt' and params.get('session_id') in SESSIONS:
                        COUNTS['interrupts'] += 1
                        session = SESSIONS[params['session_id']]
                        if session.get('stop'):
                            session['stop'].set()
                        result(rid, {'interrupted': True})
                    else:
                        send({'jsonrpc': '2.0', 'id': rid, 'error': {'code': -32601, 'message': 'Synthetic fixture method not found'}})
        except (OSError, ValueError, struct.error):
            pass

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=0)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    print(server.server_address[1], flush=True)
    server.serve_forever()
