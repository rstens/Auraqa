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

  const [review] = await db
    .insert(toolReviews)
    .values({
      id,
      toolId,
      authorId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      content: parsed.data.content,
    })
    .returning();

  // Recalculate average rating and count
  const [stats] = await db
    .select({
      avgRating: avg(toolReviews.rating),
      count: sql<number>`count(*)`,
    })
    .from(toolReviews)
    .where(eq(toolReviews.toolId, toolId));

  await db
    .update(tools)
    .set({
      avgRating: stats.avgRating ?? "0",
      reviewCount: Number(stats.count),
    })
    .where(eq(tools.id, toolId));

  return NextResponse.json(review, { status: 201 });
}
