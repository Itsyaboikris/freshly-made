import { formatPickupDateLabel } from "@/lib/dates";

export type WeekdayName = "Saturday" | "Sunday";

export type DeliverySlot = {
  id: string;
  location: string;
  days: WeekdayName[];
  time: string;
};

/** Drop-off locations — each lists the weekend days it is available. */
export const DELIVERY_SLOTS: readonly DeliverySlot[] = [
  {
    id: "courts-freeport",
    location: "Courts Freeport",
    days: ["Saturday", "Sunday"],
    time: "4:30 – 5:30 PM",
  },
  {
    id: "c3",
    location: "C3",
    days: ["Saturday", "Sunday"],
    time: "4:30 – 5:30 PM",
  },
  {
    id: "price-plaza",
    location: "Price Plaza",
    days: ["Saturday"],
    time: "3:00 – 4:00 PM",
  },
  {
    id: "grand-bazaar",
    location: "Grand Bazaar",
    days: ["Sunday"],
    time: "4:30 – 5:30 PM",
  },
] as const;

export function weekdayNameFromIso(iso: string): WeekdayName | null {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return null;
  }
  const day = dt.getDay();
  if (day === 6) return "Saturday";
  if (day === 0) return "Sunday";
  return null;
}

export function getDeliverySlotsForDate(iso: string): DeliverySlot[] {
  const dayName = weekdayNameFromIso(iso);
  if (!dayName) return [];
  return DELIVERY_SLOTS.filter((s) => s.days.includes(dayName));
}

export function getDeliverySlot(id: string): DeliverySlot | undefined {
  return DELIVERY_SLOTS.find((s) => s.id === id);
}

export function isValidDeliverySlotForDate(
  slotId: string,
  iso: string
): boolean {
  return getDeliverySlotsForDate(iso).some((s) => s.id === slotId);
}

export function getDeliverySummary(slotId: string): string | null {
  const slot = getDeliverySlot(slotId);
  if (!slot) return null;
  return `${slot.location} · ${slot.time}`;
}

export function formatDeliveryConfirmation(
  iso: string,
  slotId: string
): string {
  const slot = getDeliverySlot(slotId);
  if (!slot) return formatPickupDateLabel(iso);
  return `${formatPickupDateLabel(iso)} at ${slot.location} (${slot.time})`;
}
