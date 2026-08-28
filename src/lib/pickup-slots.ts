/**
 * Pickup locations & times (small project — edit here or move to a `pickup_locations` table later).
 */
export type PickupLocation = {
  id: string;
  label: string;
  timeLabel: string;
};

export const PICKUP_LOCATIONS: readonly PickupLocation[] = [
  {
    id: "courts-freeport",
    label: "Courts Freeport",
    timeLabel: "3:00pm–4:00pm",
  },
  {
    id: "c3",
    label: "C3",
    timeLabel: "4:00pm–5:30pm",
  },
] as const;

export function getPickupLocation(id: string): PickupLocation | undefined {
  return PICKUP_LOCATIONS.find((p) => p.id === id);
}

export function getPickupSummary(id: string): string | null {
  const p = getPickupLocation(id);
  if (!p) return null;
  return `${p.label} · ${p.timeLabel}`;
}

export function isValidPickupLocationId(id: string): boolean {
  return PICKUP_LOCATIONS.some((p) => p.id === id);
}
