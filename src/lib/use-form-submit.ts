/**
 * Shared form-submit hook.
 *
 * Centralizes the loading/error/fetch/redirect pattern that every form
 * component was duplicating. Callers provide a `submit` function that
 * receives the FormData and returns either a redirect path (string) or
 * `null` to refresh in place.
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export type SubmitResult = string | null;

export function useFormSubmit(
  submit: (data: FormData) => Promise<SubmitResult>
) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);
      const form = e.currentTarget;
      try {
        const result = await submit(new FormData(form));
        if (typeof result === "string") {
          router.push(result);
        } else {
          form.reset();
        }
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [submit, router]
  );

  return { loading, error, setError, handleSubmit };
}

/**
 * Helper: POST JSON to an endpoint and parse the response, throwing on !ok.
 * Used by form submit handlers to keep them concise.
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
