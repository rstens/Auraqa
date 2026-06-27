/**
 * Drizzle ORM schema for AuraQA.
 *
 * All entity tables use UUIDv7 primary keys generated application-side.
 * Only small lookup tables (tags, forum_categories) use serial IDs.
 *
 * PostgreSQL 18 features used:
 * - GIN indexes for full-text search via tsvector
 * - JSONB columns for flexible tool features
 * - Unique constraints for polymorphic vote deduplication
 *
 * @see docs/DATABASE.md for design decisions
 */

import type { AnyPgColumn } from "drizzle-orm/pg-core";
import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  serial,
  jsonb,
  numeric,
  smallint,
  index,
  unique,
} from "drizzle-orm/pg-core";

// ============================================================
// Users & Auth
// ============================================================

/**
 * User accounts. Created on first OAuth login.
 * Includes NextAuth-required columns (name, email, emailVerified, image)
 * plus AuraQA-specific columns (username, bio, reputation, role).
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  username: text("username").unique(),
  bio: text("bio").default(""),
  reputation: integer("reputation").notNull().default(0),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * OAuth provider accounts linked to users (NextAuth Drizzle adapter).
 * Column names must match NextAuth's expected snake_case format.
 */
export const accounts = pgTable("accounts", {
  id: uuid("id").primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => [
  unique("provider_providerAccountId_unique").on(table.provider, table.providerAccountId),
]);

/**
 * User sessions for NextAuth.
 * sessionToken is the primary key as required by the adapter.
 */
export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

/**
 * Email verification tokens (NextAuth).
 */
export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
}, (table) => [
  unique("verification_tokens_identifier_token").on(table.identifier, table.token),
]);

// ============================================================
// Tags (shared across articles, threads, tools)
// ============================================================

/**
 * Tags for categorizing content. Shared across articles, forum threads, and tools.
 * Serial ID since these are small lookup records.
 */
export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description").default(""),
  usageCount: integer("usage_count").notNull().default(0),
}, (table) => [
  index("idx_tags_slug").on(table.slug),
]);

// ============================================================
// Articles / Knowledge Base
// ============================================================

/**
 * Knowledge base articles written in Markdown.
 * AI-generated summaries are cached in the ai_summary column.
 */
export const articles = pgTable("articles", {
  id: uuid("id").primaryKey(),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  slug: text("slug").unique().notNull(),
  summary: text("summary").default(""),
  content: text("content").notNull(),
  aiSummary: text("ai_summary"),
  status: text("status").notNull().default("draft"),
  viewCount: integer("view_count").notNull().default(0),
  voteScore: integer("vote_score").notNull().default(0),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_articles_slug").on(table.slug),
  index("idx_articles_author").on(table.authorId),
  index("idx_articles_status").on(table.status),
]);

/**
 * Junction table linking articles to tags.
 */
export const articleTags = pgTable("article_tags", {
  articleId: uuid("article_id").notNull().references(() => articles.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [
  unique("article_tags_pk").on(table.articleId, table.tagId),
]);

// ============================================================
// Forum
// ============================================================

/**
 * Forum categories (e.g., "Test Automation", "Performance Testing").
 * Serial ID since these are seeded and rarely change.
 */
export const forumCategories = pgTable("forum_categories", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description").default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

/**
 * Forum discussion threads / questions.
 */
export const forumThreads = pgTable("forum_threads", {
  id: uuid("id").primaryKey(),
  categoryId: integer("category_id").notNull().references(() => forumCategories.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  viewCount: integer("view_count").notNull().default(0),
  voteScore: integer("vote_score").notNull().default(0),
  replyCount: integer("reply_count").notNull().default(0),
  lastReplyAt: timestamp("last_reply_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_forum_threads_category").on(table.categoryId),
  index("idx_forum_threads_author").on(table.authorId),
]);

/**
 * Junction table linking forum threads to tags.
 */
export const forumThreadTags = pgTable("forum_thread_tags", {
  threadId: uuid("thread_id").notNull().references(() => forumThreads.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [
  unique("forum_thread_tags_pk").on(table.threadId, table.tagId),
]);

/**
 * Replies to forum threads. Supports nesting via parent_id.
 */
export const forumReplies = pgTable("forum_replies", {
  id: uuid("id").primaryKey(),
  threadId: uuid("thread_id").notNull().references(() => forumThreads.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  // Self-reference: a reply's parent is another reply in the same thread.
  // AnyPgColumn cast breaks the circular forward-reference at type level.
  parentId: uuid("parent_id").references((): AnyPgColumn => forumReplies.id, {
    onDelete: "set null",
  }),
  content: text("content").notNull(),
  isAccepted: boolean("is_accepted").notNull().default(false),
  voteScore: integer("vote_score").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_forum_replies_thread").on(table.threadId),
  index("idx_forum_replies_author").on(table.authorId),
]);

// ============================================================
// Tools Directory
// ============================================================

/**
 * Testing tools in the directory.
 * Features stored as JSONB for flexible schema.
 */
export const tools = pgTable("tools", {
  id: uuid("id").primaryKey(),
  submittedBy: uuid("submitted_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").unique().notNull(),
  description: text("description").notNull(),
  websiteUrl: text("website_url"),
  logoUrl: text("logo_url"),
  category: text("category"),
  pricing: text("pricing").default("unknown"),
  features: jsonb("features").default([]),
  avgRating: numeric("avg_rating", { precision: 3, scale: 2 }).notNull().default("0"),
  reviewCount: integer("review_count").notNull().default(0),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_tools_slug").on(table.slug),
  index("idx_tools_category").on(table.category),
  index("idx_tools_status").on(table.status),
]);

/**
 * Junction table linking tools to tags.
 */
export const toolTags = pgTable("tool_tags", {
  toolId: uuid("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" }),
}, (table) => [
  unique("tool_tags_pk").on(table.toolId, table.tagId),
]);

/**
 * User reviews and ratings for tools.
 * One review per user per tool enforced by unique constraint.
 */
export const toolReviews = pgTable("tool_reviews", {
  id: uuid("id").primaryKey(),
  toolId: uuid("tool_id").notNull().references(() => tools.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  rating: smallint("rating").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("tool_reviews_tool_author").on(table.toolId, table.authorId),
  index("idx_tool_reviews_tool").on(table.toolId),
]);

// ============================================================
// Votes (polymorphic: articles, threads, replies)
// ============================================================

/**
 * Polymorphic voting system.
 * Supports upvote (+1) and downvote (-1) on articles, threads, and replies.
 * One vote per user per target enforced by unique constraint.
 */
export const votes = pgTable("votes", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  value: smallint("value").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  unique("votes_user_target").on(table.userId, table.targetType, table.targetId),
  index("idx_votes_target").on(table.targetType, table.targetId),
]);

// ============================================================
// AI Interactions (cost tracking and auditing)
// ============================================================

/**
 * Log of all Claude API interactions for cost tracking and abuse detection.
 */
export const aiInteractions = pgTable("ai_interactions", {
  id: uuid("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id),
  interactionType: text("interaction_type").notNull(),
  inputText: text("input_text").notNull(),
  outputText: text("output_text").notNull(),
  model: text("model").notNull(),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("idx_ai_interactions_user").on(table.userId),
  index("idx_ai_interactions_type").on(table.interactionType),
]);
