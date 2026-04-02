import { describe, test, expect } from "vitest";
import {
  getHeadingFromHTML,
  getFirstParagraphFromHTML,
  getURLsFromHTML,
} from "./index";

describe("getHeadingFromHTML", () => {
  test("returns h1 text when present", () => {
    const input = `<html><body><h1>Main Title</h1></body></html>`;
    expect(getHeadingFromHTML(input)).toBe("Main Title");
  });

  test("falls back to h2 if no h1", () => {
    const input = `<html><body><h2>Subtitle</h2></body></html>`;
    expect(getHeadingFromHTML(input)).toBe("Subtitle");
  });

  test("returns empty string if no h1 or h2", () => {
    const input = `<html><body><p>No headings here</p></body></html>`;
    expect(getHeadingFromHTML(input)).toBe("");
  });

  test("prioritizes h1 over h2 when both exist", () => {
    const input = `
      <html><body>
        <h2>Secondary</h2>
        <h1>Primary</h1>
      </body></html>
    `;
    expect(getHeadingFromHTML(input)).toBe("Primary");
  });

  test("handles empty HTML string", () => {
    expect(getHeadingFromHTML("")).toBe("");
  });
});

describe("getFirstParagraphFromHTML", () => {
  test("returns first paragraph inside main if present", () => {
    const input = `
      <html><body>
        <p>Outside paragraph</p>
        <main>
          <p>Main paragraph</p>
        </main>
      </body></html>
    `;
    expect(getFirstParagraphFromHTML(input)).toBe("Main paragraph");
  });

  test("falls back to first p if no main exists", () => {
    const input = `
      <html><body>
        <p>First paragraph</p>
        <p>Second paragraph</p>
      </body></html>
    `;
    expect(getFirstParagraphFromHTML(input)).toBe("First paragraph");
  });

  test("returns empty string if no p tag exists", () => {
    const input = `<html><body><div>No paragraph</div></body></html>`;
    expect(getFirstParagraphFromHTML(input)).toBe("");
  });

  test("handles nested elements inside paragraph", () => {
    const input = `
      <html><body>
        <main>
          <p>This is <strong>important</strong> text.</p>
        </main>
      </body></html>
    `;
    expect(getFirstParagraphFromHTML(input)).toBe("This is important text.");
  });

  test("handles empty HTML string", () => {
    expect(getFirstParagraphFromHTML("")).toBe("");
  });
});

test("getURLsFromHTML absolute URLs", () => {
  const inputHTML = `
    <html>
      <body>
        <a href="https://example.com/page">Link</a>
      </body>
    </html>
  `;
  const baseURL = "https://crawler-test.com";

  const actual = getURLsFromHTML(inputHTML, baseURL);
  const expected = ["https://example.com/page"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML relative URLs", () => {
  const inputHTML = `
    <html>
      <body>
        <a href="/path/one">Link</a>
      </body>
    </html>
  `;
  const baseURL = "https://crawler-test.com";

  const actual = getURLsFromHTML(inputHTML, baseURL);
  const expected = ["https://crawler-test.com/path/one"];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML multiple links", () => {
  const inputHTML = `
    <html>
      <body>
        <a href="/one">One</a>
        <a href="/two">Two</a>
        <a href="https://example.com/three">Three</a>
      </body>
    </html>
  `;
  const baseURL = "https://crawler-test.com";

  const actual = getURLsFromHTML(inputHTML, baseURL);
  const expected = [
    "https://crawler-test.com/one",
    "https://crawler-test.com/two",
    "https://example.com/three",
  ];

  expect(actual).toEqual(expected);
});

test("getURLsFromHTML ignores anchor without href", () => {
  const inputHTML = `
    <html>
      <body>
        <a>No href</a>
      </body>
    </html>
  `;
  const baseURL = "https://crawler-test.com";

  const actual = getURLsFromHTML(inputHTML, baseURL);
  const expected: string[] = [];

  expect(actual).toEqual(expected);
});
