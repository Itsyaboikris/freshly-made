import { createClient } from "@supabase/supabase-js";
import { getSupabaseSecretKey } from "@/lib/supabase/secret-key";

/** URL + server secret — same requirements as {@link createAdminClient} (e.g. checkout /api/orders). */
export function isServerOrderingConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  return Boolean(url && getSupabaseSecretKey());
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = getSupabaseSecretKey();
  if (!url || !key) {
    throw new Error("Missing Supabase URL or SUPABASE_SECRET_KEY");
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
