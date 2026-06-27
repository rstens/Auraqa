/**
 * Reply form for forum threads.
 *
 * Uses shared useFormSubmit + ui/input primitives.
 */

"use client";

import { TextArea, Button, ErrorMessage } from "@/components/ui/input";
import { useFormSubmit, postJson } from "@/lib/use-form-submit";

export function ReplyForm({ threadId }: { threadId: string }) {
  const { loading, error, handleSubmit } = useFormSubmit(async (formData) => {
    await postJson(`/api/forum/threads/${threadId}/replies`, {
      content: formData.get("content"),
    });
    return null;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <TextArea
        name="content"
        required
        rows={5}
        placeholder="Write your reply in Markdown..."
        className="font-mono text-sm"
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Posting..." : "Post Reply"}
      </Button>
    </form>
  );
}
