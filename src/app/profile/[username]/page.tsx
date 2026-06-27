/**
 * Public user profile page.
 *
 * Shows the user's basic info plus their published articles and recent
 * forum threads. Activity scoped to public content only.
 */

export const dynamic = "force-dynamic";

import { db } from "@/db";
import { users, articles, forumThreads } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { UserAvatar } from "@/components/shared/user-avatar";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const userResult = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      image: users.image,
      bio: users.bio,
      reputation: users.reputation,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  const user = userResult[0];
  if (!user) notFound();

  // Pull a few recent items in parallel.
  const [userArticles, userThreads] = await Promise.all([
    db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        publishedAt: articles.publishedAt,
        voteScore: articles.voteScore,
      })
      .from(articles)
      .where(and(eq(articles.authorId, user.id), eq(articles.status, "published")))
      .orderBy(desc(articles.publishedAt))
      .limit(10),
    db
      .select({
        id: forumThreads.id,
        title: forumThreads.title,
        createdAt: forumThreads.createdAt,
        replyCount: forumThreads.replyCount,
      })
      .from(forumThreads)
      .where(eq(forumThreads.authorId, user.id))
      .orderBy(desc(forumThreads.createdAt))
      .limit(10),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex items-center gap-4">
        <UserAvatar
          src={user.image}
          name={user.name ?? user.username}
          size="lg"
        />
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {user.name ?? user.username}
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            @{user.username} · {user.reputation} reputation · joined {timeAgo(user.createdAt)}
            {user.role !== "user" && (
              <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                {user.role}
              </span>
            )}
          </p>
        </div>
      </header>

      {user.bio && (
        <p className="mt-4 text-slate-700 dark:text-slate-300">{user.bio}</p>
      )}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Articles
        </h2>
        {userArticles.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No published articles yet.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {userArticles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/articles/${a.slug}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {a.title}
                </Link>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {a.voteScore} votes · {timeAgo(a.publishedAt ?? new Date())}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Forum Threads
        </h2>
        {userThreads.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            No forum threads yet.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {userThreads.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/forum/thread/${t.id}`}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {t.title}
                </Link>
                <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">
                  {t.replyCount} replies · {timeAgo(t.createdAt)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
