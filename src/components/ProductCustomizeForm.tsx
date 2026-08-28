"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { FlavorGroup } from "@/lib/flavor-groups";
import type { ProductRow, UnitType } from "@/lib/types";
import { useCart } from "@/context/CartContext";
import { computeLinePricing } from "@/lib/products";
import { formatMoney } from "@/lib/money";
import { clampLineQuantity, MAX_LINE_QUANTITY } from "@/lib/quantity";
import { normalizeToppingIds, TOPPING_OPTIONS } from "@/lib/toppings";

function pickProduct(group: FlavorGroup, unit: UnitType): ProductRow | null {
  if (unit === "loaf") return group.loaf;
  return group.slice;
}

function sectionTitle(title: string, hint?: string) {
  return (
    <div className="mb-4">
      <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

/** iPad/Safari: large label + native control (not role="button") for reliable taps. */
function unitTileClass(active: boolean) {
  return [
    "flex min-h-[4.5rem] w-full cursor-pointer touch-manipulation flex-col items-center justify-center rounded-2xl border-2 px-4 py-3 text-center transition [-webkit-tap-highlight-color:transparent]",
    active
      ? "border-brand-burgundy bg-brand-burgundy text-ink shadow-sm"
      : "border-line bg-surface text-ink active:bg-brand-cream/60",
  ].join(" ");
}

export function ProductCustomizeForm({ group }: { group: FlavorGroup }) {
  const router = useRouter();
  const { addLine } = useCart();

  const canLoaf = Boolean(group.loaf);
  const canSlice = Boolean(group.slice);
  const [unit, setUnit] = useState<UnitType>(canLoaf ? "loaf" : "slice");
  const [quantityInput, setQuantityInput] = useState("1");
  const [toppingIds, setToppingIds] = useState<string[]>([]);
  const [added, setAdded] = useState(false);

  const selectedProduct = pickProduct(group, unit);

  const quantity = useMemo(
    () => clampLineQuantity(Number(quantityInput) || 0),
    [quantityInput]
  );

  const lineTotal = useMemo(() => {
    if (!selectedProduct) return 0;
    const p = computeLinePricing(selectedProduct, toppingIds);
    if (!p) return 0;
    return p.unitCents * quantity;
  }, [selectedProduct, toppingIds, quantity]);

  function toggleTopping(id: string) {
    setToppingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleAddToCart(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;
    const q = clampLineQuantity(Number(quantityInput) || 0);
    addLine(selectedProduct, q, normalizeToppingIds(toppingIds));
    setAdded(true);
  }

  function bumpQty(delta: number) {
    const next = clampLineQuantity(quantity + delta);
    setQuantityInput(String(next));
  }

  if (!canLoaf && !canSlice) {
    return <p className="text-muted">This product is not available right now.</p>;
  }

  if (added) {
    return (
      <div className="rounded-3xl border border-line bg-linear-to-b from-brand-cream/80 to-surface-elevated px-6 py-10 text-center shadow-sm sm:px-10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-burgundy/15 text-brand-burgundy">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="font-display mt-5 text-xl font-semibold text-ink sm:text-2xl">Added to your cart</p>
        <p className="mt-2 text-sm text-muted">Ready when you are — checkout or keep shopping.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/cart" className="btn-primary px-8 py-3.5 text-center">
            View cart
          </Link>
          <button
            type="button"
            onClick={() => {
              setAdded(false);
              setQuantityInput("1");
              setToppingIds([]);
            }}
            className="inline-flex min-h-11 touch-manipulation items-center justify-center rounded-2xl border border-line bg-surface-elevated px-8 py-3 text-sm font-semibold text-ink transition active:bg-brand-cream/60 [-webkit-tap-highlight-color:transparent]"
          >
            Add another
          </button>
        </div>
        <button
          type="button"
          onClick={() => router.push("/menu")}
          className="mt-6 touch-manipulation text-sm font-medium text-brand-burgundy active:underline [-webkit-tap-highlight-color:transparent]"
        >
          ← Back to menu
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleAddToCart}
      className="relative z-0 rounded-3xl border border-line bg-surface-elevated shadow-md"
    >
      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {sectionTitle("Size", "Tap the option you want — price includes the base loaf or slice.")}
        <div
          className={`grid gap-3 ${canLoaf && canSlice ? "grid-cols-2" : "grid-cols-1"}`}
          role="radiogroup"
          aria-label="Loaf or slice"
        >
          {canLoaf && group.loaf && (
            <div className="min-w-0">
              <input
                id="fbbb-unit-loaf"
                type="radio"
                name="fbbb-unit"
                className="sr-only"
                checked={unit === "loaf"}
                onChange={() => setUnit("loaf")}
              />
              <label htmlFor="fbbb-unit-loaf" className={unitTileClass(unit === "loaf")}>
                <span className="font-semibold">2 lb loaf</span>
                <span className={`mt-1 text-sm ${unit === "loaf" ? "text-ink/70" : "text-muted"}`}>
                  {formatMoney(group.loaf.base_price_cents)}
                </span>
              </label>
            </div>
          )}
          {canSlice && group.slice && (
            <div className="min-w-0">
              <input
                id="fbbb-unit-slice"
                type="radio"
                name="fbbb-unit"
                className="sr-only"
                checked={unit === "slice"}
                onChange={() => setUnit("slice")}
              />
              <label htmlFor="fbbb-unit-slice" className={unitTileClass(unit === "slice")}>
                <span className="font-semibold">Slice</span>
                <span className={`mt-1 text-sm ${unit === "slice" ? "text-ink/70" : "text-muted"}`}>
                  {formatMoney(group.slice.base_price_cents)}
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-line" />

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {sectionTitle("Quantity", "How many of this line do you want?")}
        <div className="flex max-w-[14rem] items-stretch rounded-2xl border border-line bg-surface p-1 shadow-inner">
          <button
            type="button"
            className="flex min-h-12 min-w-12 touch-manipulation items-center justify-center rounded-xl text-lg font-semibold text-ink transition active:bg-brand-cream/80 disabled:opacity-35 [-webkit-tap-highlight-color:transparent]"
            aria-label="Decrease quantity"
            disabled={quantity <= 1}
            onClick={() => bumpQty(-1)}
          >
            −
          </button>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete="off"
            aria-label="Quantity"
            className="min-h-12 min-w-0 flex-1 border-0 bg-transparent text-center font-display text-xl font-semibold tabular-nums text-ink outline-none [-webkit-tap-highlight-color:transparent]"
            value={quantityInput}
            onChange={(e) => {
              const next = e.target.value.replace(/\D/g, "");
              setQuantityInput(next === "" ? "" : next);
            }}
            onBlur={() => {
              setQuantityInput(String(clampLineQuantity(Number(quantityInput) || 0)));
            }}
          />
          <button
            type="button"
            className="flex min-h-12 min-w-12 touch-manipulation items-center justify-center rounded-xl text-lg font-semibold text-ink transition active:bg-brand-cream/80 disabled:opacity-35 [-webkit-tap-highlight-color:transparent]"
            aria-label="Increase quantity"
            disabled={quantity >= MAX_LINE_QUANTITY}
            onClick={() => bumpQty(1)}
          >
            +
          </button>
        </div>
      </div>

      <div className="h-px bg-line" />

      <div className="px-5 py-6 sm:px-8 sm:py-8">
        {sectionTitle(
          "Add-ons",
          `${formatMoney(500)} each — mix and match chips, almonds, or peanuts.`
        )}
        <div className="flex flex-wrap gap-2 sm:gap-3" role="group" aria-label="Toppings">
          {TOPPING_OPTIONS.map((t) => {
            const on = toppingIds.includes(t.id);
            const id = `fbbb-top-${t.id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
            return (
              <span key={t.id} className="inline-flex">
                <input
                  id={id}
                  type="checkbox"
                  className="sr-only"
                  checked={on}
                  onChange={() => toggleTopping(t.id)}
                />
                <label
                  htmlFor={id}
                  className={[
                    "inline-flex min-h-11 cursor-pointer touch-manipulation items-center rounded-full border-2 px-4 py-2.5 text-sm font-medium transition [-webkit-tap-highlight-color:transparent]",
                    on
                      ? "border-brand-burgundy bg-brand-burgundy text-ink shadow-sm"
                      : "border-line bg-surface text-ink active:bg-brand-cream/50",
                  ].join(" ")}
                >
                  {t.label}
                </label>
              </span>
            );
          })}
        </div>
      </div>

      <div className="rounded-b-3xl border-t border-line bg-linear-to-b from-brand-cream/40 to-brand-cream/20 px-5 py-6 sm:px-8 sm:py-7">
        {selectedProduct && (
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Your line</p>
              <p className="mt-1 text-sm text-ink">
                {quantity}× {selectedProduct.name}
                {toppingIds.length > 0 ? (
                  <span className="text-muted"> · {toppingIds.length} add-on(s)</span>
                ) : null}
              </p>
            </div>
            <p className="font-display text-2xl font-semibold tabular-nums text-brand-burgundy sm:text-3xl">
              {formatMoney(lineTotal)}
            </p>
          </div>
        )}
        <button
          type="submit"
          disabled={!selectedProduct}
          className="btn-primary w-full touch-manipulation py-4 text-base font-semibold shadow-md [-webkit-tap-highlight-color:transparent] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Add to cart
        </button>
      </div>
    </form>
  );
}
