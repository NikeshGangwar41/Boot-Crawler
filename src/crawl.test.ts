import { describe, it, expect } from "vitest";
import { normalizeURL } from "./crawl";

describe("normalizeURL", () => {
  it("removes query parameters", () => {
    const input = "https://example.com/path?name=harsh";
    const actual = normalizeURL(input);
    const expected = "https://example.com/path";

    expect(actual).toBe(expected);
  });

  it("removes hash fragment", () => {
    const input = "https://example.com/path#section";
    const actual = normalizeURL(input);
    const expected = "https://example.com/path";

    expect(actual).toBe(expected);
  });

  it("handles trailing slash", () => {
    const input = "https://example.com/path/";
    const actual = normalizeURL(input);
    const expected = "https://example.com/path";

    expect(actual).toBe(expected);
  });

  it("handles root path", () => {
    const input = "https://example.com";
    const actual = normalizeURL(input);
    const expected = "https://example.com";

    expect(actual).toBe(expected);
  });

  it("handles http protocol", () => {
    const input = "http://example.com/path";
    const actual = normalizeURL(input);
    const expected = "http://example.com/path";

    expect(actual).toBe(expected);
  });

  it("ignores port (since hostname excludes it)", () => {
    const input = "https://example.com:8080/path";
    const actual = normalizeURL(input);
    const expected = "https://example.com/path";

    expect(actual).toBe(expected);
  });
});
