import { JSDOM } from "jsdom";
import pLimit from "p-limit";

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

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 3,
  maxPages: number = 50,
): Promise<Record<string, ExtractedPageData>> {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
  return await crawler.crawl();
}

export class ConcurrentCrawler {
  private baseURL: string;
  private pages: Record<string, ExtractedPageData>;
  private limit: ReturnType<typeof pLimit>;

  private maxPages: number;
  private shouldStop: boolean;
  private allTasks: Set<Promise<void>>;

  constructor(
    baseURL: string,
    maxConcurrency: number = 3,
    maxPages: number = 50,
  ) {
    this.baseURL = baseURL;
    this.pages = {};
    this.limit = pLimit(maxConcurrency);

    this.maxPages = maxPages;
    this.shouldStop = false;
    this.allTasks = new Set();
  }

  // Returns true if this is a new page to visit, false if already visited or should stop
  private addPageVisit(normalizedURL: string): boolean {
    if (this.shouldStop) return false;

    if (this.pages[normalizedURL]) {
      return false; // already visited
    }

    if (Object.keys(this.pages).length >= this.maxPages) {
      this.shouldStop = true;
      console.log("Reached maximum number of pages to crawl.");
      return false;
    }

    return true;
  }

  // Recursive concurrent crawl
  private async crawlPage(currentURL: string): Promise<void> {
    if (this.shouldStop) return;

    const base = new URL(this.baseURL);
    const current = new URL(currentURL);

    if (base.hostname !== current.hostname) {
      return;
    }

    const normalizedURL = normalizeURL(currentURL);

    const isNew = this.addPageVisit(normalizedURL);
    if (!isNew) return;

    console.log(`Crawling: ${currentURL}`);

    const task = (async () => {
      const html = await this.limit(() => getHTML(currentURL));
      if (!html || this.shouldStop) return;

      // Extract full page data
      const data = extractPageData(html, currentURL);

      // Store it
      this.pages[normalizedURL] = data;

      // Recurse using extracted links
      const promises = data.outgoing_links.map((url) => this.crawlPage(url));

      await Promise.all(promises);
    })();

    this.allTasks.add(task);

    await task;

    task.finally(() => {
      this.allTasks.delete(task);
    });
  }

  //  Entry point
  public async crawl(): Promise<Record<string, ExtractedPageData>> {
    await this.crawlPage(this.baseURL);

    // Wait for all active tasks to finish
    await Promise.all(this.allTasks);

    return this.pages;
  }
}
