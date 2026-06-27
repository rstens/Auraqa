/**
 * Account settings page.
 *
 * Lets the signed-in user edit their display name, bio, and username.
 * Email/avatar are managed by the OAuth provider and not editable here.
 */

export const dynamic = "force-dynamic";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/profile/settings-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const userResult = await db
    .select({
      id: users.id,
      name: users.name,
      username: users.username,
      bio: users.bio,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  const user = userResult[0];
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
        Account Settings
      </h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Signed in as {user.email}
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
