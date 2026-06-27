/**
 * Tool submission form.
 *
 * Submitted tools enter the moderation queue (status="pending"). The submitter
 * is redirected back to /tools with a flag, not to the unpublished detail page.
 */

"use client";

import { Field, Input, TextArea, Select, Button, ErrorMessage } from "@/components/ui/input";
import { useFormSubmit, postJson } from "@/lib/use-form-submit";

export function ToolSubmitForm() {
  const { loading, error, handleSubmit } = useFormSubmit(async (formData) => {
    await postJson("/api/tools", {
      name: formData.get("name"),
      description: formData.get("description"),
      websiteUrl: formData.get("websiteUrl") || undefined,
      category: formData.get("category") || undefined,
      pricing: formData.get("pricing"),
    });
    return "/tools?submitted=1";
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Field id="name" label="Tool Name">
        <Input id="name" name="name" required placeholder="e.g., Playwright" />
      </Field>

      <Field id="description" label="Description">
        <TextArea
          id="description"
          name="description"
          required
          rows={4}
          placeholder="What does this tool do? What testing scenarios is it best for?"
        />
      </Field>

      <Field id="websiteUrl" label="Website URL" hint="optional">
        <Input
          id="websiteUrl"
          name="websiteUrl"
          type="url"
          placeholder="https://playwright.dev"
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field id="category" label="Category">
          <Select id="category" name="category">
            <option value="">Select...</option>
            <option value="unit">Unit Testing</option>
            <option value="integration">Integration Testing</option>
            <option value="e2e">E2E Testing</option>
            <option value="performance">Performance</option>
            <option value="security">Security</option>
            <option value="api">API Testing</option>
            <option value="mobile">Mobile Testing</option>
            <option value="accessibility">Accessibility</option>
            <option value="visual">Visual Testing</option>
            <option value="management">Test Management</option>
            <option value="ci-cd">CI/CD</option>
            <option value="other">Other</option>
          </Select>
        </Field>
        <Field id="pricing" label="Pricing">
          <Select id="pricing" name="pricing">
            <option value="unknown">Unknown</option>
            <option value="free">Free</option>
            <option value="open-source">Open Source</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
          </Select>
        </Field>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Submitting..." : "Submit for Review"}
      </Button>
    </form>
  );
}
