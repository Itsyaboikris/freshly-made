"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <rect x="2" y="2" width="7" height="7" rx="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    icon: (
      <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 5h14M3 10h14M3 15h8" />
      </svg>
    ),
  },
] as const;

const PAGE_LABELS: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/orders": "Orders",
};

export function AdminShell({
  userEmail,
  children,
}: {
  userEmail?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const pageLabel =
    Object.entries(PAGE_LABELS).find(([path]) =>
      pathname === path || pathname.startsWith(`${path}/`)
    )?.[1] ?? "Admin";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const signOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin");
    router.refresh();
  }, [router]);

  const initials = userEmail
    ? userEmail.slice(0, 2).toUpperCase()
    : "A";

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-0.5" aria-label="Admin navigation">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
              active
                ? "bg-brand-burgundy text-ink shadow-[0_4px_12px_rgb(245_179_1/0.3)]"
                : "text-muted hover:bg-brand-cream/80 hover:text-ink"
            }`}
          >
            <span className={active ? "text-ink" : "text-muted group-hover:text-ink"}>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const SidebarFooter = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="space-y-1">
      <Link
        href="/"
        onClick={onNavigate}
        className="group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-brand-cream/80 hover:text-ink"
      >
        <svg viewBox="0 0 20 20" className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M3 10.5L10 3l7 7.5" />
          <path d="M5 8.5V17h4v-4h2v4h4V8.5" />
        </svg>
        Back to store
      </Link>
      <button
        type="button"
        onClick={() => signOut()}
        className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted transition hover:bg-red-50/70 hover:text-red-800"
      >
        <svg viewBox="0 0 20 20" className="h-4.5 w-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M13 3h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3" />
          <path d="M8 14l4-4-4-4M4 10h10" />
        </svg>
        Sign out
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 border-r border-line bg-surface-elevated lg:sticky lg:top-0 lg:flex lg:flex-col">
        {/* Sidebar header */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-burgundy text-ink">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="2" y="7" width="12" height="8" rx="1.5" />
              <path d="M5 7V5a3 3 0 0 1 6 0v2" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">Admin</p>
            <p className="truncate text-[11px] text-muted" title={userEmail}>
              {userEmail ?? "Signed in"}
            </p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto p-3">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted/60">
            Navigation
          </p>
          <NavLinks />
        </div>

        {/* Footer */}
        <div className="border-t border-line p-3">
          <SidebarFooter />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-line bg-surface-elevated/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav"
          >
            <span className="sr-only">Open menu</span>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-burgundy text-ink">
              <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="7" width="12" height="8" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              </svg>
            </div>
            <p className="text-base font-bold text-ink">{pageLabel}</p>
          </div>

          {/* Avatar */}
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-cream text-xs font-bold text-ink ring-1 ring-line"
            title={userEmail}
            aria-hidden
          >
            {initials}
          </div>
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" id="admin-mobile-nav">
            <button
              type="button"
              className="absolute inset-0 bg-ink/30 backdrop-blur-sm"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-72 flex-col bg-surface-elevated shadow-2xl">
              {/* Drawer header */}
              <div className="flex items-center justify-between border-b border-line px-4 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-burgundy text-ink">
                    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="2" y="7" width="12" height="8" rx="1.5" />
                      <path d="M5 7V5a3 3 0 0 1 6 0v2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-ink">Admin</p>
                    <p className="max-w-35 truncate text-[11px] text-muted">
                      {userEmail ?? "Signed in"}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl text-muted hover:bg-brand-cream/60 hover:text-ink"
                  aria-label="Close menu"
                >
                  <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden>
                    <path d="M5 5l10 10M15 5L5 15" />
                  </svg>
                </button>
              </div>

              <div className="flex flex-1 flex-col overflow-y-auto p-3">
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-muted/60">
                  Navigation
                </p>
                <NavLinks onNavigate={() => setMobileOpen(false)} />
              </div>

              <div className="border-t border-line p-3">
                <SidebarFooter onNavigate={() => setMobileOpen(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
