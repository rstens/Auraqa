/**
 * Shared helpers for the @seed population scripts.
 *
 * These are NOT part of the normal test suite — see e2e/seed/README.md and
 * playwright.seed.config.ts. They drive the real UI (login + create forms) to
 * fill a running app with believable-looking random content.
 */

import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

const WORDS = [
  "regression",
  "flaky",
  "fixture",
  "assertion",
  "coverage",
  "pipeline",
  "selector",
  "viewport",
  "snapshot",
  "mocking",
  "stubbing",
  "headless",
  "parallel",
  "retries",
  "timeout",
  "locator",
  "endpoint",
  "payload",
  "schema",
  "contract",
  "boundary",
  "smoke",
  "sanity",
  "exploratory",
  "accessibility",
  "performance",
  "throughput",
  "latency",
  "concurrency",
  "idempotent",
  "deterministic",
  "teardown",
  "harness",
  "traceability",
  "automation",
  "container",
  "orchestration",
  "observability",
  "resilience",
  "validation",
];

/** Inclusive random integer in [min, max]. */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Random element of a non-empty array. */
export function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}

/** `n` random words joined by spaces. */
export function words(n: number): string {
  return Array.from({ length: n }, () => pick(WORDS)).join(" ");
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** A capitalized, period-terminated sentence of 6–14 words. */
export function sentence(): string {
  return capitalize(words(randInt(6, 14))) + ".";
}

/** A paragraph of 3–6 sentences. */
export function paragraph(): string {
  return Array.from({ length: randInt(3, 6) }, sentence).join(" ");
}

/**
 * A unique-ish title: `<prefix>: <words> <4-digit>`. The numeric suffix keeps
 * generated slugs from colliding across runs (articles/tools have unique slugs).
 */
export function title(prefix: string): string {
  return `${prefix}: ${capitalize(words(randInt(3, 6)))} ${randInt(1000, 9999)}`;
}

/** A multi-section Markdown body (headings, paragraphs, list, code fence). */
export function markdownBody(): string {
  return [
    `# ${capitalize(words(randInt(3, 6)))}`,
    paragraph(),
    `## ${capitalize(words(2))}`,
    paragraph(),
    `- ${words(3)}\n- ${words(3)}\n- ${words(3)}`,
    "```\n" + words(8) + "\n```",
    paragraph(),
  ].join("\n\n");
}

/** Slugify for building plausible website URLs. */
export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * How many entries to create. Overridable per-resource via env so a caller can
 * scale the run, e.g. `SEED_ARTICLES=20 npm run seed:e2e`.
 */
export function seedCount(envKey: string, fallback: number): number {
  const raw = Number(process.env[envKey]);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : fallback;
}

/** Log in through the real credentials form as the seeded admin user. */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByTestId("login-username").fill("admin");
  await page.getByTestId("login-password").fill("admin");
  await page
    .getByTestId("credentials-login-form")
    .getByRole("button", { name: "Sign in" })
    .click();
  await page.waitForURL("/");
  // Header now reflects the signed-in user (server-rendered).
  await expect(page.getByTestId("user-menu-button")).toBeVisible();
}
