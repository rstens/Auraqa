import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glossaryTerms } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { glossaryTermSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = glossaryTermSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const [term] = await db
    .insert(glossaryTerms)
    .values({
      id: generateId(),
      term: parsed.data.term,
      abbreviation: parsed.data.abbreviation ?? null,
      definition: parsed.data.definition,
      category: parsed.data.category,
      relatedTerms: parsed.data.relatedTerms ?? [],
      seeAlso: parsed.data.seeAlso ?? [],
    })
    .returning();

  return NextResponse.json(term, { status: 201 });
}
