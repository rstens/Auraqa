/**
 * Article detail page.
 *
 * Server Component that renders a single article with full Markdown content,
 * author info, and metadata.
 */

import { db } from "@/db";
import { articles, users, articleTags, tags } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { auth, isAdmin } from "@/lib/auth";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

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
  if (!article) notFound();

  const session = await auth();
  const isAuthor = session?.user?.id === article.authorId;
  const admin = await isAdmin();
  if (article.status !== "published" && !isAuthor && !admin) notFound();

  const contentHtml = await renderMarkdown(article.content);
  const aiSummaryHtml = article.aiSummary ? await renderMarkdown(article.aiSummary) : null;

  const articleTagList = await db
    .select({ name: tags.name })
    .from(articleTags)
    .innerJoin(tags, eq(articleTags.tagId, tags.id))
    .where(eq(articleTags.articleId, article.id));

  return (
    <div data-testid="article-detail" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/articles"
        data-testid="back-to-articles"
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
      >
        &larr; Back to articles
      </Link>

      {article.status !== "published" && (
        <div data-testid="draft-banner" className="mt-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
          This article is a <strong>draft</strong> and only visible to you.
        </div>
      )}

      <article className="mt-6">
        <h1 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white sm:text-4xl">
          {article.title}
        </h1>

        <div className="mt-4 flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <span>by {article.authorName ?? article.authorUsername ?? "Anonymous"}</span>
          <span>{timeAgo(article.publishedAt ?? article.createdAt)}</span>
          <span>{article.voteScore} votes</span>
          <span>{article.viewCount} views</span>
        </div>

        {articleTagList.length > 0 && (
          <div data-testid="article-tags" className="mt-3 flex flex-wrap gap-2">
            {articleTagList.map((tag) => (
              <span key={tag.name} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {aiSummaryHtml && (
          <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
              AI Summary
            </p>
            <div
              className="prose prose-sm mt-1 max-w-none text-blue-900 dark:text-blue-200"
              dangerouslySetInnerHTML={{ __html: aiSummaryHtml }}
            />
          </div>
        )}

        <div
          data-testid="article-content"
          className="prose prose-slate mt-8 max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />
      </article>
    </div>
  );
}
