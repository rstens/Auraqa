/**
 * Tool review form with star rating.
 *
 * Uses shared useFormSubmit + ui/input primitives. Rating state is local
 * since it's interactive UI (5-star widget), then injected into the submit.
 */

"use client";

import { useState } from "react";
import { Field, Input, TextArea, Button, ErrorMessage } from "@/components/ui/input";
import { useFormSubmit, postJson } from "@/lib/use-form-submit";

export function ReviewForm({ toolSlug }: { toolSlug: string }) {
  const [rating, setRating] = useState(0);

  const { loading, error, setError, handleSubmit } = useFormSubmit(
    async (formData) => {
      if (rating === 0) {
        // Throw to surface the error via the shared hook's catch.
        throw new Error("Please select a rating");
      }
      await postJson(`/api/tools/${toolSlug}/reviews`, {
        rating,
        title: formData.get("title") || undefined,
        content: formData.get("content"),
      });
      setRating(0);
      return null;
    }
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Rating
        </label>
        <div className="mt-1 flex gap-1" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={star === rating}
              aria-label={`${star} star${star !== 1 ? "s" : ""}`}
              onClick={() => {
                setRating(star);
                setError(null);
              }}
              className={`text-2xl transition-colors ${
                star <= rating ? "text-amber-500" : "text-slate-300 dark:text-slate-600"
              } hover:text-amber-400`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <Field id="title" label="Title" hint="optional">
        <Input id="title" name="title" type="text" />
      </Field>

      <Field id="content" label="Review">
        <TextArea
          id="content"
          name="content"
          required
          rows={4}
          placeholder="Share your experience with this tool..."
        />
      </Field>

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
