"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signErr) {
        setError(signErr.message);
        setLoading(false);
        return;
      }
      window.location.href = "/admin";
    } catch {
      setError("Could not sign in.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-burgundy shadow-[0_8px_24px_rgb(245_179_1/0.35)]">
            <svg viewBox="0 0 24 24" className="h-7 w-7 text-ink" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-ink">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">Freshly Baked Banana Bread</p>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-line bg-surface-elevated p-6 shadow-[0_8px_32px_rgb(43_33_24/0.08)]">
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-ink">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                className="input-field mt-1.5"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-ink">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="input-field mt-1.5"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200/80 bg-red-50/90 px-3.5 py-3 text-sm text-red-900">
                <svg viewBox="0 0 16 16" className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
                  <circle cx="8" cy="8" r="7" />
                  <path d="M8 5v3.5M8 11h.01" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary mt-2 w-full py-3 text-[15px] disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
