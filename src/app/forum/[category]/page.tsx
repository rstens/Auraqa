/**
 * Forum category page — threads list.
 *
 * Shows all threads in a given category, sorted by most recent activity.
 */

import Link from "next/link";
import { db } from "@/db";
import { forumCategories, forumThreads, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categorySlug } = await params;

  const categoryResult = await db
    .select()
    .from(forumCategories)
    .where(eq(forumCategories.slug, categorySlug))
    .limit(1);

  const cat = categoryResult[0];
  if (!cat) notFound();

  const threads = await db
    .select({
      id: forumThreads.id,
      title: forumThreads.title,
      isPinned: forumThreads.isPinned,
      voteScore: forumThreads.voteScore,
      replyCount: forumThreads.replyCount,
      viewCount: forumThreads.viewCount,
      createdAt: forumThreads.createdAt,
      lastReplyAt: forumThreads.lastReplyAt,
      authorName: users.name,
      authorUsername: users.username,
    })
    .from(forumThreads)
    .leftJoin(users, eq(forumThreads.authorId, users.id))
    .where(eq(forumThreads.categoryId, cat.id))
    .orderBy(desc(forumThreads.isPinned), desc(forumThreads.lastReplyAt), desc(forumThreads.createdAt))
    .limit(50);

  return (
    <div data-testid="forum-category-page" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/forum" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
            &larr; All categories
          </Link>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            {cat.name}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {cat.description}
          </p>
        </div>
        <Link
          href={`/forum/${categorySlug}/new`}
          data-testid="new-thread-link"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          New Thread
        </Link>
      </div>

      <div data-testid="threads-list" className="mt-8 space-y-2">
        {threads.length === 0 ? (
          <p data-testid="threads-empty" className="py-12 text-center text-slate-500 dark:text-slate-400">
            No threads yet. Start a discussion!
          </p>
        ) : (
          threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/thread/${thread.id}`}
              data-testid={`thread-card-${thread.id}`}
              className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >
              {thread.isPinned && (
                <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                  Pinned
                </span>
              )}
              <div className="flex-1">
                <h2 className="font-medium text-slate-900 dark:text-white">
                  {thread.title}
                </h2>
                <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{thread.authorName ?? thread.authorUsername ?? "Anonymous"}</span>
                  <span>{timeAgo(thread.lastReplyAt ?? thread.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{thread.replyCount} replies</span>
                <span>{thread.voteScore} votes</span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
