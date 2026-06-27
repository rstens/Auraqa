import { test, expect, request } from "@playwright/test";

const SMOKE_ARTICLE_TITLE = "E2E Smoke Test Article";

test.describe("Smoke Tests", () => {
  test("home page loads with hero and navigation", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("navbar")).toBeVisible();
    await expect(page.getByTestId("hero-section")).toBeVisible();
    await expect(page.getByTestId("features-section")).toBeVisible();
    await expect(page.getByTestId("footer")).toBeVisible();
    await expect(page).toHaveTitle(/AuraQA/);
  });

  test("navbar links are present", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("navbar-logo")).toBeVisible();
    await expect(page.getByTestId("navbar-nav")).toBeVisible();
    await expect(page.getByTestId("navbar-search")).toBeVisible();
  });

  test("articles page loads", async ({ page }) => {
    await page.goto("/articles");
    await expect(page.getByTestId("articles-page")).toBeVisible();
    await expect(page.getByTestId("write-article-link")).toBeVisible();
  });

  test("forum page loads with categories", async ({ page }) => {
    await page.goto("/forum");
    await expect(page.getByTestId("forum-page")).toBeVisible();
    await expect(page.getByTestId("forum-categories")).toBeVisible();
  });

  test("tools page loads", async ({ page }) => {
    await page.goto("/tools");
    await expect(page.getByTestId("tools-page")).toBeVisible();
    await expect(page.getByTestId("submit-tool-link")).toBeVisible();
  });

  test("glossary page loads with terms", async ({ page }) => {
    await page.goto("/glossary");
    await expect(page.getByTestId("glossary-page")).toBeVisible();
    await expect(page.getByTestId("glossary-search-input")).toBeVisible();
    await expect(page.getByTestId("glossary-category-filters")).toBeVisible();
    await expect(page.getByTestId("glossary-terms-list")).toBeVisible();
  });

  test("glossary search filters terms", async ({ page }) => {
    await page.goto("/glossary");
    const input = page.getByTestId("glossary-search-input");
    await input.fill("regression");
    await expect(page.getByTestId("glossary-match-count")).not.toContainText("of 0");
    const termsList = page.getByTestId("glossary-terms-list");
    await expect(termsList).toContainText("Regression");
  });

  test("search page loads and accepts input", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByTestId("search-page")).toBeVisible();
    await expect(page.getByTestId("search-form")).toBeVisible();
    await expect(page.getByTestId("search-input")).toBeVisible();
  });

  test("login page loads with credentials form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByTestId("credentials-login-form")).toBeVisible();
    await expect(page.getByTestId("login-username")).toBeVisible();
    await expect(page.getByTestId("login-password")).toBeVisible();
  });

  test("admin login and dashboard access", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-username").fill("admin");
    await page.getByTestId("login-password").fill("admin");
    await page
      .getByTestId("credentials-login-form")
      .getByRole("button", { name: "Sign in" })
      .click();
    await page.waitForURL("/");

    await page.goto("/admin");
    await expect(page.getByTestId("admin-dashboard")).toBeVisible();
    await expect(page.getByTestId("admin-sidebar")).toBeVisible();
    await expect(page.getByTestId("admin-stats")).toBeVisible();
  });

  test("admin can navigate to all admin sections", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-username").fill("admin");
    await page.getByTestId("login-password").fill("admin");
    await page
      .getByTestId("credentials-login-form")
      .getByRole("button", { name: "Sign in" })
      .click();
    await page.waitForURL("/");

    await page.goto("/admin/articles");
    await expect(page.getByTestId("admin-articles-page")).toBeVisible();

    await page.goto("/admin/tools");
    await expect(page.getByTestId("admin-tools-page")).toBeVisible();

    await page.goto("/admin/users");
    await expect(page.getByTestId("admin-users-page")).toBeVisible();

    await page.goto("/admin/glossary");
    await expect(page.getByTestId("admin-glossary-page")).toBeVisible();

    await page.goto("/admin/ai");
    await expect(page.getByTestId("admin-ai-page")).toBeVisible();
  });

  test("create article as admin", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-username").fill("admin");
    await page.getByTestId("login-password").fill("admin");
    await page
      .getByTestId("credentials-login-form")
      .getByRole("button", { name: "Sign in" })
      .click();
    await page.waitForURL("/");

    await page.goto("/articles/new");
    await page.locator("#title").fill(SMOKE_ARTICLE_TITLE);
    await page.locator("#summary").fill("Created by Playwright smoke test");
    await page
      .locator("#content")
      .fill("# Smoke Test\n\nThis article was created by an automated E2E test.");
    await page.getByTestId("article-status-select").selectOption("published");
    await page.getByTestId("article-submit-button").click();

    await page.waitForURL(/\/articles\//);
    await expect(page.getByTestId("article-detail")).toBeVisible();
    await expect(page.getByTestId("article-content")).toContainText("Smoke Test");
  });

  test("profile page loads after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-username").fill("admin");
    await page.getByTestId("login-password").fill("admin");
    await page
      .getByTestId("credentials-login-form")
      .getByRole("button", { name: "Sign in" })
      .click();
    await page.waitForURL("/");

    await page.goto("/profile/admin");
    await expect(page.getByTestId("profile-page")).toBeVisible();
    await expect(page.getByTestId("profile-stats")).toBeVisible();
  });

  test("settings page loads after login", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-username").fill("admin");
    await page.getByTestId("login-password").fill("admin");
    await page
      .getByTestId("credentials-login-form")
      .getByRole("button", { name: "Sign in" })
      .click();
    await page.waitForURL("/");

    await page.goto("/profile/settings");
    await expect(page.getByTestId("settings-page")).toBeVisible();
    await expect(page.getByTestId("settings-form")).toBeVisible();
  });

  test("unauthenticated user is redirected to login for protected pages", async ({ page }) => {
    await page.goto("/articles/new");
    await page.waitForURL(/\/login/);
    await expect(page.getByTestId("credentials-login-form")).toBeVisible();
  });

  test("unauthenticated user cannot access admin", async ({ page }) => {
    await page.goto("/admin");
    await page.waitForURL(/\/login/);
  });

  test("cleanup: delete smoke test data", async ({ page }) => {
    await page.goto("/login");
    await page.getByTestId("login-username").fill("admin");
    await page.getByTestId("login-password").fill("admin");
    await page
      .getByTestId("credentials-login-form")
      .getByRole("button", { name: "Sign in" })
      .click();
    await page.waitForURL("/");

    const cookies = await page.context().cookies();
    const apiContext = await request.newContext({
      baseURL: "http://localhost:3000",
      extraHTTPHeaders: {
        Cookie: cookies.map((c) => `${c.name}=${c.value}`).join("; "),
      },
    });

    const articlesRes = await apiContext.get("/api/articles");
    const articles = await articlesRes.json();
    for (const article of articles) {
      if (article.title === SMOKE_ARTICLE_TITLE) {
        await apiContext.delete(`/api/admin/articles/${article.slug}`);
      }
    }

    await apiContext.dispose();
  });
});
