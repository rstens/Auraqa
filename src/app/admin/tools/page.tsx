import Link from "next/link";
import { db } from "@/db";
import { tools, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminToolsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;

  let query = db
    .select({
      id: tools.id,
      name: tools.name,
      slug: tools.slug,
      status: tools.status,
      category: tools.category,
      createdAt: tools.createdAt,
      submitterName: users.name,
      submitterUsername: users.username,
    })
    .from(tools)
    .leftJoin(users, eq(tools.submittedBy, users.id))
    .orderBy(desc(tools.createdAt))
    .limit(100);

  if (status === "pending" || status === "approved" || status === "rejected") {
    query = query.where(eq(tools.status, status)) as typeof query;
  }

  const toolList = await query;

  return (
    <div data-testid="admin-tools-page">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tools</h1>
        <div data-testid="tool-status-filters" className="flex gap-2">
          <FilterLink href="/admin/tools" label="All" active={!status} />
          <FilterLink href="/admin/tools?status=pending" label="Pending" active={status === "pending"} />
          <FilterLink href="/admin/tools?status=approved" label="Approved" active={status === "approved"} />
          <FilterLink href="/admin/tools?status=rejected" label="Rejected" active={status === "rejected"} />
        </div>
      </div>

      <div data-testid="admin-tools-list" className="mt-6 space-y-2">
        {toolList.length === 0 ? (
          <p data-testid="admin-tools-empty" className="py-12 text-center text-slate-500 dark:text-slate-400">No tools found.</p>
        ) : (
          toolList.map((tool) => (
            <Link
              key={tool.id}
              href={`/admin/tools/${tool.slug}`}
              data-testid={`admin-tool-${tool.slug}`}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ToolStatusBadge status={tool.status} />
                  <span className="font-medium text-slate-900 dark:text-white">{tool.name}</span>
                  {tool.category && (
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-400">{tool.category}</span>
                  )}
                </div>
                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  by {tool.submitterName ?? tool.submitterUsername ?? "Anonymous"} &middot; {timeAgo(tool.createdAt)}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}

function ToolStatusBadge({ status }: { status: string }) {
  const styles =
    status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
    status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${styles}`}>{status}</span>;
}

function FilterLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-blue-600 text-white"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
      }`}
    >
      {label}
    </Link>
  );
}
