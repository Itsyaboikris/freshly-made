/** $5 (500 cents) each — matches menu add-on pricing. */
export const TOPPING_PRICE_CENTS = 500;

export type ToppingOption = {
  id: string;
  label: string;
  price_cents: number;
};

export const TOPPING_OPTIONS: readonly ToppingOption[] = [
  { id: "chocolate_chips", label: "Chocolate chips", price_cents: TOPPING_PRICE_CENTS },
  { id: "sliced_almonds", label: "Sliced almonds", price_cents: TOPPING_PRICE_CENTS },
  { id: "peanuts", label: "Peanuts", price_cents: TOPPING_PRICE_CENTS },
] as const;

const VALID_IDS = new Set(TOPPING_OPTIONS.map((t) => t.id));

export function isValidToppingId(id: string): boolean {
  return VALID_IDS.has(id);
}

export function normalizeToppingIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const x of raw) {
    if (typeof x === "string" && isValidToppingId(x) && !out.includes(x)) {
      out.push(x);
    }
  }
  return out;
}

export function toppingLabels(ids: string[]): string[] {
  return ids
    .map((id) => TOPPING_OPTIONS.find((t) => t.id === id)?.label)
    .filter((x): x is string => Boolean(x));
}
