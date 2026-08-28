import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatusEventRow } from "@/lib/types";

export type AdminOrderLine = {
  id: string;
  quantity: number;
  selection_label: string;
  unit_price_cents: number;
  line_total_cents: number;
  topping_ids: unknown;
  products: { name: string; slug: string } | null;
};

export type AdminOrder = {
  id: string;
  created_at: string;
  customer_first_name: string | null;
  customer_last_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string;
  preferred_date: string | null;
  pickup_location_id: string | null;
  pickup_slot_summary: string | null;
  fulfillment_method?: string | null;
  notes: string | null;
  status: string;
  total_cents: number;
  order_items: AdminOrderLine[] | null;
};

export async function fetchOrdersForAdmin(): Promise<AdminOrder[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select(
      `
      id,
      created_at,
      customer_first_name,
      customer_last_name,
      customer_name,
      customer_email,
      customer_phone,
      preferred_date,
      pickup_location_id,
      pickup_slot_summary,
      fulfillment_method,
      notes,
      status,
      total_cents,
      order_items (
        id,
        quantity,
        selection_label,
        unit_price_cents,
        line_total_cents,
        topping_ids,
        products ( name, slug )
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return [];
  }

  const rows = (data ?? []) as Array<
    Omit<AdminOrder, "order_items"> & {
      order_items: Array<
        Omit<AdminOrderLine, "products"> & {
          products: { name: string; slug: string } | { name: string; slug: string }[] | null;
        }
      > | null;
    }
  >;

  return rows.map((order) => ({
    ...order,
    order_items:
      order.order_items?.map((item) => {
        const raw = item.products;
        const products = Array.isArray(raw) ? raw[0] ?? null : raw ?? null;
        return { ...item, products };
      }) ?? null,
  }));
}

export async function fetchStatusEventsForOrders(
  orderIds: string[]
): Promise<Record<string, OrderStatusEventRow[]>> {
  if (orderIds.length === 0) return {};
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("order_status_events")
    .select("id, order_id, previous_status, new_status, changed_by_email, created_at")
    .in("order_id", orderIds)
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) console.error("order_status_events:", error);
    return {};
  }

  const byOrder: Record<string, OrderStatusEventRow[]> = {};
  for (const row of data as OrderStatusEventRow[]) {
    if (!byOrder[row.order_id]) byOrder[row.order_id] = [];
    byOrder[row.order_id].push(row);
  }
  return byOrder;
}
