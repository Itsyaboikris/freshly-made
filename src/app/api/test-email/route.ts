import { NextResponse } from "next/server";
import {
  isInvoiceEmailConfigured,
  sendOrderInvoiceEmail,
} from "@/lib/email/send-order-invoice";
import { upcomingWeekendPickupDates } from "@/lib/dates";
import { getDeliverySummary } from "@/lib/delivery-slots";

function allowTestEmail(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.ALLOW_TEST_EMAIL === "true"
  );
}

function simpleEmailOk(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && s.length <= 254;
}

export async function POST(request: Request) {
  if (!allowTestEmail()) {
    return NextResponse.json({ error: "Not available." }, { status: 403 });
  }

  if (!isInvoiceEmailConfigured()) {
    return NextResponse.json(
      { error: "Email is not configured (GMAIL_USER / GMAIL_APP_PASSWORD)." },
      { status: 400 }
    );
  }

  let body: { to?: unknown } = {};
  try {
    body = (await request.json()) as { to?: unknown };
  } catch {
    /* empty body ok */
  }

  const defaultTo = process.env.GMAIL_USER?.trim();
  if (!defaultTo) {
    return NextResponse.json({ error: "Gmail is not configured." }, { status: 400 });
  }
  let to = defaultTo;
  if (typeof body.to === "string" && body.to.trim().length > 0) {
    const candidate = body.to.trim();
    if (!simpleEmailOk(candidate)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }
    to = candidate;
  }

  const preferredDate = upcomingWeekendPickupDates(14)[0] ?? "2026-06-06";
  const pickupSlotSummary =
    getDeliverySummary("courts-freeport") ?? "Courts Freeport · 4:30 – 5:30 PM";

  try {
    await sendOrderInvoiceEmail({
      to,
      orderId: "00000000-0000-4000-8000-000000000099",
      customerName: "Template preview",
      customerPhone: "1 (868) 555-0100",
      fulfillmentMethod: "delivery",
      preferredDate,
      pickupSlotSummary,
      deliveryFeeCents: 2000,
      notes: "This is a test message — allergies example.",
      lines: [
        {
          selection_label:
            "Classic Banana Loaf (2 lb loaf) — Loaf · Chocolate chips, Peanuts",
          quantity: 1,
          unit_price_cents: 7000,
          line_total_cents: 7000,
        },
        {
          selection_label: "Oreo Banana Bread (slice) — Slice · Plain",
          quantity: 2,
          unit_price_cents: 3500,
          line_total_cents: 7000,
        },
      ],
      totalCents: 16000,
    });
  } catch (e) {
    console.error("[test-email]", e);
    return NextResponse.json(
      { error: "Could not send. Check server logs." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, to });
}
