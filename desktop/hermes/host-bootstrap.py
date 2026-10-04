"""Fixed host-side Hermes discovery/startup. Only sanitized service metadata is returned.
OPTIONS is set by the private connector before this program; never contains credentials.
"""
import json
import os
import platform
import plistlib
import re
import shutil
import subprocess
import time
import urllib.request
import urllib.error
from pathlib import Path

MARKER = 'Hermes Studio managed web v1'
ROOT = Path(os.environ.get('HERMES_HOME', str(Path.home() / '.hermes')))
LEDGER = ROOT / 'spawn-ledger.json'

class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None

OPENER = urllib.request.build_opener(urllib.request.ProxyHandler({}), NoRedirect())

def command(args, timeout=25):
    try:
        return subprocess.run(args, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
                              stderr=subprocess.PIPE, text=True, timeout=timeout)
    except (OSError, subprocess.TimeoutExpired):
        return None

def discover():
    rows = []
    try:
        records = json.loads(LEDGER.read_text())
        if not isinstance(records, list):
            return []
        records = sorted(records, key=lambda r: r.get('registered_at', 0), reverse=True)
        for row in records:
            port, pid = row.get('port'), row.get('pid')
            if (row.get('purpose') not in ('serve', 'dashboard') or row.get('isolated') is True
                    or type(port) is not int or not 0 < port <= 65535 or type(pid) is not int
                    or row.get('host', '') not in ('', 'localhost', '127.0.0.1', '::1', '0.0.0.0', '::')):
                continue
            try:
                os.kill(pid, 0)  # Liveness only, never signals or terminates a runtime.
                with OPENER.open(f'http://127.0.0.1:{port}/api/health', timeout=2) as response:
                    health = json.loads(response.read(4096))
                if health.get('ok') is True:
                    rows.append({'port': port, 'authRequired': health.get('auth_required') is not False})
            except (OSError, ValueError, urllib.error.URLError):
                pass
            if len(rows) == 4:
                break
    except (OSError, ValueError, TypeError, AttributeError):
        pass
    return rows

def hermes_command():
    executable = shutil.which('hermes')
    if executable:
        return executable
    for path in (Path.home() / '.local/bin/hermes', Path('/opt/homebrew/bin/hermes'), ROOT / 'bin/hermes'):
        if path.is_file() and os.access(path, os.X_OK):
            return str(path)
    raise RuntimeError('Hermes is not installed or is not available on this host.')

def gateway_snapshot(executable):
    result = command([executable, 'gateway', 'status'])
    output = result.stdout if result else ''
    running = bool(re.search(r'Gateway is running|active \(running\)|State:\s*running|Status:\s*running|Service is running', output, re.I))
    supervised = running and not re.search('Running manually', output, re.I)
    return {'gateway': 'running' if running else 'unavailable', 'gatewaySupervised': bool(supervised)}

def native_gateway(executable):
    state = gateway_snapshot(executable)
    if state['gateway'] == 'running':
        return state  # Never replace a live manual or managed personal gateway.
    install = command([executable, 'gateway', 'install', '--if-missing'], timeout=40)
    if install is None or install.returncode:
        return state
    command([executable, 'gateway', 'start'])
    return gateway_snapshot(executable)

def atomic_owned(path, content):
    if path.is_symlink():
        raise RuntimeError('The managed service path is a symlink; no service was changed.')
    if path.exists():
        existing = path.read_text()
        if MARKER not in existing:
            raise RuntimeError('The service name is already used by another service; it was preserved.')
        if existing != content:
            raise RuntimeError('The existing service configuration differs; it was preserved. Review the host service before starting.')
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    # Exclusive creation avoids replacing a concurrent service definition.
    with path.open('x') as f:
        os.chmod(path, 0o600)
        f.write(content)

