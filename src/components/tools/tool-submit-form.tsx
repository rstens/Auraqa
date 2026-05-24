/**
 * Tool submission form.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ToolSubmitForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          description: formData.get("description"),
          websiteUrl: formData.get("websiteUrl") || undefined,
          category: formData.get("category") || undefined,
          pricing: formData.get("pricing"),
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to submit tool");
      }

      const tool = await res.json();
      router.push(`/tools/${tool.slug}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form data-testid="tool-submit-form" onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div data-testid="tool-submit-error" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tool Name</label>
        <input id="name" name="name" type="text" required className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="e.g., Playwright" />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
        <textarea id="description" name="description" required rows={4} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="What does this tool do? What testing scenarios is it best for?" />
      </div>

      <div>
        <label htmlFor="websiteUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Website URL (optional)</label>
        <input id="websiteUrl" name="websiteUrl" type="url" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="https://playwright.dev" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
          <select id="category" name="category" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            <option value="">Select...</option>
            <option value="unit">Unit Testing</option>
            <option value="integration">Integration Testing</option>
            <option value="e2e">E2E Testing</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
            <option value="api">API Testing</option>
            <option value="mobile">Mobile Testing</option>
            <option value="accessibility">Accessibility</option>
            <option value="visual">Visual Testing</option>
            <option value="management">Test Management</option>
            <option value="ci-cd">CI/CD</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label htmlFor="pricing" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Pricing</label>
          <select id="pricing" name="pricing" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
            <option value="unknown">Unknown</option>
            <option value="free">Free</option>
            <option value="open-source">Open Source</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
          </select>
        </div>
      </div>

      <button data-testid="tool-submit-button" type="submit" disabled={loading} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50">
        {loading ? "Submitting..." : "Submit Tool"}
      </button>
    </form>
  );
}
