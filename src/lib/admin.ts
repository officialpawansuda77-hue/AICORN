/**
 * Helper to determine if a user has administrative privileges.
 * Checks both database profile role ('admin') and configured admin email(s).
 */
export function checkIsAdmin(
  email?: string | null,
  role?: string | null
): boolean {
  if (role === "admin") return true;

  if (!email) return false;

  const userEmail = email.trim().toLowerCase();

  const envEmails = [
    process.env.ADMIN_EMAIL,
    process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    "sudapawan301@gmail.com",
  ]
    .filter(Boolean)
    .flatMap((val) => (val as string).split(","))
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return envEmails.includes(userEmail);
}
