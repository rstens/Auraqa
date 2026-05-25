import { db } from "@/db";
import { users, articles, tools, forumThreads, forumReplies, aiInteractions } from "@/db/schema";
import { count, eq, sum, desc } from "drizzle-orm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [
    userStats,
    publishedArticles,
    draftArticles,
    approvedTools,
    pendingTools,
    threadCount,
    replyCount,
    aiStats,
    pendingToolsList,
    draftArticlesList,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(articles).where(eq(articles.status, "published")),
    db.select({ total: count() }).from(articles).where(eq(articles.status, "draft")),
    db.select({ total: count() }).from(tools).where(eq(tools.status, "approved")),
    db.select({ total: count() }).from(tools).where(eq(tools.status, "pending")),
    db.select({ total: count() }).from(forumThreads),
    db.select({ total: count() }).from(forumReplies),
    db.select({
      total: count(),
      inputTokens: sum(aiInteractions.inputTokens),
      outputTokens: sum(aiInteractions.outputTokens),
    }).from(aiInteractions),
    db.select({ id: tools.id, name: tools.name, slug: tools.slug })
      .from(tools).where(eq(tools.status, "pending")).orderBy(desc(tools.createdAt)).limit(5),
    db.select({ id: articles.id, title: articles.title, slug: articles.slug })
      .from(articles).where(eq(articles.status, "draft")).orderBy(desc(articles.createdAt)).limit(5),
  ]);

  return (
    <div data-testid="admin-dashboard">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>

      <div data-testid="admin-stats" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard testId="stat-users" label="Users" value={userStats[0].total} />
        <StatCard testId="stat-articles" label="Articles" value={`${publishedArticles[0].total} published / ${draftArticles[0].total} drafts`} />
        <StatCard testId="stat-tools" label="Tools" value={`${approvedTools[0].total} approved / ${pendingTools[0].total} pending`} highlight={pendingTools[0].total > 0} />
        <StatCard testId="stat-forum" label="Forum" value={`${threadCount[0].total} threads / ${replyCount[0].total} replies`} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard testId="stat-ai" label="AI Usage" value={`${aiStats[0].total} calls / ${Number(aiStats[0].inputTokens ?? 0) + Number(aiStats[0].outputTokens ?? 0)} tokens`} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div data-testid="pending-tools-section">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Pending Tools
            {pendingTools[0].total > 0 && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {pendingTools[0].total}
              </span>
            )}
          </h2>
          {pendingToolsList.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No pending tools.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {pendingToolsList.map((tool) => (
                <li key={tool.id}>
                  <Link
                    href={`/admin/tools/${tool.slug}`}
                    data-testid={`pending-tool-${tool.slug}`}
                    className="block rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/20 dark:text-white dark:hover:bg-amber-900/30"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
              {pendingTools[0].total > 5 && (
                <li>
                  <Link href="/admin/tools?status=pending" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    View all {pendingTools[0].total} pending &rarr;
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>

        <div data-testid="draft-articles-section">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Draft Articles
            {draftArticles[0].total > 0 && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                {draftArticles[0].total}
              </span>
            )}
          </h2>
          {draftArticlesList.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No draft articles.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {draftArticlesList.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/admin/articles/${article.slug}`}
                    data-testid={`draft-article-${article.slug}`}
                    className="block rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                  >
                    {article.title}
                  </Link>
                </li>
              ))}
              {draftArticles[0].total > 5 && (
                <li>
                  <Link href="/admin/articles?status=draft" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
                    View all {draftArticles[0].total} drafts &rarr;
                  </Link>
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight, testId }: { label: string; value: string | number; highlight?: boolean; testId: string }) {
  return (
    <div
      data-testid={testId}
      className={`rounded-lg border p-5 ${
        highlight
          ? "border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-900/20"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800"
      }`}
    >
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
