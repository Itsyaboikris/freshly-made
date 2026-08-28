export function isAdminEmail(email: string | undefined): boolean {
  if (!email) return false;
  const raw = process.env.ADMIN_EMAILS?.trim();
  if (!raw) {
    return process.env.NODE_ENV !== "production";
  }
  const allowed = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.toLowerCase());
}
