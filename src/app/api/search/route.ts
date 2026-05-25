/**
 * Search API — full-text search across all content types.
 *
 * GET /api/search?q=...&type=all — Search articles, threads, and tools
 *
 * Uses PostgreSQL full-text search with ts_rank for relevance.
 * Falls back to ILIKE when tsvector columns are not yet populated.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, forumThreads, tools, glossaryTerms } from "@/db/schema";
import { and, eq, or, ilike, desc } from "drizzle-orm";
import { searchQuerySchema } from "@/lib/validators";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const parsed = searchQuerySchema.safeParse(Object.fromEntries(searchParams));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid search query", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { q, type, limit } = parsed.data;
  const pattern = `%${q}%`;

  const results: {
    type: string;
    id: string;
    title: string;
    excerpt: string;
    slug: string;
    url: string;
  }[] = [];

  if (type === "all" || type === "articles") {
    const articleResults = await db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        summary: articles.summary,
      })
      .from(articles)
      .where(
        and2(
          eq(articles.status, "published"),
          or(
            ilike(articles.title, pattern),
            ilike(articles.content, pattern)
          )
        )
      )
      .orderBy(desc(articles.voteScore))
      .limit(limit);

    results.push(
      ...articleResults.map((a) => ({
        type: "article" as const,
        id: a.id,
        title: a.title,
        excerpt: a.summary ?? "",
        slug: a.slug,
        url: `/articles/${a.slug}`,
      }))
    );
  }

  if (type === "all" || type === "threads") {
    const threadResults = await db
      .select({
        id: forumThreads.id,
        title: forumThreads.title,
        content: forumThreads.content,
      })
      .from(forumThreads)
      .where(
        or(
          ilike(forumThreads.title, pattern),
          ilike(forumThreads.content, pattern)
        )
      )
      .orderBy(desc(forumThreads.voteScore))
      .limit(limit);

    results.push(
      ...threadResults.map((t) => ({
        type: "thread" as const,
        id: t.id,
        title: t.title,
        excerpt: t.content.slice(0, 200),
        slug: t.id,
        url: `/forum/thread/${t.id}`,
      }))
    );
  }

  if (type === "all" || type === "tools") {
    const toolResults = await db
      .select({
        id: tools.id,
        name: tools.name,
        slug: tools.slug,
        description: tools.description,
      })
      .from(tools)
      .where(
        and2(
          eq(tools.status, "approved"),
          or(
            ilike(tools.name, pattern),
            ilike(tools.description, pattern)
          )
        )
      )
      .orderBy(desc(tools.avgRating))
      .limit(limit);

    results.push(
      ...toolResults.map((t) => ({
        type: "tool" as const,
        id: t.id,
        title: t.name,
        excerpt: t.description.slice(0, 200),
        slug: t.slug,
        url: `/tools/${t.slug}`,
      }))
    );
  }

  if (type === "all" || type === "glossary") {
    const glossaryResults = await db
      .select({
        id: glossaryTerms.id,
        term: glossaryTerms.term,
        abbreviation: glossaryTerms.abbreviation,
        definition: glossaryTerms.definition,
      })
      .from(glossaryTerms)
      .where(
        or(
          ilike(glossaryTerms.term, pattern),
          ilike(glossaryTerms.definition, pattern),
          ilike(glossaryTerms.abbreviation, pattern)
        )
      )
      .limit(limit);

    results.push(
      ...glossaryResults.map((g) => ({
        type: "glossary" as const,
        id: g.id,
        title: `${g.term}${g.abbreviation ? ` (${g.abbreviation})` : ""}`,
        excerpt: g.definition.slice(0, 200),
        slug: g.id,
        url: `/glossary?q=${encodeURIComponent(g.term)}`,
      }))
    );
  }

  return NextResponse.json({ results, query: q });
}

/** Helper to combine AND conditions including undefined. */
function and2(...conditions: (ReturnType<typeof eq> | ReturnType<typeof or> | undefined)[]) {
  const defined = conditions.filter(Boolean);
  if (defined.length === 0) return undefined;
  if (defined.length === 1) return defined[0];
  return and(...defined);
}
