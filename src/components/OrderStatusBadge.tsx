import type { ReactNode } from "react";
import type { OrderStatus } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/constants";

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "paid",
  "confirmed",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function isOrderStatus(s: string): s is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(s);
}

type StatusStyle = {
  rowBorder: string;
  badge: string;
  icon: ReactNode;
};

function IconBase({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0 opacity-90"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  pending: {
    rowBorder: "border-l-amber-500",
    badge: "bg-amber-100 text-amber-950 ring-1 ring-amber-300/60",
    icon: (
      <IconBase>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </IconBase>
    ),
  },
  paid: {
    rowBorder: "border-l-emerald-600",
    badge: "bg-emerald-100 text-emerald-950 ring-1 ring-emerald-300/70",
    icon: (
      <IconBase>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </IconBase>
    ),
  },
  confirmed: {
    rowBorder: "border-l-sky-600",
    badge: "bg-sky-100 text-sky-950 ring-1 ring-sky-300/70",
    icon: (
      <IconBase>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4 12 14.01l-3-3" />
      </IconBase>
    ),
  },
  out_for_delivery: {
    rowBorder: "border-l-violet-600",
    badge: "bg-violet-100 text-violet-950 ring-1 ring-violet-300/70",
    icon: (
      <IconBase>
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
        <path d="M15 18H9" />
        <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
        <circle cx="17" cy="18" r="2" />
        <circle cx="7" cy="18" r="2" />
      </IconBase>
    ),
  },
  delivered: {
    rowBorder: "border-l-green-600",
    badge: "bg-green-100 text-green-950 ring-1 ring-green-300/70",
    icon: (
      <IconBase>
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" x2="12" y1="22.08" y2="12" />
      </IconBase>
    ),
  },
  cancelled: {
    rowBorder: "border-l-neutral-400",
    badge: "bg-neutral-200 text-neutral-800 ring-1 ring-neutral-400/70",
    icon: (
      <IconBase>
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6M9 9l6 6" />
      </IconBase>
    ),
  },
};

const UNKNOWN_STYLE: StatusStyle = {
  rowBorder: "border-l-neutral-300",
  badge: "bg-neutral-100 text-neutral-800 ring-1 ring-neutral-300/80",
  icon: (
    <IconBase>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" />
    </IconBase>
  ),
};

export function orderStatusRowBorderClass(status: string): string {
  if (isOrderStatus(status)) return STATUS_STYLES[status].rowBorder;
  return UNKNOWN_STYLE.rowBorder;
}

export function OrderStatusBadge({
  status,
  className = "",
}: {
  status: string;
  className?: string;
}) {
  const label = ORDER_STATUS_LABELS[status] ?? status;
  const style = isOrderStatus(status) ? STATUS_STYLES[status] : UNKNOWN_STYLE;

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${style.badge} ${className}`}
    >
      {style.icon}
      <span className="truncate">{label}</span>
    </span>
  );
}
