import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { isServerOrderingConfigured } from "@/lib/supabase/admin";
import { getBankDetails } from "@/lib/bank-details";

export const metadata = {
  title: "Checkout",
  description: "Complete your banana bread order — pickup or weekend delivery.",
};

/** Read env at request time so server secret is not baked in at build as false. */
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  const canSubmitOrders = isServerOrderingConfigured();
  const bank = getBankDetails();

  return (
    <div className="relative flex-1">
      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <Link href="/cart" className="link-back">
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
          Back to cart
        </Link>
        <h1 className="mt-6 text-[27px] font-extrabold tracking-tight text-ink sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Confirm your order, choose pickup or delivery, then complete the bank
          transfer to lock in your loaves.
        </p>
        <div className="mt-10">
          <CheckoutForm canSubmitOrders={canSubmitOrders} bank={bank} />
        </div>
      </div>
    </div>
  );
}
