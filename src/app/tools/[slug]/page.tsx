/**
 * Tool detail page with reviews.
 *
 * Shows tool metadata, description, and user reviews with ratings.
 */

import { db } from "@/db";
import { tools, toolReviews, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { ReviewForm } from "@/components/tools/review-form";

export default async function ToolPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();

  const toolResult = await db
    .select()
    .from(tools)
    .where(eq(tools.slug, slug))
    .limit(1);

  const tool = toolResult[0];
  if (!tool) notFound();

  const reviews = await db
    .select({
      id: toolReviews.id,
      rating: toolReviews.rating,
      title: toolReviews.title,
      content: toolReviews.content,
      createdAt: toolReviews.createdAt,
      authorName: users.name,
      authorUsername: users.username,
    })
    .from(toolReviews)
    .leftJoin(users, eq(toolReviews.authorId, users.id))
    .where(eq(toolReviews.toolId, tool.id))
    .orderBy(desc(toolReviews.createdAt));

  return (
    <div data-testid="tool-detail" className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/tools" data-testid="back-to-tools" className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400">
        &larr; All tools
      </Link>

      <div data-testid="tool-info" className="mt-4 rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          {tool.name}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          {tool.category && (
            <span className="rounded bg-slate-100 px-2 py-1 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {tool.category}
            </span>
          )}
          {tool.pricing && tool.pricing !== "unknown" && (
            <span className="rounded bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {tool.pricing}
            </span>
          )}
          <span className="flex items-center gap-1 text-amber-500">
            &#9733; {Number(tool.avgRating).toFixed(1)} ({tool.reviewCount} reviews)
          </span>
        </div>

        <p className="mt-4 text-slate-600 dark:text-slate-400">{tool.description}</p>

        {tool.websiteUrl && (
          <a
            href={tool.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Visit website &rarr;
          </a>
        )}
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
          Reviews ({reviews.length})
        </h2>
        <div data-testid="reviews-list" className="mt-4 space-y-4">
          {reviews.map((review) => (
            <div
              key={review.id}
              data-testid={`review-${review.id}`}
              className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stars count={review.rating} />
                  {review.title && (
                    <span className="font-medium text-slate-900 dark:text-white">
                      {review.title}
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {timeAgo(review.createdAt)}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {review.content}
              </p>
              <span className="mt-2 block text-xs text-slate-500 dark:text-slate-400">
                {review.authorName ?? review.authorUsername ?? "Anonymous"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review form */}
      {session?.user ? (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Write a Review
          </h3>
          <div className="mt-4">
            <ReviewForm toolSlug={slug} />
          </div>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Link href="/login" className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
            Sign in to write a review
          </Link>
        </div>
      )}
    </div>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="text-amber-500">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i}>{i < count ? "★" : "☆"}</span>
      ))}
    </span>
  );
}
