"use client";

import { Fragment, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/app/admin/actions";
import type { AdminOrder } from "@/lib/admin-orders";
import type { OrderStatus, OrderStatusEventRow } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatMoney } from "@/lib/money";
import { OrderStatusBadge, orderStatusRowBorderClass } from "@/components/OrderStatusBadge";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function customerLabel(order: AdminOrder): string {
  const f = order.customer_first_name?.trim();
  const l = order.customer_last_name?.trim();
  if (f || l) return [f, l].filter(Boolean).join(" ");
  return order.customer_name?.trim() || "—";
}

type SortKey =
  | "created_at"
  | "customer"
  | "customer_phone"
  | "preferred_date"
  | "pickup_slot_summary"
  | "total_cents"
  | "status";

function compareOrders(
  a: AdminOrder,
  b: AdminOrder,
  key: SortKey,
  asc: boolean
): number {
  let cmp = 0;
  switch (key) {
    case "created_at":
      cmp =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      break;
    case "customer":
      cmp = customerLabel(a).localeCompare(customerLabel(b), undefined, {
        sensitivity: "base",
      });
      break;
    case "customer_phone":
      cmp = a.customer_phone.localeCompare(b.customer_phone);
      break;
    case "preferred_date":
      cmp = (a.preferred_date ?? "").localeCompare(b.preferred_date ?? "");
      break;
    case "pickup_slot_summary":
      cmp = (a.pickup_slot_summary ?? "").localeCompare(
        b.pickup_slot_summary ?? ""
      );
      break;
    case "total_cents":
      cmp = a.total_cents - b.total_cents;
      break;
    case "status":
      cmp = a.status.localeCompare(b.status);
      break;
    default:
      cmp = 0;
  }
  return asc ? cmp : -cmp;
}

