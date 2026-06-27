/**
 * Markdown rendering utilities for AuraQA.
 *
 * Pipeline: remark (parse + GFM) → remark-rehype (mdast → hast)
 *           → rehype-sanitize (strip dangerous HTML) → rehype-stringify (HTML)
 *
 * `rehype-sanitize` enforces an allow-list — script tags, event handlers,
 * `javascript:` URLs, and unknown attributes are stripped before output.
 * This is the load-bearing defense against stored XSS from user Markdown.
 *
 * @see docs/AI-INTEGRATION.md
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSanitize from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

/**
 * Convert Markdown string to sanitized HTML.
 *
 * Uses rehype-sanitize with the default GitHub-flavored allow-list, which
 * strips <script>, event handlers (onerror, onclick, ...), and
 * javascript: / data: URLs that could execute code.
 *
 * @param markdown - Raw Markdown content
 * @returns HTML string safe to render via dangerouslySetInnerHTML
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(markdown);

  return result.toString();
}

/**
 * Extract a plain text excerpt from Markdown content.
 * Strips all Markdown syntax and truncates to the specified length.
 *
 * @param markdown - Raw Markdown content
 * @param maxLength - Maximum length of the excerpt (default: 200)
 * @returns Plain text excerpt
 */
export function extractExcerpt(markdown: string, maxLength: number = 200): string {
  const plainText = markdown
    .replace(/#{1,6}\s/g, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    .replace(/!\[.*?\]\(.+?\)/g, "")
    .replace(/>\s/g, "")
    .replace(/[-*+]\s/g, "")
    .replace(/\d+\.\s/g, "")
    .replace(/\n+/g, " ")
    .trim();

  if (plainText.length <= maxLength) return plainText;
  return plainText.slice(0, maxLength - 1) + "…";
}
