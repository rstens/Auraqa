"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SettingsForm({
  initialData,
}: {
  initialData: { name: string; username: string; bio: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          username: formData.get("username"),
          bio: formData.get("bio"),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed to update profile";
        try {
          msg = JSON.parse(text).error ?? msg;
        } catch {}
        throw new Error(msg);
      }

      setSuccess(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form data-testid="settings-form" onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div
          data-testid="settings-form-error"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          data-testid="settings-form-success"
          className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400"
        >
          Profile updated successfully.
        </div>
      )}

      <div>
        <label
          htmlFor="settings-name"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Display Name
        </label>
        <input
          id="settings-name"
          name="name"
          type="text"
          required
          defaultValue={initialData.name}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="settings-username"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Username
        </label>
        <input
          id="settings-username"
          name="username"
          type="text"
          required
          defaultValue={initialData.username}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>

      <div>
        <label
          htmlFor="settings-bio"
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          Bio
        </label>
        <textarea
          id="settings-bio"
          name="bio"
          rows={4}
          defaultValue={initialData.bio}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          placeholder="Tell the community about yourself..."
        />
      </div>

      <button
        data-testid="settings-submit-button"
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
