/**
 * Profile API — update the signed-in user's settings.
 *
 * PUT /api/profile — Update display name, username, bio (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validators";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const [updated] = await db
      .update(users)
      .set({
        name: parsed.data.name,
        username: parsed.data.username,
        bio: parsed.data.bio,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id))
      .returning({
        id: users.id,
        name: users.name,
        username: users.username,
        bio: users.bio,
      });
    return NextResponse.json(updated);
  } catch (err) {
    // Username unique constraint violation
    if (
      err instanceof Error &&
      "code" in err &&
      (err as { code?: string }).code === "23505"
    ) {
      return NextResponse.json(
        { error: "That username is taken" },
        { status: 409 }
      );
    }
    throw err;
  }
}
