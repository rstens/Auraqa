import { describe, it, expect } from "vitest";
import {
  createArticleSchema,
  updateArticleSchema,
  createThreadSchema,
  createReplySchema,
  createToolSchema,
  updateToolSchema,
  updateUserRoleSchema,
  createReviewSchema,
  castVoteSchema,
  searchQuerySchema,
  updateProfileSchema,
  glossaryTermSchema,
  adminAiActionSchema,
  adminSuggestAnswerSchema,
  listQuerySchema,
  threadsListQuerySchema,
} from "../validators";

describe("createArticleSchema", () => {
  it("accepts valid article", () => {
    const result = createArticleSchema.safeParse({
      title: "Test Article",
      content: "Some content here",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("draft");
    }
  });

  it("accepts article with all fields", () => {
    const result = createArticleSchema.safeParse({
      title: "Full Article",
      content: "Content",
      summary: "A summary",
      tags: ["testing", "automation"],
      status: "published",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty title", () => {
    const result = createArticleSchema.safeParse({ title: "", content: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects empty content", () => {
    const result = createArticleSchema.safeParse({ title: "x", content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects title over 200 chars", () => {
    const result = createArticleSchema.safeParse({ title: "a".repeat(201), content: "x" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status", () => {
    const result = createArticleSchema.safeParse({ title: "x", content: "x", status: "archived" });
    expect(result.success).toBe(false);
  });

  it("rejects more than 10 tags", () => {
    const result = createArticleSchema.safeParse({
      title: "x",
      content: "x",
      tags: Array.from({ length: 11 }, (_, i) => `tag${i}`),
    });
    expect(result.success).toBe(false);
  });

  it("defaults status to draft", () => {
    const result = createArticleSchema.safeParse({ title: "x", content: "x" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.status).toBe("draft");
  });
});

describe("updateArticleSchema", () => {
  it("accepts partial update with only title", () => {
    const result = updateArticleSchema.safeParse({ title: "New Title" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    const result = updateArticleSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rejects invalid status in partial", () => {
    const result = updateArticleSchema.safeParse({ status: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("createThreadSchema", () => {
  it("accepts valid thread", () => {
    const result = createThreadSchema.safeParse({
      title: "Question",
      content: "Details",
      categoryId: 1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing categoryId", () => {
    const result = createThreadSchema.safeParse({ title: "Q", content: "D" });
    expect(result.success).toBe(false);
  });

  it("rejects negative categoryId", () => {
    const result = createThreadSchema.safeParse({ title: "Q", content: "D", categoryId: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects zero categoryId", () => {
    const result = createThreadSchema.safeParse({ title: "Q", content: "D", categoryId: 0 });
    expect(result.success).toBe(false);
  });
});

describe("createReplySchema", () => {
  it("accepts valid reply", () => {
    const result = createReplySchema.safeParse({ content: "Reply text" });
    expect(result.success).toBe(true);
  });

  it("accepts reply with parentId", () => {
    const result = createReplySchema.safeParse({
      content: "Reply",
      parentId: "01926a3b-4c5d-7e8f-9012-3456789abcde",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty content", () => {
    const result = createReplySchema.safeParse({ content: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid parentId format", () => {
    const result = createReplySchema.safeParse({ content: "x", parentId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });
});

describe("createToolSchema", () => {
  it("accepts valid tool", () => {
    const result = createToolSchema.safeParse({
      name: "Playwright",
      description: "E2E testing framework",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.pricing).toBe("unknown");
  });

  it("accepts all pricing options", () => {
    for (const pricing of ["free", "freemium", "paid", "open-source", "unknown"]) {
      const result = createToolSchema.safeParse({ name: "T", description: "D", pricing });
      expect(result.success).toBe(true);
    }
  });

  it("rejects invalid pricing", () => {
    const result = createToolSchema.safeParse({ name: "T", description: "D", pricing: "cheap" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid URL", () => {
    const result = createToolSchema.safeParse({
      name: "T",
      description: "D",
      websiteUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid URL", () => {
    const result = createToolSchema.safeParse({
      name: "T",
      description: "D",
      websiteUrl: "https://playwright.dev",
    });
    expect(result.success).toBe(true);
  });
});

describe("updateToolSchema", () => {
  it("accepts status field", () => {
    const result = updateToolSchema.safeParse({ status: "approved" });
    expect(result.success).toBe(true);
  });

  it("accepts all status values", () => {
    for (const status of ["pending", "approved", "rejected"]) {
      expect(updateToolSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it("rejects invalid status", () => {
    expect(updateToolSchema.safeParse({ status: "published" }).success).toBe(false);
  });
});

describe("updateUserRoleSchema", () => {
  it("accepts 'user' role", () => {
    expect(updateUserRoleSchema.safeParse({ role: "user" }).success).toBe(true);
  });

  it("accepts 'admin' role", () => {
    expect(updateUserRoleSchema.safeParse({ role: "admin" }).success).toBe(true);
  });

  it("rejects invalid role", () => {
    expect(updateUserRoleSchema.safeParse({ role: "moderator" }).success).toBe(false);
  });

  it("rejects missing role", () => {
    expect(updateUserRoleSchema.safeParse({}).success).toBe(false);
  });
});

describe("createReviewSchema", () => {
  it("accepts valid review", () => {
    const result = createReviewSchema.safeParse({ rating: 4, content: "Great tool" });
    expect(result.success).toBe(true);
  });

  it("rejects rating below 1", () => {
    expect(createReviewSchema.safeParse({ rating: 0, content: "x" }).success).toBe(false);
  });

  it("rejects rating above 5", () => {
    expect(createReviewSchema.safeParse({ rating: 6, content: "x" }).success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    expect(createReviewSchema.safeParse({ rating: 3.5, content: "x" }).success).toBe(false);
  });

  it("accepts optional title", () => {
    const result = createReviewSchema.safeParse({ rating: 5, content: "x", title: "Title" });
    expect(result.success).toBe(true);
  });
});

describe("castVoteSchema", () => {
  it("accepts valid upvote", () => {
    const result = castVoteSchema.safeParse({
      targetType: "article",
      targetId: "01926a3b-4c5d-7e8f-9012-3456789abcde",
      value: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid downvote", () => {
    const result = castVoteSchema.safeParse({
      targetType: "thread",
      targetId: "01926a3b-4c5d-7e8f-9012-3456789abcde",
      value: -1,
    });
    expect(result.success).toBe(true);
  });

  it("rejects value of 0", () => {
    expect(
      castVoteSchema.safeParse({
        targetType: "article",
        targetId: "01926a3b-4c5d-7e8f-9012-3456789abcde",
        value: 0,
      }).success,
    ).toBe(false);
  });

  it("rejects invalid targetType", () => {
    expect(
      castVoteSchema.safeParse({
        targetType: "comment",
        targetId: "01926a3b-4c5d-7e8f-9012-3456789abcde",
        value: 1,
      }).success,
    ).toBe(false);
  });

  it("accepts all valid target types", () => {
    for (const targetType of ["article", "thread", "reply"]) {
      expect(
        castVoteSchema.safeParse({
          targetType,
          targetId: "01926a3b-4c5d-7e8f-9012-3456789abcde",
          value: 1,
        }).success,
      ).toBe(true);
    }
  });
});

describe("searchQuerySchema", () => {
  it("accepts minimal search query", () => {
    const result = searchQuerySchema.safeParse({ q: "test" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.type).toBe("all");
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it("accepts all type options", () => {
    for (const type of ["all", "articles", "threads", "tools", "glossary"]) {
      expect(searchQuerySchema.safeParse({ q: "x", type }).success).toBe(true);
    }
  });

  it("rejects empty query", () => {
    expect(searchQuerySchema.safeParse({ q: "" }).success).toBe(false);
  });

  it("rejects query over 200 chars", () => {
    expect(searchQuerySchema.safeParse({ q: "a".repeat(201) }).success).toBe(false);
  });

  it("rejects limit over 50", () => {
    expect(searchQuerySchema.safeParse({ q: "x", limit: 51 }).success).toBe(false);
  });

  it("coerces string page to number", () => {
    const result = searchQuerySchema.safeParse({ q: "x", page: "3" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(3);
  });
});

describe("updateProfileSchema", () => {
  it("accepts valid profile update", () => {
    const result = updateProfileSchema.safeParse({ name: "New Name", bio: "About me" });
    expect(result.success).toBe(true);
  });

  it("accepts empty object", () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(true);
  });

  it("rejects name over 100 chars", () => {
    expect(updateProfileSchema.safeParse({ name: "a".repeat(101) }).success).toBe(false);
  });

  it("rejects bio over 500 chars", () => {
    expect(updateProfileSchema.safeParse({ bio: "a".repeat(501) }).success).toBe(false);
  });

  it("rejects empty name", () => {
    expect(updateProfileSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("accepts a valid username", () => {
    expect(updateProfileSchema.safeParse({ username: "alice_42" }).success).toBe(true);
  });

  it("rejects empty username", () => {
    expect(updateProfileSchema.safeParse({ username: "" }).success).toBe(false);
  });

  it("rejects username over 50 chars", () => {
    expect(updateProfileSchema.safeParse({ username: "a".repeat(51) }).success).toBe(false);
  });

  it("accepts all three fields together", () => {
    const result = updateProfileSchema.safeParse({
      name: "Alice",
      username: "alice",
      bio: "Hi",
    });
    expect(result.success).toBe(true);
  });
});

describe("glossaryTermSchema", () => {
  it("accepts valid glossary term", () => {
    const result = glossaryTermSchema.safeParse({
      term: "Testing",
      definition: "The process of evaluating software",
      category: "fundamentals",
    });
    expect(result.success).toBe(true);
  });

  it("accepts term with abbreviation", () => {
    const result = glossaryTermSchema.safeParse({
      term: "User Acceptance Testing",
      abbreviation: "UAT",
      definition: "Final testing phase",
      category: "fundamentals",
    });
    expect(result.success).toBe(true);
  });

  it("accepts null abbreviation", () => {
    const result = glossaryTermSchema.safeParse({
      term: "Testing",
      abbreviation: null,
      definition: "Def",
      category: "fundamentals",
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty term", () => {
    expect(glossaryTermSchema.safeParse({ term: "", definition: "x", category: "x" }).success).toBe(
      false,
    );
  });

  it("rejects empty definition", () => {
    expect(glossaryTermSchema.safeParse({ term: "x", definition: "", category: "x" }).success).toBe(
      false,
    );
  });

  it("rejects abbreviation over 20 chars", () => {
    expect(
      glossaryTermSchema.safeParse({
        term: "x",
        definition: "x",
        category: "x",
        abbreviation: "a".repeat(21),
      }).success,
    ).toBe(false);
  });
});

describe("adminAiActionSchema", () => {
  it("accepts summarize", () => {
    expect(adminAiActionSchema.safeParse({ action: "summarize" }).success).toBe(true);
  });

  it("accepts suggest-tags", () => {
    expect(adminAiActionSchema.safeParse({ action: "suggest-tags" }).success).toBe(true);
  });

  it("rejects unknown action", () => {
    expect(adminAiActionSchema.safeParse({ action: "translate" }).success).toBe(false);
  });
});

describe("adminSuggestAnswerSchema", () => {
  it("accepts valid UUID", () => {
    expect(
      adminSuggestAnswerSchema.safeParse({
        threadId: "01926a3b-4c5d-7e8f-9012-3456789abcde",
      }).success,
    ).toBe(true);
  });

  it("rejects non-UUID", () => {
    expect(adminSuggestAnswerSchema.safeParse({ threadId: "not-a-uuid" }).success).toBe(false);
  });
});

describe("listQuerySchema", () => {
  it("defaults to page=1, limit=20 when nothing is provided", () => {
    const r = listQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual({ page: 1, limit: 20 });
  });

  it("coerces numeric strings", () => {
    const r = listQuerySchema.safeParse({ page: "3", limit: "10" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual({ page: 3, limit: 10 });
  });

  it("rejects SQLi-shaped injection probes (regression: SQLMap 500s)", () => {
    expect(listQuerySchema.safeParse({ page: "' OR 1=1--" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ limit: "1; DROP TABLE articles;" }).success).toBe(false);
  });

  it("rejects negative and zero page/limit", () => {
    expect(listQuerySchema.safeParse({ page: "0" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ page: "-1" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ limit: "0" }).success).toBe(false);
  });

  it("rejects limit values above the 50-row cap", () => {
    // Hard reject (not silent clamp) so over-eager callers see the error
    // instead of silently getting fewer rows than they asked for.
    expect(listQuerySchema.safeParse({ limit: "51" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ limit: "1000" }).success).toBe(false);
  });

  it("treats empty-string page/limit as 'not provided' (use defaults)", () => {
    // `z.coerce.number()` turns "" into 0, which then fails .positive().
    // The emptyAsUndefined preprocessor short-circuits that so a request
    // like `?page=&limit=` falls back to the schema defaults — same
    // behavior users got before the schema existed.
    const r = listQuerySchema.safeParse({ page: "", limit: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toEqual({ page: 1, limit: 20 });
  });

  it("rejects non-integer page/limit", () => {
    expect(listQuerySchema.safeParse({ page: "1.5" }).success).toBe(false);
    expect(listQuerySchema.safeParse({ limit: "NaN" }).success).toBe(false);
  });
});

describe("threadsListQuerySchema", () => {
  it("accepts an optional positive-integer categoryId", () => {
    const r = threadsListQuerySchema.safeParse({ categoryId: "7" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.categoryId).toBe(7);
  });

  it("rejects non-numeric categoryId (regression: SQLMap 500s)", () => {
    expect(threadsListQuerySchema.safeParse({ categoryId: "not-a-number" }).success).toBe(false);
    expect(threadsListQuerySchema.safeParse({ categoryId: "' OR 1=1--" }).success).toBe(false);
  });

  it("rejects negative or zero categoryId", () => {
    expect(threadsListQuerySchema.safeParse({ categoryId: "0" }).success).toBe(false);
    expect(threadsListQuerySchema.safeParse({ categoryId: "-1" }).success).toBe(false);
  });

  it("allows the categoryId param to be absent", () => {
    const r = threadsListQuerySchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.categoryId).toBeUndefined();
  });

  it("treats empty-string categoryId as 'not provided' (no filter)", () => {
    // Pre-schema behavior was `if (categoryId) { … }`, which treated ""
    // as falsy and skipped the filter. The emptyAsUndefined preprocessor
    // matches that — a 400 here would be a regression for clients that
    // build query strings from form inputs that may leave the field blank.
    const r = threadsListQuerySchema.safeParse({ categoryId: "" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.categoryId).toBeUndefined();
  });
});
