import { ORDER_STATUS_LABELS } from "@/lib/constants";
import type { AdminOrder } from "@/lib/admin-orders";
import type { OrderStatus } from "@/lib/types";

const STATUS_ORDER: OrderStatus[] = [
  "pending",
  "paid",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export type DayBucket = {
  /** YYYY-MM-DD in local interpretation of order date */
  key: string;
  /** Short label for chart axis */
  label: string;
  count: number;
};

export type StatusBucket = {
  status: string;
  label: string;
  count: number;
};

export type DashboardStats = {
  totalOrders: number;
  /** Sum of order totals excluding cancelled */
  revenueExclCancelledCents: number;
  /** Orders not delivered and not cancelled */
  activePipelineCount: number;
  /** Average order value among non-cancelled orders */
  avgOrderExclCancelledCents: number;
  last14Days: DayBucket[];
  statusBreakdown: StatusBucket[];
};

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function formatDayLabel(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00Z");
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}

/**
 * Buckets orders by UTC calendar day of created_at for the last 14 days (including today).
 */
export function buildDashboardStats(orders: AdminOrder[]): DashboardStats {
  const totalOrders = orders.length;

  const nonCancelled = orders.filter((o) => o.status !== "cancelled");
  const revenueExclCancelledCents = nonCancelled.reduce(
    (sum, o) => sum + o.total_cents,
    0
  );
  const avgOrderExclCancelledCents =
    nonCancelled.length > 0
      ? Math.round(revenueExclCancelledCents / nonCancelled.length)
      : 0;

  const activePipelineCount = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled"
  ).length;

  const now = new Date();
  const todayStart = startOfUtcDay(now);
  const keys: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(todayStart);
    day.setUTCDate(day.getUTCDate() - i);
    const y = day.getUTCFullYear();
    const m = String(day.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(day.getUTCDate()).padStart(2, "0");
    keys.push(`${y}-${m}-${dd}`);
  }

  const countByKey = new Map<string, number>();
  for (const k of keys) countByKey.set(k, 0);

  for (const o of orders) {
    const created = new Date(o.created_at);
    const y = created.getUTCFullYear();
    const m = String(created.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(created.getUTCDate()).padStart(2, "0");
    const key = `${y}-${m}-${dd}`;
    if (countByKey.has(key)) {
      countByKey.set(key, (countByKey.get(key) ?? 0) + 1);
    }
  }

  const last14Days: DayBucket[] = keys.map((key) => ({
    key,
    label: formatDayLabel(key),
    count: countByKey.get(key) ?? 0,
  }));

  const statusCounts = new Map<string, number>();
  for (const o of orders) {
    statusCounts.set(o.status, (statusCounts.get(o.status) ?? 0) + 1);
  }

  const statusBreakdown: StatusBucket[] = STATUS_ORDER.map((status) => ({
    status,
    label: ORDER_STATUS_LABELS[status] ?? status,
    count: statusCounts.get(status) ?? 0,
  }));

  return {
    totalOrders,
    revenueExclCancelledCents,
    activePipelineCount,
    avgOrderExclCancelledCents,
    last14Days,
    statusBreakdown,
  };
}
