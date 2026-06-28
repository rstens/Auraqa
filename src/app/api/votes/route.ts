/**
 * Votes API — cast and remove votes.
 *
 * POST /api/votes — Cast a vote (+1 or -1) on an article, thread, or reply.
 *                   Toggles off if the same vote exists. Flips if opposite vote exists.
 *
 * The vote write and target score update are wrapped in a single transaction
 * so concurrent toggles can't drift `vote_score` away from the actual sum of
 * `votes.value`.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { votes, articles, forumThreads, forumReplies } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { castVoteSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";
import { jsonError, parseBody, withErrorHandling } from "@/lib/api-helpers";

/** Dispatch map from vote target type to the table whose vote_score it updates. */
const TARGET_TABLES = {
  article: articles,
  thread: forumThreads,
  reply: forumReplies,
} as const;

export const POST = withErrorHandling("POST /api/votes", async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);
  const userId = session.user.id;

  const body = await parseBody(request, castVoteSchema);
  if (!body.ok) return body.response;
  const { targetType, targetId, value } = body.data;

  const scoreDelta = await db.transaction(async (tx) => {
    const existing = await tx
      .select({ id: votes.id, value: votes.value })
      .from(votes)
      .where(
        and(
          eq(votes.userId, userId),
          eq(votes.targetType, targetType),
          eq(votes.targetId, targetId),
        ),
      )
      .limit(1);

    let delta = 0;
    if (existing.length > 0) {
      const prior = existing[0];
      if (prior.value === value) {
        // Same vote — remove (toggle off).
        await tx.delete(votes).where(eq(votes.id, prior.id));
        delta = -value;
      } else {
        // Opposite vote — flip.
        await tx.update(votes).set({ value }).where(eq(votes.id, prior.id));
        delta = value * 2;
      }
    } else {
      await tx.insert(votes).values({
        id: generateId(),
        userId,
        targetType,
        targetId,
        value,
      });
      delta = value;
    }

    if (delta !== 0) {
      const table = TARGET_TABLES[targetType];
      await tx
        .update(table)
        .set({ voteScore: sql`${table.voteScore} + ${delta}` })
        .where(eq(table.id, targetId));
    }

    return delta;
  });

  return NextResponse.json({ success: true, scoreDelta });
});
