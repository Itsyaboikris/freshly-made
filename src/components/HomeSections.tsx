import Link from "next/link";

/** Full-viewport-width band; content stays within max-w-6xl. */
function HomeBand({
  children,
  bandClassName,
  innerClassName,
}: {
  children: React.ReactNode;
  bandClassName?: string;
  innerClassName?: string;
}) {
  return (
    <div className={`w-full ${bandClassName ?? ""}`}>
      <div
        className={`mx-auto w-full max-w-6xl px-4 sm:px-6 ${innerClassName ?? "py-16 sm:py-20 lg:py-24"}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ── How it works ─────────────────────────────────────────── */

const STEPS = [
  {
    n: "01",
    title: "Pick your flavors",
    body: "Browse the menu, choose classic, Oreo, Nutella, or any of our rotating specials. Loaf or slice — your call.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 12h6M9 16h4" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Checkout in minutes",
    body: "No account needed. Add to cart, fill in your name and phone, choose pickup or delivery, and confirm.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Collect fresh",
    body: "Pay by bank transfer, then pick up your loaves on Saturday or Sunday — baked around your slot so they're still warm-fresh.",
    icon: (
      <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
] as const;

export function HomeOrderCallout() {
  return (
    <HomeBand bandClassName="border-y border-line bg-brand-cream/60">
      <section aria-labelledby="steps-heading">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <p className="label-mono">How it works</p>
          <h2
            id="steps-heading"
            className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl"
          >
            Fresh bread in three steps
          </h2>
        </div>

        <ol className="grid gap-6 sm:grid-cols-3" role="list">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="relative overflow-hidden rounded-2xl border border-line bg-surface-elevated p-6 transition duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(43_33_24/0.1)]"
            >
              {/* large ghost number */}
              <span
                className="pointer-events-none absolute -right-3 -top-4 select-none text-[96px] font-black leading-none text-ink/4"
                aria-hidden
              >
                {step.n}
              </span>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-burgundy/15 text-brand-burgundy-deep">
                {step.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-[1.65] text-muted">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <Link href="/menu" className="btn-primary px-7 py-3.5">
            Start your order
          </Link>
          <span className="text-sm text-muted">No account · Pay by bank transfer</span>
        </div>
      </section>
    </HomeBand>
  );
}

/* ── Menu teaser — high-contrast band ────────────────────── */

const FLAVORS = [
  { name: "Classic", desc: "Pure banana goodness" },
  { name: "Oreo", desc: "Cookies & cream crunch" },
  { name: "Nutella", desc: "Hazelnut swirls" },
  { name: "Double Choc", desc: "For the serious chocoholic" },
];

export function HomeMenuTeaser() {
  return (
    <HomeBand bandClassName="bg-ink text-surface-elevated overflow-hidden">
      <section aria-labelledby="menu-teaser-heading" className="relative">
        {/* decorative circle */}
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, #f5b301 0%, transparent 70%)",
          }}
          aria-hidden
        />

        <div className="relative grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-burgundy">
              Full menu
            </p>
            <h2
              id="menu-teaser-heading"
              className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-5xl"
            >
              Every flavor,
              <br />
              one place.
            </h2>
            <p className="mt-5 text-[17px] leading-[1.7] text-white/60">
              Classic, Oreo, Nutella, double chocolate, and more. Loaf or slice,
              with toppings when you want a little extra.
            </p>
            <Link
              href="/menu"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-burgundy px-8 py-3.5 text-[15px] font-bold text-ink shadow-[0_8px_24px_rgb(245_179_1/0.4)] transition hover:-translate-y-0.5 hover:bg-brand-burgundy-deep"
            >
              Browse all flavors
              <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
                <path d="M3 8h10M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </div>

          {/* flavor grid */}
          <ul className="grid grid-cols-2 gap-3" role="list">
            {FLAVORS.map((f, i) => (
              <li
                key={f.name}
                className={`rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition hover:bg-white/10 ${i === 0 ? "col-span-2" : ""}`}
              >
                <p className="text-lg font-bold text-white">{f.name}</p>
                <p className="mt-0.5 text-sm text-white/50">{f.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </HomeBand>
  );
}

/* ── Features ─────────────────────────────────────────────── */

const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7z" />
        <circle cx="12" cy="9" r="2.5" />
      </svg>
    ),
    title: "Fresh, ripe bananas",
    body: "We use naturally fresh, ripe bananas — never tinned. The riper the banana, the richer and sweeter the loaf.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
    title: "Generous loaves",
    body: "Each loaf is large, moist, and packed with flavour — enough to share, or keep all to yourself.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M2 10h20M8 4v6M16 4v6" />
      </svg>
    ),
    title: "Weekend pickup",
    body: "Choose a Saturday or Sunday slot and a location at checkout — we bake to your schedule.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12l2 2 4-4" />
        <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" />
      </svg>
    ),
    title: "No preservatives",
    body: "Real ingredients only — no preservatives, no artificial flavours or colours.",
  },
] as const;

export function HomeFeaturesSection() {
  return (
    <HomeBand bandClassName="border-y border-line">
      <section aria-labelledby="features-heading">
        <div className="grid gap-12 lg:grid-cols-[2fr_3fr] lg:gap-16 lg:items-start">
          {/* sticky label side */}
          <div className="lg:pt-2">
            <p className="label-mono">Why it hits different</p>
            <h2
              id="features-heading"
              className="mt-3 text-3xl font-extrabold text-ink sm:text-4xl"
            >
              Taste the
              <br />
              difference
            </h2>
            <p className="mt-4 text-[17px] leading-[1.7] text-muted">
              Small-batch banana bread — real ingredients, real care.
            </p>
            <Link href="/menu" className="btn-primary mt-8 inline-flex px-7 py-3.5">
              See the menu
            </Link>
          </div>

          {/* feature list */}
          <ul className="grid gap-4 sm:grid-cols-2" role="list">
            {FEATURES.map((f) => (
              <li
                key={f.title}
                className="group rounded-2xl border border-line bg-brand-cream/40 p-6 transition duration-200 hover:-translate-y-1 hover:border-brand-burgundy/30 hover:bg-brand-cream hover:shadow-[0_16px_40px_rgb(43_33_24/0.1)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-burgundy/15 text-brand-burgundy-deep">
                  {f.icon}
                </span>
                <h3 className="mt-4 text-[15px] font-bold text-ink">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-[1.65] text-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </HomeBand>
  );
}

/* ── About / CTA ──────────────────────────────────────────── */

export function HomeAboutSection() {
  return (
    <HomeBand bandClassName="bg-brand-blush/60">
      <section aria-labelledby="about-heading">
        <div className="mx-auto max-w-3xl text-center">
          {/* oversized quote-mark */}
          <p
            className="select-none text-[80px] leading-none text-brand-burgundy/30 sm:text-[100px]"
            aria-hidden
          >
            &ldquo;
          </p>
          <h2
            id="about-heading"
            className="-mt-6 text-3xl font-extrabold text-ink sm:text-4xl lg:text-5xl"
          >
            Freshly baked,
            <br />
            honestly simple.
          </h2>
          <p className="mx-auto mt-6 max-w-lg text-[17px] leading-[1.75] text-muted">
            We focus on one thing: really good banana bread in flavors people
            actually crave. Order online, collect fresh on the weekend, and
            taste why homemade beats everything.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/menu" className="btn-primary px-10 py-4 text-[15px]">
              Order now
            </Link>
            <Link href="/menu" className="btn-outline px-7 py-4 text-[15px]">
              View menu
            </Link>
          </div>

          {/* trust line */}
          <p className="mt-8 text-[13px] font-medium text-muted">
            No account needed · Pay by bank transfer · Weekend pickup
          </p>
        </div>
      </section>
    </HomeBand>
  );
}
