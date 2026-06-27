/**
 * Submit a tool page.
 *
 * Auth-protected page for submitting new testing tools.
 */

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ToolSubmitForm } from "@/components/tools/tool-submit-form";

export default async function SubmitToolPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Submit a Testing Tool</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Share a tool you use with the testing community
      </p>
      <div className="mt-8">
        <ToolSubmitForm />
      </div>
    </div>
  );
}
