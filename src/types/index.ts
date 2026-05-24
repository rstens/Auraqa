/**
 * Shared TypeScript types for AuraQA.
 *
 * These types are inferred from the Drizzle schema where possible,
 * keeping the database schema as the single source of truth.
 */

import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type {
  users,
  articles,
  forumThreads,
  forumReplies,
  forumCategories,
  tools,
  toolReviews,
  tags,
  votes,
} from "@/db/schema";

// --- User types ---
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

// --- Article types ---
export type Article = InferSelectModel<typeof articles>;
export type NewArticle = InferInsertModel<typeof articles>;

// --- Forum types ---
export type ForumCategory = InferSelectModel<typeof forumCategories>;
export type ForumThread = InferSelectModel<typeof forumThreads>;
export type NewForumThread = InferInsertModel<typeof forumThreads>;
export type ForumReply = InferSelectModel<typeof forumReplies>;
export type NewForumReply = InferInsertModel<typeof forumReplies>;

// --- Tool types ---
export type Tool = InferSelectModel<typeof tools>;
export type NewTool = InferInsertModel<typeof tools>;
export type ToolReview = InferSelectModel<typeof toolReviews>;
export type NewToolReview = InferInsertModel<typeof toolReviews>;

// --- Shared types ---
export type Tag = InferSelectModel<typeof tags>;
export type Vote = InferSelectModel<typeof votes>;

/** Article with author info for display. */
export type ArticleWithAuthor = Article & {
  author: Pick<User, "id" | "username" | "name" | "image">;
  tags: Tag[];
};

/** Forum thread with author and category info for display. */
export type ThreadWithAuthor = ForumThread & {
  author: Pick<User, "id" | "username" | "name" | "image">;
  category: Pick<ForumCategory, "name" | "slug">;
  tags: Tag[];
};

/** Forum reply with author info for display. */
export type ReplyWithAuthor = ForumReply & {
  author: Pick<User, "id" | "username" | "name" | "image">;
};

/** Tool with author info and tags for display. */
export type ToolWithDetails = Tool & {
  submitter: Pick<User, "id" | "username" | "name" | "image">;
  tags: Tag[];
};
