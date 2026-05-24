/**
 * Votes API — cast and remove votes.
 *
 * POST /api/votes — Cast a vote (+1 or -1) on an article, thread, or reply.
 *                   Toggles off if the same vote exists. Flips if opposite vote exists.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { votes, articles, forumThreads, forumReplies } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { castVoteSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = castVoteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { targetType, targetId, value } = parsed.data;
  const userId = session.user.id;

  const existing = await db
    .select()
    .from(votes)
    .where(
      and(
        eq(votes.userId, userId),
        eq(votes.targetType, targetType),
        eq(votes.targetId, targetId)
      )
    )
    .limit(1);

  let scoreDelta = 0;

  if (existing.length > 0) {
    const existingVote = existing[0];
    if (existingVote.value === value) {
      // Same vote — remove it (toggle off)
      await db.delete(votes).where(eq(votes.id, existingVote.id));
      scoreDelta = -value;
    } else {
      // Opposite vote — flip it
      await db
        .update(votes)
        .set({ value: value as number })
        .where(eq(votes.id, existingVote.id));
      scoreDelta = value * 2;
    }
  } else {
    // New vote
    await db.insert(votes).values({
      id: generateId(),
      userId,
      targetType,
      targetId,
      value: value as number,
    });
    scoreDelta = value;
  }

  // Update the target's vote score
  if (scoreDelta !== 0) {
    if (targetType === "article") {
      await db
        .update(articles)
        .set({ voteScore: sql`${articles.voteScore} + ${scoreDelta}` })
        .where(eq(articles.id, targetId));
    } else if (targetType === "thread") {
      await db
        .update(forumThreads)
        .set({ voteScore: sql`${forumThreads.voteScore} + ${scoreDelta}` })
        .where(eq(forumThreads.id, targetId));
    } else if (targetType === "reply") {
      await db
        .update(forumReplies)
        .set({ voteScore: sql`${forumReplies.voteScore} + ${scoreDelta}` })
        .where(eq(forumReplies.id, targetId));
    }
  }

  return NextResponse.json({ success: true, scoreDelta });
}
