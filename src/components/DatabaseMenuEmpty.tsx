import {
  isPublicContactVisible,
  PHONE_DISPLAY,
  TEL_HREF,
  WHATSAPP_URL,
} from "@/lib/contact";

/**
 * Shown when the menu is configured to load from the backend but no products
 * are available yet. Keep copy customer-friendly — no infra details.
 */
export function DatabaseMenuEmpty() {
  const showContact = isPublicContactVisible();

  return (
    <div className="rounded-[18px] border border-line bg-brand-cream/50 p-8 text-center shadow-sm">
      <p className="text-2xl" aria-hidden>
        🍞
      </p>
      <p className="mt-3 text-xl font-extrabold text-ink">Menu coming soon</p>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
        We&apos;re getting everything ready. Check back soon for fresh loaves and
        flavors.
      </p>
      {showContact && (
        <p className="mx-auto mt-5 max-w-md text-sm text-muted">
          Questions in the meantime?{" "}
          {WHATSAPP_URL ? (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline decoration-brand-burgundy/40 underline-offset-2 hover:text-brand-burgundy-deep"
            >
              Message us on WhatsApp
            </a>
          ) : TEL_HREF ? (
            <a
              href={TEL_HREF}
              className="font-semibold text-ink underline decoration-brand-burgundy/40 underline-offset-2 hover:text-brand-burgundy-deep"
            >
              Call {PHONE_DISPLAY}
            </a>
          ) : (
            <span className="font-semibold text-ink">{PHONE_DISPLAY}</span>
          )}
        </p>
      )}
    </div>
  );
}
