"use client";

import { Suspense, useState, useMemo, useDeferredValue, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CATEGORIES, getCategoryInfo, type GlossaryCategory } from "@/lib/glossary-data";

interface GlossaryTermData {
  id: string;
  term: string;
  abbreviation: string | null;
  definition: string;
  category: string;
  relatedTerms: string[];
  seeAlso: string[];
}

function GlossaryContent({ terms }: { terms: GlossaryTermData[] }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") ?? "";
  const initialCategories = searchParams.get("category")?.split(",").filter(Boolean) as GlossaryCategory[] ?? [];
  const initialAcronyms = searchParams.get("acronyms") === "1";

  const [query, setQuery] = useState(initialQuery);
  const [activeCategories, setActiveCategories] = useState<Set<GlossaryCategory>>(new Set(initialCategories));
  const [acronymsOnly, setAcronymsOnly] = useState(initialAcronyms);
  const [expandedTermId, setExpandedTermId] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query);

  const syncUrl = useCallback((q: string, cats: Set<GlossaryCategory>, acronyms: boolean) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (cats.size > 0) params.set("category", [...cats].join(","));
    if (acronyms) params.set("acronyms", "1");
    const qs = params.toString();
    router.replace(qs ? `/glossary?${qs}` : "/glossary", { scroll: false });
  }, [router]);

  function toggleCategory(cat: GlossaryCategory) {
    const next = new Set(activeCategories);
    if (next.has(cat)) next.delete(cat); else next.add(cat);
    setActiveCategories(next);
    syncUrl(query, next, acronymsOnly);
  }

  function toggleAcronyms() {
    const next = !acronymsOnly;
    setAcronymsOnly(next);
    syncUrl(query, activeCategories, next);
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    syncUrl(value, activeCategories, acronymsOnly);
  }

  function clearSearch() {
    setQuery("");
    syncUrl("", activeCategories, acronymsOnly);
  }

  const termLookup = useMemo(() => {
    const map = new Map<string, string>();
    for (const t of terms) {
      map.set(t.term.toLowerCase(), t.id);
      if (t.abbreviation) map.set(t.abbreviation.toLowerCase(), t.id);
    }
    return map;
  }, [terms]);

  const crossRefRegex = useMemo(() => {
    const keys = [...termLookup.keys()].sort((a, b) => b.length - a.length);
    const escaped = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (escaped.length === 0) return null;
    return new RegExp(`\\b(${escaped.join("|")})\\b`, "gi");
  }, [termLookup]);

  const filteredTerms = useMemo(() => {
    let result = terms;
    if (activeCategories.size > 0) {
      result = result.filter((t) => activeCategories.has(t.category as GlossaryCategory));
    }
    if (acronymsOnly) {
      result = result.filter((t) => t.abbreviation !== null);
    }
    if (deferredQuery.trim()) {
      const q = deferredQuery.trim().toLowerCase();
      result = result.filter((t) =>
        t.term.toLowerCase().includes(q) ||
        (t.abbreviation && t.abbreviation.toLowerCase().includes(q)) ||
        t.definition.toLowerCase().includes(q)
      );
    }
    return result;
  }, [terms, deferredQuery, activeCategories, acronymsOnly]);

  function scrollToTerm(termId: string) {
    setExpandedTermId(termId);
    setTimeout(() => {
      document.getElementById(termId)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  }

  function renderDefinitionWithLinks(definition: string, currentTermId: string) {
    if (!crossRefRegex) return [definition];
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(crossRefRegex.source, crossRefRegex.flags);

    while ((match = regex.exec(definition)) !== null) {
      const targetId = termLookup.get(match[1].toLowerCase());
      if (!targetId || targetId === currentTermId) continue;
      if (match.index > lastIndex) {
        parts.push(definition.slice(lastIndex, match.index));
      }
      parts.push(
        <button
          key={`${match.index}-${targetId}`}
          data-testid={`glossary-crossref-${targetId}`}
          onClick={(e) => { e.stopPropagation(); scrollToTerm(targetId); }}
          className="text-blue-600 underline decoration-blue-300 hover:decoration-blue-600 dark:text-blue-400 dark:decoration-blue-700 dark:hover:decoration-blue-400"
        >
          {match[1]}
        </button>
      );
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < definition.length) {
      parts.push(definition.slice(lastIndex));
    }
    return parts.length > 0 ? parts : [definition];
  }

  return (
    <div data-testid="glossary-page" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ISTQB Glossary</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Industry-standard testing terminology from the International Software Testing Qualifications Board
      </p>

      <div className="mt-6">
        <div className="relative">
          <input
            data-testid="glossary-search-input"
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search terms, acronyms, or definitions..."
            className="block w-full rounded-lg border border-slate-300 px-4 py-3 pr-10 text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          />
          {query && (
            <button
              data-testid="glossary-search-clear"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              &#x2715;
            </button>
          )}
        </div>
      </div>

      <div data-testid="glossary-category-filters" className="mt-4 flex flex-wrap items-center gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategories.has(cat.id);
          return (
            <button
              key={cat.id}
              data-testid={`glossary-filter-${cat.id}`}
              onClick={() => toggleCategory(cat.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? cat.activeClasses
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
              }`}
            >
              {cat.label}
            </button>
          );
        })}
        <div className="mx-1 h-6 w-px bg-slate-300 dark:bg-slate-600" />
        <button
          data-testid="glossary-acronyms-toggle"
          onClick={toggleAcronyms}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            acronymsOnly
              ? "bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          Acronyms only
        </button>
      </div>

      <p data-testid="glossary-match-count" className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Showing {filteredTerms.length} of {terms.length} terms
      </p>

      <div data-testid="glossary-terms-list" className="mt-6 space-y-3">
        {filteredTerms.length === 0 ? (
          <p data-testid="glossary-empty" className="py-12 text-center text-slate-500 dark:text-slate-400">
            No terms match your search.
          </p>
        ) : (
          filteredTerms.map((term) => {
            const isExpanded = expandedTermId === term.id;
            const catInfo = getCategoryInfo(term.category as GlossaryCategory);
            return (
              <div
                key={term.id}
                id={term.id}
                data-testid={`glossary-term-${term.id}`}
                className={`rounded-lg border p-5 transition-all ${
                  isExpanded
                    ? "border-blue-300 bg-white shadow-md dark:border-blue-700 dark:bg-slate-800"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
                }`}
              >
                <button
                  onClick={() => setExpandedTermId(isExpanded ? null : term.id)}
                  className="flex w-full items-start justify-between text-left"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{term.term}</h2>
                    {term.abbreviation && (
                      <span data-testid={`glossary-term-abbr-${term.id}`} className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-400">
                        {term.abbreviation}
                      </span>
                    )}
                    <span data-testid={`glossary-term-category-${term.id}`} className={`rounded px-2 py-0.5 text-xs font-medium ${catInfo.badgeClasses}`}>
                      {catInfo.label}
                    </span>
                  </div>
                  <span className="ml-4 mt-1 shrink-0 text-slate-400">{isExpanded ? "▲" : "▼"}</span>
                </button>

                <div data-testid={`glossary-term-definition-${term.id}`} className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {renderDefinitionWithLinks(term.definition, term.id)}
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-3 border-t border-slate-200 pt-4 dark:border-slate-700">
                    {term.relatedTerms.length > 0 && (
                      <div data-testid={`glossary-related-${term.id}`}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Related Terms</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {term.relatedTerms.map((relId) => {
                            const rel = terms.find((t) => t.id === relId);
                            if (!rel) return null;
                            const relCat = getCategoryInfo(rel.category as GlossaryCategory);
                            return (
                              <button
                                key={relId}
                                data-testid={`glossary-related-chip-${relId}`}
                                onClick={() => scrollToTerm(relId)}
                                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition-colors hover:opacity-80 ${relCat.badgeClasses}`}
                              >
                                {rel.term}
                                {rel.abbreviation && <span className="opacity-60">({rel.abbreviation})</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {term.seeAlso.length > 0 && (
                      <div data-testid={`glossary-seealso-${term.id}`}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">See Also</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {term.seeAlso.map((seeId) => {
                            const see = terms.find((t) => t.id === seeId);
                            if (!see) return null;
                            return (
                              <button
                                key={seeId}
                                onClick={() => scrollToTerm(seeId)}
                                className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                              >
                                {see.term}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function GlossaryClient({ terms }: { terms: GlossaryTermData[] }) {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">ISTQB Glossary</h1>
        <p className="mt-6 text-center text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    }>
      <GlossaryContent terms={terms} />
    </Suspense>
  );
}
