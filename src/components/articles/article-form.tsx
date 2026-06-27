/**
 * Article creation/editing form.
 *
 * Title input, summary, Markdown textarea, and draft/publish status selector.
 * Uses the shared useFormSubmit hook + ui/input primitives to avoid the
 * loading/error/Tailwind boilerplate every form would otherwise repeat.
 */

"use client";

import { Field, Input, TextArea, Select, Button, ErrorMessage } from "@/components/ui/input";
import { useFormSubmit, postJson } from "@/lib/use-form-submit";

type Article = { slug: string };

export function ArticleForm({
  initialData,
}: {
  initialData?: {
    title: string;
    content: string;
    summary: string;
    status: string;
    slug?: string;
  };
}) {
  const isEdit = !!initialData?.slug;

  const { loading, error, handleSubmit } = useFormSubmit(async (formData) => {
    const data = {
      title: formData.get("title") as string,
      content: formData.get("content") as string,
      summary: formData.get("summary") as string,
      status: formData.get("status") as string,
    };
    const url = isEdit ? `/api/articles/${initialData!.slug}` : "/api/articles";
    const article = await postJson<Article>(url, data, {
      method: isEdit ? "PUT" : "POST",
    });
    return `/articles/${article.slug}`;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Field id="title" label="Title">
        <Input
          id="title"
          name="title"
          required
          defaultValue={initialData?.title}
          placeholder="e.g., Getting Started with Playwright E2E Testing"
        />
      </Field>

      <Field id="summary" label="Summary" hint="optional">
        <Input
          id="summary"
          name="summary"
          defaultValue={initialData?.summary}
          placeholder="Brief description of your article"
        />
      </Field>

      <Field id="content" label="Content" hint="Markdown">
        <TextArea
          id="content"
          name="content"
          required
          rows={20}
          defaultValue={initialData?.content}
          placeholder="Write your article in Markdown..."
          className="font-mono text-sm"
        />
      </Field>

      <div className="flex items-center gap-4">
        <Select name="status" defaultValue={initialData?.status ?? "draft"}>
          <option value="draft">Save as Draft</option>
          <option value="published">Publish</option>
        </Select>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : isEdit ? "Update Article" : "Create Article"}
        </Button>
      </div>
    </form>
  );
}
