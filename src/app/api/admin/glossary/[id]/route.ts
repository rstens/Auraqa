import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glossaryTerms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";
import { glossaryTermSchema } from "@/lib/validators";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await db.select({ id: glossaryTerms.id }).from(glossaryTerms).where(eq(glossaryTerms.id, id)).limit(1);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = glossaryTermSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
  }

  const updates: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };
  if (parsed.data.abbreviation === undefined) delete updates.abbreviation;

  const [updated] = await db
    .update(glossaryTerms)
    .set(updates)
    .where(eq(glossaryTerms.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await db.select({ id: glossaryTerms.id }).from(glossaryTerms).where(eq(glossaryTerms.id, id)).limit(1);
  if (existing.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.delete(glossaryTerms).where(eq(glossaryTerms.id, id));
  return NextResponse.json({ success: true });
}
