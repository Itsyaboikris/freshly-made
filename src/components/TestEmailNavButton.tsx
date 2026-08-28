"use client";

import { useState } from "react";

const show =
  process.env.NODE_ENV === "development" ||
  process.env.NEXT_PUBLIC_ENABLE_TEST_EMAIL === "true";

export function TestEmailNavButton() {
  const [busy, setBusy] = useState(false);

  if (!show) return null;

  async function sendTest() {
    const override = window.prompt(
      "Send test invoice to:\n(Leave empty to use your GMAIL_USER address)",
      ""
    );
    if (override === null) return;

    setBusy(true);
    try {
      const res = await fetch("/api/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: override.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        to?: string;
      };
      if (!res.ok) {
        window.alert(data.error || "Could not send test email.");
        return;
      }
      window.alert(
        `Test email sent to ${data.to ?? "your inbox"}. Check spam if needed.`
      );
    } catch {
      window.alert("Network error. Is the dev server running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void sendTest()}
      disabled={busy}
      className="inline-flex min-h-11 shrink-0 touch-manipulation items-center rounded-xl border border-dashed border-amber-600/50 bg-amber-50/90 px-2.5 py-2 text-[11px] font-medium text-amber-950/90 hover:bg-amber-100/90 disabled:opacity-50 sm:text-xs"
      title="Development only — sends a sample order email"
    >
      {busy ? "Sending…" : "Test email"}
    </button>
  );
}
