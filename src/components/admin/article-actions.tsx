"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ArticleActions({ slug, currentStatus }: { slug: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [suggestedTags, setSuggestedTags] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doAction(action: string, method = "PUT", body?: Record<string, unknown>) {
    setLoading(action);
    setError(null);
    try {
      const url = action.startsWith("ai-")
        ? `/api/admin/articles/${slug}/ai`
        : `/api/admin/articles/${slug}`;
      const res = await fetch(url, {
        method: action.startsWith("ai-") ? "POST" : method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Action failed";
        try {
          msg = JSON.parse(text).error ?? msg;
        } catch {}
        throw new Error(msg);
      }
      if (action === "delete") {
        router.push("/admin/articles");
        return;
      }
      const data = await res.json();
      if (action === "ai-suggest-tags" && data.tags) {
        setSuggestedTags(data.tags);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div data-testid="article-actions" className="space-y-4">
      {error && (
        <div
          data-testid="article-actions-error"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {currentStatus === "draft" ? (
          <button
            data-testid="action-publish"
            disabled={loading !== null}
            onClick={() => doAction("publish", "PUT", { status: "published" })}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {loading === "publish" ? "Publishing..." : "Publish"}
          </button>
        ) : (
          <button
            data-testid="action-unpublish"
            disabled={loading !== null}
            onClick={() => doAction("unpublish", "PUT", { status: "draft" })}
            className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            {loading === "unpublish" ? "Unpublishing..." : "Unpublish"}
          </button>
        )}

        <button
          data-testid="action-delete"
          disabled={loading !== null}
          onClick={() => {
            if (confirm("Delete this article permanently?")) {
              doAction("delete", "DELETE");
            }
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading === "delete" ? "Deleting..." : "Delete"}
        </button>

        <button
          data-testid="action-ai-summarize"
          disabled={loading !== null}
          onClick={() => doAction("ai-summarize", "POST", { action: "summarize" })}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading === "ai-summarize" ? "Summarizing..." : "AI Summarize"}
        </button>

        <button
          data-testid="action-ai-suggest-tags"
          disabled={loading !== null}
          onClick={() => doAction("ai-suggest-tags", "POST", { action: "suggest-tags" })}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading === "ai-suggest-tags" ? "Suggesting..." : "AI Suggest Tags"}
        </button>
      </div>

      {suggestedTags && (
        <div
          data-testid="ai-tags-result"
          className="rounded-lg border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-800 dark:bg-indigo-900/20"
        >
          <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400">Suggested Tags</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestedTags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
