/**
 * Reply form for forum threads.
 *
 * Client component for posting replies to a thread.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/forum/threads/${threadId}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: formData.get("content"),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let message = "Failed to post reply";
        try {
          message = JSON.parse(text).error ?? message;
        } catch {}
        throw new Error(message);
      }

      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form data-testid="reply-form" onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          data-testid="reply-form-error"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <textarea
        data-testid="reply-content"
        name="content"
        required
        rows={5}
        className="block w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        placeholder="Write your reply in Markdown..."
      />

      <button
        data-testid="reply-submit-button"
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Posting..." : "Post Reply"}
      </button>
    </form>
  );
}
