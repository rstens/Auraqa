/**
 * Claude AI integration for AuraQA.
 *
 * Uses the Anthropic SDK (@anthropic-ai/sdk) with claude-sonnet-4-6 for:
 * - Article summarization (2-3 sentence summaries)
 * - Smart search (query expansion into structured search terms)
 * - Answer suggestions (AI-generated answers for unanswered forum questions)
 * - Tag suggestions (content classification into relevant tags)
 *
 * All functions share a frozen system prompt for prompt caching (90% cost
 * savings on repeated calls). Volatile content goes in the user message.
 *
 * @see docs/AI-INTEGRATION.md for architecture and cost tracking
 */

import Anthropic from "@anthropic-ai/sdk";

/** Singleton Anthropic client — uses ANTHROPIC_API_KEY env var. */
const client = new Anthropic();

/** Model used for all AI features. Sonnet 4.6 for cost-effectiveness on high volume. */
const MODEL = "claude-sonnet-4-6";

/**
 * Frozen system prompt for prompt caching.
 * This prefix is stable across all AI calls — changes invalidate the cache.
 * Volatile content (article body, search query) goes in the user message.
 */
const SYSTEM_PROMPT = `You are an AI assistant for AuraQA, a community platform for software testers. You help with article summarization, search query expansion, answer suggestions, and content classification. Always be accurate, concise, and focused on software testing topics.`;

/**
 * Generate a 2-3 sentence summary of an article.
 * The summary is cached in the articles.ai_summary column to avoid repeated API calls.
 *
 * @param content - The full Markdown content of the article
 * @returns Summary string, or null if the API call fails
 */
export async function summarizeArticle(content: string): Promise<string | null> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: { effort: "low" },
      messages: [
        {
          role: "user",
          content: `Summarize the following software testing article in 2-3 concise sentences. Focus on key takeaways for QA professionals.\n\n${content}`,
        },
      ],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    return textBlock?.text ?? null;
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      console.error("AI rate limited — summarization skipped");
      return null;
    }
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}: ${error.message}`);
      return null;
    }
    throw error;
  }
}

/**
 * Suggest an AI-generated answer for an unanswered forum question.
 * The suggestion is clearly labeled as AI-generated in the UI.
 *
 * @param question - The forum thread title and content
 * @param existingAnswers - Any existing answers for context (to avoid repetition)
 * @returns Suggested answer in Markdown, or null on failure
 */
export async function suggestAnswer(
  question: string,
  existingAnswers: string[] = [],
): Promise<string | null> {
  const context =
    existingAnswers.length > 0
      ? `\n\nExisting answers (supplement, don't repeat):\n${existingAnswers.join("\n---\n")}`
      : "";

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: { effort: "medium" },
      messages: [
        {
          role: "user",
          content: `You are an expert software tester. A user asked the following question on a QA community forum. Suggest a helpful, accurate answer in Markdown format.\n\nQuestion:\n${question}${context}`,
        },
      ],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    return textBlock?.text ?? null;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}: ${error.message}`);
      return null;
    }
    throw error;
  }
}

/**
 * Suggest relevant tags for content based on the existing tag set.
 * Uses structured outputs (JSON schema) for type-safe responses.
 *
 * @param content - The article or thread content to classify
 * @param existingTags - Available tags in the system
 * @returns Array of suggested tag names, or empty array on failure
 */
export async function suggestTags(content: string, existingTags: string[]): Promise<string[]> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              tags: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["tags"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: `Suggest 2-5 relevant tags for the following content. Choose from existing tags when possible.\n\nAvailable tags: ${existingTags.join(", ")}\n\nContent:\n${content.substring(0, 2000)}`,
        },
      ],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    if (!textBlock) return [];

    const parsed = JSON.parse(textBlock.text) as { tags: string[] };
    return parsed.tags;
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}: ${error.message}`);
      return [];
    }
    throw error;
  }
}

/**
 * Enhance a search query using Claude to expand natural language into
 * structured search terms and relevant tags.
 *
 * @param query - The user's natural language search query
 * @param availableTags - Tags available in the system for matching
 * @returns Expanded search terms and matched tags, or the original query on failure
 */
export async function enhanceSearch(
  query: string,
  availableTags: string[],
): Promise<{ terms: string[]; tags: string[] }> {
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 256,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              terms: {
                type: "array",
                items: { type: "string" },
              },
              tags: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["terms", "tags"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: `Convert this search query into structured search terms and matching tags.\n\nQuery: "${query}"\n\nAvailable tags: ${availableTags.join(", ")}\n\nReturn key search terms for full-text search and relevant tags.`,
        },
      ],
    });

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === "text");
    if (!textBlock) return { terms: [query], tags: [] };

    return JSON.parse(textBlock.text) as { terms: string[]; tags: string[] };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      console.error(`Claude API error ${error.status}: ${error.message}`);
      return { terms: [query], tags: [] };
    }
    throw error;
  }
}
