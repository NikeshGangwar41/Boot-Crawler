import { JSDOM } from "jsdom";

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
