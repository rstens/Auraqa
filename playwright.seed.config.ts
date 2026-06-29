/**
 * Playwright config for the @seed population scripts.
 *
 * These scripts create real content in a running app and are deliberately kept
 * OUT of the normal suite: `playwright.config.ts` ignores the `.seed.ts` files,
 * so `npx playwright test` and CI never touch them. They run only through this
 * config, e.g. `npm run seed:e2e`.
 *
 * Reuses the base `use`/`webServer`/reporter settings but points at e2e/seed,
 * filters to the `@seed` tag, serializes workers (forms share the admin login
 * and we don't want interleaved sessions), and lifts the per-test timeout
 * since a single script may create many entries in one loop.
 */

import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

export default defineConfig({
  ...base,
  testDir: "./e2e/seed",
  testIgnore: [],
  testMatch: "**/*.seed.ts",
  grep: /@seed/,
  timeout: 10 * 60 * 1000,
  retries: 0,
  workers: 1,
});
