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
import { createArticleSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const offset = (page - 1) * limit;

  const results = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(results);
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
      { status: 400 }
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
