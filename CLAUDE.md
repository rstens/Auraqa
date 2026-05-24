# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AuraQA is a community platform for software testers built with Next.js 15 (App Router), PostgreSQL 18, and Claude AI. Three main features: knowledge base articles, community forums, and a testing tools directory.

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

Next.js 15 App Router with TypeScript, React 19, Tailwind CSS 4, Drizzle ORM, NextAuth.js v5 (Auth.js), Anthropic SDK (claude-sonnet-4-6), Zod for validation, UUIDv7 for IDs.

### Server Components by Default

Pages (articles, forum, tools, search) are React Server Components. Only interactive elements (vote buttons, forms, search input, user menu) use `"use client"`.

### UUIDv7 Primary Keys

All entity tables use application-generated UUIDv7 (time-sortable, B-tree efficient). Exceptions: `tags` and `forum_categories` use serial IDs.

### Polymorphic Voting

Single `votes` table handles upvotes/downvotes across articles, threads, and replies via `targetType` + `targetId` columns with a unique constraint to prevent duplicates.

### AI Integration (src/lib/ai.ts)

All AI functions share a frozen system prompt with `cache_control: { type: "ephemeral" }` for prompt caching. Volatile content goes in the user message, never the system prompt. Functions return `null` on failure. AI calls are logged to `ai_interactions` table.

Features: `summarizeArticle()`, query expansion for search, `suggestAnswer()`, tag suggestions.

### Auth (src/lib/auth.ts)

OAuth via GitHub/Google using NextAuth.js v5 + Drizzle adapter. Database sessions (not JWT). Username auto-derived from email prefix on first login.

### Shared Tag System

Tags are shared across articles, threads, and tools via junction tables (`article_tags`, `forum_thread_tags`, `tool_tags`).

### Content Storage

Markdown stored raw, rendered server-side via remark/rehype with GFM support and syntax highlighting.

## Key Files

- `src/db/schema.ts` — Single-file Drizzle schema for all tables
- `src/lib/ai.ts` — All Claude API integrations
- `src/lib/auth.ts` — NextAuth.js config with providers and callbacks
- `src/lib/validators.ts` — Zod schemas for API request validation
- `src/lib/markdown.ts` — Markdown rendering pipeline
- `src/lib/uuid.ts` — UUIDv7 generation
- `src/types/index.ts` — Shared TypeScript types (inferred from Drizzle schema)
- `next.config.ts` — `output: "standalone"` for Docker builds
- `drizzle.config.ts` — Schema at `./src/db/schema.ts`, migrations at `./src/db/migrations`

## API Routes

- `POST/GET /api/articles`, `GET/PUT /api/articles/[slug]`
- `POST/GET /api/forum/threads`, `POST /api/forum/threads/[id]/replies`
- `POST/GET /api/tools`, `POST /api/tools/[slug]/reviews`
- `POST /api/votes` — polymorphic voting
- `GET /api/search` — AI-powered query expansion

All mutating endpoints require authentication. Validate request bodies with Zod schemas from `src/lib/validators.ts`.

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig.json).

## Environment Variables

See `.env.example` for all required variables. Key ones: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, GitHub/Google OAuth credentials, `ANTHROPIC_API_KEY`.

## Docker

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up  # dev
docker compose -f docker/docker-compose.yml up -d                                 # prod
```

## Documentation

Detailed docs in `docs/`: ARCHITECTURE.md, DATABASE.md, AI-INTEGRATION.md, API.md, DEVELOPMENT.md, TESTING.md, DEPLOYMENT.md, CONTRIBUTING.md.
