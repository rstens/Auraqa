/**
 * Forum categories page.
 *
 * Lists all forum categories with descriptions and thread counts.
 */

// This route queries the DB at request time; opt out of static prerendering
// so `next build` succeeds without a live database connection.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { forumCategories, forumThreads } from "@/db/schema";
import { eq, count, asc } from "drizzle-orm";

export default async function ForumPage() {
  const categories = await db
    .select({
      id: forumCategories.id,
      name: forumCategories.name,
      slug: forumCategories.slug,
      description: forumCategories.description,
      threadCount: count(forumThreads.id),
    })
    .from(forumCategories)
    .leftJoin(forumThreads, eq(forumCategories.id, forumThreads.categoryId))
    .groupBy(forumCategories.id)
    .orderBy(asc(forumCategories.sortOrder));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        Community Forum
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Ask questions, share experiences, and connect with fellow testers
      </p>

      <div className="mt-8 space-y-3">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/forum/${cat.slug}`}
            className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
          >
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                {cat.name}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {cat.description}
              </p>
            </div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {cat.threadCount} {cat.threadCount === 1 ? "thread" : "threads"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
