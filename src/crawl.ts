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

export async function getHTML(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "BootCrawler/1.0",
      },
    });

    if (res.status >= 400) {
      console.error(`Error: ${res.status}`);
      return null;
    }

    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      console.error("Error: Not HTML");
      return null;
    }

    return await res.text();
  } catch (err) {
    console.error("Fetch failed:", err);
    return null;
  }
}

export async function crawlPage(
  baseURL: string,
  currentURL: string = baseURL,
  pages: Record<string, number> = {},
): Promise<Record<string, number>> {
  try {
    const base = new URL(baseURL);
    const current = new URL(currentURL);

    if (base.hostname !== current.hostname) {
      return pages;
    }

    // 2. Normalize URL
    const normalizedURL = normalizeURL(currentURL);

    // 3. Track visits
    if (pages[normalizedURL]) {
      pages[normalizedURL]++;
      return pages;
    }

    pages[normalizedURL] = 1;

    console.log(`Crawling: ${currentURL}`);

    // 4. Fetch HTML
    const html = await getHTML(currentURL);
    if (!html) {
      return pages;
    }

    // 5. Extract URLs
    const nextURLs = getURLsFromHTML(html, baseURL);

    // 6. Recursively crawl
    for (const nextURL of nextURLs) {
      pages = await crawlPage(baseURL, nextURL, pages);
    }

    return pages;
  } catch (err) {
    console.error(`Error crawling ${currentURL}:`, err);
    return pages;
  }
}
