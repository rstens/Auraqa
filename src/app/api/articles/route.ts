/**
 * Articles API — list and create.
 *
 * GET  /api/articles  — List published articles (paginated)
 * POST /api/articles  — Create a new article (requires auth)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { createArticleSchema, listQuerySchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const { page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  try {
    const results = await db
      .select()
      .from(articles)
      .where(eq(articles.status, "published"))
      .orderBy(desc(articles.publishedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (err) {
    console.error("GET /api/articles failed", err);
    return NextResponse.json({ error: "Failed to list articles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, content, summary, status } = parsed.data;
  const baseSlug = slugify(title) || generateId().slice(0, 8);
  const id = generateId();

  let slug = baseSlug;
  const existing = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.slug, baseSlug))
    .limit(1);
  if (existing.length > 0) {
    slug = `${baseSlug}-${id.slice(0, 8)}`;
  }

  const [article] = await db
    .insert(articles)
    .values({
      id,
      authorId: session.user.id,
      title,
      slug,
      content,
      summary: summary ?? "",
      status: status ?? "draft",
      publishedAt: status === "published" ? new Date() : null,
    })
    .returning();

  return NextResponse.json(article, { status: 201 });
}
