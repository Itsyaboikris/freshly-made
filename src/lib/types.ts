export type UnitType = "loaf" | "slice";

export type FulfillmentMethod = "pickup" | "delivery";

export type PriceTier = {
  id: string;
  label: string;
  price_cents: number;
};

export type ProductRow = {
  id: string;
  slug: string;
  unit_type: UnitType;
  name: string;
  description: string;
  image_path: string | null;
  /** Legacy — menu uses base_price_cents + toppings */
  pricing_model: "fixed" | "tiered";
  price_cents: number | null;
  base_price_cents: number;
  tiers: PriceTier[];
  sort_order: number;
};

export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type OrderStatusEventRow = {
  id: string;
  order_id: string;
  previous_status: string | null;
  new_status: string;
  changed_by_email: string | null;
  created_at: string;
};

export type OrderListRow = {
  id: string;
  created_at: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_name?: string;
  customer_email: string | null;
  customer_phone: string;
  preferred_date: string | null;
  pickup_location_id: string | null;
  pickup_slot_summary: string | null;
  fulfillment_method?: FulfillmentMethod;
  notes: string | null;
  status: OrderStatus;
  total_cents: number;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  tier_id: string | null;
  topping_ids: string[] | null;
  selection_label: string;
  unit_price_cents: number;
  line_total_cents: number;
  products: { name: string; slug: string } | null;
};
