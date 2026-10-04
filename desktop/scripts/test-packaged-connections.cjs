// F1 packaged UI check: synthetic client metadata, optional explicit live-Mac handshake only.
const { _electron } = require("playwright");
const fs = require("node:fs/promises");
const path = require("node:path");
(async () => {
  const root = path.resolve(__dirname, ".."),
    data = await fs.mkdtemp("/private/tmp/hs-connections-ui-");
  let app, liveEndpoint;
  const live = process.argv.includes("--live-mac");
  try {
    app = await _electron.launch({
      executablePath: path.join(
        root,
        "release/mac-arm64/Hermes Studio.app/Contents/MacOS/Hermes Studio",
      ),
      args: [`--user-data-dir=${data}`],
      env: { ...process.env, HERMES_STUDIO_DISABLE_AUTOCONNECT: "1" },
      timeout: 45000,
    });
    const page = await app.firstWindow({ timeout: 50000 }),
      errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    if (live) {
      const { candidates } = await import("../hermes/gateway.mjs");
      let endpoint;
      for (const value of await candidates()) {
        try {
          const h = await (
            await fetch(value + "/api/health", {
              signal: AbortSignal.timeout(2000),
            })
          ).json();
          if (h.ok === true && h.auth_required === false) {
            endpoint = value;
            break;
          }
        } catch {}
      }
      if (!endpoint)
        throw Error(
          "Existing Hermes backend unavailable; no service was started.",
        );
      await page.evaluate(async (endpoint) => {
        const res = await fetch("/api/hermes/connections", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: "local",
            name: "This Mac",
            mode: "local",
            endpoint,
          }),
        });
        if (!res.ok) throw Error("Could not configure attach-only endpoint");
      }, endpoint);
      liveEndpoint = endpoint;
    }
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    await page
      .getByRole("heading", { name: "Hermes connections", exact: true })
      .waitFor();
    await page
      .getByRole("textbox", { name: "Name", exact: true })
      .fill("Fixture remote");
    await page
      .getByRole("textbox", { name: "IP, hostname or SSH alias", exact: true })
      .fill("fixture.invalid");
    await page
      .getByRole("textbox", { name: "SSH user", exact: false })
      .fill("fixture");
    await page.getByRole("button", { name: "Add host", exact: true }).click();
    const remote = page
      .locator(".runtime-connection")
      .filter({ has: page.getByText("Fixture remote", { exact: true }) });
    await remote.waitFor();
    for (const width of [1360, 900]) {
      await app.evaluate(
        ({ BrowserWindow }, width) =>
          BrowserWindow.getAllWindows()[0].setSize(width, 800),
        width,
      );
      if (
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        )
      )
        throw Error("Connection Settings overflows");
      await page.screenshot({
        path: path.join(data, `connections-${width}.png`),
      });
    }
    await page
      .getByRole("textbox", { name: "IP, hostname or SSH alias", exact: true })
      .focus();
    await page.keyboard.press("Tab");
    if (
      !(await page.evaluate(
        () =>
          document.activeElement.matches(":focus-visible") &&
          parseFloat(getComputedStyle(document.activeElement).outlineWidth) >=
            2,
      ))
    )
      throw Error("Connection keyboard focus missing");
    await page.keyboard.press("Escape");
    const ids = await page.evaluate(async () => {
      const request = async (url, body) =>
        (
          await fetch("/api" + url, {
            method: body ? "POST" : "GET",
            headers: { "Content-Type": "application/json" },
            ...(body ? { body: JSON.stringify(body) } : {}),
          })
        ).json();
      const workspace = await request("/workspace"),
        list = await request("/hermes/connections");
      const local = await request("/conversations", {
        dotId: workspace.dots[0].id,
        title: "F1 local fixture",
      });
      const remote = await request("/conversations", {
        dotId: workspace.dots[0].id,
        title: "F1 remote fixture",
      });
      return {
        local: local.id,
        remote: remote.id,
        host: list.connections.find((c) => c.name === "Fixture remote").id,
      };
    });
    await page.reload();
    await page
      .locator(".thread-list")
      .getByRole("button", { name: /F1 remote fixture/ })
      .click();
    const picker = page.getByLabel("Hermes host", { exact: true });
    await picker.selectOption(ids.host);
    await page.waitForFunction(
      async (ids) =>
        (
          await (
            await fetch(`/api/hermes/thread-host?threadId=${ids.remote}`)
          ).json()
        ).connectionId === ids.host,
      ids,
    );
    await page
      .locator(".thread-list")
      .getByRole("button", { name: /F1 local fixture/ })
      .click();
    await picker.selectOption("local");
    const owners = await page.evaluate(
      async (ids) =>
        Promise.all(
          [ids.local, ids.remote].map(
            async (id) =>
              (
                await (
                  await fetch("/api/hermes/thread-host?threadId=" + id)
                ).json()
              ).connectionId,
          ),
        ),
      ids,
    );
    if (owners[0] !== "local" || owners[1] !== ids.host)
      throw Error("Conversation host selection leaked");
    await page.emulateMedia({ reducedMotion: "reduce" });
    if (
      await page.evaluate(() =>
        [...document.querySelectorAll("*")].some((e) => {
          const s = getComputedStyle(e);
          return (
            s.animationName !== "none" ||
            s.transitionDuration.split(",").some((v) => parseFloat(v) > 0)
          );
        }),
      )
    )
      throw Error("Reduced Motion failed");
    await page.screenshot({ path: path.join(data, "conversation-host.png") });
    await page.getByRole("button", { name: "Settings", exact: true }).click();
    let challenge = {
        id: "fixture-challenge",
        kind: "credential",
        prompt: "Fixture SSH password",
        expiresAt: Date.now() + 120000,
      },
      answered = false;
    const decisionUrl = `**/api/hermes/connections/${ids.host}/challenges`;
    await page.route(decisionUrl, async (route) => {
      if (route.request().method() === "POST") {
        const body = route.request().postDataJSON();
        if (
          body.answer !==
          (challenge.kind === "credential"
            ? "temporary-fixture-password"
            : "yes")
        )
          throw Error("Challenge answer mismatch");
        answered = true;
        await route.fulfill({ json: { accepted: true } });
      } else
        await route.fulfill({
          json: { challenge: answered ? null : challenge },
        });
    });
    const credential = page.getByLabel("Fixture SSH password", { exact: true });
    await credential.waitFor();
    await credential.fill("temporary-fixture-password");
    await credential.press("Enter");
    await page.waitForFunction(
      () =>
        !document.querySelector("input[type=password]") ||
        document.querySelector("input[type=password]").value === "",
    );
    if (
      await page.evaluate(() =>
        JSON.stringify([localStorage, sessionStorage]).includes(
          "temporary-fixture-password",
        ),
      )
    )
      throw Error("Password persisted in renderer");
    await page.waitForFunction(
      () => !document.querySelector("input[type=password]"),
    );
    challenge = {
      id: "fixture-fingerprint",
      kind: "host-key",
      prompt: "Synthetic SHA256 fingerprint for UI review",
      expiresAt: Date.now() + 120000,
    };
    answered = false;
    await page
      .getByRole("button", { name: "Trust fingerprint", exact: true })
      .waitFor();
    await page.screenshot({ path: path.join(data, "fingerprint-review.png") });
    await page
      .getByRole("button", { name: "Trust fingerprint", exact: true })
      .click();
    await page.unroute(decisionUrl);
    await page.keyboard.press("Escape");
    let liveStatus;
    if (live) {
      const endpoint = liveEndpoint;
      await page.getByRole("button", { name: "Settings", exact: true }).click();
      const local = page
        .locator(".runtime-connection")
        .filter({ has: page.getByText("This Mac", { exact: true }) });
      await local.getByRole("button", { name: "Connect", exact: true }).click();
      await local
        .getByRole("button", { name: "Disconnect", exact: true })
        .waitFor({ timeout: 25000 });
      liveStatus = await page.evaluate(async () => {
        const s = await (await fetch("/api/hermes/status")).json();
        return { connected: s.connected, version: s.version };
      });
      await page.screenshot({
        path: path.join(data, "live-mac-connected.png"),
      });
      await app.close();
      app = undefined;
      if (!(await (await fetch(endpoint + "/api/health")).json()).ok)
        throw Error("Hermes did not survive app quit");
    }
    if (errors.length) throw Error("Renderer errors: " + errors.join("; "));
    console.log(
      JSON.stringify({
        pass: true,
        hostSelection: true,
        widths: [1360, 900],
        keyboard: true,
        reducedMotion: true,
        ...(liveStatus
          ? { liveMac: liveStatus, backendSurvivesQuit: true }
          : {}),
        dataDirectory: data,
      }),
    );
  } finally {
    if (app) await app.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
