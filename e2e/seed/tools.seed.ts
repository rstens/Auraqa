/**
 * @seed — populate the tools directory with random tool entries.
 *
 * NOTE: tools submit with status "pending", so they need admin approval before
 * they appear on the public /tools list — but the rows ARE created and each
 * tool's detail page is reachable. Excluded from normal test runs (see
 * playwright.seed.config.ts). Run with:
 *   npm run seed:e2e                 # all seed scripts
 *   npm run seed:e2e -- tools        # just this one
 *   SEED_TOOLS=20 npm run seed:e2e -- tools
 */

import { test, expect } from "@playwright/test";
import { loginAsAdmin, paragraph, pick, randInt, slugify, seedCount } from "./seed-utils";

const CATEGORIES = [
  "unit",
  "integration",
  "e2e",
  "performance",
  "security",
  "api",
  "mobile",
  "accessibility",
  "visual",
  "management",
  "ci-cd",
  "other",
] as const;

const PRICING = ["unknown", "free", "open-source", "freemium", "paid"] as const;

const NAME_PREFIXES = ["Test", "Qual", "Assert", "Verify", "Probe", "Spec", "Trace", "Flow"];
const NAME_SUFFIXES = ["Lab", "Kit", "Hub", "Forge", "Pilot", "Runner", "Bench", "Scope"];

test.describe("@seed", () => {
  test("populate tools", { tag: "@seed" }, async ({ page }) => {
    const count = seedCount("SEED_TOOLS", 6);
    await loginAsAdmin(page);

    for (let i = 0; i < count; i++) {
      const name = `${pick(NAME_PREFIXES)}${pick(NAME_SUFFIXES)} ${randInt(1000, 9999)}`;
      await page.goto("/tools/submit");
      await page.locator("#name").fill(name);
      await page.locator("#description").fill(paragraph());
      await page.locator("#websiteUrl").fill(`https://example.com/${slugify(name)}`);
      await page.locator("#category").selectOption(pick(CATEGORIES));
      await page.locator("#pricing").selectOption(pick(PRICING));
      await page.getByTestId("tool-submit-button").click();

      // Land on the new tool's detail page (slug !== the form path).
      await page.waitForURL(
        (url) => /^\/tools\/[^/]+$/.test(url.pathname) && url.pathname !== "/tools/submit",
      );
      await expect(page.getByTestId("tool-detail")).toBeVisible();
      console.log(`  ✓ tool ${i + 1}/${count} → ${name} → ${page.url()}`);
    }
  });
});
