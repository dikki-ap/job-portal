/**
 * Formats an ISO date string using the user's device locale for the date part,
 * and always enforces 24-hour time format (HH:MM).
 * Returns "—" for null/undefined/empty values.
 */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const date = d.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${date}, ${hh}:${mm}`;
}

/**
 * Formats an ISO date string as date only (no time), using device locale.
 * Returns "—" for null/undefined/empty values.
 */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
