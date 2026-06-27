# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AuraQA is a community platform for software testers built with Next.js 16 (App Router), PostgreSQL 18, and Claude AI. Features: knowledge base articles, community forums, testing tools directory, ISTQB glossary, admin dashboard, and user profiles.

## Essential Commands

```bash
npm run dev              # Start dev server (Turbopack)
npm run build            # Production build
npm run lint             # ESLint
npm run type-check       # TypeScript checking (tsc --noEmit)
npm run test             # Run all tests (vitest run)
npm run test:watch       # Watch mode (vitest)
npm run db:generate      # Generate migration files from schema diff
npm run db:migrate       # Apply pending migrations
npm run db:push          # Push schema directly (dev only)
npm run db:seed          # Seed categories and tags (npx tsx src/db/seed.ts)
npm run db:studio        # Open Drizzle Studio GUI
```

Run a single test file: `npx vitest run src/lib/__tests__/utils.test.ts`

## Architecture

### Stack

Next.js 16 App Router with TypeScript, React 19, Tailwind CSS 4, Drizzle ORM, NextAuth.js v5 (Auth.js, JWT sessions), Anthropic SDK (claude-sonnet-4-6), Zod for validation, UUIDv7 for IDs.

### Server Components by Default

Pages (articles, forum, tools, search, admin) are React Server Components. Only interactive elements (forms, search input, user menu, admin actions, glossary filters) use `"use client"`.

### UUIDv7 Primary Keys

All entity tables use application-generated UUIDv7 (time-sortable, B-tree efficient). Exceptions: `tags` and `forum_categories` use serial IDs.

### Polymorphic Voting

Single `votes` table handles upvotes/downvotes across articles, threads, and replies via `targetType` + `targetId` columns with a unique constraint to prevent duplicates.

### AI Integration (src/lib/ai.ts)

All AI functions share a frozen system prompt with `cache_control: { type: "ephemeral" }` for prompt caching. Volatile content goes in the user message, never the system prompt. Functions return `null` on failure. AI calls are logged to `ai_interactions` table.

Features: `summarizeArticle()`, `suggestTags()`, `suggestAnswer()`, `enhanceSearch()`.

### Auth (src/lib/auth.ts)

Credentials login (admin: username `admin` / password `admin`) + OAuth via GitHub/Google using NextAuth.js v5. JWT session strategy. Username stored in JWT token. Exports `isAdmin()` helper. Dev quick-login available in non-production.

### Admin Dashboard (/admin)

Protected by `isAdmin()` in admin layout. Features:

- Dashboard with stats and pending approvals
- Article management: list, approve/publish, delete, AI summarize, AI suggest tags
- Tool management: list, approve/reject, delete (tools submit as "pending")
- User management: list, change role, delete (self-protection prevents own-role changes)
- AI overview: token usage stats, interaction history

Admin API routes under `/api/admin/*` each independently check `isAdmin()`.

### ISTQB Glossary (/glossary)

Static client-side glossary with 90 ISTQB-aligned terms in `src/lib/glossary-data.ts`. Features: instant search (term/acronym/definition), category filters, acronyms-only toggle, cross-referenced definitions, expandable cards with related terms. No database or API needed.

### Markdown Rendering (src/lib/markdown.ts)

Pipeline: unified → remark-parse → remark-gfm → remark-rehype → rehype-highlight → rehype-stringify. Syntax highlighting via highlight.js (github-dark theme). Typography via `@tailwindcss/typography`.

### Content Storage

Markdown stored raw in database, rendered server-side. Article summaries also rendered through the markdown pipeline on list pages.

### Error Handling Pattern

All client-side forms use safe error parsing: `res.text()` then `try { JSON.parse(text).error } catch {}`. This prevents "Unexpected end of JSON input" when servers return empty bodies.

## Key Files

- `src/db/schema.ts` — Single-file Drizzle schema for all tables
- `src/lib/ai.ts` — All Claude API integrations (summarize, tags, answers, search)
- `src/lib/auth.ts` — NextAuth.js config, Credentials + OAuth providers, `isAdmin()` helper
- `src/lib/validators.ts` — Zod schemas for all API request validation
- `src/lib/markdown.ts` — Markdown rendering pipeline (unified/remark/rehype)
- `src/lib/glossary-data.ts` — Static ISTQB glossary dataset (90 terms, 7 categories)
- `src/lib/uuid.ts` — UUIDv7 generation
- `src/types/index.ts` — Shared TypeScript types (inferred from Drizzle schema)
- `next.config.ts` — `output: "standalone"`, bfcache headers
- `drizzle.config.ts` — Schema at `./src/db/schema.ts`, migrations at `./src/db/migrations`

## API Routes

Public:

- `GET /api/articles`, `GET /api/articles/[slug]`
- `GET /api/forum/threads`, `GET /api/tools`
- `GET /api/search` — AI-powered query expansion

Auth required:

- `POST /api/articles`, `PUT /api/articles/[slug]`
- `POST /api/forum/threads`, `POST /api/forum/threads/[id]/replies`
- `POST /api/tools` (submits as "pending"), `POST /api/tools/[slug]/reviews`
- `POST /api/votes`, `PUT /api/profile`

Admin only (`/api/admin/*`):

- `GET /api/admin/stats`
- `PUT/DELETE /api/admin/articles/[slug]`, `POST /api/admin/articles/[slug]/ai`
- `PUT/DELETE /api/admin/tools/[slug]`
- `GET /api/admin/users`, `GET/PUT/DELETE /api/admin/users/[id]`
- `POST /api/admin/ai/suggest-answer`

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Environment Variables

See `.env.example` for all required variables: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, GitHub/Google OAuth credentials, `ANTHROPIC_API_KEY`.

## Docker

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up  # dev
docker compose -f docker/docker-compose.yml up -d                                 # prod
```

After first start or volume recreation, push schema and seed:

```bash
DATABASE_URL=postgres://auraqa:auraqa_password@localhost:5432/auraqa npm run db:push
DATABASE_URL=postgres://auraqa:auraqa_password@localhost:5432/auraqa npm run db:seed
```

## Documentation

Detailed docs in `docs/`: ARCHITECTURE.md, DATABASE.md, AI-INTEGRATION.md, API.md, DEVELOPMENT.md, TESTING.md, DEPLOYMENT.md, CONTRIBUTING.md.
