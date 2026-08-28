"use client";

import { createClient } from "@/lib/supabase/client";

export function AdminAccessDenied() {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/admin";
  }

  return (
    <div className="card-panel mx-auto max-w-md text-center">
      <h1 className="font-display text-xl font-semibold text-ink">Access denied</h1>
      <p className="mt-2 text-sm text-muted">
        This account is not listed in{" "}
        <code className="rounded-md border border-line bg-brand-cream/60 px-1 text-xs">
          ADMIN_EMAILS
        </code>
        .
      </p>
      <button
        type="button"
        onClick={() => signOut()}
        className="btn-primary mt-6"
      >
        Sign out
      </button>
    </div>
  );
}
