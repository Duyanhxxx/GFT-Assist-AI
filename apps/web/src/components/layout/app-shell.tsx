"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  BrainCircuit,
  LayoutDashboard,
  Menu,
  Settings,
  Ticket,
  X,
} from "lucide-react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ShellUser = {
  email: string;
  role: string;
  organizationId?: string;
};

type AppShellProps = {
  children: ReactNode;
  user: ShellUser;
};

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tickets", label: "Tickets", icon: Ticket },
  { href: "/knowledge-base", label: "Knowledge Base", icon: BookOpen },
  { href: "/ai-runs", label: "AI Logs", icon: BrainCircuit },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AppNavigation({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav aria-label="Primary" className="space-y-1">
      {navigation.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            className={cn(
              "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium",
              active
                ? "bg-[color:var(--foreground)] text-white shadow-[0_14px_30px_rgba(15,23,42,0.16)]"
                : "text-[color:var(--muted-foreground)] hover:bg-slate-950/5 hover:text-[color:var(--foreground)] dark:hover:bg-white/8",
            )}
            href={item.href}
            key={item.href}
            {...(onNavigate ? { onClick: onNavigate } : {})}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const activeLabel = useMemo(
    () => navigation.find((item) => isActivePath(pathname, item.href))?.label ?? "Workspace",
    [pathname],
  );

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] gap-6 px-4 py-4 md:px-6 md:py-6">
        <aside className="surface-elevated sticky top-6 hidden h-[calc(100vh-3rem)] w-[280px] shrink-0 rounded-[28px] p-4 lg:flex lg:flex-col">
          <div className="border-b border-[color:var(--border)] px-2 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--foreground)] text-sm font-semibold text-white">
                GA
              </div>
              <div>
                <p className="text-sm font-semibold">GFT-Assist-AI</p>
                <p className="text-xs text-[color:var(--muted)]">AI support operations</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-4">
            <AppNavigation pathname={pathname} />
          </div>

          <div className="surface rounded-[24px] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.email}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{user.organizationId ?? "No organization"}</p>
              </div>
              <Badge variant="info">{user.role}</Badge>
            </div>
            <SignOutButton className="mt-4 w-full" variant="secondary" />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="surface-elevated sticky top-4 z-30 mb-6 rounded-[28px] px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                aria-label="Open navigation"
                className="lg:hidden"
                onClick={() => setIsMobileNavOpen(true)}
                size="icon"
                variant="secondary"
              >
                <Menu className="h-4 w-4" />
              </Button>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--muted)]">
                  Operator workspace
                </p>
                <h1 className="truncate text-lg font-semibold md:text-xl">{activeLabel}</h1>
              </div>

              <div className="flex items-center gap-2">
                <Badge>{user.role}</Badge>
                <div className="hidden rounded-2xl border border-[color:var(--border)] bg-white/60 px-3 py-2 text-right text-xs shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:bg-slate-950/40 md:block">
                  <p className="font-medium text-[color:var(--foreground)]">{user.email}</p>
                  <p className="text-[color:var(--muted)]">Secure session active</p>
                </div>
              </div>
            </div>
          </header>

          <div>{children}</div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileNavOpen ? (
          <>
            <motion.button
              animate={{ opacity: 1 }}
              aria-label="Close navigation overlay"
              className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setIsMobileNavOpen(false)}
              type="button"
            />
            <motion.aside
              animate={{ x: 0 }}
              className="surface-elevated fixed inset-y-0 left-0 z-50 flex w-[86%] max-w-sm flex-col rounded-r-[28px] p-4 lg:hidden"
              exit={{ x: "-100%" }}
              initial={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <div className="flex items-center justify-between border-b border-[color:var(--border)] pb-4">
                <div>
                  <p className="text-sm font-semibold">GFT-Assist-AI</p>
                  <p className="text-xs text-[color:var(--muted)]">Enterprise workspace</p>
                </div>
                <Button
                  aria-label="Close navigation"
                  onClick={() => setIsMobileNavOpen(false)}
                  size="icon"
                  variant="ghost"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto py-4">
                <AppNavigation onNavigate={() => setIsMobileNavOpen(false)} pathname={pathname} />
              </div>

              <div className="surface rounded-[24px] p-4">
                <p className="truncate text-sm font-medium">{user.email}</p>
                <p className="mt-1 text-xs text-[color:var(--muted)]">{user.organizationId ?? "No organization"}</p>
                <SignOutButton className="mt-4 w-full" variant="secondary" />
              </div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
