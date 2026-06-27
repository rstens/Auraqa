/**
 * Shared form-submit hook.
 *
 * Centralizes the loading/error/fetch/redirect pattern that every form
 * component was duplicating. Callers provide a `submit` function that
 * receives the FormData and returns either a redirect path (string) or
 * `null` to refresh in place.
 *
 * For the actual HTTP call, callers use `postJson` from `@/lib/api`.
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

// Re-export postJson so existing imports of `{ useFormSubmit, postJson }` from
// this module keep working without a churn-only refactor on every form. New
// callers should import postJson directly from `@/lib/api`.
export { postJson } from "./api";

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
