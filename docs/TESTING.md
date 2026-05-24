# AuraQA Testing Strategy

## Test Stack

- **Vitest** — Unit and integration tests
- **React Testing Library** — Component tests
- **Playwright** — End-to-end tests (Phase 2+)

## Running Tests

```bash
# Run all tests once
npm run test

# Watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

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

### E2E Tests (Phase 2+)
- Full user flows: register → create article → search → vote
- Forum Q&A flow: ask question → post reply → accept answer
- Tool submission and review flow
