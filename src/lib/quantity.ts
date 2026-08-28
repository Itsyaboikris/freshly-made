/** Per-line ceiling for typo / abuse prevention only — no inventory limits. */
export const MAX_LINE_QUANTITY = 99_999;

export function clampLineQuantity(n: number): number {
  const q = Math.floor(Number(n));
  if (!Number.isFinite(q) || q < 1) return 1;
  return Math.min(q, MAX_LINE_QUANTITY);
}
