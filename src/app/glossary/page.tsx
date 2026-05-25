import { db } from "@/db";
import { glossaryTerms } from "@/db/schema";
import { asc } from "drizzle-orm";
import { GlossaryClient } from "@/components/glossary/glossary-client";

export default async function GlossaryPage() {
  const terms = await db
    .select()
    .from(glossaryTerms)
    .orderBy(asc(glossaryTerms.term));

  const normalizedTerms = terms.map((t) => ({
    id: t.id,
    term: t.term,
    abbreviation: t.abbreviation,
    definition: t.definition,
    category: t.category,
    relatedTerms: (t.relatedTerms ?? []) as string[],
    seeAlso: (t.seeAlso ?? []) as string[],
  }));

  return <GlossaryClient terms={normalizedTerms} />;
}
