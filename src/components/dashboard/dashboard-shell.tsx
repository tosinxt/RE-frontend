"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import {
  Files,
  LayoutDashboard,
  FileText,
  Layers,
  Users,
  CheckSquare,
  Activity,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "admin" | "staff";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: Role[];
};

const nav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/uploads", label: "Uploads", icon: <Files className="h-4 w-4" /> },
  { href: "/deals", label: "Deals", icon: <Layers className="h-4 w-4" /> },
  { href: "/netsheets", label: "Net sheets", icon: <FileText className="h-4 w-4" /> },
  { href: "/templates", label: "Templates", icon: <Layers className="h-4 w-4" /> },
  { href: "/contacts", label: "Contacts", icon: <Users className="h-4 w-4" /> },
  { href: "/tasks", label: "Tasks", icon: <CheckSquare className="h-4 w-4" /> },
  { href: "/audit", label: "Audit", icon: <Activity className="h-4 w-4" />, roles: ["admin"] },
  { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" />, roles: ["admin"] },
];

function breadcrumbFromPath(pathname: string) {
  const clean = pathname.split("?")[0]?.split("#")[0] ?? "/";
  const parts = clean.split("/").filter(Boolean);
  if (!parts.length) return [{ href: "/", label: "Home" }];
  const crumbs = parts.map((p, idx) => ({
    href: "/" + parts.slice(0, idx + 1).join("/"),
    label: p.replace(/-/g, " "),
  }));
  return crumbs;
}

export function DashboardShell({
  children,
  role = "staff",
  primaryCtaHref = "/uploads/parse",
  primaryCtaLabel = "Upload & parse",
}: {
  children: React.ReactNode;
  role?: Role;
  primaryCtaHref?: string;
  primaryCtaLabel?: string;
}) {
  const pathname = usePathname() ?? "/";
  const [collapsed, setCollapsed] = React.useState(false);
  const crumbs = React.useMemo(() => breadcrumbFromPath(pathname), [pathname]);

  const visibleNav = nav.filter((item) => !item.roles || item.roles.includes(role));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div
        className={cn(
          "mx-auto grid min-h-screen w-full",
          collapsed ? "grid-cols-[72px_1fr]" : "grid-cols-[280px_1fr]",
        )}
      >
        <aside className="border-r border-border bg-card">
          <div className="flex h-14 items-center justify-between px-3">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1 text-sm font-semibold",
                collapsed && "justify-center px-0",
              )}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                N
              </span>
              {!collapsed ? <span>Netsheet</span> : null}
            </Link>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed((v) => !v)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="h-9 w-9 p-0"
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="px-2 pb-4">
            <div className="space-y-1">
              {visibleNav.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      active
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                      collapsed && "justify-center px-0",
                    )}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="inline-flex h-5 w-5 items-center justify-center">{item.icon}</span>
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </nav>

          {!collapsed ? (
            <div className="mt-auto border-t border-border px-4 py-3 text-xs text-muted-foreground">
              Role: <span className="font-medium text-foreground">{role}</span>
              <div className="mt-1">Admin-only: Audit, Settings</div>
            </div>
          ) : null}
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-10 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex h-14 items-center gap-3 px-6">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                  {crumbs.map((c, idx) => (
                    <React.Fragment key={c.href}>
                      <Link href={c.href} className="hover:text-foreground">
                        {c.label}
                      </Link>
                      {idx < crumbs.length - 1 ? <span>/</span> : null}
                    </React.Fragment>
                  ))}
                </div>
                <div className="ml-auto hidden w-[420px] max-w-full items-center gap-2 rounded-md border border-input bg-card px-3 py-2 text-sm text-muted-foreground md:flex">
                  <Search className="h-4 w-4" />
                  <span>Search documents, deals, netsheets…</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button asChild size="sm">
                  <Link href={primaryCtaHref} className="gap-2">
                    <Upload className="h-4 w-4" />
                    {primaryCtaLabel}
                  </Link>
                </Button>
              </div>
            </div>
          </header>

          <main className="px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