def start_web(executable):
    args = [executable, 'serve', '--host', '127.0.0.1', '--port', '0']
    env = {'PATH': os.environ.get('PATH', ''), 'HERMES_HOME': str(ROOT),
           'HERMES_DESKTOP': '0', 'HERMES_SUPERVISED_CHILD': '1'}
    system = platform.system()
    if system == 'Linux':
        probe = command(['systemctl', '--user', 'show', '--property=Version'])
        if probe is None or probe.returncode:
            raise RuntimeError('User systemd is unavailable. Configure a persistent Hermes backend on this host.')
        quote = lambda value: json.dumps(value).replace('%', '%%')
        unit = '\n'.join(['# ' + MARKER, '[Unit]', 'Description=Hermes Studio backend', '[Service]',
                          'Type=simple', 'Restart=on-failure', 'RestartSec=3',
                          'ExecStart=' + ' '.join(map(quote, args))] +
                         ['Environment=' + quote(k + '=' + v) for k, v in env.items()] +
                         ['StandardOutput=null', 'StandardError=null', '[Install]', 'WantedBy=default.target', ''])
        atomic_owned(Path.home() / '.config/systemd/user/hermes-studio-web.service', unit)
        for cmd in (['systemctl', '--user', 'daemon-reload'],
                    ['systemctl', '--user', 'enable', '--now', 'hermes-studio-web.service']):
            result = command(cmd)
            if result is None or result.returncode:
                raise RuntimeError('The Hermes backend service could not start.')
        linger = command(['loginctl', 'show-user', str(os.getuid()), '-p', 'Linger', '--value'])
        return {'web': 'managed', 'logoutPersistence': bool(linger and linger.stdout.strip() == 'yes')}
    if system == 'Darwin':
        path = Path.home() / 'Library/LaunchAgents/com.hermes-studio.backend.plist'
        plist = plistlib.dumps({'Label': 'com.hermes-studio.backend', 'ProgramArguments': args,
                               'EnvironmentVariables': env, 'RunAtLoad': True, 'KeepAlive': True,
                               'ThrottleInterval': 3}).decode()
        plist = plist.replace('<plist version="1.0">', '<!-- ' + MARKER + ' -->\n<plist version="1.0">')
        atomic_owned(path, plist)
        target = f'gui/{os.getuid()}'
        loaded = command(['launchctl', 'print', target + '/com.hermes-studio.backend'])
        if loaded is None or loaded.returncode:
            result = command(['launchctl', 'bootstrap', target, str(path)])
            if result is None or result.returncode:
                raise RuntimeError('The Hermes background service could not start in this login session.')
        return {'web': 'managed', 'logoutPersistence': False}
    raise RuntimeError('Automatic background startup is not supported on this host. Attach to an existing Hermes backend.')

def main():
    endpoints = discover()
    services = {'web': 'existing' if endpoints else 'unavailable', 'gateway': 'unknown',
                'gatewaySupervised': False, 'logoutPersistence': None}
    executable = None
    try:
        executable = hermes_command()
        services.update(gateway_snapshot(executable))
    except RuntimeError:
        if not endpoints:
            raise
    if endpoints:
        usable = [e for e in endpoints if not e['authRequired']]
        if not usable:
            return {'error': 'This Hermes backend requires login. Its authentication settings were preserved.', 'state': 'login-required'}
        return {'endpoints': usable, 'services': services}
    if not OPTIONS.get('start', False):
        return {'error': 'No local Hermes backend found. Start Hermes or enable background startup.', 'state': 'unavailable'}
    # Only absent services are provisioned; no force, sudo, stop or runtime install.
    services.update(start_web(executable))
    services.update(native_gateway(executable))
    deadline = time.monotonic() + 45
    while time.monotonic() < deadline:
        endpoints = discover()
        if endpoints:
            usable = [e for e in endpoints if not e['authRequired']]
            if not usable:
                return {'error': 'Hermes requires login. Authentication was not changed.', 'state': 'login-required'}
            return {'endpoints': usable, 'services': services}
        time.sleep(0.3)
    raise RuntimeError('The background backend did not become ready. The host service was left intact.')

if __name__ == '__main__':
    try:
        print(json.dumps(main()))
    except Exception as error:
        # Explicit errors are static application text; never forward subprocess output or config.
        message = str(error) if isinstance(error, RuntimeError) else 'Host startup failed. Check Hermes and the host service manager.'
        print(json.dumps({'error': message, 'state': 'unavailable'}))
