import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { ArticleActions } from "@/components/admin/article-actions";

export const dynamic = "force-dynamic";

export default async function AdminArticleDetailPage({
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
      authorName: users.name,
      authorUsername: users.username,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.slug, slug))
    .limit(1);

  const article = result[0];
  if (!article) notFound();

  const contentHtml = await renderMarkdown(article.content);

  return (
    <div data-testid="admin-article-detail">
      <Link href="/admin/articles" data-testid="back-to-admin-articles" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
        &larr; All articles
      </Link>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{article.title}</h1>
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${
            article.status === "published"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
          }`}>
            {article.status}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          by {article.authorName ?? article.authorUsername ?? "Anonymous"} &middot; Created {timeAgo(article.createdAt)}
          {article.publishedAt && ` · Published ${timeAgo(article.publishedAt)}`}
          &middot; {article.voteScore} votes &middot; {article.viewCount} views
        </div>
      </div>

      <div className="mt-6">
        <ArticleActions slug={slug} currentStatus={article.status} />
      </div>

      {article.aiSummary && (
        <div data-testid="article-ai-summary" className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400">AI Summary</p>
          <p className="mt-1 text-sm text-blue-900 dark:text-blue-200">{article.aiSummary}</p>
        </div>
      )}

      {article.summary && (
        <div data-testid="article-summary" className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Author Summary</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{article.summary}</p>
        </div>
      )}

      <div
        data-testid="admin-article-content"
        className="prose prose-slate mt-8 max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
