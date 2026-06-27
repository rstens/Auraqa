"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ToolActions({ slug, currentStatus }: { slug: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doAction(action: string, body?: Record<string, unknown>) {
    setLoading(action);
    setError(null);
    try {
      const method = action === "delete" ? "DELETE" : "PUT";
      const res = await fetch(`/api/admin/tools/${slug}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Action failed";
        try { msg = JSON.parse(text).error ?? msg; } catch {}
        throw new Error(msg);
      }
      if (action === "delete") {
        router.push("/admin/tools");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div data-testid="tool-actions" className="space-y-4">
      {error && (
        <div data-testid="tool-actions-error" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {currentStatus !== "approved" && (
          <button
            data-testid="action-approve-tool"
            disabled={loading !== null}
            onClick={() => doAction("approve", { status: "approved" })}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
          >
            {loading === "approve" ? "Approving..." : "Approve"}
          </button>
        )}

        {currentStatus !== "rejected" && (
          <button
            data-testid="action-reject-tool"
            disabled={loading !== null}
            onClick={() => doAction("reject", { status: "rejected" })}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-amber-700 disabled:opacity-50"
          >
            {loading === "reject" ? "Rejecting..." : "Reject"}
          </button>
        )}

        <button
          data-testid="action-delete-tool"
          disabled={loading !== null}
          onClick={() => {
            if (confirm("Delete this tool permanently?")) {
              doAction("delete");
            }
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading === "delete" ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  );
}
