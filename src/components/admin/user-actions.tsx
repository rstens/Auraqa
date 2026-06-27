"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function UserActions({
  userId,
  currentRole,
  isCurrentUser,
}: {
  userId: string;
  currentRole: string;
  isCurrentUser: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function changeRole(role: string) {
    setLoading("role");
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed to update role";
        try {
          msg = JSON.parse(text).error ?? msg;
        } catch {}
        throw new Error(msg);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  async function deleteUser() {
    if (!confirm("Delete this user permanently? All their content will be affected.")) return;
    setLoading("delete");
    setError(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed to delete user";
        try {
          msg = JSON.parse(text).error ?? msg;
        } catch {}
        throw new Error(msg);
      }
      router.push("/admin/users");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div data-testid="user-actions" className="space-y-4">
      {error && (
        <div
          data-testid="user-actions-error"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role:</label>
        <select
          data-testid="user-role-select"
          value={currentRole}
          disabled={isCurrentUser || loading !== null}
          onChange={(e) => changeRole(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        >
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        {loading === "role" && <span className="text-sm text-slate-500">Saving...</span>}

        <button
          data-testid="action-delete-user"
          disabled={isCurrentUser || loading !== null}
          onClick={deleteUser}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
        >
          {loading === "delete" ? "Deleting..." : "Delete User"}
        </button>

        {isCurrentUser && (
          <span className="text-xs text-slate-500 dark:text-slate-400">(This is your account)</span>
        )}
      </div>
    </div>
  );
}
