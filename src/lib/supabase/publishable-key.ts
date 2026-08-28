/**
 * Browser-safe Supabase key from the dashboard (Publishable / anon equivalent).
 * Supabase’s Next.js connect flow uses NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
 * we still accept older env names during the transition.
 */
export function getSupabasePublishableKey(): string | undefined {
  const k =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return k || undefined;
}
