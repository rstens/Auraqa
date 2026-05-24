# AuraQA Deployment Guide

## Docker Production Build

### Build the Image

```bash
docker build -f docker/Dockerfile -t auraqa .
```

### Run with Docker Compose

```bash
docker compose -f docker/docker-compose.yml up -d
```

This starts:
- **app** — Next.js standalone server on port 3000
- **db** — PostgreSQL 18 with persistent volume

### Environment Variables

Set these in `.env.local` or pass via `docker compose`:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | 32+ char random string |
| `NEXTAUTH_URL` | Yes | Public URL of the application |
| `GITHUB_CLIENT_ID` | For GitHub OAuth | GitHub OAuth app client ID |
| `GITHUB_CLIENT_SECRET` | For GitHub OAuth | GitHub OAuth app secret |
| `GOOGLE_CLIENT_ID` | For Google OAuth | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | For Google OAuth | Google OAuth secret |
| `ANTHROPIC_API_KEY` | For AI features | Claude API key |

## Multi-Stage Dockerfile

The production Dockerfile uses three stages:
1. **deps** — Install production dependencies only (`npm ci --omit=dev`)
2. **builder** — Build Next.js with `output: "standalone"`
3. **runner** — Minimal `node:22-alpine` image (~100MB)

The standalone output bundles everything needed into a self-contained `server.js`.

## Health Check

The app container has a health check on `/api/health` (to be implemented).

## Database Migrations

Run migrations before deploying a new version:

```bash
docker exec auraqa-app npm run db:migrate
```
