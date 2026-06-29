/**
 * @seed — populate the knowledge base with random published articles.
 *
 * Excluded from normal test runs (see playwright.seed.config.ts). Run with:
 *   npm run seed:e2e                 # all seed scripts
 *   npm run seed:e2e -- articles     # just this one
 *   SEED_ARTICLES=20 npm run seed:e2e -- articles
 */

import { test, expect } from "@playwright/test";
import { loginAsAdmin, title, sentence, markdownBody, seedCount } from "./seed-utils";

test.describe("@seed", () => {
  test("populate articles", { tag: "@seed" }, async ({ page }) => {
    const count = seedCount("SEED_ARTICLES", 8);
    await loginAsAdmin(page);

    for (let i = 0; i < count; i++) {
      await page.goto("/articles/new");
      await page.locator("#title").fill(title("Article"));
      await page.locator("#summary").fill(sentence());
      await page.locator("#content").fill(markdownBody());
      await page.getByTestId("article-status-select").selectOption("published");
      await page.getByTestId("article-submit-button").click();

      // Land on the new article's detail page (slug !== the form path).
      await page.waitForURL(
        (url) => /^\/articles\/[^/]+$/.test(url.pathname) && url.pathname !== "/articles/new",
      );
      await expect(page.getByTestId("article-detail")).toBeVisible();
      console.log(`  ✓ article ${i + 1}/${count} → ${page.url()}`);
    }
  });
});
