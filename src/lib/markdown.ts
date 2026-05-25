/**
 * Markdown rendering utilities for AuraQA.
 *
 * Converts Markdown content to HTML using remark/rehype pipeline
 * with GitHub Flavored Markdown and syntax highlighting support.
 *
 * Output is safe for rendering — remark/rehype do not execute
 * embedded scripts. Markdown is stored as-is in the database;
 * HTML is generated server-side at render time.
 */

import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeStringify from "rehype-stringify";

const sanitizeSchema = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code ?? []), "className"],
    span: [...(defaultSchema.attributes?.span ?? []), "className"],
  },
};

export async function renderMarkdown(markdown: string): Promise<string> {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSanitize, sanitizeSchema)
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
