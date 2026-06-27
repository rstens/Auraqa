import { NextResponse } from "next/server";
import { db } from "@/db";
import { glossaryTerms } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  const terms = await db.select().from(glossaryTerms).orderBy(asc(glossaryTerms.term));

  return NextResponse.json(terms);
}
