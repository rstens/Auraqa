import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SettingsForm } from "@/components/profile/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const result = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);
  if (result.length === 0) redirect("/login");

  const user = result[0];

  return (
    <div data-testid="settings-page" className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Update your profile information
      </p>

      <div className="mt-8">
        <SettingsForm
          initialData={{
            name: user.name ?? "",
            username: user.username ?? "",
            bio: user.bio ?? "",
          }}
        />
      </div>
    </div>
  );
}
