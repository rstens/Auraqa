import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { slugParamSchema, updateArticleSchema } from "@/lib/validators";
import { jsonError, parseBody, parseParams, withErrorHandling } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ slug: string }> };

export const PUT = withErrorHandling(
  "PUT /api/admin/articles/[slug]",
  async (request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, slugParamSchema);
    if (!params.ok) return params.response;
    const { slug } = params.data;

    const existing = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (existing.length === 0) return jsonError("Not found", 404);

    const body = await parseBody(request, updateArticleSchema);
    if (!body.ok) return body.response;

    const updates: Record<string, unknown> = { ...body.data, updatedAt: new Date() };
    if (body.data.status === "published" && existing[0].status !== "published") {
      updates.publishedAt = new Date();
    }

    const [updated] = await db
      .update(articles)
      .set(updates)
      .where(eq(articles.slug, slug))
      .returning();
    return NextResponse.json(updated);
  },
);

export const DELETE = withErrorHandling(
  "DELETE /api/admin/articles/[slug]",
  async (_request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, slugParamSchema);
    if (!params.ok) return params.response;
    const { slug } = params.data;

    const existing = await db
      .select({ id: articles.id })
      .from(articles)
      .where(eq(articles.slug, slug))
      .limit(1);
    if (existing.length === 0) return jsonError("Not found", 404);

    await db.delete(articles).where(eq(articles.slug, slug));
    return NextResponse.json({ success: true });
  },
);
