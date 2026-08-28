import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth";
import { getSupabasePublishableKey } from "@/lib/supabase/publishable-key";
import { createClient } from "@/lib/supabase/server";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { AdminAccessDenied } from "@/components/AdminAccessDenied";

export default async function AdminPage() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || !getSupabasePublishableKey()) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-line bg-brand-cream/80 p-6 text-sm text-ink">
          Add <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code className="rounded bg-white/80 px-1">
            NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY
          </code>{" "}
          (from the Supabase dashboard Next.js snippet; legacy{" "}
          <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> still
          works) to your environment to use admin sign-in.
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <AdminLoginForm />
      </div>
    );
  }

  if (!isAdminEmail(user.email ?? undefined)) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
        <AdminAccessDenied />
      </div>
    );
  }

  redirect("/admin/dashboard");
}
