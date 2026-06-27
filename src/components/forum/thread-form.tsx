/**
 * Thread creation form.
 *
 * Uses shared useFormSubmit + ui/input primitives.
 */

"use client";

import { Field, Input, TextArea, Button, ErrorMessage } from "@/components/ui/input";
import { useFormSubmit, postJson } from "@/lib/use-form-submit";

type Thread = { id: string };

export function ThreadForm({ categoryId }: { categoryId: number }) {
  const { loading, error, handleSubmit } = useFormSubmit(async (formData) => {
    const thread = await postJson<Thread>("/api/forum/threads", {
      title: formData.get("title"),
      content: formData.get("content"),
      categoryId,
    });
    return `/forum/thread/${thread.id}`;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Field id="title" label="Title">
        <Input id="title" name="title" required placeholder="What's your question?" />
      </Field>

      <Field id="content" label="Content" hint="Markdown">
        <TextArea
          id="content"
          name="content"
          required
          rows={10}
          placeholder="Describe your question or discussion topic..."
          className="font-mono text-sm"
        />
      </Field>

      <Button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Post Thread"}
      </Button>
    </form>
  );
}
