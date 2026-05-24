/**
 * Unit tests for UUIDv7 generation.
 */

import { describe, it, expect } from "vitest";
import { generateId } from "../uuid";

describe("generateId", () => {
  it("returns a valid UUID string", () => {
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });

  it("generates monotonically increasing IDs", () => {
    const ids = Array.from({ length: 10 }, () => generateId());
    const sorted = [...ids].sort();
    expect(ids).toEqual(sorted);
  });
});
