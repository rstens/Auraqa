# AuraQA AI Integration

## Overview

AuraQA uses the **Claude API** via the `@anthropic-ai/sdk` TypeScript SDK for intelligent features. All AI logic lives in `src/lib/ai.ts`.

## Model

**`claude-sonnet-4-6`** — chosen for the best speed/intelligence balance at $3/$15 per 1M tokens (input/output). Suitable for high-volume tasks like summarization and search.

## Features

### 1. Article Summarization
- **Endpoint:** `POST /api/ai/summarize`
- **Trigger:** When an article is published
- **Output:** 2-3 sentence summary cached in `articles.ai_summary`
- **Effort:** `low` (simple extraction task)

### 2. Smart Search
- **Endpoint:** `GET /api/search?q=...`
- **Trigger:** On every search query
- **Output:** Expanded search terms + matched tags (JSON schema output)
- **Effort:** `low`

### 3. Answer Suggestions
- **Endpoint:** `POST /api/ai/suggest`
- **Trigger:** User clicks "Get AI Suggestion" on unanswered threads
- **Output:** Markdown answer clearly labeled as AI-generated
- **Effort:** `medium` (requires reasoning)

### 4. Tag Suggestions
- **Trigger:** Inline during article/thread creation
- **Output:** 2-5 suggested tags from the existing tag set (JSON schema output)
- **Effort:** `low`

## Prompt Caching

All four functions share a **frozen system prompt** as the cache prefix. The system prompt uses `cache_control: {type: "ephemeral"}` (5-minute TTL), saving ~90% on input costs for the system prompt portion after the first call.

**Key rule:** Never interpolate dynamic data (timestamps, user IDs) into the system prompt — that would invalidate the cache on every request.

## Structured Outputs

Tag suggestions and smart search use `output_config.format` with JSON schemas for guaranteed valid output. No prefill or regex parsing needed.

## Error Handling

All AI functions return `null` (or empty arrays) on failure — the application works without AI. The SDK auto-retries rate limit (429) and server (5xx) errors with exponential backoff.

## Cost Tracking

Every AI call is logged to the `ai_interactions` table with:
- `interaction_type` (summarize, search, suggest_answer, suggest_tags)
- `input_tokens` and `output_tokens` from `response.usage`
- `model` name
- Truncated input/output text (500 chars max)

## Rate Limiting

- **Per-user:** 10 AI calls per hour
- **Per-application:** Anthropic SDK handles 429 retries automatically
