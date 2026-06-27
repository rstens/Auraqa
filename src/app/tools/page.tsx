/**
 * Tools directory listing page.
 *
 * Displays approved testing tools with ratings and categories.
 */

// Opt out of static prerendering so `next build` succeeds without a live DB.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export default async function ToolsPage() {
  const toolList = await db
    .select()
    .from(tools)
    .where(eq(tools.status, "approved"))
    .orderBy(desc(tools.avgRating))
    .limit(50);

  return (
    <div data-testid="tools-page" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Testing Tools Directory
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Discover, compare, and review testing tools
          </p>
        </div>
        <Link
          href="/tools/submit"
          data-testid="submit-tool-link"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          Submit a Tool
        </Link>
      </div>

      <div data-testid="tools-grid" className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {toolList.length === 0 ? (
          <p data-testid="tools-empty" className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
            No tools yet. Submit the first one!
          </p>
        ) : (
          toolList.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))
        )}
      </div>
    </div>
  );
}

function ToolCard({
  tool,
}: {
  tool: {
    id: string;
    name: string;
    slug: string;
    description: string;
    category: string | null;
    pricing: string | null;
    avgRating: string;
    reviewCount: number;
  };
}) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      data-testid={`tool-card-${tool.slug}`}
      className="flex flex-col rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        {tool.name}
      </h2>
      <p className="mt-2 flex-1 text-sm text-slate-600 dark:text-slate-400">
        {tool.description.length > 120
          ? tool.description.slice(0, 120) + "..."
          : tool.description}
      </p>
      <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          {tool.category && (
            <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-700">
              {tool.category}
            </span>
          )}
          {tool.pricing && tool.pricing !== "unknown" && (
            <span className="rounded bg-blue-50 px-2 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {tool.pricing}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-amber-500">&#9733;</span>
          <span>{Number(tool.avgRating).toFixed(1)}</span>
          <span>({tool.reviewCount})</span>
        </div>
      </div>
    </Link>
  );
}
