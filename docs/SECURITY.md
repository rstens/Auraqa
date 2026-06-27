# AuraQA Security Scan Workflow

Manually-dispatched GitHub Actions pipeline that runs static (no app) and
dynamic (DAST against a running instance) security tooling in one job, gated
by an `intensity` input.

Workflow file: [`.github/workflows/security.yml`](../.github/workflows/security.yml)

## How to run

1. Go to **Actions → Security Scan** in the GitHub UI.
2. Click **Run workflow**.
3. Pick an `intensity` and (optionally) a `target_branch`.
4. Click **Run workflow**. The job summary on the run page will collect
   pass/fail counts as each tool finishes.

## ⚠️ Safety rules

- `extreme` runs **destructive active scans** (ZAP full scan, SQLMap, Wapiti)
  that send real attack payloads — SQL injection, XSS, path traversal, command
  injection. They **will corrupt test data** and may break the app under test.
- The workflow only ever targets the ephemeral Docker instance it stands up
  itself (`http://localhost:3000` inside the runner). **Never point any
  intensity at a production environment.**
- The dynamic-analysis job tears the Docker stack down at the end regardless
  of outcome.

## Intensity matrix

| Tool                    | Smoke  | Normal  | Extreme | Notes                                                                                     |
| ----------------------- | :----: | :-----: | :-----: | ----------------------------------------------------------------------------------------- |
| **Static**              |        |         |         |                                                                                           |
| GitLeaks                |   ✓    |    ✓    |    ✓    | Secrets in git history                                                                    |
| `npm audit`             |   ✓    |    ✓    |    ✓    | npm-registry advisories                                                                   |
| OSV-Scanner             |   ✓    |    ✓    |    ✓    | Google's OSS vulnerability DB                                                             |
| Trivy (filesystem)      |   ✓    |    ✓    |    ✓    | Deps + misconfigs                                                                         |
| Semgrep                 |        |    ✓    |    ✓    | SAST — `p/security-audit`, `p/nextjs`, `p/typescript`, `p/owasp-top-ten`, `p/secrets`     |
| Trivy (image)           |        |    ✓    |    ✓    | OS/lib CVEs in the built Docker image                                                     |
| **Dynamic**             |        |         |         |                                                                                           |
| ZAP baseline (passive)  |   ✓    |    ✓    |    ✓    | Crawls + inspects responses; **no payloads**                                              |
| Nuclei (high/critical)  |        |    ✓    |    ✓    | Template-based scanner — high+critical only                                               |
| ZAP full active scan    |        |         |    ✓    | **Destructive** — SQLi/XSS/etc. payloads                                                  |
| Nuclei (all severities) |        |         |    ✓    | Full ruleset incl. low/info                                                               |
| Wapiti                  |        |         |    ✓    | DAST alternative — common,sql,xss,xxe,csrf,exec,file,redirect,ssrf,…                      |
| SQLMap                  |        |         |    ✓    | **Destructive** — injection probe on `/api/search`, `/api/articles`, `/api/forum/threads` |
| **Expected runtime**    | ~5 min | ~25 min | ~90 min | Wall clock on the default GitHub runner                                                   |

## Artifacts

Each run uploads two artifacts (30-day retention):

- `static-analysis-<intensity>` — npm-audit JSON, OSV-Scanner SARIF, Trivy
  filesystem SARIF, Semgrep SARIF, Trivy image SARIF
- `dynamic-analysis-<intensity>` — ZAP baseline HTML+JSON, ZAP full HTML+JSON,
  Nuclei JSONL, Wapiti HTML, SQLMap session tree

SARIF outputs from OSV-Scanner, Trivy, and Semgrep are also uploaded to the
repo's **Security → Code scanning alerts** tab via
`github/codeql-action/upload-sarif`, so dismissals + tracking work the same
way as CodeQL findings.

## Reading the results

- **Job summary** (Actions tab → the run → top of the page) — counts per tool,
  high-severity totals, and links to the artifacts.
- **Security tab → Code scanning alerts** — file-and-line findings from the
  SARIF uploads, dismissable and historical.
- **Artifacts** — full HTML reports (ZAP / Wapiti) for in-depth review.

## Auto-triage with Copilot

After every `normal` or `extreme` run, the workflow files a GitHub issue
containing a fixed triage prompt and assigns `@Copilot`. The Copilot
coding agent picks the issue up, reads the run logs, applies fixes, and
opens a PR against `dev`. The assignment is best-effort — if the coding
agent isn't enabled for the repo the issue is still created and can be
picked up manually.

Smoke runs skip this step (pre-merge sanity check, low signal).

## Tuning

Edit `.github/workflows/security.yml` to:

