import { JSDOM } from "jsdom";

export function normalizeURL(url: string): string {
  const urlObj = new URL(url);

  const hostname = urlObj.hostname.toLowerCase();
  let pathname = urlObj.pathname;

  if (pathname.endsWith("/") && pathname !== "/") {
    pathname = pathname.slice(0, -1);
  }

  if (pathname === "/") {
    return hostname;
  }

  return `${hostname}${pathname}`;
}

export function getHeadingFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const h1 = document.querySelector("h1");
  if (h1?.textContent?.trim()) {
    return h1.textContent.trim();
  }

  const h2 = document.querySelector("h2");
  if (h2?.textContent?.trim()) {
    return h2.textContent.trim();
  }

  return "";
}

export function getFirstParagraphFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const mainParagraphs = document.querySelectorAll("main p");
  for (const p of mainParagraphs) {
    const text = p.textContent?.trim();
    if (text) return text;
  }

  const allParagraphs = document.querySelectorAll("p");
  for (const p of allParagraphs) {
    const text = p.textContent?.trim();
    if (text) return text;
  }

  return "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const anchors = document.querySelectorAll("a");

  const urls = new Set<string>();

  anchors.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (!href) return;

    if (href.startsWith("javascript:") || href.startsWith("mailto:")) {
      return;
    }

    try {
      const url = new URL(href, baseURL).toString();
      urls.add(url);
    } catch {
      // ignore invalid
    }
  });

  return Array.from(urls);
}


export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const images = document.querySelectorAll("img");

  const urls = new Set<string>();

  images.forEach((img) => {
    const src = img.getAttribute("src");
    if (!src) return;

    if (src.startsWith("javascript:")) return;

    try {
      const url = new URL(src, baseURL).toString();
      urls.add(url);
    } catch {
      // ignore invalid
    }
  });

  return Array.from(urls);
}

export type ExtractedPageData = {
  url: string;
  heading: string;
  first_paragraph: string;
  outgoing_links: string[];
  image_urls: string[];
};

export function extractPageData(
  html: string,
  pageURL: string,
): ExtractedPageData {
  return {
    url: pageURL,
    heading: getHeadingFromHTML(html),
    first_paragraph: getFirstParagraphFromHTML(html),
    outgoing_links: getURLsFromHTML(html, pageURL),
    image_urls: getImagesFromHTML(html, pageURL),
  };
}
