import { db } from "@/db";
import { users, articles, forumThreads, forumReplies } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { UserActions } from "@/components/admin/user-actions";

export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  const user = result[0];
  if (!user) notFound();

  const [articleCount, threadCount, replyCount] = await Promise.all([
    db.select({ total: count() }).from(articles).where(eq(articles.authorId, id)),
    db.select({ total: count() }).from(forumThreads).where(eq(forumThreads.authorId, id)),
    db.select({ total: count() }).from(forumReplies).where(eq(forumReplies.authorId, id)),
  ]);

  const isCurrentUser = session?.user?.id === id;

  return (
    <div data-testid="admin-user-detail">
      <Link href="/admin/users" data-testid="back-to-admin-users" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
        &larr; All users
      </Link>

      <div className="mt-4 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-medium text-white">
          {(user.name ?? user.username ?? "U")[0].toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{user.name ?? user.username ?? "Unknown"}</h1>
            <span className={`rounded px-2 py-0.5 text-xs font-medium ${
              user.role === "admin"
                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
            }`}>{user.role}</span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            @{user.username ?? "—"} &middot; {user.email} &middot; Joined {timeAgo(user.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <UserActions userId={id} currentRole={user.role} isCurrentUser={isCurrentUser} />
      </div>

      <div data-testid="user-stats" className="mt-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Reputation</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{user.reputation}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Articles</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{articleCount[0].total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Threads</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{threadCount[0].total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Replies</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{replyCount[0].total}</p>
        </div>
      </div>

      {user.bio && (
        <div className="mt-6">
          <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">Bio</h2>
          <p className="mt-1 text-slate-900 dark:text-white">{user.bio}</p>
        </div>
      )}
    </div>
  );
}
