# AuraQA Testing Strategy

## Test Stack

- **Vitest** — Unit and integration tests (jsdom, v8 coverage)
- **React Testing Library** — Component tests
- **Playwright** — End-to-end smoke tests against a Dockerized stack
- **Bruno** — API tests (positive / negative / variance / boundary per route)

## Running Tests

```bash
npm run test            # Vitest, single run
npm run test:watch      # Vitest, watch mode
npm run test:coverage   # Vitest + v8 coverage (HTML report under coverage/)
npm run test:e2e        # Playwright smoke tests
npm run test:api        # Bruno API suite (needs the Docker stack up)
npm run type-check      # tsc --noEmit
npm run lint            # ESLint
```

## Coverage targets

`vitest.config.ts` enforces 90% lines / functions / statements (85% branches)
across the pure helper surface — `src/lib/{api,markdown,uuid,utils,validators,glossary-data}.ts`
plus `src/components/shared/user-avatar.tsx`. CI fails if the gated number
drops below threshold; current baseline is 100% lines / 96% branches.

UI pages, API route handlers, and Drizzle schema are intentionally
excluded from the gate — they're covered by the Playwright + Bruno
integration suites instead, where the assertions live against a running
stack rather than against mocked modules.

## Test Structure

```
src/
├── lib/
│   └── __tests__/         # Unit tests for utilities
├── components/
│   └── __tests__/         # Component tests
└── app/
    └── api/
        └── __tests__/     # API route integration tests
e2e/                       # Playwright E2E tests
```

## What to Test

### Unit Tests

- Utility functions (slugify, timeAgo, UUID generation)
- Markdown rendering and excerpt extraction
- Zod validation schemas
- AI service functions (with mocked Anthropic client)

### Component Tests

- ArticleCard, ThreadCard, ToolCard rendering
- VoteButtons interaction
- SearchBar input handling

### Integration Tests

- API route handlers (CRUD operations)
- Authentication middleware
- Vote deduplication
- Search query execution

### E2E Tests

- Full user flows: register → create article → search → vote
- Forum Q&A flow: ask question → post reply → accept answer
- Tool submission and review flow

### API Tests (Bruno)

Lives under `tests/api/` — see `tests/api/README.md` for the full layout.
Each route has up to four `.bru` files following the unit-test
category split:

| Category | Example                                                                                                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Positive | `articles/list-articles.bru` — 200 + array shape                                                                                                                                        |
| Variance | `articles/list-articles-with-tag-variance.bru`                                                                                                                                          |
| Boundary | `search/search-oversized-query-boundary.bru` (10KB `?q=`), `articles/get-article-malicious-slug-boundary.bru` (path traversal), `search/search-sql-injection-boundary.bru` (SQLi probe) |
| Negative | `articles/create-article-unauthorized.bru` (401/403 on anonymous POST)                                                                                                                  |

CI installs `@usebruno/cli` after the Playwright run, executes the
suite against the same Docker stack, and uploads the Bruno HTML +
JSON report as the `bruno-api-report` artifact.
