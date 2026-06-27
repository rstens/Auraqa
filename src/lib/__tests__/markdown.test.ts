/**
 * Unit tests for Markdown rendering.
 *
 * The critical invariant: user-controlled HTML in Markdown must NOT survive
 * the pipeline — script tags, event handlers, and javascript: URLs are stripped.
 */

import { describe, it, expect } from "vitest";
import { renderMarkdown, extractExcerpt } from "../markdown";

describe("renderMarkdown — sanitization", () => {
  it("strips <script> tags", async () => {
    const html = await renderMarkdown("Hello <script>alert(1)</script> world");
    // Tag removed; any leftover text is inert (can't execute outside <script>)
    expect(html).not.toContain("<script");
    expect(html).not.toContain("</script");
  });

  it("strips inline event handlers", async () => {
    const html = await renderMarkdown('<img src="x" onerror="alert(1)">');
    expect(html).not.toContain("onerror");
    expect(html).not.toContain("alert(1)");
  });

  it("strips javascript: URLs", async () => {
    const html = await renderMarkdown("[click](javascript:alert(1))");
    expect(html.toLowerCase()).not.toContain("javascript:");
  });

  it("strips data: URLs that could execute scripts", async () => {
    const html = await renderMarkdown(
      "[click](data:text/html,<script>alert(1)</script>)"
    );
    expect(html).not.toContain("<script>");
  });

  it("renders safe Markdown to HTML", async () => {
    const html = await renderMarkdown("# Heading\n\n**bold** and *italic*");
    expect(html).toContain("<h1>Heading</h1>");
    expect(html).toContain("<strong>bold</strong>");
    expect(html).toContain("<em>italic</em>");
  });

  it("supports GFM tables", async () => {
    const html = await renderMarkdown("| a | b |\n|---|---|\n| 1 | 2 |");
    expect(html).toContain("<table>");
    expect(html).toContain("<td>1</td>");
  });

  it("renders fenced code blocks", async () => {
    const html = await renderMarkdown("```js\nconst x = 1;\n```");
    expect(html).toContain("<code");
    expect(html).toContain("const x = 1;");
  });
});

describe("extractExcerpt", () => {
  it("strips Markdown syntax", () => {
    expect(extractExcerpt("# Title\n\n**bold** text")).toBe("Title bold text");
  });

  it("truncates with ellipsis when over maxLength", () => {
    const result = extractExcerpt("a".repeat(300), 100);
    expect(result.length).toBe(100);
    expect(result.endsWith("…")).toBe(true);
  });
});
