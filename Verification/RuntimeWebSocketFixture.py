#!/usr/bin/env python3
"""Synthetic localhost fixture, standard library only; never touches Hermes data."""
import argparse
import base64
import hashlib
import json
import socket
import struct
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

TOKEN = 'synthetic-fixture-token'

class Handler(BaseHTTPRequestHandler):
    protocol_version = 'HTTP/1.1'

    def log_message(self, *_args):
        pass

    def respond(self, data, content_type='application/json'):
        body = data.encode()
        self.send_response(200)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        route = urlparse(self.path)
        if route.path == '/api/health':
            self.respond(json.dumps({'ok': True, 'auth_required': False}))
        elif route.path == '/':
            self.respond('window.__HERMES_SESSION_TOKEN__=' + json.dumps(TOKEN) + ';', 'text/html')
        elif route.path == '/api/ws' and parse_qs(route.query).get('token') == [TOKEN]:
            key = self.headers.get('Sec-WebSocket-Key', '')
            accept = base64.b64encode(hashlib.sha1((key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').encode()).digest()).decode()
            self.send_response(101)
            self.send_header('Upgrade', 'websocket')
            self.send_header('Connection', 'Upgrade')
            self.send_header('Sec-WebSocket-Accept', accept)
            self.end_headers()
            self.close_connection = True
            self.ws()
        else:
            self.send_error(404)

    def ws(self):
        lock = threading.Lock()

        def send(value, opcode=1):
            payload = json.dumps(value).encode() if opcode == 1 else value
            header = bytes([0x80 | opcode])
            length = len(payload)
            if length < 126:
                header += bytes([length])
            elif length < 65536:
                header += bytes([126]) + struct.pack('!H', length)
            else:
                header += bytes([127]) + struct.pack('!Q', length)
            try:
                with lock:
                    self.connection.sendall(header + payload)
            except OSError:
                pass

        def result(request_id, value):
            send({'jsonrpc': '2.0', 'id': request_id, 'result': value})

        def event(name, payload):
            send({'jsonrpc': '2.0', 'method': 'event', 'params': {
                'type': name, 'session_id': 'fixture-session', 'payload': payload}})

        def snapshot(session_id):
            state = self.server.sessions[session_id]
            return {'session_id': session_id, 'stored_session_id': session_id,
                    'running': state['running'], 'status': 'streaming' if state['running'] else 'idle',
                    'messages': list(state['messages'])}

        def prompt(request_id, params):
            session_id = params['session_id']
            state = self.server.sessions[session_id]
            state['running'] = True
            state['messages'].append({'role': 'user', 'content': params['text']})
            def emit(name, payload):
                send({'jsonrpc': '2.0', 'method': 'event', 'params': {
                    'type': name, 'session_id': session_id, 'payload': payload}})
            state['emit'] = emit
            emit('message.delta', {'text': 'Synthetic streaming response'})
            emit('tool.start', {'tool_id': 'synthetic-tool', 'name': 'synthetic_read', 'args': {'path': 'fixture.txt'}})
            time.sleep(1.2)
            if state['running']:
                state['running'] = False
                text = 'Synthetic confirmed response'
                state['messages'].append({'role': 'assistant', 'content': text})
                emit('message.complete', {'text': text, 'status': 'complete'})
            emit('tool.complete', {'tool_id': 'synthetic-tool', 'name': 'synthetic_read', 'result_text': 'Late synthetic tool result'})
            time.sleep(0.3)
            result(request_id, {'admitted': True})

        def slow(request_id):
            time.sleep(0.15)
            result(request_id, {'tag': 'slow'})

        send({'jsonrpc': '2.0', 'method': 'event', 'params': {
            'type': 'gateway.ready', 'payload': {'heartbeat': True, 'change_events': True, 'replay_epoch': 'fixture'}}})
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
                    payload = bytes(value ^ mask[index % 4] for index, value in enumerate(payload))
                if opcode == 8:
                    send(struct.pack('!H', 1000), opcode=8)
                    return
                if opcode == 9:
                    send(payload, opcode=10)
                    continue
                if opcode != 1:
                    continue
                request = json.loads(payload)
                method, request_id = request.get('method'), request.get('id')
                if self.server.conversations and method in ('session.create', 'session.resume'):
                    params = request.get('params', {})
                    session_id = params.get('session_id') or 'fixture-' + params['idempotency_key']
                    self.server.sessions.setdefault(session_id, {'running': False, 'messages': []})
                    result(request_id, snapshot(session_id))
                elif self.server.conversations and method == 'prompt.submit':
                    threading.Thread(target=prompt, args=(request_id, request.get('params', {})), daemon=True).start()
                elif self.server.conversations and method == 'session.interrupt':
                    state = self.server.sessions[request['params']['session_id']]
                    state['running'] = False
                    state['emit']('message.complete', {'text': 'Synthetic interrupted response', 'status': 'interrupted'})
                    result(request_id, {'interrupted': True})
                elif method == 'client.capabilities':
                    result(request_id, {'server_requests': [], 'declines_not_shown': True})
                elif method == 'gateway.ping':
                    result(request_id, {'ok': True})
                elif method == 'fixture.fast':
                    result(request_id, {'tag': 'fast'})
                elif method == 'fixture.slow':
                    threading.Thread(target=slow, args=(request_id,), daemon=True).start()
                elif method == 'fixture.events':
                    event('message.delta', {'text': 'Ciao '})
                    event('message.complete', {'text': 'Ciao fixture.', 'status': 'complete'})
                    result(request_id, {'ok': True})
                elif method == 'fixture.malformed':
                    result(9223372036854775808, {'ok': False})
                    result(request_id, {'ok': True})
                elif method == 'fixture.drop':
                    send(struct.pack('!H', 1000), opcode=8)
                    return
                elif method == 'fixture.wait':
                    pass
                else:
                    send({'jsonrpc': '2.0', 'id': request_id, 'error': {'code': -32601, 'message': 'Fixture method not found'}})
        except (OSError, ValueError, struct.error):
            pass

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=0)
    parser.add_argument('--conversations', action='store_true')
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    server.conversations = args.conversations
    server.sessions = {}
    print(server.server_address[1], flush=True)
    server.serve_forever()
