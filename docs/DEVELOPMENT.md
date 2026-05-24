# AuraQA Development Guide

## Prerequisites

- **Node.js 22+** (LTS recommended)
- **Docker** and Docker Compose (for PostgreSQL 18)
- **Git**

## Local Setup

### 1. Clone and Install

```bash
git clone https://github.com/rstens/Auraqa.git
cd Auraqa
npm install
```

### 2. Environment Variables

```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials. See `.env.example` for documentation on each variable.

### 3. Start PostgreSQL

```bash
docker compose -f docker/docker-compose.yml up db -d
```

### 4. Set Up the Database

```bash
npm run db:push     # Push schema to database
npm run db:seed     # Seed categories and tags
```

### 5. Start the Dev Server

```bash
npm run dev
```

Visit http://localhost:3000

## Full Docker Development

```bash
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up
```

This starts Next.js (port 3000), PostgreSQL (port 5432), and Adminer (port 8080).

## Coding Standards

- **TypeScript** — strict mode, no `any` types
- **JSDoc** — all exported functions, types, and components
- **Zod** — validate all API inputs
- **UUIDv7** — use `generateId()` from `src/lib/uuid.ts` for all entity IDs
- **Server Components** — default to server rendering; use `"use client"` only for interactivity
- **Drizzle ORM** — no raw SQL strings; use the query builder

## Git Workflow

1. Create a feature branch from `dev`
2. Make changes with descriptive commits
3. Run `npm run lint && npm run type-check && npm test` before pushing
4. Create a pull request targeting `dev`

## Available Scripts

| Script | Description |
|--------|------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript check |
| `npm run test` | Vitest tests |
| `npm run db:push` | Push schema (dev) |
| `npm run db:seed` | Seed data |
| `npm run db:studio` | Drizzle Studio |
