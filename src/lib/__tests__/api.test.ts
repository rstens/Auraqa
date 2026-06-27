/**
 * Unit tests for the shared postJson HTTP helper.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { postJson } from "../api";

const originalFetch = globalThis.fetch;

describe("postJson", () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("POSTs JSON and returns the parsed body on 2xx", async () => {
    const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ slug: "hello-world" }),
    });

    const result = await postJson<{ slug: string }>("/api/articles", {
      title: "Hello",
    });

    expect(result).toEqual({ slug: "hello-world" });
    expect(mock).toHaveBeenCalledOnce();
    const [url, init] = mock.mock.calls[0];
    expect(url).toBe("/api/articles");
    expect(init.method).toBe("POST");
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json"
    );
    expect(JSON.parse(init.body as string)).toEqual({ title: "Hello" });
  });

  it("honors a custom method via init (e.g., PUT)", async () => {
    const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await postJson("/api/profile", { name: "X" }, { method: "PUT" });

    const [, init] = mock.mock.calls[0];
    expect(init.method).toBe("PUT");
  });

  it("throws with body.error message when the server returns non-2xx with an error body", async () => {
    const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce({
      ok: false,
      status: 409,
      json: async () => ({ error: "Username already taken" }),
    });

    await expect(postJson("/api/profile", {})).rejects.toThrow(
      "Username already taken"
    );
  });

  it("throws a generic 'Request failed (status)' when error body has no .error", async () => {
    const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(postJson("/api/foo", {})).rejects.toThrow(
      "Request failed (500)"
    );
  });

  it("falls back to the generic message when error body isn't valid JSON", async () => {
    const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce({
      ok: false,
      status: 502,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
    });

    await expect(postJson("/api/foo", {})).rejects.toThrow(
      "Request failed (502)"
    );
  });

  it("serializes nested objects in the body", async () => {
    const mock = globalThis.fetch as ReturnType<typeof vi.fn>;
    mock.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    await postJson("/api/votes", {
      targetType: "article",
      targetId: "abc-123",
      value: 1,
    });

    const [, init] = mock.mock.calls[0];
    expect(JSON.parse(init.body as string)).toEqual({
      targetType: "article",
      targetId: "abc-123",
      value: 1,
    });
  });
});
