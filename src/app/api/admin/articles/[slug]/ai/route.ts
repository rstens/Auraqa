import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { articles, tags, aiInteractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, auth } from "@/lib/auth";
import { adminAiActionSchema } from "@/lib/validators";
import { summarizeArticle, suggestTags } from "@/lib/ai";
import { generateId } from "@/lib/uuid";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  const { slug } = await params;

  const articleResult = await db.select().from(articles).where(eq(articles.slug, slug)).limit(1);
  if (articleResult.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const article = articleResult[0];

  const body = await request.json();
  const parsed = adminAiActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const { action } = parsed.data;

  if (action === "summarize") {
    const summary = await summarizeArticle(article.content);
    if (!summary) {
      return NextResponse.json({ error: "AI summarization failed" }, { status: 502 });
    }

    await db.update(articles).set({ aiSummary: summary, updatedAt: new Date() }).where(eq(articles.slug, slug));

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
    const allTags = await db.select({ name: tags.name }).from(tags);
    const tagNames = allTags.map((t) => t.name);
    const suggested = await suggestTags(article.content, tagNames);
    if (!suggested) {
      return NextResponse.json({ error: "AI tag suggestion failed" }, { status: 502 });
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

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
