import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/AdminShell";

export default async function AdminAuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email ?? undefined)) {
    redirect("/admin");
  }

  return <AdminShell userEmail={user.email ?? undefined}>{children}</AdminShell>;
}
