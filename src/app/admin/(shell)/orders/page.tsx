import { fetchOrdersForAdmin, fetchStatusEventsForOrders } from "@/lib/admin-orders";
import { AdminOrders } from "@/components/AdminOrders";

export const metadata = {
  title: "Orders · Admin",
  description: "Manage customer orders and statuses.",
};

export default async function AdminOrdersPage() {
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

  const statusEvents = await fetchStatusEventsForOrders(orders.map((o) => o.id));

  return <AdminOrders initialOrders={orders} statusEvents={statusEvents} />;
}
