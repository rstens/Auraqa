/**
 * Shared HTTP helpers for AuraQA API routes.
 *
 * Centralises the "validate input, run DB call, never let an exception
 * escape as a stack-trace 500" pattern. Every public handler should go
 * through these helpers so error shapes and status codes stay consistent
 * across the surface — especially important for the security scan that
 * probes every endpoint with malformed input.
 */

import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodSchema } from "zod";

/** Uniform JSON error response shape used by every route. */
export function jsonError(message: string, status: number, details?: unknown): NextResponse {
  return NextResponse.json(
    details === undefined ? { error: message } : { error: message, details },
    { status },
  );
}

export type ParseResult<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/**
 * Parse and validate a JSON request body. Returns a discriminated union
 * so callers can early-return the 400 response without nested try/catch.
 *
 * Catches:
 * - SyntaxError from request.json() when the body isn't valid JSON
 * - Zod validation errors with a flattened details object
 */
export async function parseBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>,
): Promise<ParseResult<T>> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return { ok: false, response: jsonError("Invalid JSON body", 400) };
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError("Validation failed", 400, parsed.error.flatten()),
    };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Parse and validate query-string parameters. Same return shape as
 * parseBody; same early-return pattern in handlers.
 *
 * Catches:
 * - Non-string / non-coercible inputs the schema rejects (e.g. SQLi
 *   probes like `?page=' OR 1=1--` that would otherwise become NaN
 *   and crash the downstream Drizzle query)
 */
export function parseQuery<T>(request: NextRequest, schema: ZodSchema<T>): ParseResult<T> {
  const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError("Invalid query parameters", 400, parsed.error.flatten()),
    };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Parse a route param (`[slug]`, `[id]`, etc.) through a Zod schema.
 *
 * Catches:
 * - Path-traversal-shaped slugs (`../../etc/passwd`)
 * - Non-UUID strings hitting endpoints that expect a UUID
 * - Empty / oversized strings
 *
 * Pass the raw `await context.params` object; the schema validates the
 * keys you care about and returns the typed shape on success.
 */
export function parseParams<T>(raw: Record<string, unknown>, schema: ZodSchema<T>): ParseResult<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      response: jsonError("Invalid route parameter", 400, parsed.error.flatten()),
    };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Wrap an async handler so any uncaught exception becomes a structured
 * 500 JSON instead of a stack-trace response. The first argument is a
 * label used in the server log to identify the failing handler.
 *
 * Usage:
 *   export const POST = withErrorHandling("POST /api/votes", async (req) => {
 *     ...
 *   });
 */
export function withErrorHandling<TArgs extends unknown[]>(
  label: string,
  handler: (...args: TArgs) => Promise<NextResponse>,
): (...args: TArgs) => Promise<NextResponse> {
  return async (...args: TArgs) => {
    try {
      return await handler(...args);
    } catch (err) {
      // Zod errors that escape the parse* helpers — surface as 400 with
      // the same shape so clients get a consistent contract.
      if (err instanceof ZodError) {
        return jsonError("Validation failed", 400, err.flatten());
      }
      // Log the real error server-side; client gets a generic message
      // so internal details don't leak through error responses.
      console.error(`${label} failed`, err);
      return jsonError("Internal server error", 500);
    }
  };
}
