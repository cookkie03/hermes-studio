import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { HostConnection, bootstrapProgram } from "./host-backend.mjs";

test("explicit local attach never bootstraps or changes the runtime", async () => {
  let started = false;
  const host = new HostConnection(
    { mode: "local", endpoint: "http://127.0.0.1:1234" },
    {
      bootstrap: () => {
        started = true;
      },
    },
  );
  assert.deepEqual((await host.open()).endpoints, ["http://127.0.0.1:1234"]);
  assert.equal(started, false);
  host.close();
});
test("remote bootstrap and tunnel reuse Hermes without exposing an arbitrary command interface", async () => {
  const calls = [];
  const ssh = {
    on() {},
    open: async () => calls.push("open"),
    bootstrap: async (program) => {
      assert.match(program, /OPTIONS/);
      return JSON.stringify({
        endpoints: [{ port: 5678 }],
        services: { web: "existing", gateway: "unknown" },
      });
    },
    forward: async (port) => {
      calls.push(port);
      return "http://127.0.0.1:1234";
    },
    close: () => calls.push("close"),
  };
  const host = new HostConnection({ mode: "ssh" }, { sshFactory: () => ssh });
  const value = await host.open();
  assert.equal(value.services.web, "existing");
  host.close();
  assert.deepEqual(calls, ["open", 5678, "close"]);
});
test("host-side adapter preserves gated runtime and registers only native commands in owned service files", async () => {
  const directory = await mkdtemp("/private/tmp/hs-bootstrap-test-");
  try {
    const source = fileURLToPath(
      new URL("./host-bootstrap.py", import.meta.url),
    );
    const program = `import importlib.util, pathlib, subprocess, json, os\nspec=importlib.util.spec_from_file_location('bootstrap', ${JSON.stringify(source)})\nm=importlib.util.module_from_spec(spec); spec.loader.exec_module(m)\nm.OPTIONS={'start': True}\nm.ROOT=pathlib.Path(${JSON.stringify(directory)})\npathlib.Path.home=classmethod(lambda cls:m.ROOT)\nm.hermes_command=lambda:'/fixture/hermes'\ncalls=[]\nm.command=lambda args,timeout=25:(calls.append(args) or subprocess.CompletedProcess(args,0,'yes' if args[0]=='loginctl' else 'Gateway is running (Running manually, not as a system service)', ''))\nm.discover=lambda:[{'port':1234,'authRequired':True}]\nresult=m.main()\nassert result['state']=='login-required'\nassert all(args==['/fixture/hermes','gateway','status'] for args in calls)\ncalls.clear()\nm.platform.system=lambda:'Linux'\nstate=m.start_web('/fixture/hermes')\nunit=(m.ROOT/'.config/systemd/user/hermes-studio-web.service').read_text()\nassert 'serve' in unit and 'HERMES_DESKTOP=0' in unit and '--isolated' not in unit\nassert state['logoutPersistence'] is True\nassert all('stop' not in args and 'kill' not in args for args in calls)\npath=m.ROOT/'foreign.service';path.write_text('unowned')\ntry:m.atomic_owned(path,'changed')\nexcept RuntimeError:pass\nelse:raise AssertionError('foreign service replaced')\nassert path.read_text()=='unowned'\ncalls.clear();m.platform.system=lambda:'Darwin'\nassert m.start_web('/fixture/hermes')['logoutPersistence'] is False\nplist=(m.ROOT/'Library/LaunchAgents/com.hermes-studio.backend.plist').read_text()\nassert '<string>serve</string>' in plist and '<key>KeepAlive</key>' in plist\nprint('native-service-adapter PASS')\n`;
    const result = spawnSync("python3", ["-"], {
      input: program,
      encoding: "utf8",
      env: { ...process.env, HERMES_HOME: directory },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /PASS/);
    const noStart = await bootstrapProgram(false);
    assert.equal(
      JSON.parse(
        JSON.parse(
          noStart.split("\n")[1].slice("OPTIONS = json.loads(".length, -1),
        ),
      ).start,
      false,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
