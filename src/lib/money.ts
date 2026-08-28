/** Display amounts as TTD (menu / flyer). */
export function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-TT", {
    style: "currency",
    currency: "TTD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
