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
import { createReplySchema, idParamSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";
import { jsonError, parseBody, parseParams, withErrorHandling } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  "GET /api/forum/threads/[id]/replies",
  async (_request: NextRequest, ctx: Ctx) => {
    const params = parseParams(await ctx.params, idParamSchema);
    if (!params.ok) return params.response;

    const replies = await db
      .select()
      .from(forumReplies)
      .where(eq(forumReplies.threadId, params.data.id))
      .orderBy(asc(forumReplies.createdAt));

    return NextResponse.json(replies);
  },
);

export const POST = withErrorHandling(
  "POST /api/forum/threads/[id]/replies",
  async (request: NextRequest, ctx: Ctx) => {
    const params = parseParams(await ctx.params, idParamSchema);
    if (!params.ok) return params.response;
    const threadId = params.data.id;

    const session = await auth();
    if (!session?.user?.id) return jsonError("Unauthorized", 401);

    const body = await parseBody(request, createReplySchema);
    if (!body.ok) return body.response;

    const id = generateId();

    const [reply] = await db
      .insert(forumReplies)
      .values({
        id,
        threadId,
        authorId: session.user.id,
        content: body.data.content,
        parentId: body.data.parentId ?? null,
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
  },
);