function SortHeader({
  label,
  column,
  sortKey,
  sortAsc,
  onSort,
  className = "",
}: {
  label: string;
  column: SortKey;
  sortKey: SortKey;
  sortAsc: boolean;
  onSort: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === column;
  return (
    <th scope="col" className={`px-3 py-3 text-left ${className}`}>
      <button
        type="button"
        onClick={() => onSort(column)}
        aria-label={
          active
            ? `${label}, sorted ${sortAsc ? "ascending" : "descending"}. Click to reverse.`
            : `${label}. Click to sort.`
        }
        className="inline-flex items-center gap-1 font-semibold text-ink hover:text-brand-burgundy"
      >
        {label}
        {active && (
          <span className="text-brand-burgundy" aria-hidden>
            {sortAsc ? "↑" : "↓"}
          </span>
        )}
      </button>
    </th>
  );
}

export function AdminOrders({
  initialOrders,
  statusEvents,
}: {
  initialOrders: AdminOrder[];
  statusEvents: Record<string, OrderStatusEventRow[]>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortAsc, setSortAsc] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sortedOrders = useMemo(() => {
    const arr = [...initialOrders];
    arr.sort((a, b) => compareOrders(a, b, sortKey, sortAsc));
    return arr;
  }, [initialOrders, sortKey, sortAsc]);

  function onSort(column: SortKey) {
    if (column === sortKey) {
      setSortAsc((v) => !v);
    } else {
      setSortKey(column);
      setSortAsc(
        column === "customer" ||
          column === "customer_phone" ||
          column === "preferred_date" ||
          column === "pickup_slot_summary" ||
          column === "status"
      );
    }
  }

  function onStatusChange(orderId: string, status: OrderStatus) {
    setErr("");
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status);
        router.refresh();
      } catch {
        setErr("Could not update status.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Orders</h1>
        <p className="mt-2 text-sm text-muted">
          Click column headers to sort. Expand a row for items and status history.
        </p>
      </div>

      {err && (
        <p className="rounded-xl border border-red-200/80 bg-red-50/90 px-4 py-2 text-sm text-red-950">
          {err}
        </p>
      )}

      {initialOrders.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface-elevated/80 p-8 text-center text-muted">
          No orders yet. Customer submissions will appear here.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface-elevated shadow-sm">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-brand-cream/40 text-left">
                <th scope="col" className="w-10 px-2 py-3" aria-label="Expand" />
                <SortHeader
                  label="Placed"
                  column="created_at"
                  sortKey={sortKey}
                  sortAsc={sortAsc}
                  onSort={onSort}
                />
                <SortHeader
                  label="Customer"
                  column="customer"
                  sortKey={sortKey}
                  sortAsc={sortAsc}
                  onSort={onSort}
                />
                <SortHeader
                  label="Phone"
                  column="customer_phone"
                  sortKey={sortKey}
                  sortAsc={sortAsc}
                  onSort={onSort}
                  className="whitespace-nowrap"
                />
                <SortHeader
                  label="Pickup"
                  column="preferred_date"
                  sortKey={sortKey}
                  sortAsc={sortAsc}
                  onSort={onSort}
                  className="whitespace-nowrap"
                />
                <SortHeader
                  label="Location"
                  column="pickup_slot_summary"
                  sortKey={sortKey}
                  sortAsc={sortAsc}
                  onSort={onSort}
                />
                <SortHeader
                  label="Total"
                  column="total_cents"
                  sortKey={sortKey}
                  sortAsc={sortAsc}
                  onSort={onSort}
                  className="whitespace-nowrap text-right"
                />
                <SortHeader
                  label="Status"
                  column="status"
                  sortKey={sortKey}
                  sortAsc={sortAsc}
                  onSort={onSort}
                  className="whitespace-nowrap"
                />
              </tr>
            </thead>
            <tbody>
              {sortedOrders.map((order) => {
                const events = statusEvents[order.id] ?? [];
                const open = expandedId === order.id;
                return (
                  <Fragment key={order.id}>
                    <tr
                      className={`border-b border-line border-l-4 hover:bg-brand-cream/20 ${orderStatusRowBorderClass(order.status)}`}
                    >
                      <td className="px-2 py-3 align-top">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-line/60 hover:text-ink"
                          aria-expanded={open}
                          aria-controls={`order-detail-${order.id}`}
                          onClick={() =>
                            setExpandedId((id) =>
                              id === order.id ? null : order.id
                            )
                          }
                        >
                          <span className="text-lg leading-none" aria-hidden>
                            {open ? "▼" : "▶"}
                          </span>
                        </button>
                      </td>
                      <td className="px-3 py-3 align-top text-muted whitespace-nowrap">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span className="font-medium text-ink">
                          {customerLabel(order)}
                        </span>
                        {order.customer_email && (
                          <span className="mt-0.5 block text-xs text-muted">
                            {order.customer_email}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top text-muted whitespace-nowrap">
                        {order.customer_phone}
                      </td>
                      <td className="px-3 py-3 align-top whitespace-nowrap">
                        {order.preferred_date}
                      </td>
                      <td className="max-w-[200px] px-3 py-3 align-top text-muted">
                        {order.pickup_slot_summary ?? "—"}
                      </td>
                      <td className="px-3 py-3 align-top text-right font-semibold text-brand-burgundy whitespace-nowrap">
                        {formatMoney(order.total_cents)}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="flex max-w-52 flex-col gap-2">
                          <OrderStatusBadge status={order.status} />
                          <label className="sr-only" htmlFor={`status-${order.id}`}>
                            Change status for order {order.id.slice(0, 8)}
                          </label>
                          <select
                            id={`status-${order.id}`}
                            disabled={pending}
                            className="input-field py-1.5 text-xs"
                            value={order.status}
                            onChange={(e) =>
                              onStatusChange(
                                order.id,
                                e.target.value as OrderStatus
                              )
                            }
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {ORDER_STATUS_LABELS[s] ?? s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                    </tr>
                    {open && (
                      <tr
                        id={`order-detail-${order.id}`}
                        className={`border-b border-line border-l-4 bg-surface/80 ${orderStatusRowBorderClass(order.status)}`}
                      >
                        <td colSpan={8} className="px-4 py-4 sm:px-6">
                          {order.notes && (
                            <p className="mb-4 text-sm text-muted">
                              <span className="font-medium text-ink">Notes:</span>{" "}
                              {order.notes}
                            </p>
                          )}
                          {order.order_items && order.order_items.length > 0 && (
                            <div className="mb-4">
                              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                                Line items
                              </p>
                              <ul className="divide-y divide-line rounded-xl border border-line bg-surface-elevated text-muted">
                                {order.order_items.map((item) => (
                                  <li
                                    key={item.id}
                                    className="flex flex-wrap justify-between gap-2 px-3 py-2 text-sm"
                                  >
                                    <span>
                                      {item.quantity}× {item.selection_label}
                                    </span>
                                    <span className="font-medium text-ink">
                                      {formatMoney(item.line_total_cents)}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {events.length > 0 && (
                            <details className="rounded-xl border border-line bg-surface-elevated px-3 py-2">
                              <summary className="cursor-pointer text-sm font-medium text-ink">
                                Status history ({events.length})
                              </summary>
                              <ol className="mt-2 space-y-1.5 border-t border-line pt-2 text-xs text-muted">
                                {events.map((ev) => (
                                  <li
                                    key={ev.id}
                                    className="flex flex-wrap gap-x-2 border-l-2 border-accent-warm/50 pl-2"
                                  >
                                    <time dateTime={ev.created_at}>
                                      {formatDate(ev.created_at)}
                                    </time>
                                    <span>
                                      {ev.previous_status
                                        ? `${ORDER_STATUS_LABELS[ev.previous_status] ?? ev.previous_status} → `
                                        : ""}
                                      <strong>
                                        {ORDER_STATUS_LABELS[ev.new_status] ??
                                          ev.new_status}
                                      </strong>
                                    </span>
                                    {ev.changed_by_email && (
                                      <span className="text-muted/80">
                                        by {ev.changed_by_email}
                                      </span>
                                    )}
                                  </li>
                                ))}
                              </ol>
                            </details>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
