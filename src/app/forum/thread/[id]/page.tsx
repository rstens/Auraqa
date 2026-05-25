/**
 * Forum thread detail page.
 *
 * Displays the thread content, replies, and a reply form.
 */

import { db } from "@/db";
import { forumThreads, forumReplies, users, forumCategories } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { ReplyForm } from "@/components/forum/reply-form";

export const dynamic = "force-dynamic";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const threadResult = await db
    .select({
      id: forumThreads.id,
      title: forumThreads.title,
      content: forumThreads.content,
      voteScore: forumThreads.voteScore,
      replyCount: forumThreads.replyCount,
      viewCount: forumThreads.viewCount,
      createdAt: forumThreads.createdAt,
      authorName: users.name,
      authorUsername: users.username,
      authorImage: users.image,
      categoryName: forumCategories.name,
      categorySlug: forumCategories.slug,
    })
    .from(forumThreads)
    .leftJoin(users, eq(forumThreads.authorId, users.id))
    .leftJoin(forumCategories, eq(forumThreads.categoryId, forumCategories.id))
    .where(eq(forumThreads.id, id))
    .limit(1);

  const thread = threadResult[0];
  if (!thread) notFound();

  const replies = await db
    .select({
      id: forumReplies.id,
      content: forumReplies.content,
      isAccepted: forumReplies.isAccepted,
      voteScore: forumReplies.voteScore,
      createdAt: forumReplies.createdAt,
      authorName: users.name,
      authorUsername: users.username,
      authorImage: users.image,
    })
    .from(forumReplies)
    .leftJoin(users, eq(forumReplies.authorId, users.id))
    .where(eq(forumReplies.threadId, id))
    .orderBy(asc(forumReplies.createdAt));

  const threadHtml = await renderMarkdown(thread.content);

  return (
    <div data-testid="thread-detail" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/forum/${thread.categorySlug}`}
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
      >
        &larr; {thread.categoryName}
      </Link>

      {/* Thread */}
      <div data-testid="thread-content" className="mt-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {thread.title}
        </h1>
        <div className="mt-2 flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span>{thread.authorName ?? thread.authorUsername ?? "Anonymous"}</span>
          <span>{timeAgo(thread.createdAt)}</span>
          <span>{thread.voteScore} votes</span>
          <span>{thread.viewCount} views</span>
        </div>
        <div
          className="prose prose-slate mt-4 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: threadHtml }}
        />
      </div>

      {/* Replies */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {replies.length} {replies.length === 1 ? "Reply" : "Replies"}
        </h2>
        <div data-testid="replies-list" className="mt-4 space-y-4">
          {replies.map(async (reply) => {
            const replyHtml = await renderMarkdown(reply.content);
            return (
              <div
                key={reply.id}
                data-testid={`reply-${reply.id}`}
                className={`rounded-lg border p-4 ${
                  reply.isAccepted
                    ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20"
                    : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
                }`}
              >
                {reply.isAccepted && (
                  <span className="mb-2 inline-block rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-800 dark:text-green-200">
                    Accepted Answer
                  </span>
                )}
                <div
                  className="prose prose-slate prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: replyHtml }}
                />
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>{reply.authorName ?? reply.authorUsername ?? "Anonymous"}</span>
                  <span>{timeAgo(reply.createdAt)}</span>
                  <span>{reply.voteScore} votes</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reply form */}
      {session?.user ? (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Post a Reply
          </h3>
          <div className="mt-4">
            <ReplyForm threadId={id} />
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            Sign in to reply
          </Link>
        </div>
      )}
    </div>
  );
}
