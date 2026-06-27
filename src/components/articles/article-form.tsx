/**
 * Article creation/editing form.
 *
 * Client component with a title input, Markdown textarea, and
 * status selector (draft/published). Submits via server action.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArticleForm({
  initialData,
}: {
  initialData?: {
    title: string;
    content: string;
    summary: string;
    status: string;
    slug?: string;
  };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEdit = !!initialData?.slug;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      summary: formData.get("summary") as string,
      status: formData.get("status") as string,
    };

    try {
      const url = isEdit ? `/api/articles/${initialData!.slug}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to save article";
        try {
          message = JSON.parse(text).error ?? message;
        } catch {}
        throw new Error(message);
      }

      const article = await res.json();
      router.push(`/articles/${article.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form data-testid="article-form" onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          data-testid="article-form-error"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          defaultValue={initialData?.title}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          placeholder="e.g., Getting Started with Playwright E2E Testing"
        />
      </div>

      <div>
        <label
          htmlFor="summary"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Summary (optional)
        </label>
        <input
          id="summary"
          name="summary"
          type="text"
          defaultValue={initialData?.summary}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          placeholder="Brief description of your article"
        />
      </div>

      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Content (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={20}
          defaultValue={initialData?.content}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          placeholder="Write your article in Markdown..."
        />
      </div>

      <div className="flex items-center gap-4">
        <select
          data-testid="article-status-select"
          name="status"
          defaultValue={initialData?.status ?? "draft"}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="draft">Save as Draft</option>
          <option value="published">Publish</option>
        </select>

        <button
          data-testid="article-submit-button"
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
        </button>
      </div>
    </form>
  );
}
