/**
 * Article detail API — get, update, delete by slug.
 *
 * GET    /api/articles/[slug]  — Get single article
 * PUT    /api/articles/[slug]  — Update article (author/admin only)
 * DELETE /api/articles/[slug]  — Delete article (author/admin only)
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, isAdmin } from "@/lib/auth";
import { updateArticleSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const result = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);

  if (result.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result[0]);
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing[0].authorId !== session.user.id && !(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = updateArticleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.status === "published" && existing[0].status !== "published") {
    updates.publishedAt = new Date();
  }

  const [updated] = await db
    .update(articles)
    .set(updates)
    .where(eq(articles.slug, slug))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing[0].authorId !== session.user.id && !(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.delete(articles).where(eq(articles.slug, slug));

  return NextResponse.json({ success: true });
}
