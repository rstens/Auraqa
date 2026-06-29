# `@seed` population scripts

Playwright scripts that fill a **running** AuraQA instance with random content by
driving the real UI (login + the create forms): published **articles**, forum
**threads**, and **tool** entries.

These are not part of the test suite. `playwright.config.ts` ignores
`**/*.seed.ts`, so `npm run test:e2e` and CI never run them. Every script is also
tagged `@seed`. They run only on request, through `playwright.seed.config.ts`.

## Prerequisites

- The app reachable at `http://localhost:3000` (the seed config reuses an
  already-running server — e.g. the Docker stack — and won't start its own).
- The DB seeded with categories/tags (`npm run db:seed`) so forum categories exist.
- Chromium installed for Playwright: `npx playwright install chromium`.

## Run

```bash
npm run seed:e2e                 # all three scripts
npm run seed:e2e -- articles     # only articles.seed.ts
npm run seed:e2e -- forum        # only forum.seed.ts
npm run seed:e2e -- tools        # only tools.seed.ts
```

## Counts

Defaults: 8 articles, 8 threads, 6 tools. Override per resource via env:

```bash
SEED_ARTICLES=20 SEED_THREADS=15 SEED_TOOLS=10 npm run seed:e2e
```

## Notes

- Logs in as `admin` / `admin`.
- Tools are created with status **pending**, so they need admin approval before
  showing on the public `/tools` list — but the rows are created and each tool's
  detail page is reachable.
