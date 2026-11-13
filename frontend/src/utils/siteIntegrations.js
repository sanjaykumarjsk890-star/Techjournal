let analyticsLoaded = false;
let lastTrackedPath = "";

const socialCandidates = [
  ["LinkedIn", import.meta.env.VITE_SOCIAL_LINKEDIN],
  ["YouTube", import.meta.env.VITE_SOCIAL_YOUTUBE],
  ["Instagram", import.meta.env.VITE_SOCIAL_INSTAGRAM],
  ["X", import.meta.env.VITE_SOCIAL_X],
  ["GitHub", import.meta.env.VITE_SOCIAL_GITHUB],
];

export const socialLinks = socialCandidates.flatMap(([label, value]) => {
  if (!value) return [];
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return [];
    return [{ label, url: url.toString() }];
  } catch {
    return [];
  }
});

export const contactEmail = import.meta.env.VITE_CONTACT_EMAIL || "";

export function initializeSiteIntegrations() {
  const verificationCode =
    import.meta.env.VITE_GOOGLE_SITE_VERIFICATION?.trim();
  if (verificationCode) {
    let verificationMeta = document.querySelector(
      'meta[name="google-site-verification"]'
    );
    if (!verificationMeta) {
      verificationMeta = document.createElement("meta");
      verificationMeta.name = "google-site-verification";
      document.head.appendChild(verificationMeta);
    }
    verificationMeta.content = verificationCode;
  }

  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();
  if (!measurementId || !/^G-[A-Z0-9]+$/i.test(measurementId) || analyticsLoaded) {
    return;
  }

  analyticsLoaded = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => window.dataLayer.push(args);
  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: false });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(
    measurementId
  )}`;
  document.head.appendChild(script);
}

export function trackPageView(path) {
  if (!window.gtag || lastTrackedPath === path) return;
  lastTrackedPath = path;
  window.gtag("event", "page_view", {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title,
  });
}

export function setPageMetadata({ title, description, url, image, type = "website" }) {
  document.title = title;

  const setMeta = (attribute, key, content) => {
    if (!content) return;
    let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, key);
      document.head.appendChild(element);
    }
    element.content = content;
  };

  setMeta("name", "description", description);
  setMeta("name", "title", title);
  setMeta("property", "og:type", type);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  setMeta("property", "og:url", url);
  setMeta("property", "og:image", image);
  setMeta("name", "twitter:title", title);
  setMeta("name", "twitter:description", description);
  setMeta("name", "twitter:image", image);

  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = url;
}
