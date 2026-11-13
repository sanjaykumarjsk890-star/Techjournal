/**
 * Formats an ISO date string into a user-friendly date format
 * e.g., "Nov 13, 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return "Recently";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "Recently";
  }
}

/**
 * Formats a date with time for admin scheduled display
 * e.g., "Nov 13, 2026 at 2:30 PM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date);
  } catch {
    return "-";
  }
}
