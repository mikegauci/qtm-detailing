"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { contentNav, crmNav, settingsNav } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/admin/auth";

function NavSection({
  title,
  items,
}: {
  title: string;
  items: readonly { label: string; href: string; icon: React.ComponentType<{ className?: string }> }[];
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-1">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-white/40">
        {title}
      </p>
      {items.map((item) => {
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-brand-purple-600/30 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export function AdminSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-white/10 bg-surface-base">
      <div className="border-b border-white/10 p-4">
        <Link href="/admin" className="block">
          <span className="text-lg font-bold text-white">QTM Admin</span>
          <span className="mt-0.5 block text-xs text-white/50">CMS + CRM</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto p-4">
        <NavSection title="CRM" items={crmNav} />
        <NavSection title="Content" items={contentNav} />
        <NavSection title="Settings" items={settingsNav} />
      </nav>

      <div className="border-t border-white/10 p-4">
        <form action={logout}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
