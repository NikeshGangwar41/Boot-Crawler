import { describe, it, expect } from "vitest";
import { normalizeURL } from "./crawl";

describe("normalizeURL", () => {
  it("removes protocol", () => {
    const input = "https://example.com/path";
    const expected = "example.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("removes query parameters", () => {
    const input = "https://example.com/path?name=harsh";
    const expected = "example.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("removes hash fragment", () => {
    const input = "https://example.com/path#section";
    const expected = "example.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("handles trailing slash", () => {
    const input = "https://example.com/path/";
    const expected = "example.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("handles root path", () => {
    const input = "https://example.com";
    const expected = "example.com";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("handles http protocol", () => {
    const input = "http://example.com/path";
    const expected = "example.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("ignores port", () => {
    const input = "https://example.com:8080/path";
    const expected = "example.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("normalizes uppercase hostname", () => {
    const input = "https://EXAMPLE.com/path";
    const expected = "example.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("handles trailing slash with normalization", () => {
    const input = "https://CRAWLER-TEST.com/path/";
    const expected = "crawler-test.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });

  it("handles http + uppercase together", () => {
    const input = "http://CRAWLER-TEST.com/path";
    const expected = "crawler-test.com/path";
    expect(normalizeURL(input)).toBe(expected);
  });
});
