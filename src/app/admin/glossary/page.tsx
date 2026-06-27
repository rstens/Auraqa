import { db } from "@/db";
import { glossaryTerms } from "@/db/schema";
import { asc } from "drizzle-orm";
import { GlossaryAdmin } from "@/components/admin/glossary-admin";

export const dynamic = "force-dynamic";

export default async function AdminGlossaryPage() {
  const terms = await db.select().from(glossaryTerms).orderBy(asc(glossaryTerms.term));

  return (
    <div data-testid="admin-glossary-page">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Glossary Management</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        {terms.length} terms — add, edit, or remove ISTQB glossary entries
      </p>
      <div className="mt-6">
        <GlossaryAdmin initialTerms={terms} />
      </div>
    </div>
  );
}
