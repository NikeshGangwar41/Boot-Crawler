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

export async function crawlSiteAsync(
  baseURL: string,
  maxConcurrency: number = 3,
  maxPages: number = 50,
): Promise<Record<string, number>> {
  const crawler = new ConcurrentCrawler(baseURL, maxConcurrency, maxPages);
  return await crawler.crawl();
}
export class ConcurrentCrawler {
  private baseURL: string;
  private pages: Record<string, number>;
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

  // Track page visits with count
  private addPageVisit(normalizedURL: string): boolean {
    if (this.shouldStop) {
      return false;
    }

    if (this.pages[normalizedURL]) {
      this.pages[normalizedURL]++;
      return false;
    }

    // Check limit BEFORE adding new page
    if (Object.keys(this.pages).length >= this.maxPages) {
      this.shouldStop = true;
      console.log("Reached maximum number of pages to crawl.");
      return false;
    }

    this.pages[normalizedURL] = 1;
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

      const urls = getURLsFromHTML(html, this.baseURL);

      const promises = urls.map((url) => this.crawlPage(url));
      await Promise.all(promises);
    })();

    // Track task
    this.allTasks.add(task);

    task.finally(() => {
      this.allTasks.delete(task);
    });

    await task;
  }

  //  Entry point
  public async crawl(): Promise<Record<string, number>> {
    await this.crawlPage(this.baseURL);

    // Wait for all active tasks to finish
    await Promise.all(this.allTasks);

    return this.pages;
  }
}
