# AuraQA API tests (Bruno)

Bruno collection mirroring the test categories from the unit suite:
**positive**, **negative**, **variance**, and **boundary** for every public
API surface, plus auth-rejection guards for every endpoint that requires a
session.

## Running locally

1. Install Bruno once:
   ```bash
   npm install -g @usebruno/cli
   ```
2. Boot the app:
   ```bash
   docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --wait
   ```
3. Run the suite:
   ```bash
   npm run test:api
   ```

`npm run test:api` resolves to `bru run --env local tests/api`. Bruno picks
up `tests/api/environments/local.bru` for `{{baseUrl}}`, `{{adminUsername}}`
and `{{adminPassword}}`. The `_auth/` folder bootstraps a session cookie
once at the start and Bruno reuses it for any test that needs it.

## Test category breakdown

| Category | Purpose                                                                     |
| -------- | --------------------------------------------------------------------------- |
| Positive | Valid request → correct status + shape + headers                            |
| Negative | Wrong auth / missing field / unknown id → expected 4xx                      |
| Variance | Different valid inputs (filters, pagination, encoding)                      |
| Boundary | Empty strings, oversized inputs, SQLi/path-traversal probes, malformed JSON |

Each `.bru` file is named after its category so a directory listing reads
like a checklist (`*-boundary.bru`, `*-unauthorized.bru`, etc.).

## What's exercised

| Area               | Files                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------- |
| Auth bootstrap     | `_auth/csrf.bru`, `_auth/login-admin.bru`                                                                 |
| Articles           | `articles/list-*.bru`, `articles/get-article-*.bru`, `articles/create-article-*.bru`                      |
| Forum threads      | `forum/list-threads*.bru`, `forum/create-thread-unauthorized.bru`                                         |
| Tools              | `tools/list-tools.bru`, `tools/submit-tool-unauthorized.bru`                                              |
| Search             | `search/search-*.bru` (positive + empty + SQLi + 10KB query)                                              |
| Glossary           | `glossary/list-glossary.bru`                                                                              |
| Votes              | `votes/cast-vote-unauthorized.bru`                                                                        |
| Profile            | `profile/update-profile-unauthorized.bru`                                                                 |
| Admin (4xx checks) | `admin/stats-unauthorized.bru`, `admin/users-list-unauthorized.bru`, `admin/delete-user-wrong-method.bru` |

## Adding a new endpoint

1. Make a folder under `tests/api/<area>/`.
2. For each new route, copy the four file pattern: `<route>.bru` (positive),
   `<route>-<filter>-variance.bru`, `<route>-<probe>-boundary.bru`,
   `<route>-unauthorized.bru` (if auth-gated).
3. Use the existing assertions style — `expect(res.getStatus())`,
   `expect(res.getBody())`, `expect(res.getResponseTime())`.
4. Anything that mutates DB state should reset itself in `script:post-response`
   so a re-run from a clean stack still passes.
