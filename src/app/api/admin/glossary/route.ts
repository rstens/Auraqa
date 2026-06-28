import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { glossaryTerms } from "@/db/schema";
import { isAdmin } from "@/lib/auth";
import { glossaryTermSchema } from "@/lib/validators";
import { generateId } from "@/lib/uuid";
import { jsonError, parseBody, withErrorHandling } from "@/lib/api-helpers";

export const POST = withErrorHandling("POST /api/admin/glossary", async (request: NextRequest) => {
  if (!(await isAdmin())) return jsonError("Forbidden", 403);

  const body = await parseBody(request, glossaryTermSchema);
  if (!body.ok) return body.response;

  const [term] = await db
    .insert(glossaryTerms)
    .values({
      id: generateId(),
      term: body.data.term,
      abbreviation: body.data.abbreviation ?? null,
      definition: body.data.definition,
      category: body.data.category,
      relatedTerms: body.data.relatedTerms ?? [],
      seeAlso: body.data.seeAlso ?? [],
    })
    .returning();

  return NextResponse.json(term, { status: 201 });
});
