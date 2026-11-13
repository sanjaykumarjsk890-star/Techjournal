const allowedTags = new Set([
  "A",
  "BLOCKQUOTE",
  "BR",
  "CODE",
  "DIV",
  "EM",
  "FIGCAPTION",
  "FIGURE",
  "H1",
  "H2",
  "H3",
  "HR",
  "IFRAME",
  "IMG",
  "LI",
  "OL",
  "P",
  "PRE",
  "STRONG",
  "TABLE",
  "TBODY",
  "TD",
  "TH",
  "THEAD",
  "TR",
  "UL",
]);

const allowedAttributes = new Set([
  "allow",
  "allowfullscreen",
  "alt",
  "class",
  "frameborder",
  "height",
  "href",
  "id",
  "rel",
  "src",
  "target",
  "width",
]);

const safeUrl = (value, { iframe = false } = {}) => {
  try {
    const url = new URL(value, window.location.origin);
    if (iframe) {
      return (
        url.protocol === "https:" &&
        ["www.youtube.com", "www.youtube-nocookie.com"].includes(url.hostname) &&
        url.pathname.startsWith("/embed/")
      );
    }

    return (
      url.protocol === "https:" ||
      url.protocol === "http:" ||
      url.protocol === "mailto:" ||
      url.protocol === "tel:"
    );
  } catch {
    return false;
  }
};

const removeUnsafeElement = (element) => {
  if (["SCRIPT", "STYLE", "TEMPLATE", "SVG", "MATH"].includes(element.tagName)) {
    element.remove();
    return;
  }

  element.replaceWith(...element.childNodes);
};

export function sanitizeHtml(html) {
  const parsed = new DOMParser().parseFromString(html, "text/html");

  for (const element of [...parsed.body.querySelectorAll("*")]) {
    if (!allowedTags.has(element.tagName)) {
      removeUnsafeElement(element);
      continue;
    }

    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim();

      if (!allowedAttributes.has(name)) {
        element.removeAttribute(attribute.name);
      } else if (
        (name === "href" || name === "src") &&
        !safeUrl(value, { iframe: element.tagName === "IFRAME" })
      ) {
        element.removeAttribute(attribute.name);
      }
    }

    if (element.tagName === "IFRAME" && !element.hasAttribute("src")) {
      element.remove();
    }

    if (element.tagName === "A" && element.target === "_blank") {
      element.rel = "noopener noreferrer";
    }
  }

  return parsed.body.innerHTML;
}
