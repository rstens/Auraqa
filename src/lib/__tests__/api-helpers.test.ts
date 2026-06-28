import { describe, it, expect } from "vitest";
import { z } from "zod";
import { NextResponse } from "next/server";
import { jsonError, parseBody, parseParams, parseQuery, withErrorHandling } from "../api-helpers";

/**
 * Helper: build a NextRequest-shape stub that the helpers actually need.
 *
 * The real NextRequest is heavy to construct in jsdom (Node fetch impl,
 * URL parsing); we only need `nextUrl.searchParams` for parseQuery and a
 * working `.json()` for parseBody. Casting to the parameter type at the
 * call sites is safe because the helpers don't touch anything else.
 */
function makeRequest({
  url = "http://localhost:3000/test",
  body,
}: {
  url?: string;
  body?: string | object;
} = {}) {
  const u = new URL(url);
  return {
    nextUrl: u,
    json: async () => {
      if (body === undefined) throw new SyntaxError("no body");
      if (typeof body === "string") {
        // Mimic Request.json's parse-or-throw behavior.
        return JSON.parse(body);
      }
      return body;
    },
  } as unknown as Parameters<typeof parseBody>[0];
}

describe("jsonError", () => {
  it("returns a NextResponse with the given message and status", async () => {
    const res = jsonError("Boom", 418);
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.status).toBe(418);
    expect(await res.json()).toEqual({ error: "Boom" });
  });

  it("attaches details when provided", async () => {
    const res = jsonError("Validation failed", 400, { fieldErrors: { q: ["required"] } });
    expect(await res.json()).toEqual({
      error: "Validation failed",
      details: { fieldErrors: { q: ["required"] } },
    });
  });
});

describe("parseQuery", () => {
  const schema = z.object({ q: z.string().min(1), limit: z.coerce.number().int().max(10) });

  it("returns parsed data on success", () => {
    const req = makeRequest({ url: "http://x.test/?q=hello&limit=5" });
    const result = parseQuery(req as never, schema);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ q: "hello", limit: 5 });
  });

  it("returns a 400 response on validation failure", async () => {
    const req = makeRequest({ url: "http://x.test/?limit=999" });
    const result = parseQuery(req as never, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toBe("Invalid query parameters");
      expect(body.details).toBeDefined();
    }
  });

  it("returns 400 for SQLi-shaped numeric coercion (regression)", async () => {
    const req = makeRequest({ url: "http://x.test/?q=ok&limit=%27%20OR%201%3D1--" });
    const result = parseQuery(req as never, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.response.status).toBe(400);
  });
});

describe("parseBody", () => {
  const schema = z.object({ name: z.string().min(1) });

  it("returns parsed data on success", async () => {
    const req = makeRequest({ body: { name: "OK" } });
    const result = await parseBody(req as never, schema);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toEqual({ name: "OK" });
  });

  it("returns 400 when the body isn't valid JSON", async () => {
    const req = makeRequest({ body: "{ not valid json" });
    const result = await parseBody(req as never, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toBe("Invalid JSON body");
    }
  });

  it("returns 400 when the body fails schema validation", async () => {
    const req = makeRequest({ body: { name: "" } });
    const result = await parseBody(req as never, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toBe("Validation failed");
      expect(body.details.fieldErrors.name).toBeDefined();
    }
  });
});

describe("parseParams", () => {
  const schema = z.object({ slug: z.string().regex(/^[a-z0-9-]+$/) });

  it("returns parsed data on success", () => {
    const result = parseParams({ slug: "valid-slug" }, schema);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.slug).toBe("valid-slug");
  });

  it("rejects path traversal", async () => {
    const result = parseParams({ slug: "../../etc/passwd" }, schema);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(400);
      const body = await result.response.json();
      expect(body.error).toBe("Invalid route parameter");
    }
  });
});

describe("withErrorHandling", () => {
  it("passes through the handler's response on success", async () => {
    const handler = withErrorHandling("test", async () => NextResponse.json({ ok: true }));
    const res = await handler();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("converts an uncaught throw into a 500 JSON response", async () => {
    const handler = withErrorHandling("test", async () => {
      throw new Error("kaboom");
    });
    const res = await handler();
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ error: "Internal server error" });
  });

  it("converts an uncaught ZodError into a 400", async () => {
    const handler = withErrorHandling("test", async () => {
      z.string().min(1).parse(""); // throws ZodError
      return NextResponse.json({ unreachable: true });
    });
    const res = await handler();
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("Validation failed");
  });

  it("does not leak the underlying error message to the client", async () => {
    const handler = withErrorHandling("test", async () => {
      throw new Error("super-secret internal detail with PII");
    });
    const res = await handler();
    const body = await res.json();
    expect(body.error).toBe("Internal server error");
    expect(JSON.stringify(body)).not.toContain("super-secret");
  });
});
