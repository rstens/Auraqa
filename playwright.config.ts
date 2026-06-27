/**
 * Playwright configuration for AuraQA E2E tests.
 *
 * Reporters:
 * - `list` — concise per-test output in the terminal/CI logs.
 * - `html` — full HTML report written to `playwright-report/`. In CI we
 *   upload this directory as an artifact so failures are debuggable from
 *   the GitHub Actions UI.
 * - `github` — annotates failed assertions on the PR in CI (no-op locally).
 *
 * `trace`, `screenshot`, and `video` are kept off for green runs and
 * captured on failure to keep artifact size reasonable.
 */

import { defineConfig } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [["list"], ["html", { outputFolder: "playwright-report", open: "never" }], ["github"]]
    : [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: "http://localhost:3000",
    headless: true,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
  webServer: {
    command: "npm run dev",
    port: 3000,
    reuseExistingServer: true,
    timeout: 60000,
  },
});
