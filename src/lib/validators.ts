/**
 * Zod validation schemas for AuraQA API request bodies.
 *
 * Used in API routes to validate and parse incoming data before
 * passing it to the database layer.
 *
 * @see docs/API.md for endpoint documentation
 */

import { z } from "zod";

/** Schema for creating a new article. */
export const createArticleSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(50000),
  summary: z.string().max(500).optional(),
  tags: z.array(z.string()).max(10).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});

/** Schema for updating an existing article. */
export const updateArticleSchema = createArticleSchema.partial();

/** Schema for creating a new forum thread. */
export const createThreadSchema = z.object({
  title: z.string().min(1).max(300),
  content: z.string().min(1).max(50000),
  categoryId: z.number().int().positive(),
  tags: z.array(z.string()).max(10).optional(),
});

/** Schema for creating a reply to a forum thread. */
export const createReplySchema = z.object({
  content: z.string().min(1).max(50000),
  parentId: z.string().uuid().optional(),
});

/** Schema for submitting a new tool to the directory. */
export const createToolSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(2000),
  websiteUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),
  category: z.string().max(50).optional(),
  pricing: z.enum(["free", "freemium", "paid", "open-source", "unknown"]).default("unknown"),
  tags: z.array(z.string()).max(10).optional(),
});

/** Schema for admin updating a tool. */
export const updateToolSchema = createToolSchema.partial().extend({
  status: z.enum(["pending", "approved", "rejected"]).optional(),
});

/** Schema for changing a user's role. */
export const updateUserRoleSchema = z.object({
  role: z.enum(["user", "admin"]),
});

/** Schema for admin AI action on an article. */
export const adminAiActionSchema = z.object({
  action: z.enum(["summarize", "suggest-tags"]),
});

/** Schema for admin AI suggest-answer. */
export const adminSuggestAnswerSchema = z.object({
  threadId: z.string().uuid(),
});

/** Schema for creating a tool review. */
export const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  content: z.string().min(1).max(5000),
});

/** Schema for casting a vote. */
export const castVoteSchema = z.object({
  targetType: z.enum(["article", "thread", "reply"]),
  targetId: z.string().uuid(),
  value: z.union([z.literal(1), z.literal(-1)]),
});

/** Schema for updating own profile. */
export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  username: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
});

/** Schema for creating/updating a glossary term. */
export const glossaryTermSchema = z.object({
  term: z.string().min(1).max(200),
  abbreviation: z.string().max(20).nullable().optional(),
  definition: z.string().min(1).max(5000),
  category: z.string().min(1).max(50),
  relatedTerms: z.array(z.string()).optional(),
  seeAlso: z.array(z.string()).optional(),
});

/** Schema for search queries. */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["all", "articles", "threads", "tools", "glossary"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/**
 * Shared list/pagination query schema for the public GET endpoints
 * (articles, threads, tools). Coerces from strings, returns sensible
 * defaults, and rejects garbage instead of letting `Number()` produce
 * `NaN` that crashes Postgres downstream — SQLMap probes like
 * `?page=' OR 1=1--` were surfacing as raw 500s before this schema.
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(10_000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

/** Threads-list filter: optional `categoryId` on top of the list params. */
export const threadsListQuerySchema = listQuerySchema.extend({
  categoryId: z.coerce.number().int().positive().optional(),
});

/**
 * Route-param schemas — applied to `await context.params` via the
 * `parseParams` helper. Each one rejects path traversal, oversized
 * input, and shape mismatches at the handler boundary so the DB layer
 * never sees garbage.
 */
const SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?$/i;

export const slugParamSchema = z.object({
  slug: z.string().min(1).max(100).regex(SLUG_PATTERN, "must be a URL-safe slug"),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

/** Admin users-list query — optional role filter and limit (1–100). */
export const adminUsersListQuerySchema = z.object({
  role: z.enum(["admin", "user"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});
