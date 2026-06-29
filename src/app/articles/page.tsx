/**
 * Articles listing page.
 *
 * Server Component that fetches and displays published articles
 * with pagination. Links to article detail pages.
 */

// Opt out of static prerendering so `next build` succeeds without a live DB.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { articles, users, articleTags, tags } from "@/db/schema";
import { desc, eq, count, inArray } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";
import { renderMarkdown } from "@/lib/markdown";

const PAGE_SIZE = 20;

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // Total published count drives the page math. Clamp the requested page into
  // [1, totalPages] so an out-of-range ?page= lands on the last page instead of
  // an empty list.
  const [{ value: total }] = await db
    .select({ value: count() })
    .from(articles)
    .where(eq(articles.status, "published"));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Number.parseInt((await searchParams).page ?? "1", 10);
  const page = Math.min(Math.max(Number.isNaN(requestedPage) ? 1 : requestedPage, 1), totalPages);
  const offset = (page - 1) * PAGE_SIZE;

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
    .limit(PAGE_SIZE)
    .offset(offset);

  // Scope the tag lookup to the articles actually on this page.
  const pageArticleIds = articleList.map((a) => a.id);
  const allArticleTags = pageArticleIds.length
    ? await db
        .select({ articleId: articleTags.articleId, tagName: tags.name })
        .from(articleTags)
        .innerJoin(tags, eq(articleTags.tagId, tags.id))
        .where(inArray(articleTags.articleId, pageArticleIds))
    : [];

  const tagsByArticle = new Map<string, string[]>();
  for (const row of allArticleTags) {
    const list = tagsByArticle.get(row.articleId) ?? [];
    list.push(row.tagName);
    tagsByArticle.set(row.articleId, list);
  }

  return (
    <div data-testid="articles-page" className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Knowledge Base</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Articles on testing methodologies, tools, and best practices
          </p>
        </div>
        <Link
          href="/articles/new"
          data-testid="write-article-link"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Write Article
        </Link>
      </div>

      <div data-testid="articles-list" className="mt-8 space-y-4">
        {articleList.length === 0 ? (
          <p
            data-testid="articles-empty"
            className="py-12 text-center text-slate-500 dark:text-slate-400"
          >
            No articles yet. Be the first to write one!
          </p>
        ) : (
          articleList.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              tags={tagsByArticle.get(article.id) ?? []}
            />
          ))
        )}
      </div>

      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </div>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const linkClass =
    "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800";
  const disabledClass =
    "cursor-not-allowed rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-300 dark:border-slate-800 dark:text-slate-600";

  return (
    <nav
      data-testid="articles-pagination"
      aria-label="Articles pagination"
      className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-700"
    >
      {page > 1 ? (
        <Link data-testid="pagination-prev" href={`/articles?page=${page - 1}`} className={linkClass}>
          ← Previous
        </Link>
      ) : (
        <span data-testid="pagination-prev" aria-disabled="true" className={disabledClass}>
          ← Previous
        </span>
      )}

      <span data-testid="pagination-status" className="text-sm text-slate-600 dark:text-slate-400">
        Page {page} of {totalPages}
      </span>

      {page < totalPages ? (
        <Link data-testid="pagination-next" href={`/articles?page=${page + 1}`} className={linkClass}>
          Next →
        </Link>
      ) : (
        <span data-testid="pagination-next" aria-disabled="true" className={disabledClass}>
          Next →
        </span>
      )}
    </nav>
  );
}

async function ArticleCard({
  article,
  tags: articleTagNames,
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
  tags: string[];
}) {
  const displaySummary = article.aiSummary ?? article.summary;
  const summaryHtml = displaySummary ? await renderMarkdown(displaySummary) : null;

  return (
    <Link
      href={`/articles/${article.slug}`}
      data-testid={`article-card-${article.slug}`}
      className="block rounded-lg border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
    >
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{article.title}</h2>
      {summaryHtml && (
        <div
          className="prose prose-sm prose-slate mt-2 max-w-none dark:prose-invert"
          // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml -- HTML produced by renderMarkdown() which runs rehype-sanitize (src/lib/markdown.ts).
          dangerouslySetInnerHTML={{ __html: summaryHtml }}
        />
      )}
      {articleTagNames.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {articleTagNames.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
            >
              {tag}
            </span>
          ))}
        </div>
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
