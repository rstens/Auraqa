import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { forumThreads, forumReplies, aiInteractions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth, isAdmin } from "@/lib/auth";
import { adminSuggestAnswerSchema } from "@/lib/validators";
import { suggestAnswer } from "@/lib/ai";
import { generateId } from "@/lib/uuid";

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await auth();
  const body = await request.json();
  const parsed = adminSuggestAnswerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { threadId } = parsed.data;

  const threadResult = await db
    .select()
    .from(forumThreads)
    .where(eq(forumThreads.id, threadId))
    .limit(1);
  if (threadResult.length === 0) {
    return NextResponse.json({ error: "Thread not found" }, { status: 404 });
  }

  const thread = threadResult[0];
  const replies = await db
    .select({ content: forumReplies.content })
    .from(forumReplies)
    .where(eq(forumReplies.threadId, threadId));

  const existingAnswers = replies.map((r) => r.content);
  const suggestion = await suggestAnswer(thread.content, existingAnswers);

  if (!suggestion) {
    return NextResponse.json({ error: "AI suggestion failed" }, { status: 502 });
  }

  await db.insert(aiInteractions).values({
    id: generateId(),
    userId: session?.user?.id ?? null,
    interactionType: "suggest-answer",
    inputText: thread.content.slice(0, 500),
    outputText: suggestion,
    model: "claude-sonnet-4-6",
    inputTokens: null,
    outputTokens: null,
  });

  return NextResponse.json({ suggestion });
}
