/**
 * Settings form — update display name, username, bio.
 *
 * Uses shared form primitives + useFormSubmit hook.
 */

"use client";

import { Field, Input, TextArea, Button, ErrorMessage } from "@/components/ui/input";
import { useFormSubmit, postJson } from "@/lib/use-form-submit";

export function SettingsForm({
  initialData,
}: {
  initialData: { name: string; username: string; bio: string };
}) {
  const { loading, error, handleSubmit } = useFormSubmit(async (formData) => {
    await postJson(
      "/api/profile",
      {
        name: formData.get("name"),
        username: formData.get("username"),
        bio: formData.get("bio"),
      },
      { method: "PUT" }
    );
    return null;
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <ErrorMessage>{error}</ErrorMessage>}

      <Field id="name" label="Display Name">
        <Input id="name" name="name" defaultValue={initialData.name} maxLength={100} />
      </Field>

      <Field
        id="username"
        label="Username"
        hint="visible in your profile URL"
      >
        <Input
          id="username"
          name="username"
          defaultValue={initialData.username}
          pattern="[a-zA-Z0-9_-]+"
          minLength={2}
          maxLength={40}
          required
        />
      </Field>

      <Field id="bio" label="Bio" hint="optional">
        <TextArea
          id="bio"
          name="bio"
          defaultValue={initialData.bio}
          rows={4}
          maxLength={500}
          placeholder="A short bio about yourself"
        />
      </Field>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
