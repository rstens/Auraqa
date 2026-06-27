import { describe, it, expect } from "vitest";
import { generateId } from "../uuid";

describe("generateId", () => {
  it("returns a valid UUIDv7 string", () => {
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

  it("returns a 36-character string", () => {
    expect(generateId().length).toBe(36);
  });

  it("version nibble is always 7", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateId()[14]).toBe("7");
    }
  });

  it("variant bits are always 10xx", () => {
    for (let i = 0; i < 20; i++) {
      expect(generateId()[19]).toMatch(/[89ab]/);
    }
  });
});
