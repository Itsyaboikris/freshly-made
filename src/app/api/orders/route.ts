import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendOrderInvoiceEmail } from "@/lib/email/send-order-invoice";
import { isDeliveryDateValid } from "@/lib/dates";
import { computeLinePricing, normalizeProductRow } from "@/lib/products";
import {
  getDeliverySummary,
  isValidDeliverySlotForDate,
} from "@/lib/delivery-slots";
import {
  COUNTER_PICKUP_ID,
  COUNTER_PICKUP_SUMMARY,
  DELIVERY_FEE_CENTS,
  isFulfillmentMethod,
} from "@/lib/fulfillment";
import { MAX_LINE_QUANTITY } from "@/lib/quantity";
import { normalizeToppingIds } from "@/lib/toppings";
import type { ProductRow } from "@/lib/types";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Shown to customers — no database, env, or stack details. */
const MSG_TRY_LATER =
  "We're having trouble completing your order right now. Please try again in a few minutes.";
const MSG_CART_MENU =
  "Your cart doesn't match our current menu. Clear your cart and add items again from the menu.";
const MSG_BAD_REQUEST =
  "Something went wrong with your request. Please refresh the page and try again.";

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return bad(MSG_BAD_REQUEST);
  }

  if (!body || typeof body !== "object") return bad(MSG_BAD_REQUEST);

  const b = body as Record<string, unknown>;
  const customer_first_name =
    typeof b.customer_first_name === "string" ? b.customer_first_name.trim() : "";
  const customer_last_name =
    typeof b.customer_last_name === "string" ? b.customer_last_name.trim() : "";
  const customer_phone_raw =
    typeof b.customer_phone === "string" ? b.customer_phone.trim() : "";
  const customer_phone =
    customer_phone_raw.length > 0 ? customer_phone_raw.slice(0, 40) : "—";
  const customer_email_raw =
    typeof b.customer_email === "string" ? b.customer_email.trim() : "";
  const customer_email =
    customer_email_raw.length > 0 ? customer_email_raw.slice(0, 254) : null;
  const fulfillment_method_raw =
    typeof b.fulfillment_method === "string" ? b.fulfillment_method.trim() : "pickup";
  const fulfillment_method = isFulfillmentMethod(fulfillment_method_raw)
    ? fulfillment_method_raw
    : "pickup";
  const preferred_date_raw =
    typeof b.preferred_date === "string" ? b.preferred_date.trim() : "";
  const preferred_date =
    preferred_date_raw.length > 0 ? preferred_date_raw : null;
  const pickup_location_id =
    typeof b.pickup_location_id === "string" ? b.pickup_location_id.trim() : "";
  const pickup_slot_summary =
    typeof b.pickup_slot_summary === "string" ? b.pickup_slot_summary.trim() : "";
  const notes =
    typeof b.notes === "string" ? b.notes.trim().slice(0, 2000) : "";
  const itemsRaw = b.items;

  if (customer_first_name.length < 1 || customer_first_name.length > 80) {
    return bad("Please enter a valid first name.");
  }
  if (customer_last_name.length < 1 || customer_last_name.length > 80) {
    return bad("Please enter a valid last name.");
  }
  if (customer_phone_raw.length > 0 && customer_phone_raw.length < 5) {
    return bad("Please enter a valid contact number.");
  }
  if (
    customer_email &&
    (customer_email.length < 3 || !customer_email.includes("@"))
  ) {
    return bad("Please enter a valid email or leave it blank.");
  }

  if (fulfillment_method === "delivery") {
    if (!preferred_date || !isDeliveryDateValid(preferred_date)) {
      return bad(
        "Delivery must be on a Saturday or Sunday, at least a few days from today."
      );
    }
    if (!isValidDeliverySlotForDate(pickup_location_id, preferred_date)) {
      return bad("Please choose a valid delivery location for that date.");
    }
    const expectedSummary = getDeliverySummary(pickup_location_id);
    if (
      !expectedSummary ||
      pickup_slot_summary !== expectedSummary
    ) {
      return bad("Please check your delivery details and try again.");
    }
  } else {
    if (pickup_location_id !== COUNTER_PICKUP_ID) {
      return bad("Invalid pickup option.");
    }
    if (pickup_slot_summary !== COUNTER_PICKUP_SUMMARY) {
      return bad("Please check your pickup details and try again.");
    }
  }
  if (!Array.isArray(itemsRaw) || itemsRaw.length === 0) {
    return bad("Add at least one item to your order.");
  }

  const items: { product_id: string; quantity: number; topping_ids: string[] }[] =
    [];
  for (const row of itemsRaw) {
    if (!row || typeof row !== "object") return bad(MSG_BAD_REQUEST);
    const r = row as Record<string, unknown>;
    const product_id = typeof r.product_id === "string" ? r.product_id : "";
    const quantity = typeof r.quantity === "number" ? r.quantity : Number.NaN;
    const topping_ids = normalizeToppingIds(r.topping_ids);

    if (!UUID_RE.test(product_id)) return bad(MSG_CART_MENU);
    if (!Number.isInteger(quantity) || quantity < 1) {
      return bad("Each item needs a quantity of at least 1.");
    }
    if (quantity > MAX_LINE_QUANTITY) {
      return bad(
        "For very large orders, please contact us directly so we can help."
      );
    }
    items.push({ product_id, quantity, topping_ids });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ error: MSG_TRY_LATER }, { status: 503 });
  }

  const ids = [...new Set(items.map((i) => i.product_id))];
  const { data: productRows, error: prodErr } = await admin
    .from("products")
    .select(
      "id, slug, unit_type, name, description, image_path, pricing_model, price_cents, tiers, sort_order"
    )
    .in("id", ids)
    .eq("active", true);

  if (prodErr) {
    console.error("[orders] products query failed:", prodErr.message, prodErr);
    return NextResponse.json({ error: MSG_TRY_LATER }, { status: 503 });
  }

  if (!productRows?.length) {
    return bad(MSG_CART_MENU, 409);
  }

  if (productRows.length < ids.length) {
    return bad(MSG_CART_MENU, 409);
  }

  const products: ProductRow[] = productRows.map((row) =>
    normalizeProductRow(row as Record<string, unknown>)
  );

  const byId = new Map(products.map((p) => [p.id, p]));

  let total_cents = 0;
  const lines: {
    product_id: string;
    quantity: number;
    tier_id: null;
    topping_ids: string[];
    selection_label: string;
    unit_price_cents: number;
    line_total_cents: number;
  }[] = [];

  for (const line of items) {
    const p = byId.get(line.product_id);
    if (!p) {
      return bad(MSG_CART_MENU, 409);
    }

    const priced = computeLinePricing(p, line.topping_ids);
    if (!priced) {
      return bad(MSG_CART_MENU, 409);
    }
    const line_total_cents = priced.unitCents * line.quantity;
    total_cents += line_total_cents;
    lines.push({
      product_id: line.product_id,
      quantity: line.quantity,
      tier_id: null,
      topping_ids: line.topping_ids,
      selection_label: `${p.name} — ${priced.label}`,
      unit_price_cents: priced.unitCents,
      line_total_cents,
    });
  }

  if (fulfillment_method === "delivery") {
    total_cents += DELIVERY_FEE_CENTS;
  }

  const customer_name = `${customer_first_name} ${customer_last_name}`.trim();

  const orderPayload: Record<string, unknown> = {
    customer_first_name,
    customer_last_name,
    customer_name,
    customer_email,
    customer_phone,
    fulfillment_method,
    preferred_date,
    pickup_location_id,
    pickup_slot_summary,
    notes: notes || null,
    status: "pending",
    total_cents,
  };

  const { data: orderRow, error: orderErr } = await admin
    .from("orders")
    .insert(orderPayload)
    .select("id")
    .single();

  if (orderErr || !orderRow?.id) {
    console.error("[orders] insert order:", orderErr);
    return NextResponse.json({ error: MSG_TRY_LATER }, { status: 500 });
  }

  const orderId = orderRow.id as string;

  const { error: itemsErr } = await admin.from("order_items").insert(
    lines.map((l) => ({
      order_id: orderId,
      product_id: l.product_id,
      quantity: l.quantity,
      tier_id: l.tier_id,
      topping_ids: l.topping_ids,
      selection_label: l.selection_label,
      unit_price_cents: l.unit_price_cents,
      line_total_cents: l.line_total_cents,
    }))
  );

  if (itemsErr) {
    console.error("[orders] insert items:", itemsErr);
    await admin.from("orders").delete().eq("id", orderId);
    return NextResponse.json({ error: MSG_TRY_LATER }, { status: 500 });
  }

  const { error: evErr } = await admin.from("order_status_events").insert({
    order_id: orderId,
    previous_status: null,
    new_status: "pending",
    changed_by_email: null,
  });

  if (evErr) {
    console.error("order_status_events insert:", evErr);
  }

  if (customer_email) {
    try {
      await sendOrderInvoiceEmail({
        to: customer_email,
        orderId,
        customerName: customer_name,
        customerPhone: customer_phone,
        fulfillmentMethod: fulfillment_method,
        preferredDate: preferred_date,
        pickupSlotSummary: pickup_slot_summary,
        deliveryFeeCents:
          fulfillment_method === "delivery" ? DELIVERY_FEE_CENTS : 0,
        notes: notes || null,
        lines: lines.map((l) => ({
          selection_label: l.selection_label,
          quantity: l.quantity,
          unit_price_cents: l.unit_price_cents,
          line_total_cents: l.line_total_cents,
        })),
        totalCents: total_cents,
      });
    } catch (e) {
      console.error("[orders] invoice email failed:", e);
    }
  }

  return NextResponse.json({ ok: true, order_id: orderId });
}
