import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const role = searchParams.get("role");
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "50")));

  let query = db
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

  if (role === "admin" || role === "user") {
    query = query.where(eq(users.role, role)) as typeof query;
  }

  const userList = await query;
  return NextResponse.json(userList);
}
