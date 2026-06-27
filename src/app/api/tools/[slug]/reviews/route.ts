/**
 * Tool reviews API — list and create reviews.
 *
 * GET  /api/tools/[slug]/reviews  — List reviews for a tool
 * POST /api/tools/[slug]/reviews  — Add a review (requires auth, one per user)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tools, toolReviews } from "@/db/schema";
import { eq, desc, sql, avg } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const toolResult = await db
    .select({ id: tools.id })
    .from(tools)
    .where(eq(tools.slug, slug))
    .limit(1);

  if (toolResult.length === 0) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  const reviews = await db
    .select()
    .from(toolReviews)
    .where(eq(toolReviews.toolId, toolResult[0].id))
    .orderBy(desc(toolReviews.createdAt));

  return NextResponse.json(reviews);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const toolResult = await db
    .select({ id: tools.id })
    .from(tools)
    .where(eq(tools.slug, slug))
    .limit(1);

  if (toolResult.length === 0) {
    return NextResponse.json({ error: "Tool not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const id = generateId();
  const toolId = toolResult[0].id;
  // Extract before the closure so TypeScript's narrowing from the early
  // `if (!session?.user?.id)` return reaches the transaction callback.
  const authorId = session.user.id;

  // Wrap insert + aggregate + tools update in a single transaction. Without
  // this, two concurrent POSTs see the same intermediate avg/count and the
  // second writer clobbers the first → reviewCount drifts below reality.
  const review = await db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(toolReviews)
      .values({
        id,
        toolId,
        authorId,
        rating: parsed.data.rating,
        title: parsed.data.title ?? null,
        content: parsed.data.content,
      })
      .returning();

    const [stats] = await tx
      .select({
        avgRating: avg(toolReviews.rating),
        count: sql<number>`count(*)`,
      })
      .from(toolReviews)
      .where(eq(toolReviews.toolId, toolId));

    await tx
      .update(tools)
      .set({
        avgRating: stats.avgRating ?? "0",
        reviewCount: Number(stats.count),
      })
      .where(eq(tools.id, toolId));

    return inserted;
  });

  return NextResponse.json(review, { status: 201 });
}
