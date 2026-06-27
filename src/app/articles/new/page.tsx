/**
 * Create article page.
 *
 * Protected page that renders a Markdown editor for writing new articles.
 * Requires authentication.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArticleForm } from "@/components/articles/article-form";

export default async function NewArticlePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Write an Article</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Share your knowledge with the testing community
      </p>
      <div className="mt-8">
        <ArticleForm />
      </div>
    </div>
  );
}
