"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { contentNav, crmNav, settingsNav } from "@/lib/admin/nav";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/admin/auth";

const SIDEBAR_COLLAPSED_KEY = "admin-sidebar-collapsed";

function isNavItemActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string,
) {
  const [path, queryString] = href.split("?");
  const itemParams = new URLSearchParams(queryString ?? "");

  if (pathname !== path && !pathname.startsWith(`${path}/`)) {
    return false;
  }

  if (path === "/admin/gallery" && itemParams.size === 0) {
    return searchParams.get("view") !== "linked";
  }

  if (itemParams.size === 0) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  }

  for (const [key, value] of itemParams.entries()) {
    if (searchParams.get(key) !== value) {
      return false;
    }
  }

  return true;
}

function NavSection({
  title,
  items,
  collapsed,
}: {
  title: string;
  items: readonly {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <div className="space-y-1">
      <p
        className={cn(
          "px-3 text-xs font-semibold tracking-wider text-white/40 uppercase",
          collapsed && "max-lg:sr-only",
        )}
      >
        {title}
      </p>
      {items.map((item) => {
        const active = isNavItemActive(pathname, searchParams, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-label={item.label}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
              collapsed &&
                "max-lg:justify-center max-lg:gap-0 max-lg:px-0 max-lg:py-1.5",
              active
                ? "bg-brand-purple-600/30 text-white"
                : "text-white/70 hover:bg-white/5 hover:text-white",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && "max-lg:sr-only")}>{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

function NavSections({ collapsed }: { collapsed: boolean }) {
  return (
    <>
      <NavSection title="CRM" items={crmNav} collapsed={collapsed} />
      <Suspense fallback={null}>
        <NavSection title="Content" items={contentNav} collapsed={collapsed} />
      </Suspense>
      <NavSection title="Settings" items={settingsNav} collapsed={collapsed} />
    </>
  );
}

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (saved !== null) {
      setCollapsed(saved === "true");
    } else {
      setCollapsed(window.matchMedia("(max-width: 1023px)").matches);
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-white/10 bg-surface-base transition-[width] duration-200",
        collapsed ? "max-lg:w-12" : "w-64",
        "lg:w-64",
      )}
    >
      <div
        className={cn(
          "border-b border-white/10 p-4",
          collapsed && "max-lg:p-2",
        )}
      >
        <div
          className={cn(
            "flex gap-2",
            collapsed ? "max-lg:items-center max-lg:justify-center" : "items-start justify-between",
          )}
        >
          <Link
            href="/admin"
            className={cn("min-w-0", collapsed && "max-lg:hidden")}
            title="QTM Admin"
          >
            <span className="text-lg font-bold text-white">QTM Admin</span>
            <span className="mt-0.5 block text-xs text-white/50">CMS + CRM</span>
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "inline-flex shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:bg-white/5 hover:text-white lg:hidden",
              collapsed ? "h-7 w-7" : "h-8 w-8",
            )}
            aria-label={collapsed ? "Expand sidebar menu" : "Collapse sidebar menu"}
            aria-pressed={collapsed}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <nav
        className={cn(
          "flex-1 space-y-6 overflow-y-auto p-4",
          collapsed && "max-lg:space-y-3 max-lg:px-1 max-lg:py-2",
        )}
      >
        {hydrated ? (
          <NavSections collapsed={collapsed} />
        ) : (
          <NavSections collapsed={false} />
        )}
      </nav>

      <div className={cn("border-t border-white/10 p-4", collapsed && "max-lg:p-2")}>
        <form action={logout}>
          <button
            type="submit"
            title="Sign out"
            aria-label="Sign out"
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white",
              collapsed &&
                "max-lg:justify-center max-lg:gap-0 max-lg:px-0 max-lg:py-1.5",
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={cn(collapsed && "max-lg:sr-only")}>Sign out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
