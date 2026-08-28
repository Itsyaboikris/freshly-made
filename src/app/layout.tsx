import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { CartProvider } from "@/context/CartContext";
import { CartDrawerProvider } from "@/context/CartDrawerContext";
import { ToastProvider } from "@/components/Toast";
import {
  isPublicContactVisible,
  PHONE_DISPLAY,
  TEL_HREF,
  WHATSAPP_URL,
} from "@/lib/contact";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "Freshly Baked Banana Bread",
    template: "%s | Freshly Baked Banana Bread",
  },
  description:
    "Take-home baked goodness — classic, Oreo, Nutella, and double chocolate banana loaves. Order online.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport = {
  width: "device-width" as const,
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full scroll-auto antialiased`}
    >
      <body className="flex min-h-full flex-col overflow-x-hidden bg-background text-ink">
        <CartProvider>
          <CartDrawerProvider>
            <ToastProvider>
              <SiteHeader />
              <main className="flex flex-1 flex-col">{children}</main>
            </ToastProvider>
          </CartDrawerProvider>
        </CartProvider>
        <footer className="mt-auto border-t border-line px-4 py-6 text-center sm:px-6">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-muted">
            Freshly Baked Banana Bread — baked when the bananas are past their best.
          </p>
          <p className="mt-2 text-xs text-muted/80">
            2 lb loaves · Order 2–3 days ahead
          </p>
          {isPublicContactVisible() && (
            <p className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
              {WHATSAPP_URL ? (
                <>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-burgundy/90 underline decoration-brand-burgundy/25 underline-offset-4 hover:text-brand-burgundy"
                  >
                    WhatsApp
                  </a>
                  {(TEL_HREF || PHONE_DISPLAY) && (
                    <span className="text-muted/30" aria-hidden>
                      |
                    </span>
                  )}
                </>
              ) : null}
              {TEL_HREF ? (
                <a
                  href={TEL_HREF}
                  className="font-medium text-brand-burgundy/90 hover:text-brand-burgundy"
                >
                  {PHONE_DISPLAY}
                </a>
              ) : PHONE_DISPLAY ? (
                <span className="font-medium text-brand-burgundy/90">
                  {PHONE_DISPLAY}
                </span>
              ) : null}
            </p>
          )}
        </footer>
      </body>
    </html>
  );
}
