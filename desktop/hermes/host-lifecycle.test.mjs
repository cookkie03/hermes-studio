// Uses a disposable LaunchAgent and a synthetic executable, never the user's Hermes services.
import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
const execute = promisify(execFile);
test(
  "owned native-command service survives client closure and restarts a crashed backend",
  { skip: process.platform !== "darwin", timeout: 30000 },
  async () => {
    const directory = await mkdtemp("/private/tmp/hs-service-fixture-");
    const label = `com.hermes-studio.fixture.${directory.split("-").at(-1).toLowerCase()}`;
    const source = fileURLToPath(
      new URL("./host-bootstrap.py", import.meta.url),
    );
    const program = `import pathlib, os, sys, time, signal, subprocess, types, json\nroot=pathlib.Path(${JSON.stringify(directory)})\nlabel=${JSON.stringify(label)}\nm=types.ModuleType('fixture')\nsource=pathlib.Path(${JSON.stringify(source)}).read_text().replace('com.hermes-studio.backend',label)\nexec(compile(source,'fixture-bootstrap','exec'),m.__dict__)\nm.ROOT=root;m.LEDGER=root/'spawn-ledger.json'\nm.Path.home=classmethod(lambda cls:root)\nbackend=root/'hermes-fixture'\nbackend.write_text('#!'+sys.executable+'\\n'+'''import os,json,pathlib\nfrom http.server import HTTPServer,BaseHTTPRequestHandler\nclass Handler(BaseHTTPRequestHandler):\n def do_GET(self):\n  self.send_response(200);self.end_headers();self.wfile.write(b'{"ok":true,"auth_required":false}')\n def log_message(self,*args):pass\nserver=HTTPServer(('127.0.0.1',0),Handler)\npathlib.Path(os.environ['HERMES_HOME'],'spawn-ledger.json').write_text(json.dumps([{'purpose':'serve','pid':os.getpid(),'port':server.server_port,'host':'127.0.0.1'}]))\nserver.serve_forever()\n''')\nbackend.chmod(0o700)\ndef ready(old_pid=None):\n deadline=time.monotonic()+12\n while time.monotonic()<deadline:\n  endpoints=m.discover()\n  if endpoints:\n   pid=json.loads(m.LEDGER.read_text())[0]['pid']\n   if pid!=old_pid:return endpoints,pid\n  time.sleep(.2)\n raise AssertionError('fixture service did not become ready')\ntry:\n state=m.start_web(str(backend))\n endpoints,pid=ready()\n with m.OPENER.open('http://127.0.0.1:'+str(endpoints[0]['port'])+'/api/health') as client:assert json.load(client)['ok']\n # The HTTP client closes; the independently supervised backend still responds.\n assert m.discover()\n os.kill(pid,signal.SIGTERM)\n restarted,new_pid=ready(pid)\n assert new_pid!=pid and state['logoutPersistence'] is False\n print(json.dumps({'clientClosePreservedBackend':True,'supervisorRestartedBackend':True,'logoutPersistence':False}))\nfinally:\n subprocess.run(['launchctl','bootout',f'gui/{os.getuid()}/'+label],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)\n`;
    try {
      const { stdout } = await execute("python3", ["-c", program], {
        env: { ...process.env, HERMES_HOME: directory },
        timeout: 28000,
        maxBuffer: 16384,
      });
      assert.deepEqual(JSON.parse(stdout), {
        clientClosePreservedBackend: true,
        supervisorRestartedBackend: true,
        logoutPersistence: false,
      });
    } finally {
      await execute("/bin/launchctl", [
        "bootout",
        `gui/${process.getuid()}/${label}`,
      ]).catch(() => {});
      await rm(directory, { recursive: true, force: true });
    }
  },
);
