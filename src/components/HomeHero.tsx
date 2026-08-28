import Image from "next/image";
import Link from "next/link";
import {
  formatPickupDateLabel,
  upcomingWeekendPickupDates,
} from "@/lib/dates";

export function HomeHero() {
  const nextDate = upcomingWeekendPickupDates(1)[0];

  return (
    <section className="relative overflow-hidden">
      {/* background decoration */}
      <div
        className="pointer-events-none absolute -top-32 right-0 h-150 w-150 rounded-full opacity-30"
        style={{
          background:
            "radial-gradient(circle, #f5b301 0%, #fff4d6 50%, transparent 75%)",
          filter: "blur(60px)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-20 top-1/2 h-100 w-100 -translate-y-1/2 rounded-full opacity-20"
        style={{
          background:
            "radial-gradient(circle, #5fb85b 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:py-0">
        {/* ── Left ── */}
        <div>
          {/* headline */}
          <h1 className="text-[clamp(2.5rem,7vw,4.25rem)] font-extrabold leading-[1.04] tracking-tight text-ink">
            The riper the
            <br />
            banana,{" "}
            <span className="relative inline-block">
              <span className="relative z-10">the better</span>
              <span
                className="absolute -bottom-1 left-0 right-0 z-0 h-[0.35em] rounded-sm bg-brand-burgundy/40"
                aria-hidden
              />
            </span>
            <br />
            the loaf.
          </h1>

          <p className="mt-6 max-w-md text-[17px] leading-[1.7] text-muted">
            Handmade with fresh, ripe bananas — no shortcuts, no preservatives.
            Pick your flavor, add your toppings, and collect fresh on the
            weekend.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/menu"
              className="btn-primary gap-2 px-8 py-3.5 text-[15px]"
            >
              Order now
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path
                  d="M3 8h10M9 4l4 4-4 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <Link
              href="/menu"
              className="btn-outline gap-1.5 px-6 py-3.5 text-[15px]"
            >
              Browse menu
            </Link>
          </div>
        </div>

        {/* ── Right ── */}
        <div className="relative flex justify-center lg:justify-end">
          {/* floating card behind image */}
          <div className="absolute -left-6 -top-6 hidden h-full w-full rounded-3xl border border-brand-burgundy/20 bg-brand-burgundy/5 lg:block" />

          <div className="relative w-full max-w-sm">
            {/* image card */}
            <div className="relative overflow-hidden rounded-3xl border border-line bg-brand-cream shadow-[0_24px_64px_rgb(43_33_24/0.14)]">
              <div className="overflow-hidden rounded-2xl m-3 bg-brand-blush/50">
                <Image
                  src="/logo.png"
                  alt="Freshly Baked Banana Bread"
                  width={480}
                  height={480}
                  className="h-auto w-full object-contain p-8"
                  priority
                />
              </div>

              {/* next pickup badge inside card */}
              {nextDate && (
                <div className="flex items-center gap-3 border-t border-line px-5 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-green/15 text-brand-green">
                    <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                      <rect
                        x="2"
                        y="3"
                        width="12"
                        height="11"
                        rx="2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                      />
                      <path
                        d="M2 7h12M5 1v4M11 1v4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10.5px] font-semibold uppercase tracking-widest text-muted">
                      Next collection
                    </p>
                    <p className="text-[13.5px] font-bold text-ink">
                      {formatPickupDateLabel(nextDate)}
                    </p>
                  </div>
                  <span className="ml-auto h-2 w-2 rounded-full bg-brand-green" aria-hidden />
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
