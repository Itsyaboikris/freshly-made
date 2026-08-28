"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  startTransition,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ProductRow } from "@/lib/types";
import { computeLinePricing } from "@/lib/products";
import { clampLineQuantity } from "@/lib/quantity";
import { normalizeToppingIds } from "@/lib/toppings";

const STORAGE_KEY = "fbbb-cart-v2";

export type CartLine = {
  key: string;
  product: ProductRow;
  toppingIds: string[];
  quantity: number;
};

type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  itemCount: number;
  subtotalCents: number;
  /** Add a configured line (product + qty + toppings) in one step */
  addLine: (product: ProductRow, quantity: number, toppingIds: string[]) => void;
  removeLine: (key: string) => void;
  updateLine: (
    key: string,
    patch: Partial<Pick<CartLine, "toppingIds" | "quantity">>
  ) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function normalizeLoadedLine(raw: unknown): CartLine | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.key !== "string" ||
    typeof o.quantity !== "number" ||
    typeof o.product !== "object" ||
    o.product === null
  ) {
    return null;
  }
  const product = o.product as ProductRow;
  let toppingIds: string[] = [];
  if (Array.isArray(o.toppingIds)) {
    toppingIds = o.toppingIds.filter((x): x is string => typeof x === "string");
  }
  return {
    key: o.key,
    product,
    toppingIds,
    quantity: clampLineQuantity(o.quantity),
  };
}

function loadLines(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        const out = parsed.map(normalizeLoadedLine).filter(Boolean) as CartLine[];
        if (out.length > 0) return out;
      }
    }
    const legacy = localStorage.getItem("fbbb-cart-v1");
    if (legacy) {
      const parsed = JSON.parse(legacy) as unknown;
      if (Array.isArray(parsed)) {
        return parsed
          .map((row) => {
            if (!row || typeof row !== "object") return null;
            const r = row as Record<string, unknown>;
            if (typeof r.key !== "string" || typeof r.product !== "object")
              return null;
            return {
              key: r.key,
              product: r.product as ProductRow,
              toppingIds: [] as string[],
              quantity: typeof r.quantity === "number" ? r.quantity : 1,
            } satisfies CartLine;
          })
          .filter(Boolean) as CartLine[];
      }
    }
  } catch {
    /* ignore */
  }
  return [];
}

function saveLines(lines: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  } catch {
    /* ignore quota */
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    startTransition(() => {
      setLines(loadLines());
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      saveLines(lines);
    }, 32);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [lines, hydrated]);

  /* Flush cart to storage when leaving the tab (iOS often kills timers before debounce fires). */
  useEffect(() => {
    if (!hydrated) return;
    function flush() {
      saveLines(lines);
    }
    function onVisibility() {
      if (document.visibilityState === "hidden") flush();
    }
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [lines, hydrated]);

  const addLine = useCallback(
    (product: ProductRow, quantity: number, toppingIds: string[]) => {
      const q = clampLineQuantity(quantity);
      const tops = normalizeToppingIds(toppingIds);
      setLines((prev) => [
        ...prev,
        {
          key: `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          product,
          toppingIds: tops,
          quantity: q,
        },
      ]);
    },
    []
  );

  const removeLine = useCallback((key: string) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const updateLine = useCallback(
    (
      key: string,
      patch: Partial<Pick<CartLine, "toppingIds" | "quantity">>
    ) => {
      setLines((prev) =>
        prev.map((l) => {
          if (l.key !== key) return l;
          const next = { ...l, ...patch };
          if (typeof patch.quantity === "number") {
            next.quantity = clampLineQuantity(patch.quantity);
          }
          return next;
        })
      );
    },
    []
  );

  const clearCart = useCallback(() => setLines([]), []);

  const itemCount = useMemo(
    () => lines.reduce((n, l) => n + l.quantity, 0),
    [lines]
  );

  const subtotalCents = useMemo(() => {
    let t = 0;
    for (const line of lines) {
      const r = computeLinePricing(line.product, line.toppingIds);
      if (r) t += r.unitCents * line.quantity;
    }
    return t;
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      hydrated,
      itemCount,
      subtotalCents,
      addLine,
      removeLine,
      updateLine,
      clearCart,
    }),
    [
      lines,
      hydrated,
      itemCount,
      subtotalCents,
      addLine,
      removeLine,
      updateLine,
      clearCart,
    ]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
