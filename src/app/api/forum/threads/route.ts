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
import { jsonError, parseBody, parseQuery, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling("GET /api/forum/threads", async (request: NextRequest) => {
  const query = parseQuery(request, threadsListQuerySchema);
  if (!query.ok) return query.response;
  const { categoryId, page, limit } = query.data;
  const offset = (page - 1) * limit;

  let q = db.select().from(forumThreads);
  if (categoryId !== undefined) {
    q = q.where(eq(forumThreads.categoryId, categoryId)) as typeof q;
  }
  const results = await q.orderBy(desc(forumThreads.createdAt)).limit(limit).offset(offset);
  return NextResponse.json(results);
});

export const POST = withErrorHandling("POST /api/forum/threads", async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const body = await parseBody(request, createThreadSchema);
  if (!body.ok) return body.response;
  const { title, content, categoryId } = body.data;
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
});
