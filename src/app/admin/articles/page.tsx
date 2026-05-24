import Link from "next/link";
import { db } from "@/db";
import { articles, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";

export default async function AdminArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let query = db
    .select({
      id: articles.id,
      title: articles.title,
      slug: articles.slug,
      status: articles.status,
      createdAt: articles.createdAt,
      publishedAt: articles.publishedAt,
      authorName: users.name,
      authorUsername: users.username,
    })
    .from(articles)
    .leftJoin(users, eq(articles.authorId, users.id))
    .orderBy(desc(articles.createdAt))
    .limit(100);

  if (status === "draft" || status === "published") {
    query = query.where(eq(articles.status, status)) as typeof query;
  }

  const articleList = await query;

  return (
    <div data-testid="admin-articles-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Articles</h1>
        <div data-testid="article-status-filters" className="flex gap-2">
          <FilterLink href="/admin/articles" label="All" active={!status} />
          <FilterLink href="/admin/articles?status=published" label="Published" active={status === "published"} />
          <FilterLink href="/admin/articles?status=draft" label="Drafts" active={status === "draft"} />
        </div>
      </div>

      <div data-testid="admin-articles-list" className="mt-6 space-y-2">
        {articleList.length === 0 ? (
          <p data-testid="admin-articles-empty" className="py-12 text-center text-slate-500 dark:text-slate-400">No articles found.</p>
        ) : (
          articleList.map((article) => (
            <Link
              key={article.id}
              href={`/admin/articles/${article.slug}`}
              data-testid={`admin-article-${article.slug}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={article.status} />
                  <span className="font-medium text-slate-900 dark:text-white">{article.title}</span>
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  by {article.authorName ?? article.authorUsername ?? "Anonymous"} &middot; {timeAgo(article.createdAt)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = status === "published"
    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles}`}>{status}</span>;
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </Link>
  );
}
