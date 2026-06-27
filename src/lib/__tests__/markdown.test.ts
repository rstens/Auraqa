import { describe, it, expect } from "vitest";
import { renderMarkdown, extractExcerpt } from "../markdown";

describe("renderMarkdown", () => {
  it("renders a heading", async () => {
    const html = await renderMarkdown("# Hello");
    expect(html).toContain("<h1>");
    expect(html).toContain("Hello");
  });

  it("renders bold text", async () => {
    const html = await renderMarkdown("**bold**");
    expect(html).toContain("<strong>bold</strong>");
  });

  it("renders italic text", async () => {
    const html = await renderMarkdown("*italic*");
    expect(html).toContain("<em>italic</em>");
  });

  it("renders links", async () => {
    const html = await renderMarkdown("[AuraQA](https://example.com)");
    expect(html).toContain("<a");
    expect(html).toContain("https://example.com");
    expect(html).toContain("AuraQA");
  });

  it("renders inline code", async () => {
    const html = await renderMarkdown("Use `npm test` to run");
    expect(html).toContain("<code>");
    expect(html).toContain("npm test");
  });

  it("renders code blocks with syntax highlighting classes", async () => {
    const html = await renderMarkdown("```js\nconst x = 1;\n```");
    expect(html).toContain("<code");
    expect(html).toContain("const");
  });

  it("renders GFM tables", async () => {
    const md = "| A | B |\n|---|---|\n| 1 | 2 |";
    const html = await renderMarkdown(md);
    expect(html).toContain("<table>");
    expect(html).toContain("<td>");
  });

  it("renders GFM strikethrough", async () => {
    const html = await renderMarkdown("~~deleted~~");
    expect(html).toContain("<del>deleted</del>");
  });

  it("renders unordered lists", async () => {
    const html = await renderMarkdown("- item 1\n- item 2");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>");
  });

  it("renders ordered lists", async () => {
    const html = await renderMarkdown("1. first\n2. second");
    expect(html).toContain("<ol>");
    expect(html).toContain("<li>");
  });

  it("renders blockquotes", async () => {
    const html = await renderMarkdown("> quoted text");
    expect(html).toContain("<blockquote>");
  });

  it("sanitizes script tags", async () => {
    const html = await renderMarkdown("<script>alert('xss')</script>");
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("alert");
  });

  it("sanitizes javascript: URLs in links", async () => {
    const html = await renderMarkdown("[click](javascript:alert(1))");
    expect(html).not.toContain("javascript:");
  });

  it("sanitizes event handlers in HTML", async () => {
    const html = await renderMarkdown('<img onerror="alert(1)" src="x">');
    expect(html).not.toContain("onerror");
  });

  it("sanitizes iframe injection", async () => {
    const html = await renderMarkdown('<iframe src="https://evil.com"></iframe>');
    expect(html).not.toContain("<iframe");
  });

  it("returns empty string for empty input", async () => {
    const html = await renderMarkdown("");
    expect(html.trim()).toBe("");
  });

  it("handles multi-paragraph content", async () => {
    const html = await renderMarkdown("Paragraph 1\n\nParagraph 2");
    expect(html).toContain("<p>Paragraph 1</p>");
    expect(html).toContain("<p>Paragraph 2</p>");
  });
});

describe("extractExcerpt", () => {
  it("strips heading markers", () => {
    expect(extractExcerpt("# Hello World")).toBe("Hello World");
  });

  it("strips bold markers", () => {
    expect(extractExcerpt("**bold text**")).toBe("bold text");
  });

  it("strips italic markers", () => {
    expect(extractExcerpt("*italic text*")).toBe("italic text");
  });

  it("strips inline code", () => {
    expect(extractExcerpt("Use `npm test`")).toBe("Use npm test");
  });

  it("strips fenced code blocks", () => {
    const result = extractExcerpt("Before\n```\ncode\n```\nAfter");
    expect(result).not.toContain("```");
  });

  it("strips links but keeps text", () => {
    expect(extractExcerpt("[AuraQA](https://example.com)")).toBe("AuraQA");
  });

  it("strips image URLs from markdown", () => {
    const result = extractExcerpt("text ![alt](image.png) more");
    expect(result).not.toContain("image.png");
  });

  it("strips blockquotes", () => {
    expect(extractExcerpt("> quoted text")).toBe("quoted text");
  });

  it("strips list markers", () => {
    expect(extractExcerpt("- item one\n- item two")).toBe("item one item two");
  });

  it("strips numbered list markers", () => {
    expect(extractExcerpt("1. first\n2. second")).toBe("first second");
  });

  it("collapses newlines to spaces", () => {
    expect(extractExcerpt("line one\n\nline two")).toBe("line one line two");
  });

  it("truncates at maxLength", () => {
    const result = extractExcerpt("This is a longer excerpt that needs to be truncated", 20);
    expect(result.length).toBe(20);
    expect(result.endsWith("…")).toBe(true);
  });

  it("does not truncate short text", () => {
    expect(extractExcerpt("Short", 200)).toBe("Short");
  });

  it("uses default maxLength of 200", () => {
    const long = "word ".repeat(100);
    const result = extractExcerpt(long);
    expect(result.length).toBe(200);
  });

  it("handles empty string", () => {
    expect(extractExcerpt("")).toBe("");
  });
});
