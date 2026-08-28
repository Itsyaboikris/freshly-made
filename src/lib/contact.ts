/**
 * Public phone + WhatsApp — set in `.env.local` (requires restart / rebuild for NEXT_PUBLIC_*).
 * NEXT_PUBLIC_PHONE_E164: digits only, country code included, no + (e.g. 18683067278)
 * NEXT_PUBLIC_PHONE_DISPLAY: how it appears on the site (e.g. 1 (868) 306-7278)
 */

function readPublicEnv(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v && v.length > 0 ? v : undefined;
}

const e164Digits =
  readPublicEnv("NEXT_PUBLIC_PHONE_E164")?.replace(/\D/g, "") ?? "";

const displayFromEnv = readPublicEnv("NEXT_PUBLIC_PHONE_DISPLAY");

/** E.164 digits without +, for wa.me / tel — empty if unset */
export const PHONE_E164 = e164Digits;

/** Shown in the footer; falls back to +{digits} when only E164 is set */
export const PHONE_DISPLAY =
  displayFromEnv ?? (e164Digits ? `+${e164Digits}` : "");

export const WHATSAPP_URL = e164Digits
  ? `https://wa.me/${e164Digits}`
  : "";

export const TEL_HREF = e164Digits ? `tel:+${e164Digits}` : "";

/** True when the footer should show phone / WhatsApp (any of env or derived display) */
export function isPublicContactVisible(): boolean {
  return Boolean(e164Digits || displayFromEnv);
}
