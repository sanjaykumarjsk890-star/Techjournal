/**
 * Calculates estimated reading time in minutes for a given text or HTML content.
 * Average reading speed: 200 words per minute.
 *
 * @param {string} content
 * @returns {number} Estimated reading time in minutes (minimum 1)
 */
const calculateReadingTime = (content) => {
  if (!content || typeof content !== "string") {
    return 1;
  }

  // Strip HTML tags and code blocks
  const plainText = content
    .replace(/<pre[\s\S]*?<\/pre>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .trim();

  const words = plainText
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  const wordsPerMinute = 200;
  const minutes = Math.ceil(words / wordsPerMinute);

  return Math.max(1, minutes);
};

module.exports = calculateReadingTime;
