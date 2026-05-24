import Link from "next/link";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";

export default async function AdminUsersPage() {
  const userList = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      role: users.role,
      reputation: users.reputation,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(100);

  return (
    <div data-testid="admin-users-page">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Users</h1>

      <div data-testid="admin-users-list" className="mt-6 space-y-2">
        {userList.length === 0 ? (
          <p data-testid="admin-users-empty" className="py-12 text-center text-slate-500 dark:text-slate-400">No users found.</p>
        ) : (
          userList.map((user) => (
            <Link
              key={user.id}
              href={`/admin/users/${user.id}`}
              data-testid={`admin-user-${user.username ?? user.id}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-medium text-white">
                  {(user.name ?? user.username ?? "U")[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {user.name ?? user.username ?? "Unknown"}
                    </span>
                    <RoleBadge role={user.role} />
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {user.email} &middot; rep {user.reputation} &middot; joined {timeAgo(user.createdAt)}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles = role === "admin"
    ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles}`}>{role}</span>;
}
