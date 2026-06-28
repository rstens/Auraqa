/**
 * Tools API — list and submit.
 *
 * GET  /api/tools  — List approved tools
 * POST /api/tools  — Submit a new tool (requires auth, starts as pending)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tools } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createToolSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";
import { slugify } from "@/lib/utils";
import { jsonError, parseBody, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling("GET /api/tools", async () => {
  const results = await db
    .select()
    .from(tools)
    .where(eq(tools.status, "approved"))
    .orderBy(desc(tools.avgRating))
    .limit(50);
  return NextResponse.json(results);
});

export const POST = withErrorHandling("POST /api/tools", async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const body = await parseBody(request, createToolSchema);
  if (!body.ok) return body.response;
  const { name, description, websiteUrl, category, pricing } = body.data;
  const slug = slugify(name) || generateId().slice(0, 8);
  const id = generateId();

  const [tool] = await db
    .insert(tools)
    .values({
      id,
      submittedBy: session.user.id,
      name,
      slug,
      description,
      websiteUrl: websiteUrl ?? null,
      category: category ?? null,
      pricing: pricing ?? "unknown",
      status: "pending",
    })
    .returning();

  return NextResponse.json(tool, { status: 201 });
});
