/** Delivery drop-off fee — matches banana-bakehouse.jsx ($20). */
export const DELIVERY_FEE_CENTS = 2000;

export type FulfillmentMethod = "pickup" | "delivery";

export const COUNTER_PICKUP_ID = "counter";
export const COUNTER_PICKUP_SUMMARY = "Counter pickup";

export function isFulfillmentMethod(v: string): v is FulfillmentMethod {
  return v === "pickup" || v === "delivery";
}
