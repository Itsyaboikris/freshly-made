import Link from "next/link";
import MenuListing from "@/components/MenuListing";

export const metadata = {
  title: "Menu",
  description:
    "Banana bread flavors — classic, Oreo, Nutella, double chocolate. Choose loaf or slice and toppings.",
};

export default async function MenuPage() {
  return (
    <div className="relative flex-1">
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <Link href="/" className="link-back">
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
          Home
        </Link>

        <div className="mt-8 scroll-mt-28" id="menu">
          <MenuListing />
        </div>
      </div>
    </div>
  );
}
