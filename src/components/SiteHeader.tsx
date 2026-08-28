"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CartDrawer } from "@/components/CartDrawer";
import { CartNavLink } from "@/components/CartNavLink";
import { TestEmailNavButton } from "@/components/TestEmailNavButton";

export function SiteHeader() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/" className="group flex min-w-0 items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px] bg-brand-burgundy"
              aria-hidden
            />
            <span className="truncate text-xl font-extrabold text-ink">
              Freshly Baked
            </span>
            <span className="hidden text-[10.5px] font-semibold uppercase tracking-[0.14em] text-brand-green sm:inline">
              Banana Bread
            </span>
            <Image
              src="/logo.png"
              alt=""
              width={32}
              height={32}
              className="ml-1 h-8 w-8 rounded-md object-contain opacity-90 transition group-hover:opacity-100 sm:hidden"
            />
          </Link>
          <nav className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/menu"
              className="hidden min-h-11 items-center rounded-full px-3 py-2 text-sm font-semibold text-muted transition hover:bg-brand-cream hover:text-ink sm:inline-flex"
            >
              Menu
            </Link>
            <TestEmailNavButton />
            <CartNavLink />
          </nav>
        </div>
      </header>
      <CartDrawer />
    </>
  );
}
