# REA setup plan — 2026-10-13

Status: awaiting user approval. Tooling setup for the current Codex coding agent; no product feature selected or changed.

## Observed preview

Executed from this project with temporary npm cache:

```sh
npx --yes rea-agents@latest setup --client codex --dry-run --json
```

Package resolved to REA 6.4.0. Result `status: planned`, `appliedActions: []`.

| Action | Exact destination | Details |
| --- | --- | --- |
| Configure Codex MCP | `/Users/luca/.codex/config.toml` | Register `npx -y rea-agents@6.4.0 mcp`; preserve unrelated entries and existing server environment overrides. |
| Configuration backup | `/Users/luca/.codex/config.toml.rea.backup` | Setup-managed backup of the existing configuration. |
| Install bundled skill and references | `/Users/luca/.agents/skills/reverse-engineer-anything` | Matching REA workflow instructions. |

These destinations are personal/user-wide, not project-local. Running from the project does not limit registration to it. No other agent is selected; no Hopper installation or provider environment changes are planned. No app dependencies, product code, protected feature cards, Hermes profiles or conversations are part of setup. The npm download is cached in `/private/tmp/hermes-rea-npm-cache`.

## Apply after approval

```sh
npx --yes rea-agents@latest setup --client codex --yes --json
```

Recheck the preview if the resolved release or planned destinations change. REA documentation describes exact-version registration and a 30-second Codex startup allowance. The registry preview, rather than repository main, governs the applied release.

## Verification

1. Inspect applied actions, backup and REA registration without displaying unrelated configuration or secrets.
2. Run `npx --yes rea-agents@6.4.0 doctor --client codex --json` and the bundled skill check; report scoped readiness separately from optional provider readiness.
3. Start the registered MCP command, perform `initialize` and `tools/list`, then close the verification process. This proves the server responds, not that the existing chat has reloaded it.
4. Record installation results and any remaining restart/reconnection requirement. Verify active tool availability after reconnect when possible.

Dry-run diagnosis currently reports missing registration and skill, as expected before installation. No available native analysis provider was reported. Native decompilation is not part of this setup and is not certified by MCP readiness.

## Sources

- [Official installation and setup](https://github.com/morluto/rea/blob/main/docs/installation.md)
- [Official client configuration](https://github.com/morluto/rea/blob/main/docs/client-configuration.md)
- Live npm package dry-run executed on 2026-10-13; no setup writes applied.
