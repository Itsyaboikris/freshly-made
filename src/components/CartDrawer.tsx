"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { formatMoney } from "@/lib/money";
import { computeLinePricing } from "@/lib/products";
import { toppingLabels } from "@/lib/toppings";
import { QtyStepper } from "@/components/QtyStepper";
import { resolveProductImageSrc } from "@/lib/product-image";

export function CartDrawer() {
  const router = useRouter();
  const { open, closeDrawer } = useCartDrawer();
  const { lines, itemCount, subtotalCents, hydrated, updateLine, removeLine } =
    useCart();

  if (!open) return null;

  const count = hydrated ? itemCount : 0;

  function goCheckout() {
    closeDrawer();
    router.push("/checkout");
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-ink/35"
        aria-label="Close cart"
        onClick={closeDrawer}
      />
      <aside
        className="absolute right-0 top-0 flex h-full w-full max-w-[380px] flex-col bg-surface-elevated p-6 shadow-[-8px_0_32px_rgb(43_33_24/0.15)]"
        aria-label="Shopping cart"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-ink">Your cart</h2>
          <button
            type="button"
            onClick={closeDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition hover:bg-brand-cream"
            aria-label="Close cart panel"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" aria-hidden>
              <path
                d="M5 5l10 10M15 5 5 15"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {!hydrated ? (
            <p className="text-sm text-muted">Loading cart…</p>
          ) : lines.length === 0 ? (
            <p className="text-sm text-muted">
              Nothing in here yet — go pick a loaf.
            </p>
          ) : (
            lines.map((line) => {
              const priced = computeLinePricing(line.product, line.toppingIds);
              const labels = toppingLabels(line.toppingIds);
              const imageSrc = resolveProductImageSrc(line.product.image_path);
              const isLocal = imageSrc?.startsWith("/") ?? false;

              return (
                <div
                  key={line.key}
                  className="mb-4 flex gap-3 border-b border-line pb-4"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[10px] bg-brand-cream">
                    {imageSrc ? (
                      <Image
                        src={imageSrc}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="56px"
                        unoptimized={!isLocal}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-lg">
                        🍞
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <span className="text-sm font-semibold text-ink">
                        {line.product.name}
                      </span>
                      <span className="shrink-0 text-[13px] font-bold tabular-nums">
                        {priced
                          ? formatMoney(priced.unitCents * line.quantity)
                          : "—"}
                      </span>
                    </div>
                    {labels.length > 0 && (
                      <p className="mt-0.5 text-[11.5px] text-muted">
                        + {labels.join(", ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2.5">
                      <QtyStepper
                        value={line.quantity}
                        onChange={(qty) => updateLine(line.key, { quantity: qty })}
                        label={`Quantity for ${line.product.name}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="ml-auto text-xs text-red-600 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {hydrated && lines.length > 0 && (
          <div className="ticket-edge pt-4">
            <div className="mb-3.5 flex justify-between text-[15px] font-bold">
              <span>Subtotal</span>
              <span className="text-brand-burgundy-deep tabular-nums">
                {formatMoney(subtotalCents)}
              </span>
            </div>
            <button
              type="button"
              onClick={goCheckout}
              className="btn-primary w-full py-3"
            >
              Checkout
            </button>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="mt-3 block text-center text-xs font-semibold text-muted hover:text-ink"
            >
              View full cart ({count})
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
