"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/orders", label: "Orders" },
] as const;

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

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1" aria-label="Admin">
      {nav.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`rounded-xl px-3 py-2.5 text-sm font-medium transition min-h-11 flex items-center ${
              active
                ? "bg-brand-burgundy/12 text-brand-burgundy-deep border border-brand-burgundy/20"
                : "text-ink hover:bg-brand-cream/80 border border-transparent"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="hidden h-screen w-60 shrink-0 border-r border-line bg-surface-elevated/95 lg:sticky lg:top-0 lg:flex lg:flex-col">
        <div className="flex flex-1 flex-col p-4">
          <p className="font-display text-lg font-semibold text-brand-burgundy">Admin</p>
          <p className="mt-1 truncate text-xs text-muted" title={userEmail}>
            {userEmail ?? "Signed in"}
          </p>
          <div className="mt-6">
            <NavLinks />
          </div>
          <div className="mt-auto pt-8">
            <Link
              href="/"
              className="inline-flex min-h-11 w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-brand-cream/80 hover:text-ink"
            >
              ← Back to store
            </Link>
            <button
              type="button"
              onClick={() => signOut()}
              className="mt-2 w-full rounded-xl border border-line bg-surface px-3 py-2.5 text-left text-sm font-medium text-ink transition hover:bg-brand-cream/60 min-h-11"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-90 flex items-center justify-between gap-3 border-b border-line bg-surface-elevated/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-line bg-surface text-ink"
            aria-expanded={mobileOpen}
            aria-controls="admin-mobile-nav"
          >
            <span className="sr-only">Open menu</span>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <p className="font-display text-lg font-semibold text-ink">Admin</p>
          <span className="min-w-11" aria-hidden />
        </header>

        {mobileOpen && (
          <div className="fixed inset-0 z-100 lg:hidden" id="admin-mobile-nav">
            <button
              type="button"
              className="absolute inset-0 bg-ink/40"
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
            />
            <div className="absolute left-0 top-0 flex h-full w-[min(100%,18rem)] flex-col border-r border-line bg-surface-elevated shadow-xl">
              <div className="flex items-center justify-between border-b border-line px-4 py-3">
                <span className="font-display font-semibold text-brand-burgundy">Menu</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="min-h-11 min-w-11 rounded-xl text-2xl leading-none text-muted hover:bg-brand-cream/60"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
                <NavLinks onNavigate={() => setMobileOpen(false)} />
                <div className="mt-auto border-t border-line pt-4">
                  <Link
                    href="/"
                    className="inline-flex min-h-11 w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium text-muted hover:bg-brand-cream/80"
                    onClick={() => setMobileOpen(false)}
                  >
                    ← Back to store
                  </Link>
                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="mt-2 w-full rounded-xl border border-line px-3 py-2.5 text-left text-sm font-medium min-h-11"
                  >
                    Sign out
                  </button>
                </div>
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
