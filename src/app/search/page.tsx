/**
 * Search page — wraps SearchClient in Suspense for useSearchParams().
 */

import { Suspense } from "react";
import { SearchClient } from "./search-client";

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchClient />
    </Suspense>
  );
}

function SearchFallback() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Search</h1>
      <div className="mt-6 h-10 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-700" />
    </div>
  );
}
