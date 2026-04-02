import { describe, test, expect } from "vitest";
import { getHeadingFromHTML, getFirstParagraphFromHTML } from "./index";

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
