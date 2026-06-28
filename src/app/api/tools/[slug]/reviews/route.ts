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
import { createReviewSchema, slugParamSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";
import { jsonError, parseBody, parseParams, withErrorHandling } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ slug: string }> };

export const GET = withErrorHandling(
  "GET /api/tools/[slug]/reviews",
  async (_request: NextRequest, ctx: Ctx) => {
    const params = parseParams(await ctx.params, slugParamSchema);
    if (!params.ok) return params.response;

    const toolResult = await db
      .select({ id: tools.id })
      .from(tools)
      .where(eq(tools.slug, params.data.slug))
      .limit(1);

    if (toolResult.length === 0) return jsonError("Tool not found", 404);

    const reviews = await db
      .select()
      .from(toolReviews)
      .where(eq(toolReviews.toolId, toolResult[0].id))
      .orderBy(desc(toolReviews.createdAt));

    return NextResponse.json(reviews);
  },
);

export const POST = withErrorHandling(
  "POST /api/tools/[slug]/reviews",
  async (request: NextRequest, ctx: Ctx) => {
    const params = parseParams(await ctx.params, slugParamSchema);
    if (!params.ok) return params.response;
    const { slug } = params.data;

    const session = await auth();
    if (!session?.user?.id) return jsonError("Unauthorized", 401);

    const toolResult = await db
      .select({ id: tools.id })
      .from(tools)
      .where(eq(tools.slug, slug))
      .limit(1);

    if (toolResult.length === 0) return jsonError("Tool not found", 404);

    const body = await parseBody(request, createReviewSchema);
    if (!body.ok) return body.response;

    const id = generateId();
    const toolId = toolResult[0].id;
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
          rating: body.data.rating,
          title: body.data.title ?? null,
          content: body.data.content,
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
  },
);
