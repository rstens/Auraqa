/**
 * Thread creation form.
 *
 * Client component for posting a new forum thread.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ThreadForm({
  categoryId,
}: {
  categoryId: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/forum/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.get("title"),
          content: formData.get("content"),
          categoryId,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to create thread");
      }

      const thread = await res.json();
      router.push(`/forum/thread/${thread.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          placeholder="What's your question?"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Content (Markdown)
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={10}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          placeholder="Describe your question or discussion topic..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post Thread"}
      </button>
    </form>
  );
}
