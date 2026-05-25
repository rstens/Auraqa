import { db } from "@/db";
import { users, articles, forumThreads, forumReplies } from "@/db/schema";
import { eq, count, desc, ilike } from "drizzle-orm";
import { notFound } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      reputation: users.reputation,
      role: users.role,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(ilike(users.username, username))
    .limit(1);

  const user = result[0];
  if (!user) notFound();

  const [articleList, articleCount, threadCount, replyCount] = await Promise.all([
    db
      .select({ id: articles.id, title: articles.title, slug: articles.slug, publishedAt: articles.publishedAt })
      .from(articles)
      .where(eq(articles.authorId, user.id))
      .orderBy(desc(articles.publishedAt))
      .limit(5),
    db.select({ total: count() }).from(articles).where(eq(articles.authorId, user.id)),
    db.select({ total: count() }).from(forumThreads).where(eq(forumThreads.authorId, user.id)),
    db.select({ total: count() }).from(forumReplies).where(eq(forumReplies.authorId, user.id)),
  ]);

  return (
    <div data-testid="profile-page" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-medium text-white">
          {(user.name ?? user.username ?? "U")[0].toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user.name ?? user.username}
            </h1>
            {user.role === "admin" && (
              <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                admin
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            @{user.username} &middot; Joined {timeAgo(user.createdAt)}
          </p>
        </div>
      </div>

      {user.bio && (
        <p data-testid="profile-bio" className="mt-4 text-slate-700 dark:text-slate-300">{user.bio}</p>
      )}

      <div data-testid="profile-stats" className="mt-6 grid gap-4 sm:grid-cols-4">
        <StatBox label="Reputation" value={user.reputation} />
        <StatBox label="Articles" value={articleCount[0].total} />
        <StatBox label="Threads" value={threadCount[0].total} />
        <StatBox label="Replies" value={replyCount[0].total} />
      </div>

      {articleList.length > 0 && (
        <div data-testid="profile-articles" className="mt-8">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Articles</h2>
          <div className="mt-3 space-y-2">
            {articleList.map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                data-testid={`profile-article-${article.slug}`}
                className="block rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
              >
                {article.title}
                {article.publishedAt && (
                  <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{timeAgo(article.publishedAt)}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 text-center dark:border-slate-700 dark:bg-slate-800">
      <p className="text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
