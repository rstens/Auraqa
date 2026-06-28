import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, tags, articleTags, aiInteractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, auth } from "@/lib/auth";
import { adminAiActionSchema, slugParamSchema } from "@/lib/validators";
import { summarizeArticle, suggestTags } from "@/lib/ai";
import { generateId } from "@/lib/uuid";
import { jsonError, parseBody, parseParams, withErrorHandling } from "@/lib/api-helpers";

type Ctx = { params: Promise<{ slug: string }> };

export const POST = withErrorHandling(
  "POST /api/admin/articles/[slug]/ai",
  async (request: NextRequest, ctx: Ctx) => {
    if (!(await isAdmin())) return jsonError("Forbidden", 403);
    const params = parseParams(await ctx.params, slugParamSchema);
    if (!params.ok) return params.response;
    const { slug } = params.data;

    const session = await auth();

    const articleResult = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
    if (articleResult.length === 0) return jsonError("Not found", 404);
    const article = articleResult[0];

    const body = await parseBody(request, adminAiActionSchema);
    if (!body.ok) return body.response;
    const { action } = body.data;

    if (action === "summarize") {
      const summary = await summarizeArticle(article.content);
      if (!summary) return jsonError("AI summarization failed", 502);

      await db
        .update(articles)
        .set({ aiSummary: summary, updatedAt: new Date() })
        .where(eq(articles.slug, slug));

      await db.insert(aiInteractions).values({
        id: generateId(),
        userId: session?.user?.id ?? null,
        interactionType: "summarize",
        inputText: article.content.slice(0, 500),
        outputText: summary,
        model: "claude-sonnet-4-6",
        inputTokens: null,
        outputTokens: null,
      });

      return NextResponse.json({ summary });
    }

    if (action === "suggest-tags") {
      const allTags = await db.select({ id: tags.id, name: tags.name }).from(tags);
      const tagNames = allTags.map((t) => t.name);
      const suggested = await suggestTags(article.content, tagNames);
      if (!suggested) return jsonError("AI tag suggestion failed", 502);

      for (const tagName of suggested) {
        const match = allTags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
        if (match) {
          await db
            .insert(articleTags)
            .values({
              articleId: article.id,
              tagId: match.id,
            })
            .onConflictDoNothing();
        }
      }

      await db.insert(aiInteractions).values({
        id: generateId(),
        userId: session?.user?.id ?? null,
        interactionType: "suggest-tags",
        inputText: article.content.slice(0, 500),
        outputText: JSON.stringify(suggested),
        model: "claude-sonnet-4-6",
        inputTokens: null,
        outputTokens: null,
      });

      return NextResponse.json({ tags: suggested });
    }

    return jsonError("Unknown action", 400);
  },
);
