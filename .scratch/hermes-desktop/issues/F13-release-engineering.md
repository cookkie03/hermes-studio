# F13 — Release engineering & macOS DMG delivery

Status: ready-for-release (local gates passed; GitHub push blocked on OAuth workflow scope)
Baseline: f3f1bf3 -> beaa53b
Spec: docs/features/F13-distribution-packaging.md, docs/releases/ci-release-runbook.md

Ownership: desktop/scripts/verify-package*, docs/releases/*, .github/workflows/*. Preserve F0–F3 contracts, runtime isolation, and credential safety.

Integrated verification (2026-10-22):
- All 8 autonomous role findings verified and integrated into main branch (commits bdbfd2e..beaa53b).
- Full desktop test suite: 95 tests pass, 1 skip, 0 fail.
- Packaging verification: `desktop/scripts/test-verify-package.cjs` passes (3/3), runtime helper and README validation pass.
- Artifact verification: `docs/releases/verify-artifacts.test.cjs` passes (5/5).
- Typecheck & Production build: exit 0 without errors.
- Supply chain audit: security review completed (`docs/project/team/security-review.md`), token scopes audited.
- Fresh checkout CI remediation: sequenced `build:metadata` before test executions in `desktop/package.json` and workflow files; added `desktop/scripts/test-clean-checkout-lifecycle.test.cjs`.
- Blocker: pushing `.github/workflows/ci.yml` and `release.yml` to GitHub rejected by remote OAuth App scope (`workflow` scope required on GitHub OAuth token or push via PAT with workflow scope).
