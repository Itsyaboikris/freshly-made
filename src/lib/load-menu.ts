import { createClient as createAnonClient } from "@supabase/supabase-js";
import { FALLBACK_PRODUCTS, getMenuProducts } from "@/lib/products";
import { getSupabasePublishableKey } from "@/lib/supabase/publishable-key";
import type { ProductRow } from "@/lib/types";

/** True when public Supabase keys are set — menu should come from the `products` table. */
export function isSupabaseMenuConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() && getSupabasePublishableKey()
  );
}

/**
 * Menu for pages: from DB when Supabase is configured, otherwise built-in demo list.
 * Uses the anon key only (no cookies) so pages can stay statically optimized.
 */
export async function loadMenuProducts(): Promise<ProductRow[]> {
  if (!isSupabaseMenuConfigured()) {
    return FALLBACK_PRODUCTS;
  }
  try {
    const supabase = createAnonClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      getSupabasePublishableKey()!
    );
    return await getMenuProducts(supabase);
  } catch (e) {
    console.error("[loadMenuProducts]", e);
    return [];
  }
}
