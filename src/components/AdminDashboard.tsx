import Link from "next/link";
import type { AdminOrder } from "@/lib/admin-orders";
import type { DashboardStats } from "@/lib/admin-dashboard-stats";
import { OrderStatusBadge, orderStatusRowBorderClass } from "@/components/OrderStatusBadge";
import { formatMoney } from "@/lib/money";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function customerShort(order: AdminOrder): string {
  const f = order.customer_first_name?.trim();
  const l = order.customer_last_name?.trim();
  if (f || l) return [f, l].filter(Boolean).join(" ");
  return order.customer_name?.trim() || "—";
}

const STAT_ICONS = {
  orders: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M6 2h8l2 3H4L6 2z" />
      <path d="M3 5h14v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5z" />
      <path d="M8 10h4M8 13h2" />
    </svg>
  ),
  revenue: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="10" cy="10" r="8" />
      <path d="M10 6v8M8 8h3a1.5 1.5 0 0 1 0 3H8a1.5 1.5 0 0 0 0 3h4" />
    </svg>
  ),
  pipeline: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 10h14M7 6l-4 4 4 4M13 6l4 4-4 4" />
    </svg>
  ),
  avg: (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 14l4-6 4 4 3-5 3 3" />
    </svg>
  ),
};

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-elevated p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold text-ink tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
        </div>
        <div className="shrink-0 rounded-xl bg-brand-burgundy/12 p-2.5 text-brand-burgundy-deep">
          {icon}
        </div>
      </div>
    </div>
  );
}

function OrdersPerDayChart({ days }: { days: DashboardStats["last14Days"] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div className="-mx-1 overflow-x-auto px-1">
      <div
        className="mt-4 flex h-36 min-w-70 gap-0.5 sm:h-44 sm:gap-1"
        role="img"
        aria-label="Orders placed per day over the last fourteen days"
      >
        {days.map((d) => {
          const pct = d.count === 0 ? 0 : Math.max(6, (d.count / max) * 100);
          return (
            <div
              key={d.key}
              className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
            >
              <span className="text-[9px] font-semibold tabular-nums text-muted sm:text-[10px]">
                {d.count > 0 ? d.count : ""}
              </span>
              <div className="flex w-full flex-1 flex-col justify-end">
                <div
                  className="w-full rounded-t-sm bg-brand-burgundy/80 transition-[height] hover:bg-brand-burgundy"
                  style={{ height: `${pct}%` }}
                  title={`${d.label}: ${d.count} order${d.count !== 1 ? "s" : ""}`}
                />
              </div>
              <span
                className="max-w-full truncate text-center text-[8px] leading-tight text-muted sm:text-[9px]"
                title={d.label}
              >
                {d.label.replace(/,\s*\d{4}/, "")}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusBars({ breakdown }: { breakdown: DashboardStats["statusBreakdown"] }) {
  const max = Math.max(1, ...breakdown.map((b) => b.count));
  return (
    <ul className="mt-4 space-y-3.5" role="list">
      {breakdown.map((b) => (
        <li key={b.status}>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-ink">{b.label}</span>
            <span className="tabular-nums text-muted">{b.count}</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-cream">
            <div
              className="h-full rounded-full bg-brand-burgundy/75 transition-[width]"
              style={{ width: `${(b.count / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function AdminDashboard({
  stats,
  recentOrders,
}: {
  stats: DashboardStats;
  recentOrders: AdminOrder[];
}) {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink sm:text-3xl">Dashboard</h1>
          <p className="mt-1.5 text-sm text-muted">
            Snapshot of orders and revenue.
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="btn-outline gap-1.5 px-5 py-2.5 text-sm"
        >
          View all orders
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      </div>

      {/* Stat grid */}
      <div className="grid gap-3 grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total orders"
          value={String(stats.totalOrders)}
          icon={STAT_ICONS.orders}
        />
        <StatCard
          label="Revenue"
          value={formatMoney(stats.revenueExclCancelledCents)}
          hint="Excl. cancelled"
          icon={STAT_ICONS.revenue}
        />
        <StatCard
          label="Active"
          value={String(stats.activePipelineCount)}
          hint="In progress"
          icon={STAT_ICONS.pipeline}
        />
        <StatCard
          label="Avg. order"
          value={formatMoney(stats.avgOrderExclCancelledCents)}
          hint="Non-cancelled"
          icon={STAT_ICONS.avg}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface-elevated p-5 shadow-sm">
          <h2 className="text-base font-bold text-ink">Orders per day</h2>
          <p className="mt-0.5 text-xs text-muted">Last 14 days</p>
          <OrdersPerDayChart days={stats.last14Days} />
        </section>
        <section className="rounded-2xl border border-line bg-surface-elevated p-5 shadow-sm">
          <h2 className="text-base font-bold text-ink">By status</h2>
          <p className="mt-0.5 text-xs text-muted">All orders</p>
          <StatusBars breakdown={stats.statusBreakdown} />
        </section>
      </div>

      {/* Recent orders */}
      <section className="rounded-2xl border border-line bg-surface-elevated shadow-sm">
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-line">
          <div>
            <h2 className="text-base font-bold text-ink">Recent orders</h2>
            <p className="text-xs text-muted">Latest 5 by placement time</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-semibold text-brand-burgundy-deep hover:underline"
          >
            View all →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No orders yet. Customer submissions will appear here.
          </p>
        ) : (
          <>
            {/* Mobile cards */}
            <ul className="divide-y divide-line md:hidden" role="list">
              {recentOrders.map((o) => (
                <li
                  key={o.id}
                  className={`flex items-start justify-between gap-3 border-l-4 px-5 py-4 ${orderStatusRowBorderClass(o.status)}`}
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-ink">{customerShort(o)}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {formatDateTime(o.created_at)}
                    </p>
                    <div className="mt-2">
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </div>
                  <p className="shrink-0 font-bold tabular-nums text-brand-burgundy-deep">
                    {formatMoney(o.total_cents)}
                  </p>
                </li>
              ))}
            </ul>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-130 border-collapse text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-semibold uppercase tracking-widest text-muted">
                    <th scope="col" className="px-5 py-3 text-left font-semibold">
                      Placed
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">
                      Customer
                    </th>
                    <th scope="col" className="px-4 py-3 text-left font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3 text-right font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr
                      key={o.id}
                      className={`border-b border-line/60 border-l-4 last:border-b-0 hover:bg-brand-cream/20 ${orderStatusRowBorderClass(o.status)}`}
                    >
                      <td className="whitespace-nowrap px-5 py-3.5 text-muted">
                        {formatDateTime(o.created_at)}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-ink">
                        {customerShort(o)}
                      </td>
                      <td className="px-4 py-3.5">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-3.5 text-right font-bold tabular-nums text-brand-burgundy-deep">
                        {formatMoney(o.total_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
