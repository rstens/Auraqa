import Link from "next/link";

const navItems = [
  { href: "/admin", label: "Dashboard", testId: "admin-nav-dashboard" },
  { href: "/admin/articles", label: "Articles", testId: "admin-nav-articles" },
  { href: "/admin/tools", label: "Tools", testId: "admin-nav-tools" },
  { href: "/admin/users", label: "Users", testId: "admin-nav-users" },
  { href: "/admin/glossary", label: "Glossary", testId: "admin-nav-glossary" },
  { href: "/admin/ai", label: "AI", testId: "admin-nav-ai" },
];

export function AdminSidebar() {
  return (
    <nav data-testid="admin-sidebar" className="w-48 shrink-0 border-r border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
      <div className="sticky top-16 space-y-1 p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Admin
        </p>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            data-testid={item.testId}
            className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
