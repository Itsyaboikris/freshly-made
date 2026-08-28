"use client";

import { useCart } from "@/context/CartContext";
import { useCartDrawer } from "@/context/CartDrawerContext";

export function CartNavLink() {
  const { itemCount, hydrated } = useCart();
  const { openDrawer } = useCartDrawer();
  const n = hydrated ? itemCount : 0;

  return (
    <button
      type="button"
      onClick={openDrawer}
      className="btn-primary gap-2 px-[18px] py-2.5"
      aria-label={`Open cart, ${n} items`}
    >
      <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden>
        <path
          d="M2 2h1.2l1.4 7.2a1.5 1.5 0 0 0 1.5 1.2h5.8a1.5 1.5 0 0 0 1.5-1.2L14.8 5H4.2M6 13.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm6 0a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="text-[13px] font-bold tabular-nums">{n}</span>
    </button>
  );
}
