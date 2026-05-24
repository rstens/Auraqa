/**
 * Articles listing page.
 *
 * Server Component that fetches and displays published articles
 * with pagination. Links to article detail pages.
 */

import Link from "next/link";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";

export default async function ArticlesPage() {
  const articleList = await db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      summary: articles.summary,
      aiSummary: articles.aiSummary,
      status: articles.status,
      voteScore: articles.voteScore,
      viewCount: articles.viewCount,
      publishedAt: articles.publishedAt,
      createdAt: articles.createdAt,
      authorName: users.name,
      authorImage: users.image,
      authorUsername: users.username,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(20);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Knowledge Base
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Articles on testing methodologies, tools, and best practices
          </p>
        </div>
        <Link
          href="/articles/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Write Article
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {articleList.length === 0 ? (
          <p className="py-12 text-center text-slate-500 dark:text-slate-400">
            No articles yet. Be the first to write one!
          </p>
        ) : (
          articleList.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))
        )}
      </div>
    </div>
  );
}

function ArticleCard({
  article,
}: {
  article: {
    id: string;
    title: string;
    slug: string;
    summary: string | null;
    aiSummary: string | null;
    voteScore: number;
    viewCount: number;
    publishedAt: Date | null;
    createdAt: Date;
    authorName: string | null;
    authorUsername: string | null;
  };
}) {
  const displaySummary = article.aiSummary ?? article.summary;

  return (
    <Link
      href={`/articles/${article.slug}`}
      className="block rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
    >
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
        {article.title}
      </h2>
      {displaySummary && (
        <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {displaySummary}
        </p>
      )}
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span>by {article.authorName ?? article.authorUsername ?? "Anonymous"}</span>
        <span>{timeAgo(article.publishedAt ?? article.createdAt)}</span>
        <span>{article.voteScore} votes</span>
        <span>{article.viewCount} views</span>
      </div>
    </Link>
  );
}
