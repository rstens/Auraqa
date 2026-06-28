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
import { jsonError, parseBody, parseQuery, withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling("GET /api/articles", async (request: NextRequest) => {
  const query = parseQuery(request, listQuerySchema);
  if (!query.ok) return query.response;
  const { page, limit } = query.data;
  const offset = (page - 1) * limit;

  const results = await db
    .select()
    .from(articles)
    .where(eq(articles.status, "published"))
    .orderBy(desc(articles.publishedAt))
    .limit(limit)
    .offset(offset);

  return NextResponse.json(results);
});

export const POST = withErrorHandling("POST /api/articles", async (request: NextRequest) => {
  const session = await auth();
  if (!session?.user?.id) return jsonError("Unauthorized", 401);

  const body = await parseBody(request, createArticleSchema);
  if (!body.ok) return body.response;
  const { title, content, summary, status } = body.data;
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
});
