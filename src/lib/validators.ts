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

/** Schema for search queries. */
export const searchQuerySchema = z.object({
  q: z.string().min(1).max(200),
  type: z.enum(["all", "articles", "threads", "tools"]).default("all"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
