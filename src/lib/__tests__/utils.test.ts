import { describe, it, expect } from "vitest";
import { cn, slugify, truncate, timeAgo } from "../utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignores falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("respects clsx conditional object syntax", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("flattens nested arrays", () => {
    expect(cn(["a", ["b", "c"]], "d")).toBe("a b c d");
  });

  it("resolves Tailwind conflicts via tailwind-merge", () => {
    // tailwind-merge keeps the last conflicting class only
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("preserves non-conflicting Tailwind classes", () => {
    expect(cn("p-2", "m-2", "bg-red-500")).toBe("p-2 m-2 bg-red-500");
  });

  it("returns an empty string for no inputs", () => {
    expect(cn()).toBe("");
  });
});

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

  it("handles strings with only special characters", () => {
    expect(slugify("!@#$%^&*()")).toBe("");
  });

  it("handles unicode characters", () => {
    expect(slugify("Tëst Àutomation")).toBe("tst-utomation");
  });

  it("converts underscores to hyphens", () => {
    expect(slugify("test_automation_tool")).toBe("test-automation-tool");
  });

  it("handles numeric input", () => {
    expect(slugify("Test 123 Runner")).toBe("test-123-runner");
  });

  it("handles very long strings", () => {
    const long = "a".repeat(500);
    expect(slugify(long)).toBe(long);
  });

  it("handles mixed whitespace", () => {
    expect(slugify("test\tautomation\nnow")).toBe("test-automation-now");
  });
});

describe("truncate", () => {
  it("returns the full string if within limit", () => {
    expect(truncate("Hello", 10)).toBe("Hello");
  });

  it("returns the full string if exactly at limit", () => {
    expect(truncate("Hello", 5)).toBe("Hello");
  });

  it("truncates and adds ellipsis when over limit", () => {
    const result = truncate("Hello World, this is a long string", 15);
    expect(result.length).toBe(15);
    expect(result.endsWith("…")).toBe(true);
  });

  it("handles single character limit", () => {
    const result = truncate("Hello", 1);
    expect(result).toBe("…");
  });

  it("handles empty string", () => {
    expect(truncate("", 10)).toBe("");
  });

  it("does not truncate when string length equals maxLength", () => {
    expect(truncate("12345", 5)).toBe("12345");
  });

  it("truncates at maxLength minus 1 plus ellipsis", () => {
    expect(truncate("abcdef", 5)).toBe("abcd…");
  });
});

describe("timeAgo", () => {
  it("returns 'just now' for recent dates", () => {
    expect(timeAgo(new Date())).toBe("just now");
  });

  it("returns 'just now' for dates less than 60 seconds ago", () => {
    const thirtySecondsAgo = new Date(Date.now() - 30 * 1000);
    expect(timeAgo(thirtySecondsAgo)).toBe("just now");
  });

  it("returns '1 minute ago' for singular", () => {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    expect(timeAgo(oneMinuteAgo)).toBe("1 minute ago");
  });

  it("returns minutes ago", () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    expect(timeAgo(fiveMinutesAgo)).toBe("5 minutes ago");
  });

  it("returns '1 hour ago' for singular", () => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    expect(timeAgo(oneHourAgo)).toBe("1 hour ago");
  });

  it("returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    expect(timeAgo(twoHoursAgo)).toBe("2 hours ago");
  });

  it("returns '1 day ago' for singular", () => {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(timeAgo(oneDayAgo)).toBe("1 day ago");
  });

  it("returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeDaysAgo)).toBe("3 days ago");
  });

  it("returns '1 month ago' for singular", () => {
    const oneMonthAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000);
    expect(timeAgo(oneMonthAgo)).toBe("1 month ago");
  });

  it("returns months ago", () => {
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    expect(timeAgo(threeMonthsAgo)).toBe("3 months ago");
  });

  it("returns '1 year ago' for singular", () => {
    const oneYearAgo = new Date(Date.now() - 366 * 24 * 60 * 60 * 1000);
    expect(timeAgo(oneYearAgo)).toBe("1 year ago");
  });

  it("returns years ago", () => {
    const twoYearsAgo = new Date(Date.now() - 730 * 24 * 60 * 60 * 1000);
    expect(timeAgo(twoYearsAgo)).toBe("2 years ago");
  });
});
