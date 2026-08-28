import Link from "next/link";
import { FlavorCard } from "@/components/FlavorCard";
import { DatabaseMenuEmpty } from "@/components/DatabaseMenuEmpty";
import { groupProductsByFlavor } from "@/lib/flavor-groups";
import { isSupabaseMenuConfigured, loadMenuProducts } from "@/lib/load-menu";

/**
 * Full product menu grid — shared pattern for scaling as the catalog grows.
 */
export default async function MenuListing() {
  const products = await loadMenuProducts();
  const menuFromDb = isSupabaseMenuConfigured();
  const flavors = groupProductsByFlavor(products);

  return (
    <>
      <div className="mb-8">
        <p className="label-mono">Today&apos;s loaves</p>
        <h1 className="mt-1.5 text-[30px] font-extrabold tracking-tight text-ink">
          Pick a flavor, make it yours
        </h1>
        <p className="mt-2 max-w-xl text-muted">
          Pick toppings and add straight to your cart — no extra steps.
        </p>
      </div>
      {menuFromDb && products.length === 0 ? (
        <DatabaseMenuEmpty />
      ) : (
        <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
          {flavors.map((group) => (
            <FlavorCard key={group.slug} group={group} />
          ))}
        </div>
      )}
      <div className="mt-10 text-center sm:hidden">
        <Link href="/cart" className="btn-outline px-6 py-3 text-sm">
          View cart →
        </Link>
      </div>
    </>
  );
}
