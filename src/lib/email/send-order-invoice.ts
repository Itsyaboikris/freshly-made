import nodemailer from "nodemailer";
import type { FulfillmentMethod } from "@/lib/types";
import { formatPickupDateLabel } from "@/lib/dates";
import { formatMoney } from "@/lib/money";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export type InvoiceLine = {
  selection_label: string;
  quantity: number;
  unit_price_cents: number;
  line_total_cents: number;
};

export function isInvoiceEmailConfigured(): boolean {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  return Boolean(user && pass);
}

/**
 * Sends order summary / invoice to the customer via Gmail (Nodemailer).
 * Requires GMAIL_USER + GMAIL_APP_PASSWORD (Google App Password, not your normal password).
 */
export async function sendOrderInvoiceEmail(params: {
  to: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  fulfillmentMethod: FulfillmentMethod;
  preferredDate: string | null;
  pickupSlotSummary: string;
  deliveryFeeCents: number;
  notes: string | null;
  lines: InvoiceLine[];
  totalCents: number;
}): Promise<void> {
  if (!isInvoiceEmailConfigured()) {
    console.warn(
      "[email] Invoice skipped: set GMAIL_USER and GMAIL_APP_PASSWORD to send mail."
    );
    return;
  }

  const user = process.env.GMAIL_USER!.trim();
  const pass = process.env.GMAIL_APP_PASSWORD!.replace(/\s/g, "");
  const from = process.env.INVOICE_FROM_EMAIL?.trim() || user;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const shortId = params.orderId.slice(0, 8).toUpperCase();
  const subject = `Order confirmed — Freshly Baked Banana Bread (#${shortId})`;

  const pickupLabel = params.preferredDate
    ? formatPickupDateLabel(params.preferredDate)
    : null;
  const fulfillmentHeading =
    params.fulfillmentMethod === "delivery" ? "Delivery" : "Pickup";
  const fulfillmentDetail =
    params.fulfillmentMethod === "delivery" && pickupLabel
      ? `${pickupLabel} — ${params.pickupSlotSummary}`
      : params.pickupSlotSummary;

  // Font stacks
  const sans =
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";
  const mono = "ui-monospace,SFMono-Regular,Consolas,monospace";

  // Brand palette
  const gold = "#f5b301";
  const ink = "#2b2118";
  const muted = "#7a6859";
  const cream = "#fbf7ee";
  const blush = "#fff4d6";
  const cardBg = "#ffffff";
  const pageBg = "#f0ebe1";
  const border = "#e5ddd0";
  const rowBorder = "#f0ebe1";

  // Item rows — alternate cream/white for readability
  const rowsHtml = params.lines
    .map(
      (l, i) =>
        `<tr style="background-color:${i % 2 === 1 ? cream : cardBg};">
  <td style="padding:13px 16px;border-bottom:1px solid ${rowBorder};font-size:14px;color:${ink};line-height:1.5;vertical-align:top;">${escapeHtml(l.selection_label)}</td>
  <td style="padding:13px 10px;border-bottom:1px solid ${rowBorder};text-align:center;font-size:14px;color:${muted};vertical-align:top;width:40px;">${l.quantity}</td>
  <td style="padding:13px 14px;border-bottom:1px solid ${rowBorder};text-align:right;font-size:13px;color:${muted};vertical-align:top;white-space:nowrap;">${formatMoney(l.unit_price_cents)}</td>
  <td style="padding:13px 16px;border-bottom:1px solid ${rowBorder};text-align:right;font-size:14px;font-weight:600;color:${ink};vertical-align:top;white-space:nowrap;">${formatMoney(l.line_total_cents)}</td>
</tr>`
    )
    .join("");

  const deliveryFeeRow =
    params.deliveryFeeCents > 0
      ? `<tr>
  <td style="padding:10px 16px;font-size:14px;color:${muted};">Delivery fee</td>
  <td align="right" colspan="3" style="padding:10px 16px;font-size:14px;color:${muted};">${formatMoney(params.deliveryFeeCents)}</td>
</tr>`
      : "";

  const notesBlock =
    params.notes && params.notes.trim().length > 0
      ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:20px;">
  <tr>
    <td style="padding:14px 16px;background-color:${blush};border-left:3px solid ${gold};font-size:14px;line-height:1.65;color:${ink};">
      <strong style="color:${ink};">Note</strong> — ${escapeHtml(params.notes.trim())}
    </td>
  </tr>
</table>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Order confirmed</title>
</head>
<body style="margin:0;padding:0;background-color:${pageBg};font-family:${sans};color:${ink};-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${pageBg};">
  <tr>
    <td align="center" style="padding:40px 16px 56px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;">

        <!-- ── Brand header ── -->
        <tr>
          <td style="background-color:${gold};padding:24px 32px 20px;border-radius:12px 12px 0 0;">
            <p style="margin:0;font-size:20px;font-weight:700;color:${ink};letter-spacing:-0.01em;">
              Freshly Baked Banana Bread
            </p>
            <p style="margin:5px 0 0;font-size:11px;font-weight:600;color:${ink};opacity:0.6;letter-spacing:0.08em;text-transform:uppercase;">
              Order confirmation
            </p>
          </td>
        </tr>

        <!-- ── Body ── -->
        <tr>
          <td style="background-color:${cardBg};padding:36px 32px 32px;border-left:1px solid ${border};border-right:1px solid ${border};">

            <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;line-height:1.25;color:${ink};letter-spacing:-0.02em;">
              Thank you, ${escapeHtml(params.customerName)}!
            </h1>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:${muted};">
              Your order is in. We&rsquo;ll reach out on <strong style="color:${ink};font-weight:600;">${escapeHtml(params.customerPhone)}</strong> to confirm everything.
            </p>

            <!-- Info row: fulfillment + order ref -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;border:1px solid ${border};border-radius:8px;overflow:hidden;">
              <tr>
                <td width="50%" style="padding:14px 16px;background-color:${cream};border-right:1px solid ${border};vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${muted};">${escapeHtml(fulfillmentHeading)}</p>
                  <p style="margin:0;font-size:14px;font-weight:600;color:${ink};line-height:1.45;">${escapeHtml(fulfillmentDetail || "—")}</p>
                </td>
                <td width="50%" style="padding:14px 16px;background-color:${cream};vertical-align:top;">
                  <p style="margin:0 0 4px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:${muted};">Order ref</p>
                  <p style="margin:0;font-family:${mono};font-size:13px;font-weight:600;color:${ink};letter-spacing:0.04em;">#${shortId}</p>
                </td>
              </tr>
            </table>

            <!-- Items -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;border:1px solid ${border};border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background-color:${cream};">
                  <th align="left"   style="padding:10px 16px;font-size:10px;font-weight:700;color:${muted};text-transform:uppercase;letter-spacing:0.07em;border-bottom:1px solid ${border};">Item</th>
                  <th align="center" style="padding:10px 10px;font-size:10px;font-weight:700;color:${muted};text-transform:uppercase;letter-spacing:0.07em;border-bottom:1px solid ${border};width:40px;">Qty</th>
                  <th align="right"  style="padding:10px 14px;font-size:10px;font-weight:700;color:${muted};text-transform:uppercase;letter-spacing:0.07em;border-bottom:1px solid ${border};">Each</th>
                  <th align="right"  style="padding:10px 16px;font-size:10px;font-weight:700;color:${muted};text-transform:uppercase;letter-spacing:0.07em;border-bottom:1px solid ${border};">Total</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>

            <!-- Totals -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid ${border};border-top:none;border-radius:0 0 8px 8px;overflow:hidden;">
              ${deliveryFeeRow}
              <tr>
                <td colspan="2" style="padding:0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding:16px 16px;background-color:${gold};font-size:15px;font-weight:700;color:${ink};">Total (TTD)</td>
                      <td align="right" style="padding:16px 16px;background-color:${gold};font-size:22px;font-weight:700;color:${ink};">${formatMoney(params.totalCents)}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            ${notesBlock}

            <!-- Payment reminder -->
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
              <tr>
                <td style="padding:16px;background-color:${blush};border-radius:8px;border:1px solid ${border};">
                  <p style="margin:0;font-size:13px;line-height:1.65;color:${muted};">
                    <strong style="color:${ink};">Payment:</strong> Please complete your bank transfer using the details provided at checkout, quoting reference <strong style="font-family:${mono};color:${ink};">#${shortId}</strong>.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- ── Footer ── -->
        <tr>
          <td style="background-color:${cream};padding:20px 32px;border:1px solid ${border};border-top:none;border-radius:0 0 12px 12px;text-align:center;">
            <p style="margin:0;font-size:13px;color:${muted};line-height:1.6;">
              Freshly Baked Banana Bread &mdash; handmade with fresh, ripe bananas.
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const textLines = [
    `Order confirmed — Freshly Baked Banana Bread (#${shortId})`,
    ``,
    `Thank you, ${params.customerName}!`,
    `We'll reach out on ${params.customerPhone} to confirm.`,
    ``,
    `${fulfillmentHeading}: ${fulfillmentDetail || "—"}`,
    params.deliveryFeeCents > 0
      ? `Delivery fee: ${formatMoney(params.deliveryFeeCents)}`
      : "",
    ``,
    ...params.lines.map(
      (l) =>
        `${l.quantity}x ${l.selection_label} @ ${formatMoney(l.unit_price_cents)} = ${formatMoney(l.line_total_cents)}`
    ),
    ``,
    `Total: ${formatMoney(params.totalCents)} TTD`,
    params.notes?.trim() ? `\nNote: ${params.notes.trim()}` : "",
    ``,
    `Please transfer payment quoting reference #${shortId}.`,
  ].filter((l) => l !== undefined && l !== null);

  await transporter.sendMail({
    from: `"Freshly Baked Banana Bread" <${from}>`,
    to: params.to,
    subject,
    text: textLines.join("\n"),
    html,
  });

  console.info(`[email] Invoice sent to ${params.to} for order #${shortId}`);
}
