import {
  DELIVERY_DATE_RANGE_DAYS,
  DELIVERY_MIN_LEAD_DAYS,
  MIN_LEAD_DAYS,
} from "@/lib/constants";

function toIso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * YYYY-MM-DD — minimum allowed preferred date (local calendar).
 * On Fridays, the next Saturday/Sunday are excluded: lead days alone would allow
 * Sunday (only 2 days after Friday), so we push the minimum to the Monday after
 * this weekend so the first Sat/Sun options are the following week.
 */
export function minPreferredDateIso(): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const d = new Date(today);
  d.setDate(d.getDate() + MIN_LEAD_DAYS);

  if (today.getDay() === 5) {
    const mondayAfterThisWeekend = new Date(today);
    mondayAfterThisWeekend.setDate(mondayAfterThisWeekend.getDate() + 3);
    if (d < mondayAfterThisWeekend) {
      d.setTime(mondayAfterThisWeekend.getTime());
    }
  }

  return toIso(d);
}

export function isPreferredDateValid(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  return isoDate >= minPreferredDateIso();
}

/** Local calendar: Saturday = 6, Sunday = 0 */
export function isSaturdayOrSunday(isoDate: string): boolean {
  const [y, m, d] = isoDate.split("-").map(Number);
  if (!y || !m || !d) return false;
  const dt = new Date(y, m - 1, d);
  if (
    dt.getFullYear() !== y ||
    dt.getMonth() !== m - 1 ||
    dt.getDate() !== d
  ) {
    return false;
  }
  const day = dt.getDay();
  return day === 0 || day === 6;
}

export function isWeekendPickupDateValid(isoDate: string): boolean {
  return isPreferredDateValid(isoDate) && isSaturdayOrSunday(isoDate);
}

/** Next weekend-only pickup dates (Sat/Sun), inclusive of min date, for `<select>`. */
export function upcomingWeekendPickupDates(maxOptions = 12): string[] {
  const min = minPreferredDateIso();
  const [ymin, mmin, dmin] = min.split("-").map(Number);
  const start = new Date(ymin, mmin - 1, dmin);
  const out: string[] = [];
  const cursor = new Date(start);
  while (out.length < maxOptions && out.length < 52) {
    const day = cursor.getDay();
    if (day === 0 || day === 6) {
      const y = cursor.getFullYear();
      const mo = String(cursor.getMonth() + 1).padStart(2, "0");
      const da = String(cursor.getDate()).padStart(2, "0");
      const iso = `${y}-${mo}-${da}`;
      if (iso >= min) out.push(iso);
    }
    cursor.setDate(cursor.getDate() + 1);
    if (cursor.getTime() - start.getTime() > 400 * 24 * 60 * 60 * 1000) break;
  }
  return out;
}

/** Weekend delivery dates (Sat/Sun) with delivery lead time — matches banana-bakehouse.jsx. */
export function upcomingWeekendDeliveryDates(
  maxOptions = 30,
  minLeadDays = DELIVERY_MIN_LEAD_DAYS,
  rangeDays = DELIVERY_DATE_RANGE_DAYS
): string[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minDate = new Date(today);
  minDate.setDate(today.getDate() + minLeadDays);

  const out: string[] = [];
  for (let i = 0; i <= rangeDays && out.length < maxOptions; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const day = d.getDay();
    if ((day === 0 || day === 6) && d.getTime() >= minDate.getTime()) {
      out.push(toIso(d));
    }
  }
  return out;
}

export function isDeliveryDateValid(isoDate: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return false;
  if (!isSaturdayOrSunday(isoDate)) return false;
  return upcomingWeekendDeliveryDates(52).includes(isoDate);
}

export function formatPickupDateLabel(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-TT", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
