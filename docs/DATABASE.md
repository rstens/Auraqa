# AuraQA Database Design

## Overview

AuraQA uses **PostgreSQL 18** as its primary data store, accessed via **Drizzle ORM** for type-safe queries and migrations.

## Why PostgreSQL 18

- **Async I/O** — improved concurrent query performance
- **Enhanced JSON_TABLE** — querying JSONB columns (tool features)
- **Virtual generated columns** — computed search vectors
- **Full-text search** — built-in GIN-indexed tsvector/tsquery

## UUIDv7 Strategy

All entity tables use **UUIDv7** primary keys generated application-side via the `uuidv7` npm package (`src/lib/uuid.ts`).

**Why UUIDv7 over UUIDv4:**
- Time-sortable: embeds a millisecond-precision timestamp
- B-tree friendly: monotonically increasing values reduce page splits
- No sequence contention: generated application-side, no database round-trip
- URL-safe: standard UUID format

**Exceptions:** `tags` and `forum_categories` use `serial` IDs — small lookup tables where time-sorting is unnecessary.

## Schema Overview

| Table | Primary Key | Description |
|-------|------------|-------------|
| `users` | UUIDv7 | User accounts (OAuth) |
| `accounts` | UUIDv7 | OAuth provider links |
| `sessions` | UUIDv7 | NextAuth sessions |
| `articles` | UUIDv7 | Knowledge base articles |
| `article_tags` | Composite | Article-tag junction |
| `forum_categories` | Serial | Forum categories (seeded) |
| `forum_threads` | UUIDv7 | Forum discussion threads |
| `forum_thread_tags` | Composite | Thread-tag junction |
| `forum_replies` | UUIDv7 | Thread replies (nestable) |
| `tools` | UUIDv7 | Testing tools directory |
| `tool_tags` | Composite | Tool-tag junction |
| `tool_reviews` | UUIDv7 | Tool reviews/ratings |
| `tags` | Serial | Shared tags |
| `votes` | UUIDv7 | Polymorphic votes |
| `ai_interactions` | UUIDv7 | AI usage audit log |

## Full-Text Search

GIN indexes are created on `to_tsvector('english', ...)` for:
- **articles** — title + summary + content
- **forum_threads** — title + content
- **tools** — name + description

## Migration Workflow

```bash
# Generate migration SQL from schema changes
npm run db:generate

# Apply pending migrations
npm run db:migrate

# Push schema directly (dev only — no migration file)
npm run db:push

# Seed initial data (categories, tags)
npm run db:seed

# Open Drizzle Studio for visual DB browsing
npm run db:studio
```

## Seeded Data

### Forum Categories
1. Test Automation
2. Manual Testing
3. Performance Testing
4. Security Testing
5. CI/CD & DevOps
6. Mobile Testing
7. API Testing
8. General Discussion

### Initial Tags
30 testing-related tags including: Selenium, Cypress, Playwright, Jest, JUnit, Appium, JMeter, k6, Postman, TDD, BDD, CI/CD, and more.
