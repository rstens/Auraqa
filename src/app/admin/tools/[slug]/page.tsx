import { db } from "@/db";
import { tools, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { ToolActions } from "@/components/admin/tool-actions";

export const dynamic = "force-dynamic";

export default async function AdminToolDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const result = await db
    .select({
      id: tools.id,
      name: tools.name,
      slug: tools.slug,
      description: tools.description,
      websiteUrl: tools.websiteUrl,
      category: tools.category,
      pricing: tools.pricing,
      status: tools.status,
      avgRating: tools.avgRating,
      reviewCount: tools.reviewCount,
      createdAt: tools.createdAt,
      submitterName: users.name,
      submitterUsername: users.username,
    })
    .from(tools)
    .leftJoin(users, eq(tools.submittedBy, users.id))
    .where(eq(tools.slug, slug))
    .limit(1);

  const tool = result[0];
  if (!tool) notFound();

  const statusStyles =
    tool.status === "approved"
      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      : tool.status === "rejected"
        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";

  return (
    <div data-testid="admin-tool-detail">
      <Link
        href="/admin/tools"
        data-testid="back-to-admin-tools"
        className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
      >
        &larr; All tools
      </Link>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{tool.name}</h1>
          <span className={`rounded px-2 py-0.5 text-xs font-medium ${statusStyles}`}>
            {tool.status}
          </span>
        </div>
        <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          by {tool.submitterName ?? tool.submitterUsername ?? "Anonymous"} &middot;{" "}
          {timeAgo(tool.createdAt)}
          &middot; {Number(tool.avgRating).toFixed(1)} avg rating &middot; {tool.reviewCount}{" "}
          reviews
        </div>
      </div>

      <div className="mt-6">
        <ToolActions slug={slug} currentStatus={tool.status} />
      </div>

      <div
        data-testid="admin-tool-info"
        className="mt-6 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
      >
        <dl className="space-y-3 text-sm">
          <div>
            <dt className="font-medium text-slate-500 dark:text-slate-400">Description</dt>
            <dd className="mt-1 text-slate-900 dark:text-white">{tool.description}</dd>
          </div>
          {tool.category && (
            <div>
              <dt className="font-medium text-slate-500 dark:text-slate-400">Category</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">{tool.category}</dd>
            </div>
          )}
          {tool.pricing && (
            <div>
              <dt className="font-medium text-slate-500 dark:text-slate-400">Pricing</dt>
              <dd className="mt-1 text-slate-900 dark:text-white">{tool.pricing}</dd>
            </div>
          )}
          {tool.websiteUrl && (
            <div>
              <dt className="font-medium text-slate-500 dark:text-slate-400">Website</dt>
              <dd className="mt-1">
                <a
                  href={tool.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {tool.websiteUrl}
                </a>
              </dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
