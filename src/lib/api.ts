/**
 * Shared HTTP helpers for client-side fetch calls.
 *
 * Centralizes the JSON-post pattern used by forms, VoteButtons, and any
 * other client component that talks to our internal /api routes.
 */

/**
 * POST or PUT JSON to an endpoint and parse the response.
 * Throws an Error on non-2xx, with `body.error` as the message if available.
 *
 * @example
 *   const article = await postJson<{slug: string}>("/api/articles", data);
 *   await postJson("/api/profile", data, { method: "PUT" });
 */
export async function postJson<T = unknown>(
  url: string,
  body: unknown,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...init,
  });
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(errBody.error ?? `Request failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}
