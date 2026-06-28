/**
 * Forum threads API — list and create.
 *
 * GET  /api/forum/threads  — List threads (filterable by category)
 * POST /api/forum/threads  — Create a new thread (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forumThreads } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createThreadSchema, threadsListQuerySchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";

export async function GET(request: NextRequest) {
  const parsed = threadsListQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { categoryId, limit } = parsed.data;

  try {
    let query = db.select().from(forumThreads);
    if (categoryId !== undefined) {
      query = query.where(eq(forumThreads.categoryId, categoryId)) as typeof query;
    }
    const results = await query.orderBy(desc(forumThreads.createdAt)).limit(limit);
    return NextResponse.json(results);
  } catch (err) {
    console.error("GET /api/forum/threads failed", err);
    return NextResponse.json({ error: "Failed to list threads" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createThreadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, content, categoryId } = parsed.data;
  const id = generateId();

  const [thread] = await db
    .insert(forumThreads)
    .values({
      id,
      authorId: session.user.id,
      title,
      content,
      categoryId,
    })
    .returning();

  return NextResponse.json(thread, { status: 201 });
}
