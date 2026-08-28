import { fetchOrdersForAdmin } from "@/lib/admin-orders";
import { buildDashboardStats } from "@/lib/admin-dashboard-stats";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = {
  title: "Dashboard · Admin",
  description: "Admin overview — orders and revenue.",
};

export default async function AdminDashboardPage() {
  let orders;
  try {
    orders = await fetchOrdersForAdmin();
  } catch {
    return (
      <div className="rounded-2xl border border-red-200/90 bg-red-50/90 p-6 text-sm text-red-950">
        Could not load orders. Check that your server environment is configured correctly, then try
        again.
      </div>
    );
  }

  const stats = buildDashboardStats(orders);
  const recentOrders = orders.slice(0, 5);

  return <AdminDashboard stats={stats} recentOrders={recentOrders} />;
}