- **Add a tool**: copy the pattern of any existing step — gate with
  `if: inputs.intensity != 'smoke'` or `if: inputs.intensity == 'extreme'`
  to slot it into the intensity matrix.
- **Change Trivy severity floor**: `severity: MEDIUM,HIGH,CRITICAL` on the
  filesystem step.
- **Add Semgrep rulesets**: append to the `config:` block.
- **Expand SQLMap targets**: add URLs to the `for url in ...` loop in the
  SQLMap step.

## Credentials & gated tools

The workflow runs without external credentials. The following secrets are
**optional** — without them the tools either run anonymously or warn:

| Secret             | Purpose                                     | Without it                                     |
| ------------------ | ------------------------------------------- | ---------------------------------------------- |
| `GITLEAKS_LICENSE` | Silences GitLeaks free-mode warning         | Action still runs                              |
| `ENV_DEV`          | Populates `.env.local` for the Docker stack | A minimal fallback is written so the app boots |

There is no Snyk integration today (gated on `SNYK_TOKEN`); add as a step
that mirrors the OSV-Scanner pattern if needed.

## When to run which intensity

- **smoke** — pre-merge sanity check; safe on any branch, fast feedback
- **normal** — weekly or pre-release; full static analysis + DAST
- **extreme** — red-team-style pre-launch validation; expect a corrupted
  test DB and a ~90-minute runtime; review every finding by hand

## Accepted findings

A handful of advisories are tracked but not fixable from this repo. These
are surfaced by every `npm audit` run and intentionally left in place:

| Package                        | Severity | Why we accept it                                                                                                  |
| ------------------------------ | -------- | ----------------------------------------------------------------------------------------------------------------- |
| `esbuild` (via `drizzle-kit` → | moderate | Dev-only tool. `drizzle-kit` bundles its own outdated `esbuild`. The vulnerability (dev-server CORS) only matters |
| `@esbuild-kit/esm-loader`)     |          | when running the bundler with a publicly-reachable HTTP port — we don't.                                          |
| `postcss` (via `next`)         | moderate | Build-time only. Next.js ships its own copy; we cannot upgrade until upstream Next ships a release that pins      |
|                                |          | `postcss >= 8.5.10`. The XSS sink (`Stringify` of attacker-controlled CSS) is not reachable from our app.         |

## Runtime hardening

The app sets the following response headers on every route (see
`next.config.ts`). These were added in response to ZAP baseline alerts from
the Security Scan workflow:

- `X-Content-Type-Options: nosniff` — addresses [10021]
- `X-Frame-Options: DENY` + `frame-ancestors 'none'` in CSP — anti-clickjacking [10020]
- `Content-Security-Policy` — default-src self, no inline frames, restricts script/style/image origins [10038]
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — denies camera/microphone/geolocation/payment/USB [10063]
- `poweredByHeader: false` strips `X-Powered-By: Next.js` [10037]
- `Cross-Origin-Embedder-Policy: credentialless` — mitigates Spectre-class
  side-channel attacks [90004]. Uses `credentialless` instead of
  `require-corp` to avoid breaking same-origin fonts/images that lack CORP.

CSP currently allows `'unsafe-inline'` for `script-src`/`style-src` because
Next.js emits inline runtime bootstrap and styled-jsx blocks. Tightening to
nonce-only requires a middleware that injects per-request nonces and is
deferred to a follow-up.

`'unsafe-eval'` was removed from `script-src` — Next.js 16 with Turbopack
does not require runtime `eval()` in production builds [10055].

## Accepted ZAP baseline alerts (informational / false-positive)

The following ZAP baseline alerts are expected and not actionable:

| Alert ID | Name                                         | Disposition                                                                   |
| -------- | -------------------------------------------- | ----------------------------------------------------------------------------- |
| 10019    | Content-Type Header Missing                  | Fires on Next.js 308 redirect responses; redirects carry no body.             |
| 10027    | Information Disclosure - Suspicious Comments | Comments inside bundled `node_modules/next` JS; not our source code.          |
| 10044    | Big Redirect Detected                        | Auth-protected pages redirect unauthenticated users; by design.               |
| 10049    | Non-Storable Content                         | Fonts and static assets served with correct caching; ZAP misreads `no-cache`. |
| 10096    | Timestamp Disclosure - Unix                  | Epoch values inside React DOM runtime code; not sensitive.                    |
| 10109    | Modern Web Application                       | Informational only.                                                           |
| 10110    | Dangerous JS Functions                       | `eval`/`Function()` in React server-DOM; bundled by Next.js, not our code.    |
| 10111    | Authentication Request Identified            | Informational — confirms login page exists.                                   |
| 10202    | Absence of Anti-CSRF Tokens                  | NextAuth.js uses SameSite cookies + server-side validation; no form tokens.   |
