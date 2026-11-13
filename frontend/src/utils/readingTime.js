/**
 * Computes or formats reading time
 */
export function formatReadingTime(minutes) {
  const min = Math.max(1, parseInt(minutes, 10) || 1);
  return `${min} min read`;
}

export function calculateClientReadingTime(text) {
  if (!text || typeof text !== "string") return 1;
  const words = text
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
