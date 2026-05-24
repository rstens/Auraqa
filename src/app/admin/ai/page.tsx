import { db } from "@/db";
import { aiInteractions } from "@/db/schema";
import { count, sum, desc, eq } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";

export default async function AdminAIPage() {
  const [totals, recentList] = await Promise.all([
    db
      .select({
        total: count(),
        inputTokens: sum(aiInteractions.inputTokens),
        outputTokens: sum(aiInteractions.outputTokens),
      })
      .from(aiInteractions),
    db
      .select({
        id: aiInteractions.id,
        interactionType: aiInteractions.interactionType,
        model: aiInteractions.model,
        inputTokens: aiInteractions.inputTokens,
        outputTokens: aiInteractions.outputTokens,
        createdAt: aiInteractions.createdAt,
      })
      .from(aiInteractions)
      .orderBy(desc(aiInteractions.createdAt))
      .limit(20),
  ]);

  const byType = await Promise.all(
    ["summarize", "suggest-tags", "suggest-answer", "enhance-search"].map(async (type) => {
      const result = await db
        .select({ total: count() })
        .from(aiInteractions)
        .where(eq(aiInteractions.interactionType, type));
      return { type, count: result[0].total };
    })
  );

  const stats = totals[0];

  return (
    <div data-testid="admin-ai-page">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Usage</h1>

      <div data-testid="ai-stats" className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Interactions</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Input Tokens</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{Number(stats.inputTokens ?? 0).toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Output Tokens</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{Number(stats.outputTokens ?? 0).toLocaleString()}</p>
        </div>
      </div>

      <div data-testid="ai-by-type" className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">By Type</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {byType.map(({ type, count: c }) => (
            <div key={type} className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{type}</p>
              <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{c}</p>
            </div>
          ))}
        </div>
      </div>

      <div data-testid="ai-recent" className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Interactions</h2>
        <div className="mt-4 space-y-2">
          {recentList.length === 0 ? (
            <p className="py-8 text-center text-slate-500 dark:text-slate-400">No AI interactions yet.</p>
          ) : (
            recentList.map((item) => (
              <div
                key={item.id}
                data-testid={`ai-interaction-${item.id}`}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {item.interactionType}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{item.model}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                  {item.inputTokens !== null && <span>{item.inputTokens} in</span>}
                  {item.outputTokens !== null && <span>{item.outputTokens} out</span>}
                  <span>{timeAgo(item.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
