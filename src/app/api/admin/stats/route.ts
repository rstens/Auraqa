import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, articles, tools, forumThreads, forumReplies, aiInteractions } from "@/db/schema";
import { count, eq, sum } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [
    userStats,
    adminCount,
    publishedArticles,
    draftArticles,
    approvedTools,
    pendingTools,
    rejectedTools,
    threadCount,
    replyCount,
    aiStats,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(users).where(eq(users.role, "admin")),
    db.select({ total: count() }).from(articles).where(eq(articles.status, "published")),
    db.select({ total: count() }).from(articles).where(eq(articles.status, "draft")),
    db.select({ total: count() }).from(tools).where(eq(tools.status, "approved")),
    db.select({ total: count() }).from(tools).where(eq(tools.status, "pending")),
    db.select({ total: count() }).from(tools).where(eq(tools.status, "rejected")),
    db.select({ total: count() }).from(forumThreads),
    db.select({ total: count() }).from(forumReplies),
    db.select({
      total: count(),
      inputTokens: sum(aiInteractions.inputTokens),
      outputTokens: sum(aiInteractions.outputTokens),
    }).from(aiInteractions),
  ]);

  return NextResponse.json({
    users: { total: userStats[0].total, admins: adminCount[0].total },
    articles: { published: publishedArticles[0].total, drafts: draftArticles[0].total },
    tools: { approved: approvedTools[0].total, pending: pendingTools[0].total, rejected: rejectedTools[0].total },
    forum: { threads: threadCount[0].total, replies: replyCount[0].total },
    ai: {
      totalInteractions: aiStats[0].total,
      inputTokens: Number(aiStats[0].inputTokens ?? 0),
      outputTokens: Number(aiStats[0].outputTokens ?? 0),
    },
  });
}
