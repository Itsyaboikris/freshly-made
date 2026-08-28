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
    <div className="card-panel mx-auto max-w-md">
      <h1 className="font-display text-2xl font-semibold text-ink">Admin sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Use the Supabase account you listed in{" "}
        <code className="rounded-md border border-line bg-brand-cream/60 px-1 text-xs text-ink">
          ADMIN_EMAILS
        </code>
        .
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-ink">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            className="input-field mt-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-ink">
          Password
          <input
            type="password"
            required
            autoComplete="current-password"
            className="input-field mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && (
          <p className="rounded-lg border border-red-200/80 bg-red-50/90 px-3 py-2 text-sm text-red-950">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
