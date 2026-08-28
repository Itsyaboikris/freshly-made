"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatMoney } from "@/lib/money";
import { computeLinePricing } from "@/lib/products";
import { toppingLabels } from "@/lib/toppings";
import type { FulfillmentMethod } from "@/lib/types";
import {
  formatPickupDateLabel,
  upcomingWeekendDeliveryDates,
} from "@/lib/dates";
import {
  formatDeliveryConfirmation,
  getDeliverySlotsForDate,
  getDeliverySummary,
} from "@/lib/delivery-slots";
import {
  COUNTER_PICKUP_ID,
  COUNTER_PICKUP_SUMMARY,
  DELIVERY_FEE_CENTS,
} from "@/lib/fulfillment";
import type { BankDetails } from "@/lib/bank-details";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseIsoDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/* ------------------------------------------------------------------ */
/* Bank details panel — shown in sidebar and on confirmation           */
/* ------------------------------------------------------------------ */
function BankDetailsPanel({
  bank,
  highlight,
}: {
  bank: BankDetails;
  highlight?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAccount() {
    try {
      await navigator.clipboard.writeText(bank.accountNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable – number is still visible */
    }
  }

  const rows: { label: string; value: string; copyable?: boolean }[] = [
    ...(bank.bankName ? [{ label: "Bank", value: bank.bankName }] : []),
    { label: "Account name", value: bank.accountName },
    {
      label: "Account number",
      value: bank.accountNumber,
      copyable: true,
    },
    ...(bank.branch ? [{ label: "Branch", value: bank.branch }] : []),
  ];

  return (
    <div
      className={`rounded-[14px] border p-4 ${
        highlight
          ? "border-brand-burgundy/30 bg-brand-blush"
          : "border-line bg-brand-cream"
      }`}
    >
      <p className="label-mono mb-3">Pay by bank transfer</p>
      <div className="flex flex-col gap-1.5 text-[13px]">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center justify-between gap-2">
            <span className="text-muted">{r.label}</span>
            <span className="flex items-center gap-1.5 font-semibold text-ink">
              {r.value}
              {r.copyable && (
                <button
                  type="button"
                  onClick={copyAccount}
                  aria-label="Copy account number"
                  className="ml-0.5 text-muted transition hover:text-ink"
                >
                  {copied ? (
                    <svg viewBox="0 0 13 13" className="h-3.5 w-3.5" aria-hidden>
                      <path
                        d="M2 7l3 3 6-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 13 13" className="h-3.5 w-3.5" aria-hidden>
                      <rect
                        x="4"
                        y="4"
                        width="7"
                        height="8"
                        rx="1.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                      />
                      <path
                        d="M2 9V2.5A1.5 1.5 0 0 1 3.5 1H9"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              )}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11.5px] leading-relaxed text-muted">
        Use your name as the transfer reference. We&apos;ll confirm your order
        once payment is received.
      </p>
      {copied && (
        <p className="mt-1.5 text-[11.5px] font-semibold text-brand-green">
          Account number copied.
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Confirmation screen                                                  */
/* ------------------------------------------------------------------ */
type OrderLine = {
  name: string;
  toppingIds: string[];
  qty: number;
  lineCents: number;
};

function ConfirmationScreen({
  orderNum,
  firstName,
  email,
  fulfillmentMethod,
  deliveryDate,
  deliveryLocationId,
  subtotalCents,
  deliveryFeeCents,
  orderLines,
  bank,
  onBackToMenu,
}: {
  orderNum: string;
  firstName: string;
  email: string;
  fulfillmentMethod: FulfillmentMethod;
  deliveryDate: string;
  deliveryLocationId: string;
  subtotalCents: number;
  deliveryFeeCents: number;
  orderLines: OrderLine[];
  bank: BankDetails;
  onBackToMenu: () => void;
}) {
  const grandTotal = subtotalCents + deliveryFeeCents;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <div       className="mb-7 inline-flex items-center gap-2 rounded-full bg-brand-green/15 px-5 py-2.5 font-bold text-brand-green">
        <svg viewBox="0 0 18 18" className="h-4.5 w-4.5" aria-hidden>
          <path
            d="M4 9l4 4 6-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-[13px] uppercase tracking-widest">
          Order received
        </span>
      </div>

      <h2 className="text-[30px] font-extrabold text-ink">
        Thanks, {firstName || "friend"}.
      </h2>
      <p className="mt-1 text-[14px] font-bold text-brand-burgundy-deep">
        {orderNum}
      </p>
      {email && (
        <p className="mt-3 text-[14.5px] text-muted">
          We&apos;ll email {email} once your loaves are in the oven.{" "}
          {fulfillmentMethod === "pickup"
            ? "Ready for pickup at the counter."
            : deliveryDate && deliveryLocationId
              ? `Drop-off: ${formatDeliveryConfirmation(deliveryDate, deliveryLocationId)}.`
              : null}
        </p>
      )}
      {!email && (
        <p className="mt-3 text-[14.5px] text-muted">
          {fulfillmentMethod === "pickup"
            ? "Ready for pickup at the counter."
            : deliveryDate && deliveryLocationId
              ? `Drop-off: ${formatDeliveryConfirmation(deliveryDate, deliveryLocationId)}.`
              : "We'll confirm your order once payment is received."}
        </p>
      )}
      <p className="mt-3 text-[14.5px] text-muted">
        Please complete your bank transfer using the reference{" "}
        <strong className="text-ink">{orderNum}</strong> — we&apos;ll confirm
        once it&apos;s received.
      </p>

      {/* Bank details */}
      {(bank.accountName || bank.accountNumber) && (
        <div className="mt-7 text-left">
          <BankDetailsPanel bank={bank} highlight />
        </div>
      )}

      {/* Order summary */}
      <div className="mt-5 rounded-[18px] border border-line bg-brand-cream p-5 text-left">
        {orderLines.map((line, i) => {
          const labels = toppingLabels(line.toppingIds);
          return (
            <div key={i} className="mb-2.5 last:mb-0">
              <div className="flex justify-between text-[13.5px]">
                <span className="font-medium text-ink">
                  {line.qty} × {line.name}
                </span>
                <span className="tabular-nums">{formatMoney(line.lineCents)}</span>
              </div>
              {labels.length > 0 && (
                <p className="mt-0.5 text-[11.5px] text-muted">
                  + {labels.join(", ")}
                </p>
              )}
            </div>
          );
        })}
        {deliveryFeeCents > 0 && (
          <div className="mt-2 flex justify-between text-[13.5px]">
            <span>Delivery fee</span>
            <span className="tabular-nums">{formatMoney(deliveryFeeCents)}</span>
          </div>
        )}
        <div className="mt-3 flex justify-between border-t-2 border-dashed border-line pt-3 font-bold text-[14px]">
          <span>Total</span>
          <span className="text-brand-burgundy-deep tabular-nums">
            {formatMoney(grandTotal)}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={onBackToMenu}
        className="btn-primary mt-8 px-7 py-3 text-[14.5px]"
      >
        Back to menu
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main checkout form                                                   */
/* ------------------------------------------------------------------ */
export function CheckoutForm({
  canSubmitOrders,
  bank,
}: {
  canSubmitOrders: boolean;
  bank: BankDetails;
}) {
  const router = useRouter();
  const { lines, subtotalCents, clearCart } = useCart();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const deliveryDateOptions = useMemo(() => upcomingWeekendDeliveryDates(), []);
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod>("pickup");
  const [deliveryDate, setDeliveryDate] = useState(
    () => upcomingWeekendDeliveryDates(1)[0] ?? ""
  );
  const [deliveryLocationId, setDeliveryLocationId] = useState("");

  const deliverySlotsForDate = useMemo(
    () => (deliveryDate ? getDeliverySlotsForDate(deliveryDate) : []),
    [deliveryDate]
  );

  const deliveryFeeCents =
    fulfillmentMethod === "delivery" ? DELIVERY_FEE_CENTS : 0;
  const grandTotalCents = subtotalCents + deliveryFeeCents;

  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [orderNum, setOrderNum] = useState("");
  const [confirmedLines, setConfirmedLines] = useState<OrderLine[]>([]);
  const [confirmedSubtotal, setConfirmedSubtotal] = useState(0);
  const [confirmedDeliveryFee, setConfirmedDeliveryFee] = useState(0);
  const [confirmedMethod, setConfirmedMethod] =
    useState<FulfillmentMethod>("pickup");
  const [confirmedDate, setConfirmedDate] = useState("");
  const [confirmedLocationId, setConfirmedLocationId] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitOrders) {
      setErrorMessage(
        "Online checkout isn't available right now. Please try again later."
      );
      setStatus("error");
      return;
    }
    if (lines.length === 0) {
      setErrorMessage("Your cart is empty.");
      setStatus("error");
      return;
    }
    for (const line of lines) {
      if (!UUID_RE.test(line.product.id)) {
        setErrorMessage(
          "This shop isn't ready for checkout yet. Please check back later."
        );
        setStatus("error");
        return;
      }
    }

    if (fulfillmentMethod === "delivery") {
      if (!deliveryDate) {
        setErrorMessage("Choose a delivery date.");
        setStatus("error");
        return;
      }
      if (!deliveryLocationId) {
        setErrorMessage("Choose a delivery location.");
        setStatus("error");
        return;
      }
      const summary = getDeliverySummary(deliveryLocationId);
      if (!summary) {
        setErrorMessage("Choose a valid delivery location.");
        setStatus("error");
        return;
      }
    }

    setStatus("submitting");
    setErrorMessage("");

    const slotSummary =
      fulfillmentMethod === "delivery"
        ? getDeliverySummary(deliveryLocationId)!
        : COUNTER_PICKUP_SUMMARY;
    const locationId =
      fulfillmentMethod === "delivery"
        ? deliveryLocationId
        : COUNTER_PICKUP_ID;

    const items = lines.map((line) => ({
      product_id: line.product.id,
      quantity: line.quantity,
      topping_ids: line.toppingIds,
    }));

    /* capture lines before clearing */
    const snapshotLines: OrderLine[] = lines.map((line) => {
      const priced = computeLinePricing(line.product, line.toppingIds);
      return {
        name: line.product.name,
        toppingIds: line.toppingIds,
        qty: line.quantity,
        lineCents: priced ? priced.unitCents * line.quantity : 0,
      };
    });
    const snapshotSubtotal = subtotalCents;

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_first_name: firstName,
          customer_last_name: lastName,
          customer_phone: customerPhone,
          customer_email: customerEmail.trim() || null,
          fulfillment_method: fulfillmentMethod,
          preferred_date:
            fulfillmentMethod === "delivery" ? deliveryDate : null,
          pickup_location_id: locationId,
          pickup_slot_summary: slotSummary,
          notes,
          items,
        }),
      });

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        order_number?: string;
        order_id?: string;
      };

      if (!res.ok) {
        const serverMsg =
          typeof data.error === "string" && data.error.length > 0
            ? data.error
            : "";
        setErrorMessage(
          res.status >= 500
            ? "We couldn't save your order right now. Please try again in a few minutes."
            : serverMsg || "Something went wrong. Please try again."
        );
        setStatus("error");
        return;
      }

      /* derive a short order reference from the returned id/number */
      const ref =
        data.order_number ??
        (data.order_id
          ? `BB-${data.order_id.slice(0, 4).toUpperCase()}`
          : `BB-${Math.floor(1000 + Math.random() * 9000)}`);

      setOrderNum(ref);
      setConfirmedLines(snapshotLines);
      setConfirmedSubtotal(snapshotSubtotal);
      setConfirmedDeliveryFee(deliveryFeeCents);
      setConfirmedMethod(fulfillmentMethod);
      setConfirmedDate(fulfillmentMethod === "delivery" ? deliveryDate : "");
      setConfirmedLocationId(
        fulfillmentMethod === "delivery" ? deliveryLocationId : ""
      );

      clearCart();
      setStatus("success");
      router.refresh();
    } catch {
      setErrorMessage("Network error. Check your connection and try again.");
      setStatus("error");
    }
  }

  function backToMenu() {
    setStatus("idle");
    setOrderNum("");
    setFirstName("");
    setLastName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setNotes("");
    router.push("/menu");
  }

  /* --- Confirmation --- */
  if (status === "success") {
    return (
      <ConfirmationScreen
        orderNum={orderNum}
        firstName={firstName}
        email={customerEmail}
        fulfillmentMethod={confirmedMethod}
        deliveryDate={confirmedDate}
        deliveryLocationId={confirmedLocationId}
        subtotalCents={confirmedSubtotal}
        deliveryFeeCents={confirmedDeliveryFee}
        orderLines={confirmedLines}
        bank={bank}
        onBackToMenu={backToMenu}
      />
    );
  }

  /* --- Empty cart --- */
  if (lines.length === 0) {
    return (
      <div className="card-panel py-10 text-center">
        <p className="text-muted">Your cart is empty.</p>
        <Link
          href="/menu"
          className="mt-5 inline-block text-sm font-semibold text-ink hover:underline"
        >
          Browse the menu
        </Link>
      </div>
    );
  }

  /* --- Checkout form --- */
  return (
    <form
      onSubmit={onSubmit}
      className="grid items-start gap-10 lg:grid-cols-[1.3fr_1fr] lg:gap-12"
    >
      {/* ---- LEFT: form fields ---- */}
      <div className="min-w-0 space-y-6">
        {!canSubmitOrders && (
          <p className="rounded-[10px] border border-line bg-brand-cream px-4 py-3 text-sm text-ink">
            Online checkout isn&apos;t turned on for this site yet. Please check
            back later or contact the bakery directly.
          </p>
        )}

        <div>
          <h2 className="text-[27px] font-extrabold text-ink">Your details</h2>
          <p className="mt-1 text-sm text-muted">
            Place your order below, then complete the bank transfer using your
            name as the reference.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
            Full name
            <input
              required
              className="input-field"
              value={firstName}
              placeholder="First name"
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
            &nbsp;
            <input
              required
              className="input-field"
              value={lastName}
              placeholder="Last name"
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
          Email
          <input
            required
            type="email"
            className="input-field"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
          Phone{" "}
          <span className="font-normal text-muted">(optional)</span>
          <input
            type="tel"
            className="input-field"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            autoComplete="tel"
          />
        </label>

        <div>
          <p className="text-[13px] font-semibold text-ink">Get it by</p>
          <div className="mt-2 flex gap-2.5">
            {(["pickup", "delivery"] as FulfillmentMethod[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setFulfillmentMethod(m)}
                className={`btn-outline px-[18px] py-2 text-[13.5px] capitalize ${
                  fulfillmentMethod === m ? "btn-outline-active" : ""
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {fulfillmentMethod === "delivery" && (
          <div>
            <p className="text-[13px] font-semibold text-ink">Delivery date</p>
            <p className="mt-1 text-xs text-muted">
              Orders need at least 3 days&apos; notice — pick any available
              Saturday or Sunday over the next month.
            </p>
            <div className="mt-3 flex max-h-57.5 flex-wrap gap-2 overflow-y-auto pr-0.5">
              {deliveryDateOptions.map((iso) => {
                const active = deliveryDate === iso;
                const d = parseIsoDate(iso);
                return (
                  <button
                    key={iso}
                    type="button"
                    onClick={() => {
                      setDeliveryDate(iso);
                      setDeliveryLocationId("");
                    }}
                    className={`flex w-19 flex-col items-center gap-0.5 rounded-xl border-[1.5px] px-1.5 py-2.5 transition ${
                      active
                        ? "border-brand-burgundy bg-brand-cream"
                        : "border-line bg-surface-elevated hover:border-brand-burgundy/40"
                    }`}
                  >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                      {d.toLocaleDateString(undefined, { weekday: "short" })}
                    </span>
                    <span className="text-xl font-extrabold leading-none">
                      {d.getDate()}
                    </span>
                    <span className="text-[10.5px] text-muted">
                      {d.toLocaleDateString(undefined, { month: "short" })}
                    </span>
                  </button>
                );
              })}
            </div>

            {deliveryDate && (
              <>
                <p className="mt-4 text-[13px] font-semibold text-ink">
                  Drop-off location
                </p>
                <div className="mt-2 flex flex-col gap-2">
                  {deliverySlotsForDate.map((slot) => {
                    const active = deliveryLocationId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setDeliveryLocationId(slot.id)}
                        className={`flex items-center justify-between rounded-[10px] border-[1.5px] px-3.5 py-3 text-left transition ${
                          active
                            ? "border-brand-burgundy bg-brand-cream"
                            : "border-line bg-surface-elevated hover:border-brand-burgundy/40"
                        }`}
                      >
                        <span className="text-sm font-semibold text-ink">
                          {slot.location}
                        </span>
                        <span className="text-xs font-semibold text-muted">
                          {slot.time}
                        </span>
                      </button>
                    );
                  })}
                  {deliverySlotsForDate.length === 0 && (
                    <p className="text-sm text-muted">
                      No drop-off slots for this date.
                    </p>
                  )}
                </div>
              </>
            )}

            <p className="mt-3 text-xs text-muted">
              A {formatMoney(DELIVERY_FEE_CENTS)} delivery fee applies — see the
              order summary.
            </p>
          </div>
        )}

        <label className="flex flex-col gap-1.5 text-[13px] font-semibold text-ink">
          Notes for the bakers (optional)
          <textarea
            rows={3}
            className="input-field resize-y"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Allergies, gift note…"
          />
        </label>

        {status === "error" && errorMessage && (
          <p role="alert" className="text-[13px] font-semibold text-red-600">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary w-full py-3.5 text-[15px] lg:hidden"
        >
          {status === "submitting" ? "Sending…" : "Place order"}
        </button>
      </div>

      {/* ---- RIGHT: sticky order summary + bank details ---- */}
      <aside className="card-panel sticky top-22.5 bg-brand-cream">
        <p className="label-mono">Order summary</p>

        {/* line items */}
        <div className="mt-4 space-y-2.5">
          {lines.map((line) => {
            const priced = computeLinePricing(line.product, line.toppingIds);
            const labels = toppingLabels(line.toppingIds);
            return (
              <div key={line.key}>
                <div className="flex justify-between text-[13.5px]">
                  <span className="font-medium text-ink">
                    {line.quantity} × {line.product.name}
                  </span>
                  <span className="tabular-nums">
                    {priced ? formatMoney(priced.unitCents * line.quantity) : "—"}
                  </span>
                </div>
                {labels.length > 0 && (
                  <p className="mt-0.5 text-[11.5px] text-muted">
                    + {labels.join(", ")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* total */}
        {deliveryFeeCents > 0 && (
          <div className="mt-4 flex justify-between text-[13.5px]">
            <span>Delivery fee</span>
            <span className="tabular-nums">{formatMoney(deliveryFeeCents)}</span>
          </div>
        )}
        <div className="mt-4 flex justify-between border-t-2 border-dashed border-line pt-4 font-bold">
          <span>Total</span>
          <span className="text-brand-burgundy-deep tabular-nums">
            {formatMoney(grandTotalCents)}
          </span>
        </div>

        {/* fulfillment summary */}
        {fulfillmentMethod === "delivery" && deliveryDate && (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Drop-off: {formatPickupDateLabel(deliveryDate)}
            {deliveryLocationId
              ? ` · ${getDeliverySummary(deliveryLocationId) ?? ""}`
              : ""}
          </p>
        )}
        {fulfillmentMethod === "pickup" && (
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Pickup at the counter — we&apos;ll confirm when your order is ready.
          </p>
        )}

        {/* bank details */}
        {(bank.accountName || bank.accountNumber) && (
          <div className="mt-5">
            <BankDetailsPanel bank={bank} />
          </div>
        )}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary mt-5 hidden w-full py-3.5 text-[15px] lg:inline-flex"
        >
          {status === "submitting" ? "Sending…" : "Place order"}
        </button>
      </aside>
    </form>
  );
}
