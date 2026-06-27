# AuraQA API Reference

## Authentication

All write endpoints require authentication via NextAuth.js session cookies.

## Articles

| Method | Endpoint               | Auth | Description                         |
| ------ | ---------------------- | ---- | ----------------------------------- |
| GET    | `/api/articles`        | No   | List published articles (paginated) |
| POST   | `/api/articles`        | Yes  | Create a new article                |
| GET    | `/api/articles/[slug]` | No   | Get article by slug                 |
| PUT    | `/api/articles/[slug]` | Yes  | Update article (author/admin)       |
| DELETE | `/api/articles/[slug]` | Yes  | Delete article (author/admin)       |

## Forum

| Method | Endpoint                          | Auth | Description                           |
| ------ | --------------------------------- | ---- | ------------------------------------- |
| GET    | `/api/forum/threads`              | No   | List threads (filterable by category) |
| POST   | `/api/forum/threads`              | Yes  | Create a new thread                   |
| GET    | `/api/forum/threads/[id]/replies` | No   | List replies for a thread             |
| POST   | `/api/forum/threads/[id]/replies` | Yes  | Post a reply                          |

## Tools

| Method | Endpoint                    | Auth | Description             |
| ------ | --------------------------- | ---- | ----------------------- |
| GET    | `/api/tools`                | No   | List approved tools     |
| POST   | `/api/tools`                | Yes  | Submit a new tool       |
| GET    | `/api/tools/[slug]/reviews` | No   | List reviews for a tool |
| POST   | `/api/tools/[slug]/reviews` | Yes  | Add a review            |

## Votes

| Method | Endpoint     | Auth | Description            |
| ------ | ------------ | ---- | ---------------------- |
| POST   | `/api/votes` | Yes  | Cast a vote (+1 or -1) |

## Search

| Method | Endpoint                     | Auth | Description                         |
| ------ | ---------------------------- | ---- | ----------------------------------- |
| GET    | `/api/search?q=...&type=all` | No   | Full-text search across all content |

## AI

| Method | Endpoint            | Auth | Description              |
| ------ | ------------------- | ---- | ------------------------ |
| POST   | `/api/ai/summarize` | Yes  | Generate article summary |
| POST   | `/api/ai/suggest`   | Yes  | Get AI answer suggestion |
