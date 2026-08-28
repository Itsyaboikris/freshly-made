import type { SupabaseClient } from "@supabase/supabase-js";
import type { PriceTier, ProductRow, UnitType } from "@/lib/types";
import {
  normalizeToppingIds,
  TOPPING_PRICE_CENTS,
  toppingLabels,
} from "@/lib/toppings";

function parseTiers(raw: unknown): PriceTier[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (t): t is PriceTier =>
        typeof t === "object" &&
        t !== null &&
        "id" in t &&
        "label" in t &&
        "price_cents" in t &&
        typeof (t as PriceTier).id === "string" &&
        typeof (t as PriceTier).label === "string" &&
        typeof (t as PriceTier).price_cents === "number"
    )
    .map((t) => ({
      id: t.id,
      label: t.label,
      price_cents: t.price_cents,
    }));
}

function basePriceFromRow(row: Record<string, unknown>, tiers: PriceTier[]): number {
  if (row.pricing_model === "tiered" && tiers.length > 0) {
    const plain = tiers.find((t) => t.id === "plain");
    return plain?.price_cents ?? tiers[0]!.price_cents;
  }
  const n = Number(row.price_cents ?? 0);
  return Number.isFinite(n) ? n : 0;
}

export function normalizeProductRow(row: Record<string, unknown>): ProductRow {
  const tiers = parseTiers(row.tiers);
  const unit_type: UnitType = row.unit_type === "slice" ? "slice" : "loaf";
  const base_price_cents = basePriceFromRow(row, tiers);

  return {
    id: String(row.id),
    slug: String(row.slug),
    unit_type,
    name: String(row.name),
    description: String(row.description),
    image_path: row.image_path == null ? null : String(row.image_path),
    pricing_model: row.pricing_model === "tiered" ? "tiered" : "fixed",
    price_cents:
      row.price_cents == null || row.price_cents === ""
        ? null
        : Number(row.price_cents),
    base_price_cents,
    tiers,
    sort_order: Number(row.sort_order ?? 0),
  };
}

function fb(
  id: string,
  slug: string,
  unit: UnitType,
  name: string,
  description: string,
  base: number,
  sort: number
): ProductRow {
  return {
    id,
    slug,
    unit_type: unit,
    name,
    description,
    image_path: null,
    pricing_model: "fixed",
    price_cents: base,
    base_price_cents: base,
    tiers: [],
    sort_order: sort,
  };
}

/** Static menu when Supabase is not configured or the query fails (local demo). */
export const FALLBACK_PRODUCTS: ProductRow[] = [
  fb(
    "fallback-classic-loaf",
    "classic-banana-loaf",
    "loaf",
    "Classic Banana Loaf (2 lb loaf)",
    "Super moist, soft and loaded with banana flavor. ",
    6000,
    1
  ),
  fb(
    "fallback-oreo-loaf",
    "oreo-banana-loaf",
    "loaf",
    "Oreo Banana Loaf (2 lb loaf)",
    "Topped with vanilla cream Oreo. ",
    7000,
    2
  ),
  fb(
    "fallback-nutella-loaf",
    "nutty-nutella-banana-loaf",
    "loaf",
    "Nutty Nutella Banana Loaf (2 lb loaf)",
    "Nutella and peanuts. ",
    7500,
    3
  ),
  fb(
    "fallback-double-loaf",
    "mega-moist-double-chocolate",
    "loaf",
    "Mega Moist Double Chocolate Loaf (2 lb)",
    "Chocolatey with melted chips. ",
    7000,
    4
  ),
  fb(
    "fallback-classic-slice",
    "classic-banana-loaf",
    "slice",
    "Classic Banana Bread (slice)",
    "Sliced portion. ",
    3000,
    11
  ),
  fb(
    "fallback-oreo-slice",
    "oreo-banana-loaf",
    "slice",
    "Oreo Banana Bread (slice)",
    "Sliced portion. ",
    3500,
    12
  ),
  fb(
    "fallback-nutella-slice",
    "nutty-nutella-banana-loaf",
    "slice",
    "Nutty Nutella Banana Bread (slice)",
    "Sliced portion. ",
    3750,
    13
  ),
  fb(
    "fallback-double-slice",
    "mega-moist-double-chocolate",
    "slice",
    "Mega Moist Double Chocolate (slice)",
    "Sliced portion. ",
    3500,
    14
  ),
];

export async function getMenuProducts(
  supabase: SupabaseClient
): Promise<ProductRow[]> {
  const { data, error } = await supabase
    .from("products")
    .select(
      "id, slug, unit_type, name, description, image_path, pricing_model, price_cents, tiers, sort_order"
    )
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("[products] Supabase query failed:", error.message);
    return [];
  }

  return (data ?? []).map((row) =>
    normalizeProductRow(row as Record<string, unknown>)
  );
}

/** Unit price for one item including $5 per selected topping. */
export function computeLinePricing(
  product: ProductRow,
  toppingIds: string[]
): { unitCents: number; label: string } | null {
  const baseRaw =
    product.base_price_cents ?? product.price_cents ?? 0;
  const base = Number(baseRaw);
  if (!Number.isFinite(base) || base < 0) return null;
  const tops = normalizeToppingIds(toppingIds);
  const unitCents = base + tops.length * TOPPING_PRICE_CENTS;
  const unitLabel =
    product.unit_type === "slice" ? "Slice" : "Loaf";
  const topPart =
    tops.length > 0 ? toppingLabels(tops).join(", ") : "Plain";
  return {
    unitCents,
    label: `${unitLabel} · ${topPart}`,
  };
}
