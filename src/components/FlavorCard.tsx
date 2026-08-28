"use client";

import Image from "next/image";
import { useState } from "react";
import type { FlavorGroup } from "@/lib/flavor-groups";
import type { UnitType } from "@/lib/types";
import { resolveProductImageSrc } from "@/lib/product-image";
import { formatMoney } from "@/lib/money";
import { TOPPING_OPTIONS } from "@/lib/toppings";
import { computeLinePricing } from "@/lib/products";
import { useCart } from "@/context/CartContext";
import { useCartDrawer } from "@/context/CartDrawerContext";
import { useToast } from "@/components/Toast";
import { QtyStepper } from "@/components/QtyStepper";

const FLAVOR_TINTS: Record<string, { tint: string; accent: string }> = {
  "classic-banana-loaf": { tint: "#fff4d6", accent: "#f5b301" },
  "oreo-banana-loaf": { tint: "#eee7ff", accent: "#9b7fe8" },
  "nutty-nutella-banana-loaf": { tint: "#ffebd9", accent: "#f2994a" },
  "mega-moist-double-chocolate": { tint: "#ffe3f0", accent: "#ef5da8" },
};

function getFlavorColors(slug: string) {
  return FLAVOR_TINTS[slug] ?? { tint: "#fff4d6", accent: "#f5b301" };
}

function MenuImagePlaceholder({
  label,
  tint,
}: {
  label: string;
  tint: string;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{ backgroundColor: tint }}
      aria-hidden
    >
      <span className="text-4xl">🍞</span>
      <p className="mt-1 text-[11px] font-semibold text-ink/40">
        Photo coming soon
      </p>
      <span className="sr-only">Image placeholder for {label}</span>
    </div>
  );
}

export function FlavorCard({ group }: { group: FlavorGroup }) {
  const { addLine } = useCart();
  const { openDrawer } = useCartDrawer();
  const { showToast } = useToast();

  const canLoaf = Boolean(group.loaf);
  const canSlice = Boolean(group.slice);

  const [unit, setUnit] = useState<UnitType>(canLoaf ? "loaf" : "slice");
  const [toppingIds, setToppingIds] = useState<string[]>([]);
  const [qty, setQty] = useState(1);

  const selectedProduct = unit === "loaf" ? group.loaf : group.slice;
  const priced = selectedProduct
    ? computeLinePricing(selectedProduct, toppingIds)
    : null;
  const lineTotal = priced ? priced.unitCents * qty : 0;

  const imagePath =
    group.loaf?.image_path ?? group.slice?.image_path ?? null;
  const imageSrc = resolveProductImageSrc(imagePath);
  const isLocal = imageSrc?.startsWith("/") ?? false;
  const colors = getFlavorColors(group.slug);

  function toggleTopping(id: string) {
    setToppingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleAdd() {
    if (!selectedProduct) return;
    addLine(selectedProduct, qty, toppingIds);
    showToast(`${qty} × ${group.title} added to cart`);
    setToppingIds([]);
    setQty(1);
    openDrawer();
  }

  return (
    <article className="card-hover flex flex-col rounded-[18px] border border-line bg-surface-elevated p-4.5">
      {/* image */}
      <div
        className="relative mb-3.5 h-32 overflow-hidden rounded-xl"
        style={{ backgroundColor: colors.tint }}
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`${group.title} — preview`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized={!isLocal}
          />
        ) : (
          <MenuImagePlaceholder label={group.title} tint={colors.tint} />
        )}
      </div>

      {/* name + description */}
      <h3 className="text-[18px] font-bold text-ink">{group.title}</h3>
      <p className="mt-1 min-h-10 flex-1 text-[13.5px] leading-snug text-muted line-clamp-3">
        {group.description}
      </p>

      {/* unit toggle — only shown when both loaf and slice exist */}
      {canLoaf && canSlice && (
        <div className="mt-3 flex gap-2">
          {(["loaf", "slice"] as UnitType[]).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => setUnit(u)}
              className={`rounded-full border-[1.5px] px-3 py-1 text-xs font-semibold transition ${
                unit === u
                  ? "border-brand-burgundy bg-brand-burgundy text-ink"
                  : "border-line bg-surface-elevated text-muted hover:border-brand-burgundy/40"
              }`}
            >
              {u === "loaf" ? "2 lb loaf" : "Slice"}
            </button>
          ))}
        </div>
      )}

      {/* toppings */}
      <p className="mt-3 text-[11.5px] font-bold uppercase tracking-[0.04em] text-muted">
        Add extras (+{formatMoney(500)} each)
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {TOPPING_OPTIONS.map((t) => {
          const active = toppingIds.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTopping(t.id)}
              aria-pressed={active}
              className="extra-chip"
              style={
                active
                  ? {
                      background: colors.accent,
                      borderColor: colors.accent,
                      color: "#fff",
                    }
                  : undefined
              }
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* price + qty row */}
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="text-[17px] font-bold tabular-nums text-ink">
          {lineTotal > 0 ? formatMoney(lineTotal) : formatMoney(group.fromPriceCents)}
        </span>
        <QtyStepper value={qty} onChange={setQty} />
      </div>

      {/* add to cart */}
      <button
        type="button"
        onClick={handleAdd}
        disabled={!selectedProduct}
        className="btn-primary mt-2.5 w-full py-2.5 text-[13.5px]"
      >
        Add to cart
      </button>
    </article>
  );
}
