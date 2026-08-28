"use server";

import { revalidatePath } from "next/cache";
import { isAdminEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  const user = await requireAdmin();
  if (!STATUSES.includes(status)) {
    throw new Error("Invalid status");
  }
  const admin = createAdminClient();

  const { data: current, error: fetchErr } = await admin
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchErr || !current) {
    throw new Error("Order not found");
  }

  const previous = current.status as string;
  if (previous === status) {
    return;
  }

  const { error } = await admin
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;

  const { error: logErr } = await admin.from("order_status_events").insert({
    order_id: orderId,
    previous_status: previous,
    new_status: status,
    changed_by_email: user.email ?? null,
  });

  if (logErr) {
    console.error("order_status_events insert:", logErr);
  }

  revalidatePath("/admin");
}
