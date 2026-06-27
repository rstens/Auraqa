"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/glossary-data";

interface DbGlossaryTerm {
  id: string;
  term: string;
  abbreviation: string | null;
  definition: string;
  category: string;
  relatedTerms: unknown;
  seeAlso: unknown;
}

export function GlossaryAdmin({ initialTerms }: { initialTerms: DbGlossaryTerm[] }) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const filtered = search.trim()
    ? initialTerms.filter(
        (t) =>
          t.term.toLowerCase().includes(search.toLowerCase()) ||
          (t.abbreviation && t.abbreviation.toLowerCase().includes(search.toLowerCase())),
      )
    : initialTerms;

  async function handleDelete(id: string, term: string) {
    if (!confirm(`Delete "${term}" permanently?`)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/glossary/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed to delete";
        try {
          msg = JSON.parse(text).error ?? msg;
        } catch {}
        throw new Error(msg);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div data-testid="glossary-admin" className="space-y-4">
      {error && (
        <div
          data-testid="glossary-admin-error"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          data-testid="glossary-admin-search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter terms..."
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
        <button
          data-testid="glossary-add-button"
          onClick={() => {
            setShowAdd(!showAdd);
            setEditingId(null);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          {showAdd ? "Cancel" : "Add Term"}
        </button>
      </div>

      {showAdd && (
        <GlossaryForm
          onDone={() => {
            setShowAdd(false);
            router.refresh();
          }}
          onError={setError}
        />
      )}

      <div data-testid="glossary-admin-list" className="space-y-2">
        {filtered.map((term) => (
          <div
            key={term.id}
            data-testid={`glossary-admin-term-${term.id}`}
            className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
          >
            {editingId === term.id ? (
              <GlossaryForm
                initial={term}
                onDone={() => {
                  setEditingId(null);
                  router.refresh();
                }}
                onError={setError}
              />
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">{term.term}</span>
                    {term.abbreviation && (
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        {term.abbreviation}
                      </span>
                    )}
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {term.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                    {term.definition}
                  </p>
                </div>
                <div className="ml-4 flex shrink-0 gap-2">
                  <button
                    data-testid={`glossary-edit-${term.id}`}
                    onClick={() => {
                      setEditingId(term.id);
                      setShowAdd(false);
                    }}
                    className="rounded px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    Edit
                  </button>
                  <button
                    data-testid={`glossary-delete-${term.id}`}
                    disabled={loading}
                    onClick={() => handleDelete(term.id, term.term)}
                    className="rounded px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function GlossaryForm({
  initial,
  onDone,
  onError,
}: {
  initial?: DbGlossaryTerm;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    const body = {
      term: formData.get("term") as string,
      abbreviation: (formData.get("abbreviation") as string) || null,
      definition: formData.get("definition") as string,
      category: formData.get("category") as string,
    };

    try {
      const url = initial ? `/api/admin/glossary/${initial.id}` : "/api/admin/glossary";
      const method = initial ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const text = await res.text();
        let msg = "Failed to save term";
        try {
          msg = JSON.parse(text).error ?? msg;
        } catch {}
        throw new Error(msg);
      }
      onDone();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      data-testid="glossary-term-form"
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20"
    >
      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Term
          </label>
          <input
            name="term"
            required
            defaultValue={initial?.term}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Abbreviation
          </label>
          <input
            name="abbreviation"
            defaultValue={initial?.abbreviation ?? ""}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
            Category
          </label>
          <select
            name="category"
            required
            defaultValue={initial?.category ?? "fundamentals"}
            className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300">
          Definition
        </label>
        <textarea
          name="definition"
          required
          rows={3}
          defaultValue={initial?.definition}
          className="mt-1 block w-full rounded border border-slate-300 px-2 py-1.5 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-white"
        />
      </div>
      <div className="flex gap-2">
        <button
          data-testid="glossary-form-submit"
          type="submit"
          disabled={loading}
          className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : initial ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={onDone}
          className="rounded-lg px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
