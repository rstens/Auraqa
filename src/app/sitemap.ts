import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Static-only sitemap covering the main browseable surfaces. Per-entity
// pages (articles, threads, tools) are intentionally excluded — emitting
// them would require a DB hit on every sitemap fetch, and search engines
// can crawl them via the listing pages already enumerated here.
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ["", "/articles", "/forum", "/tools", "/glossary", "/search"];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
