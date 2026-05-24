/**
 * Forum replies API — list and create replies for a thread.
 *
 * GET  /api/forum/threads/[id]/replies  — List replies
 * POST /api/forum/threads/[id]/replies  — Create a reply (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forumReplies, forumThreads } from "@/db/schema";
import { eq, asc, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createReplySchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params;

  const replies = await db
    .select()
    .from(forumReplies)
    .where(eq(forumReplies.threadId, threadId))
    .orderBy(asc(forumReplies.createdAt));

  return NextResponse.json(replies);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: threadId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createReplySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const id = generateId();

  const [reply] = await db
    .insert(forumReplies)
    .values({
      id,
      threadId,
      authorId: session.user.id,
      content: parsed.data.content,
      parentId: parsed.data.parentId ?? null,
    })
    .returning();

  // Increment reply count and update last reply timestamp
  await db
    .update(forumThreads)
    .set({
      replyCount: sql`${forumThreads.replyCount} + 1`,
      lastReplyAt: new Date(),
    })
    .where(eq(forumThreads.id, threadId));

  return NextResponse.json(reply, { status: 201 });
}
