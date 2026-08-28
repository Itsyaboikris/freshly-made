/** Minimum calendar days after today for pickup/delivery (flyer: order 2–3 days ahead). */
export const MIN_LEAD_DAYS = 2;

/** Delivery scheduling — matches banana-bakehouse.jsx. */
export const DELIVERY_MIN_LEAD_DAYS = 3;
export const DELIVERY_DATE_RANGE_DAYS = 30;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  paid: "Paid",
  confirmed: "Confirmed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
