/**
 * Create new forum thread page.
 *
 * Protected page for posting a new thread in a specific category.
 */

import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/db";
import { forumCategories } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ThreadForm } from "@/components/forum/thread-form";

export const dynamic = "force-dynamic";

export default async function NewThreadPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { category: categorySlug } = await params;
  const catResult = await db
    .select()
    .from(forumCategories)
    .where(eq(forumCategories.slug, categorySlug))
    .limit(1);

  if (catResult.length === 0) notFound();
  const cat = catResult[0];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
        New Thread in {cat.name}
      </h1>
      <div className="mt-8">
        <ThreadForm categoryId={cat.id} />
      </div>
    </div>
  );
}
