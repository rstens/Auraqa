import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, isAdmin } from "@/lib/auth";
import { idParamSchema, updateUserRoleSchema } from "@/lib/validators";
import { jsonError, parseBody, parseParams, withErrorHandling } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  "GET /api/admin/users/[id]",
  async (_request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, idParamSchema);
    if (!params.ok) return params.response;

    const result = await db.select().from(users).where(eq(users.id, params.data.id)).limit(1);
    if (result.length === 0) return jsonError("Not found", 404);
    return NextResponse.json(result[0]);
  },
);

export const PUT = withErrorHandling(
  "PUT /api/admin/users/[id]",
  async (request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, idParamSchema);
    if (!params.ok) return params.response;
    const { id } = params.data;

    const session = await auth();
    if (session?.user?.id === id) return jsonError("Cannot change your own role", 400);

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) return jsonError("Not found", 404);

    const body = await parseBody(request, updateUserRoleSchema);
    if (!body.ok) return body.response;

    const [updated] = await db
      .update(users)
      .set({ role: body.data.role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return NextResponse.json(updated);
  },
);

export const DELETE = withErrorHandling(
  "DELETE /api/admin/users/[id]",
  async (_request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, idParamSchema);
    if (!params.ok) return params.response;
    const { id } = params.data;

    const session = await auth();
    if (session?.user?.id === id) return jsonError("Cannot delete your own account", 400);

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.id, id)).limit(1);
    if (existing.length === 0) return jsonError("Not found", 404);

    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ success: true });
  },
);
