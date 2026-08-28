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

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface-elevated p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 font-display text-2xl font-semibold text-ink tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function OrdersPerDayChart({ days }: { days: DashboardStats["last14Days"] }) {
  const max = Math.max(1, ...days.map((d) => d.count));
  return (
    <div
      className="mt-4 flex h-40 gap-1 sm:gap-1.5"
      role="img"
      aria-label="Orders placed per day over the last fourteen days"
    >
      {days.map((d) => {
        const pct = d.count === 0 ? 0 : Math.max(8, (d.count / max) * 100);
        return (
          <div
            key={d.key}
            className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[10px] font-medium tabular-nums text-muted sm:text-xs">
              {d.count > 0 ? d.count : ""}
            </span>
            <div className="flex w-full flex-1 flex-col justify-end">
              <div
                className="w-full min-h-0 rounded-t-md bg-brand-burgundy/75 transition-[height] sm:rounded-t-lg"
                style={{ height: `${pct}%` }}
                title={`${d.label}: ${d.count} order(s)`}
              />
            </div>
            <span
              className="max-w-full truncate text-center text-[9px] leading-tight text-muted sm:text-[10px]"
              title={d.label}
            >
              {d.label.replace(/,\s*\d{4}/, "")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function StatusBars({ breakdown }: { breakdown: DashboardStats["statusBreakdown"] }) {
  const max = Math.max(1, ...breakdown.map((b) => b.count));
  return (
    <ul className="mt-4 space-y-3" role="list">
      {breakdown.map((b) => (
        <li key={b.status}>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="font-medium text-ink">{b.label}</span>
            <span className="tabular-nums text-muted">{b.count}</span>
          </div>
          <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-brand-burgundy/70"
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
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink sm:text-3xl">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">
          Snapshot of orders and revenue. Data updates when you refresh the page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
        <StatCard
          label="Revenue (excl. cancelled)"
          value={formatMoney(stats.revenueExclCancelledCents)}
        />
        <StatCard
          label="Active pipeline"
          value={String(stats.activePipelineCount)}
          hint="Not delivered or cancelled"
        />
        <StatCard
          label="Avg. order"
          value={formatMoney(stats.avgOrderExclCancelledCents)}
          hint="Non-cancelled orders only"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card-panel">
          <h2 className="font-display text-lg font-semibold text-ink">Orders per day</h2>
          <p className="mt-1 text-sm text-muted">Last 14 days (UTC dates)</p>
          <OrdersPerDayChart days={stats.last14Days} />
        </section>
        <section className="card-panel">
          <h2 className="font-display text-lg font-semibold text-ink">By status</h2>
          <p className="mt-1 text-sm text-muted">All time in current dataset</p>
          <StatusBars breakdown={stats.statusBreakdown} />
        </section>
      </div>

      <section className="card-panel overflow-x-auto">
        <h2 className="font-display text-lg font-semibold text-ink">Recent orders</h2>
        <p className="mt-1 text-sm text-muted">Latest five by placement time</p>
        {recentOrders.length === 0 ? (
          <p className="mt-6 text-sm text-muted">No orders yet.</p>
        ) : (
          <table className="mt-4 w-full min-w-[520px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-muted">
                <th scope="col" className="py-2 pr-4">
                  Placed
                </th>
                <th scope="col" className="py-2 pr-4">
                  Customer
                </th>
                <th scope="col" className="py-2 pr-4">
                  Status
                </th>
                <th scope="col" className="py-2 text-right">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr
                  key={o.id}
                  className={`border-b border-line/80 border-l-4 last:border-0 ${orderStatusRowBorderClass(o.status)}`}
                >
                  <td className="py-3 pr-4 text-muted whitespace-nowrap">
                    {formatDateTime(o.created_at)}
                  </td>
                  <td className="py-3 pr-4 font-medium text-ink">{customerShort(o)}</td>
                  <td className="py-3 pr-4 align-middle">
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className="py-3 text-right font-semibold text-brand-burgundy tabular-nums whitespace-nowrap">
                    {formatMoney(o.total_cents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
