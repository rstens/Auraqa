import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glossaryTerms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { glossaryTermSchema, idParamSchema } from "@/lib/validators";
import { jsonError, parseBody, parseParams, withErrorHandling } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = withErrorHandling(
  "PUT /api/admin/glossary/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, idParamSchema);
    if (!params.ok) return params.response;
    const { id } = params.data;

    const existing = await db
      .select({ id: glossaryTerms.id })
      .from(glossaryTerms)
      .where(eq(glossaryTerms.id, id))
      .limit(1);
    if (existing.length === 0) return jsonError("Not found", 404);

    const body = await parseBody(request, glossaryTermSchema.partial());
    if (!body.ok) return body.response;

    const updates: Record<string, unknown> = { ...body.data, updatedAt: new Date() };
    if (body.data.abbreviation === undefined) delete updates.abbreviation;

    const [updated] = await db
      .update(glossaryTerms)
      .set(updates)
      .where(eq(glossaryTerms.id, id))
      .returning();
    return NextResponse.json(updated);
  },
);

export const DELETE = withErrorHandling(
  "DELETE /api/admin/glossary/[id]",
  async (_request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, idParamSchema);
    if (!params.ok) return params.response;
    const { id } = params.data;

    const existing = await db
      .select({ id: glossaryTerms.id })
      .from(glossaryTerms)
      .where(eq(glossaryTerms.id, id))
      .limit(1);
    if (existing.length === 0) return jsonError("Not found", 404);

    await db.delete(glossaryTerms).where(eq(glossaryTerms.id, id));
    return NextResponse.json({ success: true });
  },
);
