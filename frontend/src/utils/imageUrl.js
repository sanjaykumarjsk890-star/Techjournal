const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const serverUrl = new URL(API_URL, window.location.origin);
serverUrl.pathname = serverUrl.pathname.replace(/\/api\/?$/, "");
const SERVER_URL = serverUrl.toString().replace(/\/$/, "");
export const DEFAULT_ARTICLE_COVER = "/images/article-cover-default.svg";

export function handleArticleImageError(event) {
  const image = event.currentTarget;
  if (image.dataset.fallbackApplied) {
    image.style.display = "none";
    return;
  }
  image.dataset.fallbackApplied = "true";
  image.src = DEFAULT_ARTICLE_COVER;
}

/**
 * Normalizes and formats an image path or URL into a full valid URL.
 * Handles external URLs (http/https) and uploaded local server images.
 *
 * @param {string} image - Path or URL string
 * @returns {string} Fully qualified image URL
 */
export function getImageUrl(image) {
  if (!image) return "";
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  const cleanPath = image.replace(/\\/g, "/").replace(/^\/+/, "");
  return new URL(cleanPath, `${SERVER_URL}/`).toString();
}

export default getImageUrl;
