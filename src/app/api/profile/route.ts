/**
 * Profile API — update the authenticated user's profile.
 *
 * PUT /api/profile — Update username / display name / bio.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validators";
import { jsonError, parseBody, withErrorHandling } from "@/lib/api-helpers";

export const PUT = withErrorHandling("PUT /api/profile", async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const body = await parseBody(request, updateProfileSchema);
  if (!body.ok) return body.response;

  if (body.data.username) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.username, body.data.username))
      .limit(1);
    if (existing.length > 0 && existing[0].id !== session.user.id) {
      return jsonError("Username already taken", 409);
    }
  }

  const [updated] = await db
    .update(users)
    .set({ ...body.data, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
    .returning();

  return NextResponse.json(updated);
});
