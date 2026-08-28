import Link from "next/link";
import { CartPageClient } from "@/components/CartPageClient";

export const metadata = {
  title: "Cart",
  description: "Review your banana bread order before checkout.",
};

export default function CartPage() {
  return (
    <div className="relative flex-1">
      <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
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
          Continue shopping
        </Link>
        <h1 className="mt-6 text-[27px] font-extrabold tracking-tight text-ink sm:text-3xl">
          Your cart
        </h1>
        <p className="mt-2 text-sm text-muted">
          Adjust quantities or toppings, then continue to checkout when you&apos;re
          ready.
        </p>
        <div className="mt-8">
          <CartPageClient />
        </div>
      </div>
    </div>
  );
}
