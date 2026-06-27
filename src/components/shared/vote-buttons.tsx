/**
 * VoteButtons — upvote/downvote widget with optimistic updates.
 *
 * Renders the score between two arrow buttons. Clicking POSTs to /api/votes
 * and updates the displayed count optimistically. On API failure, the count
 * rolls back and an error is logged.
 *
 * For unauthenticated users, the buttons are disabled and tooltip-titled
 * with a sign-in hint — the server still rejects with 401 if bypassed.
 */

"use client";

import { useState } from "react";
import { postJson } from "@/lib/api";

type TargetType = "article" | "thread" | "reply";

export function VoteButtons({
  targetType,
  targetId,
  initialScore,
  canVote,
  size = "md",
}: {
  targetType: TargetType;
  targetId: string;
  initialScore: number;
  canVote: boolean;
  size?: "sm" | "md";
}) {
  const [score, setScore] = useState(initialScore);

  async function cast(value: 1 | -1) {
    if (!canVote) return;
    const previous = score;
    // Optimistic: assume a fresh vote in the chosen direction. The server's
    // actual delta (toggle/flip/new) comes back in the response and replaces
    // this estimate.
    setScore((s) => s + value);
    try {
      const { scoreDelta } = await postJson<{ scoreDelta: number }>(
        "/api/votes",
        { targetType, targetId, value }
      );
      setScore(previous + scoreDelta);
    } catch (err) {
      console.error("VoteButtons:", err);
      setScore(previous);
    }
  }

  const btnBase =
    "rounded p-1 text-slate-400 transition-colors hover:text-blue-600 disabled:cursor-not-allowed disabled:hover:text-slate-400 dark:text-slate-500 dark:hover:text-blue-400";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const scoreSize = size === "sm" ? "text-xs" : "text-sm";
  const title = canVote ? undefined : "Sign in to vote";

  return (
    <div className="flex flex-col items-center" title={title}>
      <button
        type="button"
        aria-label="Upvote"
        onClick={() => cast(1)}
        disabled={!canVote}
        className={btnBase}
      >
        <svg
          className={iconSize}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
        </svg>
      </button>
      <span
        className={`${scoreSize} font-medium tabular-nums text-slate-700 dark:text-slate-300`}
      >
        {score}
      </span>
      <button
        type="button"
        aria-label="Downvote"
        onClick={() => cast(-1)}
        disabled={!canVote}
        className={btnBase}
      >
        <svg
          className={iconSize}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
    </div>
  );
}
