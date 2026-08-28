"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CartLineList } from "@/components/CartLineList";
import { formatMoney } from "@/lib/money";

export function CartPageClient() {
  const { lines, hydrated, subtotalCents, removeLine, updateLine } = useCart();

  if (!hydrated) {
    return <p className="text-sm text-muted">Loading cart…</p>;
  }

  return (
    <div className="space-y-8">
      <section className="card-panel">
        <CartLineList
          lines={lines}
          onRemove={removeLine}
          onUpdate={updateLine}
        />
        <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-lg font-semibold text-ink">
            Subtotal{" "}
            <span className="text-brand-burgundy">{formatMoney(subtotalCents)}</span>
          </p>
          <Link
            href="/checkout"
            className={`btn-primary px-8 py-3.5 text-center ${
              lines.length === 0 ? "pointer-events-none opacity-50" : ""
            }`}
            aria-disabled={lines.length === 0}
            onClick={(e) => {
              if (lines.length === 0) e.preventDefault();
            }}
          >
            Proceed to checkout
          </Link>
        </div>
      </section>
    </div>
  );
}
