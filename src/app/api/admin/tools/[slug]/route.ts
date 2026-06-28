import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { slugParamSchema, updateToolSchema } from "@/lib/validators";
import { jsonError, parseBody, parseParams, withErrorHandling } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ slug: string }> };

export const PUT = withErrorHandling(
  "PUT /api/admin/tools/[slug]",
  async (request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, slugParamSchema);
    if (!params.ok) return params.response;
    const { slug } = params.data;

    const existing = await db.select().from(tools).where(eq(tools.slug, slug)).limit(1);
    if (existing.length === 0) return jsonError("Not found", 404);

    const body = await parseBody(request, updateToolSchema);
    if (!body.ok) return body.response;

    const [updated] = await db
      .update(tools)
      .set({ ...body.data, updatedAt: new Date() })
      .where(eq(tools.slug, slug))
      .returning();
    return NextResponse.json(updated);
  },
);

export const DELETE = withErrorHandling(
  "DELETE /api/admin/tools/[slug]",
  async (_request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, slugParamSchema);
    if (!params.ok) return params.response;
    const { slug } = params.data;

    const existing = await db
      .select({ id: tools.id })
      .from(tools)
      .where(eq(tools.slug, slug))
      .limit(1);
    if (existing.length === 0) return jsonError("Not found", 404);

    await db.delete(tools).where(eq(tools.slug, slug));
    return NextResponse.json({ success: true });
  },
);
