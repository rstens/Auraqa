# AuraQA

[![CI](https://github.com/rstens/Auraqa/actions/workflows/ci.yml/badge.svg)](https://github.com/rstens/Auraqa/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/rstens/Auraqa/graph/badge.svg?token=tQgc5JrwPr)](https://codecov.io/gh/rstens/Auraqa)

**A community platform for software testers** — consolidating knowledge articles, community forums/Q&A, and a testing tools directory into a single destination.

Built with Next.js 16, PostgreSQL 18, and Claude AI.

## Features

- **Knowledge Base** — Curated Markdown articles on testing methodologies, tools, and best practices
- **Community Forums** — Q&A-style discussion forums organized by testing categories (automation, performance, security, API, mobile, etc.)
- **Testing Tools Directory** — Catalog of testing tools with reviews, ratings, and comparisons
- **AI-Powered** — Article summarization, smart search, answer suggestions, and tag classification via Claude API
- **OAuth Authentication** — Sign in with GitHub or Google
- **Reputation System** — Earn points through community contributions

## Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js 22+](https://nodejs.org/) (for local development without Docker)

### With Docker (recommended)

```bash
# 1. Clone the repository
git clone https://github.com/rstens/Auraqa.git
cd Auraqa

# 2. Create environment file
cp .env.example .env.local
# Edit .env.local with your OAuth credentials and API keys

# 3. Start the full stack
docker compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up

# 4. Open http://localhost:3000
```

### Without Docker

```bash
# 1. Install dependencies
npm install

# 2. Set up PostgreSQL 18 and create the database
createdb auraqa

# 3. Create environment file
cp .env.example .env.local
# Edit .env.local with your DATABASE_URL and other credentials

# 4. Push the schema to the database
npm run db:push

# 5. Seed initial data
npm run db:seed

# 6. Start the dev server
npm run dev
```

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | Next.js 16 (App Router, TypeScript)         |
| Styling    | Tailwind CSS + shadcn/ui                    |
| Database   | PostgreSQL 18                               |
| ORM        | Drizzle ORM                                 |
| Auth       | NextAuth.js (Auth.js v5)                    |
| AI         | Claude API (Anthropic SDK)                  |
| IDs        | UUIDv7                                      |
| Testing    | Vitest + React Testing Library + Playwright |
| Deployment | Docker multi-stage build                    |

## Project Structure

```
src/
├── app/          # Next.js App Router pages and API routes
├── components/   # React components (ui, layout, articles, forum, tools, shared)
├── db/           # Drizzle schema, migrations, and seed data
├── lib/          # Utilities (auth, AI, markdown, validators, UUID)
└── types/        # Shared TypeScript types
```

## Documentation

| Document                                 | Description                                        |
| ---------------------------------------- | -------------------------------------------------- |
| [Architecture](docs/ARCHITECTURE.md)     | System overview and design decisions               |
| [Database](docs/DATABASE.md)             | Schema design, PostgreSQL 18 features, migrations  |
| [API Reference](docs/API.md)             | API endpoints with request/response examples       |
| [AI Integration](docs/AI-INTEGRATION.md) | Claude API patterns, prompt caching, cost tracking |
| [Development](docs/DEVELOPMENT.md)       | Local setup, coding standards, Git workflow        |
| [Testing](docs/TESTING.md)               | Test strategy, running tests                       |
| [Deployment](docs/DEPLOYMENT.md)         | Docker deployment guide                            |
| [Security Scan](docs/SECURITY.md)        | Manually-dispatched ZAP/Nuclei/Trivy/etc. workflow |
| [Contributing](docs/CONTRIBUTING.md)     | How to contribute                                  |

## Scripts

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build
npm run start        # Run the production build locally (run `npm run build` first)
npm run format       # Format code with Prettier
npm run format:check # Check formatting (used in CI)
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
npm run test         # Run Vitest tests
npm run test:watch   # Vitest in watch mode
npm run test:e2e     # Playwright end-to-end smoke tests
npm run db:generate  # Generate migration files
npm run db:migrate   # Apply migrations
npm run db:push      # Push schema (dev only)
npm run db:seed      # Seed categories and tags
npm run db:studio    # Open Drizzle Studio
```

## CI & Automation

- **CI** (`.github/workflows/ci.yml`) — format check, lint, type check, Vitest, then a Dockerized Playwright smoke run on every push and PR to `dev` / `main`. The dev Docker image is cached on GHCR keyed by a content hash of the Dockerfiles, lockfile, root configs, and `src/` + `public/` — runs with no relevant changes reuse the image and skip the ~60s build.
- **Security Scan** (`.github/workflows/security.yml`) — manually-dispatched, gated by an `intensity` input (`smoke` / `normal` / `extreme`). See [`docs/SECURITY.md`](docs/SECURITY.md).
- **Dependabot** (`.github/dependabot.yml`) — weekly Monday scans across npm, GitHub Actions, and Docker, with framework-specific groupings so Next / React / Drizzle / Auth.js bumps land in their own PRs.

## License

[Apache License 2.0](LICENSE)

---

[![SonarQube Cloud](https://sonarcloud.io/images/project_badges/sonarcloud-light.svg)](https://sonarcloud.io/summary/new_code?id=rstens_Auraqa)
