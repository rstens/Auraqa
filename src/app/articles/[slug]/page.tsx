/**
 * Article detail page.
 *
 * Server Component that renders a single article with full Markdown content,
 * author info, and metadata.
 */

import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { VoteButtons } from "@/components/shared/vote-buttons";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const result = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      content: articles.content,
      summary: articles.summary,
      aiSummary: articles.aiSummary,
      status: articles.status,
      voteScore: articles.voteScore,
      viewCount: articles.viewCount,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      authorId: articles.authorId,
      authorName: users.name,
      authorImage: users.image,
      authorUsername: users.username,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  const article = result[0];
  if (!article || article.status !== "published") notFound();

  // Fire-and-forget view count bump — don't block render on it. Atomic
  // `view_count + 1` in SQL avoids races between concurrent views.
  void db
    .update(articles)
    .set({ viewCount: sql`${articles.viewCount} + 1` })
    .where(eq(articles.id, article.id))
    .catch((err) => console.error("Failed to increment article view count:", err));

  const contentHtml = await renderMarkdown(article.content);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/articles"
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
      >
        &larr; Back to articles
      </Link>

      <article className="mt-6 flex gap-6">
        <div className="hidden sm:block">
          <VoteButtons
            targetType="article"
            targetId={article.id}
            initialScore={article.voteScore}
            canVote={!!session?.user}
          />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
            {article.title}
          </h1>

          <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span>by {article.authorName ?? article.authorUsername ?? "Anonymous"}</span>
            <span>{timeAgo(article.publishedAt ?? article.createdAt)}</span>
            <span>{article.viewCount} views</span>
          </div>

        {article.aiSummary && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              AI Summary
            </p>
            <p className="mt-1 text-sm text-blue-900 dark:text-blue-200">
              {article.aiSummary}
            </p>
          </div>
        )}

          <div
            className="prose prose-slate mt-8 max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </div>
      </article>
    </div>
  );
}
