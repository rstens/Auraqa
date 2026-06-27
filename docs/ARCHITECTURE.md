# AuraQA Architecture

## Overview

AuraQA is a community platform for software testers built as a full-stack Next.js 16 application with PostgreSQL 18 for data persistence and Claude AI for intelligent features.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                  │
│  React Components (SSR + Client-side interactivity) │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP/HTTPS
┌──────────────────────▼──────────────────────────────┐
│              Next.js 16 App Router                   │
│  ┌─────────────┐  ┌──────────┐  ┌────────────────┐ │
│  │ Server       │  │ API      │  │ Auth           │ │
│  │ Components   │  │ Routes   │  │ (NextAuth.js)  │ │
│  └──────┬──────┘  └────┬─────┘  └───────┬────────┘ │
│         │              │                 │          │
│  ┌──────▼──────────────▼─────────────────▼────────┐ │
│  │           Drizzle ORM (Type-safe queries)       │ │
│  └──────────────────────┬─────────────────────────┘ │
│                         │                            │
│  ┌──────────────────────▼─────────────────────────┐ │
│  │        Claude AI Service (src/lib/ai.ts)        │ │
│  │  Anthropic SDK → claude-sonnet-4-6              │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────▼──────────────┐
        │     PostgreSQL 18           │
        │  (Full-text search, JSONB)  │
        └─────────────────────────────┘
```

## Key Design Decisions

### Server Components by Default

Article listings, forum threads, and tool pages are server-rendered (React Server Components) for SEO and performance. Client components are used only for interactive elements: vote buttons, forms, search bar, and Markdown editor.

### UUIDv7 Primary Keys

All entity tables use UUIDv7 IDs generated application-side. UUIDv7 embeds a millisecond timestamp, producing monotonically increasing values that are naturally sorted by creation time. This provides excellent B-tree index performance compared to random UUIDv4.

Exceptions: `tags` and `forum_categories` use serial IDs as small, stable lookup tables.

### Polymorphic Voting

A single `votes` table with `target_type` and `target_id` columns handles votes on articles, threads, and replies. This avoids duplicating voting logic across three separate tables.

### Shared Tag System

Tags are shared across articles, forum threads, and tools. A tag like "Selenium" can cross-reference content from all three content types, making the platform more interconnected.

### Markdown Storage

Content is stored as raw Markdown in the database rather than rich text HTML. Markdown is portable, diffable, and renders consistently. Server-side rendering avoids XSS concerns from stored HTML.

### AI Integration

Claude API (Sonnet 4.6) provides four intelligent features, all using prompt caching for cost efficiency:

1. Article summarization (cached in `ai_summary` column)
2. Smart search (query expansion)
3. Answer suggestions (AI-assisted Q&A)
4. Tag suggestions (content classification)

## Data Flow

### Article Creation

1. User submits Markdown content via the article editor
2. Server validates input (Zod schema)
3. Slug is generated from the title
4. Article is saved to PostgreSQL with UUIDv7 ID
5. On publish, AI generates a summary (cached for future use)
6. Full-text search index is updated

### Forum Q&A

1. User creates a thread in a category
2. Other users post replies (supports nesting via `parent_id`)
3. Users vote on threads and replies
4. Thread author can accept an answer
5. AI can suggest answers for unanswered questions

### Search

1. User enters a natural language query
2. AI expands the query into structured search terms
3. PostgreSQL full-text search runs across articles, threads, and tools
4. Results are ranked by relevance and displayed with type tabs
