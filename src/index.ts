import { JSDOM } from "jsdom";
import { get } from "node:http";

export function getHeadingFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const h1 = document.querySelector("h1");
  if (h1?.textContent) {
    return h1.textContent.trim();
  }

  const h2 = document.querySelector("h2");
  if (h2?.textContent) {
    return h2.textContent.trim();
  }

  return "";
}

export function getFirstParagraphFromHTML(html: string): string {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const mainParagraph = document.querySelector("main p");
  if (mainParagraph?.textContent) {
    return mainParagraph.textContent.trim();
  }

  const firstParagraph = document.querySelector("p");
  if (firstParagraph?.textContent) {
    return firstParagraph.textContent.trim();
  }

  return "";
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const anchorTags = document.querySelectorAll("a");
  const urls: string[] = [];

  anchorTags.forEach((anchor) => {
    const href = anchor.getAttribute("href");
    if (href) {
      try {
        const url = new URL(href, baseURL);
        urls.push(url.href);
      } catch (e) {
        // Ignore invalid URLs
      }
    }
  });

  return urls;
}

export function getImagesFromHTML(html: string, baseURL: string): string[] {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const imgTags = document.querySelectorAll("img");
  const urls: string[] = [];

  imgTags.forEach((img) => {
    const src = img.getAttribute("src");

    if (!src) return;

    try {
      const url = new URL(src, baseURL);
      urls.push(url.href);
    } catch (e) {
      // Ignore invalid URLs
    }
  });

  return urls;
}
