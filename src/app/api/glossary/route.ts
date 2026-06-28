/**
 * Glossary API — list all terms.
 *
 * GET /api/glossary — Returns the full ISTQB glossary, alphabetically.
 */

import { NextResponse } from "next/server";
import { db } from "@/db";
import { glossaryTerms } from "@/db/schema";
import { asc } from "drizzle-orm";
import { withErrorHandling } from "@/lib/api-helpers";

export const GET = withErrorHandling("GET /api/glossary", async () => {
  const terms = await db.select().from(glossaryTerms).orderBy(asc(glossaryTerms.term));
  return NextResponse.json(terms);
});
