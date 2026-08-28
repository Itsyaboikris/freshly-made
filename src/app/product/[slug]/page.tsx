import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCustomizeForm } from "@/components/ProductCustomizeForm";
import { getFlavorGroup } from "@/lib/flavor-groups";
import { loadMenuProducts } from "@/lib/load-menu";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const products = await loadMenuProducts();
  const group = getFlavorGroup(decodeURIComponent(slug), products);
  if (!group) return { title: "Product" };
  return {
    title: `${group.title} | Order`,
    description: group.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const products = await loadMenuProducts();
  const group = getFlavorGroup(slug, products);

  if (!group || (!group.loaf && !group.slice)) {
    notFound();
  }

  return (
    <div className="relative isolate flex-1">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-64 bg-linear-to-b from-brand-burgundy/6 via-accent-warm/5 to-transparent"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-xl px-4 pb-16 pt-8 sm:px-6 sm:pb-20 sm:pt-12">
        <Link href="/menu" className="link-back">
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
            <path
              d="M10 3 5 8l5 5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to menu
        </Link>

        <header className="mt-8 border-b border-line pb-8">
          <p className="label-mono">Customize</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink wrap-break-word sm:text-4xl">
            {group.title}
          </h1>
          <p className="mt-4 max-w-prose leading-relaxed text-muted">{group.description}</p>
        </header>

        <div className="mt-10">
          <ProductCustomizeForm group={group} />
        </div>
      </div>
    </div>
  );
}
