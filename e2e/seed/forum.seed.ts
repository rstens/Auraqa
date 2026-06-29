/**
 * @seed — populate the forum with random threads across the seeded categories.
 *
 * Excluded from normal test runs (see playwright.seed.config.ts). Run with:
 *   npm run seed:e2e                 # all seed scripts
 *   npm run seed:e2e -- forum        # just this one
 *   SEED_THREADS=20 npm run seed:e2e -- forum
 */

import { test, expect } from "@playwright/test";
import { loginAsAdmin, title, markdownBody, pick, seedCount } from "./seed-utils";

// Category slugs seeded by src/db/seed.ts.
const CATEGORY_SLUGS = [
  "test-automation",
  "manual-testing",
  "performance-testing",
  "security-testing",
  "ci-cd-devops",
  "mobile-testing",
  "api-testing",
  "general-discussion",
] as const;

test.describe("@seed", () => {
  test("populate forum threads", { tag: "@seed" }, async ({ page }) => {
    const count = seedCount("SEED_THREADS", 8);
    await loginAsAdmin(page);

    for (let i = 0; i < count; i++) {
      const category = pick(CATEGORY_SLUGS);
      await page.goto(`/forum/${category}/new`);
      await page.locator("#title").fill(title("Question"));
      await page.locator("#content").fill(markdownBody());
      await page.getByRole("button", { name: "Post Thread" }).click();

      await page.waitForURL((url) => /^\/forum\/thread\/[^/]+$/.test(url.pathname));
      await expect(page.getByTestId("thread-detail")).toBeVisible();
      console.log(`  ✓ thread ${i + 1}/${count} in ${category} → ${page.url()}`);
    }
  });
});
