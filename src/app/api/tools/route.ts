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

export async function GET() {
  const results = await db
    .select()
    .from(tools)
    .where(eq(tools.status, "approved"))
    .orderBy(desc(tools.avgRating))
    .limit(50);

  return NextResponse.json(results);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createToolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, description, websiteUrl, category, pricing } = parsed.data;
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
      status: "approved",
    })
    .returning();

  return NextResponse.json(tool, { status: 201 });
}
