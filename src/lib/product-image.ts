/**
 * Resolves `products.image_path` for use in <img> / next/image.
 * Supports absolute URLs, site-relative paths, or `bucket/key` for Supabase public storage.
 */
export function resolveProductImageSrc(imagePath: string | null | undefined): string | null {
  const raw = imagePath?.trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
  if (raw.startsWith("/")) return raw;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  if (!base) return null;
  const key = raw.replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${key}`;
}
