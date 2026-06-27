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
