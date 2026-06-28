import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { adminUsersListQuerySchema } from "@/lib/validators";
import { jsonError, parseQuery, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling("GET /api/admin/users", async (request: NextRequest) => {
  if (!(await isAdmin())) return jsonError("Forbidden", 403);

  const query = parseQuery(request, adminUsersListQuerySchema);
  if (!query.ok) return query.response;
  const { role, limit } = query.data;

  let q = db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      username: users.username,
      role: users.role,
      reputation: users.reputation,
      image: users.image,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(limit);

  if (role) {
    q = q.where(eq(users.role, role)) as typeof q;
  }

  return NextResponse.json(await q);
});
