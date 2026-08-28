import type { ProductRow } from "@/lib/types";

export type FlavorGroup = {
  slug: string;
  /** Short customer-facing title (e.g. Classic Banana Bread) */
  title: string;
  description: string;
  sortOrder: number;
  loaf: ProductRow | null;
  slice: ProductRow | null;
  /** Lowest base price for “From …” */
  fromPriceCents: number;
};

const SLUG_TITLES: Record<string, string> = {
  "classic-banana-loaf": "Classic Banana Bread",
  "oreo-banana-loaf": "Oreo Banana Bread",
  "nutty-nutella-banana-loaf": "Nutty Nutella Banana Bread",
  "mega-moist-double-chocolate": "Mega Moist Double Chocolate Banana Bread",
};

function titleForSlug(slug: string, fallbackName: string): string {
  return SLUG_TITLES[slug] ?? fallbackName.replace(/\s*\([^)]*\)\s*$/g, "").trim();
}

export function groupProductsByFlavor(products: ProductRow[]): FlavorGroup[] {
  const bySlug = new Map<
    string,
    { loaf: ProductRow | null; slice: ProductRow | null; sortOrder: number }
  >();

  for (const p of products) {
    const cur = bySlug.get(p.slug) ?? {
      loaf: null,
      slice: null,
      sortOrder: p.sort_order,
    };
    if (p.unit_type === "slice") {
      cur.slice = p;
    } else {
      cur.loaf = p;
    }
    cur.sortOrder = Math.min(cur.sortOrder, p.sort_order);
    bySlug.set(p.slug, cur);
  }

  const groups: FlavorGroup[] = [];
  for (const [slug, { loaf, slice, sortOrder }] of bySlug) {
    const primary = loaf ?? slice;
    if (!primary) continue;

    const bases = [loaf?.base_price_cents, slice?.base_price_cents].filter(
      (n): n is number => typeof n === "number" && Number.isFinite(n)
    );
    const fromPriceCents = bases.length ? Math.min(...bases) : primary.base_price_cents;

    const description =
      loaf?.description ??
      slice?.description ??
      primary.description;

    groups.push({
      slug,
      title: titleForSlug(slug, primary.name),
      description,
      sortOrder,
      loaf,
      slice,
      fromPriceCents,
    });
  }

  groups.sort((a, b) => a.sortOrder - b.sortOrder);
  return groups;
}

export function getFlavorGroup(
  slug: string,
  products: ProductRow[]
): FlavorGroup | null {
  return groupProductsByFlavor(products).find((g) => g.slug === slug) ?? null;
}
