/** Server-only Supabase **Secret** key (`sb_secret_...` from Project Settings → API). */
export function getSupabaseSecretKey(): string | undefined {
  const k = process.env.SUPABASE_SECRET_KEY?.trim();
  return k || undefined;
}
