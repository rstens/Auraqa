/**
 * Unit tests for shared utility functions.
 */

import { describe, it, expect } from "vitest";
import { slugify, truncate, timeAgo } from "../utils";

describe("slugify", () => {
  it("converts a title to a URL-safe slug", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("handles special characters", () => {
    expect(slugify("What's the best API testing tool?")).toBe("whats-the-best-api-testing-tool");
  });

  it("collapses consecutive hyphens", () => {
    expect(slugify("Test -- Automation")).toBe("test-automation");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  -Hello World-  ")).toBe("hello-world");
  });

  it("handles empty strings", () => {
    expect(slugify("")).toBe("");
  });
});

describe("truncate", () => {
  it("returns the full string if within limit", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("truncates and adds ellipsis when over limit", () => {
    const result = truncate("Hello World, this is a long string", 15);
    expect(result.length).toBe(15);
    expect(result.endsWith("…")).toBe(true);
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent dates", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("returns minutes ago", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinutesAgo)).toBe("5 minutes ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(timeAgo(twoHoursAgo)).toBe("2 hours ago");
  });

  it("returns singular form for 1 unit", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(timeAgo(oneHourAgo)).toBe("1 hour ago");
  });
});
