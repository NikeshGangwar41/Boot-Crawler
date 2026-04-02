import { test, expect } from "vitest";
import {
  normalizeURL,
  getHeadingFromHTML,
  getFirstParagraphFromHTML,
  getImagesFromHTML,
  getURLsFromHTML,
} from "./crawl";

/* -------------------- normalizeURL -------------------- */

test("normalizeURL protocol", () => {
  const input = "https://crawler-test.com/path";
  expect(normalizeURL(input)).toEqual("crawler-test.com/path");
});

test("normalizeURL slash", () => {
  const input = "https://crawler-test.com/path/";
  expect(normalizeURL(input)).toEqual("crawler-test.com/path");
});

test("normalizeURL capitals", () => {
  const input = "https://CRAWLER-TEST.com/path";
  expect(normalizeURL(input)).toEqual("crawler-test.com/path");
});

test("normalizeURL http", () => {
  const input = "http://CRAWLER-TEST.com/path";
  expect(normalizeURL(input)).toEqual("crawler-test.com/path");
});

test("normalizeURL removes query params", () => {
  const input = "https://crawler-test.com/path?query=123";
  expect(normalizeURL(input)).toEqual("crawler-test.com/path");
});

test("normalizeURL removes hash", () => {
  const input = "https://crawler-test.com/path#section";
  expect(normalizeURL(input)).toEqual("crawler-test.com/path");
});

test("normalizeURL root", () => {
  const input = "https://crawler-test.com/";
  expect(normalizeURL(input)).toEqual("crawler-test.com");
});

test("normalizeURL complex case", () => {
  const input = "HTTPS://Crawler-Test.COM/path/?a=1#top";
  expect(normalizeURL(input)).toEqual("crawler-test.com/path");
});

/* -------------------- getHeadingFromHTML -------------------- */

test("getHeadingFromHTML basic", () => {
  const inputBody = `<html><body><h1>Test Title</h1></body></html>`;
  expect(getHeadingFromHTML(inputBody)).toEqual("Test Title");
});

test("getHeadingFromHTML h2 fallback", () => {
  const inputBody = `<html><body><h2>Fallback Title</h2></body></html>`;
  expect(getHeadingFromHTML(inputBody)).toEqual("Fallback Title");
});

test("getHeadingFromHTML prefers h1 over h2", () => {
  const inputBody = `<h2>Secondary</h2><h1>Primary</h1>`;
  expect(getHeadingFromHTML(inputBody)).toEqual("Primary");
});

test("getHeadingFromHTML trims whitespace", () => {
  const inputBody = `<h1>   Title with spaces   </h1>`;
  expect(getHeadingFromHTML(inputBody)).toEqual("Title with spaces");
});

test("getHeadingFromHTML no heading", () => {
  const inputBody = `<p>No headings here</p>`;
  expect(getHeadingFromHTML(inputBody)).toEqual("");
});

/* -------------------- getFirstParagraphFromHTML -------------------- */

test("getFirstParagraphFromHTML main priority", () => {
  const inputBody = `
    <p>Outside paragraph.</p>
    <main><p>Main paragraph.</p></main>`;
  expect(getFirstParagraphFromHTML(inputBody)).toEqual("Main paragraph.");
});

test("getFirstParagraphFromHTML fallback to first p", () => {
  const inputBody = `
    <p>First outside paragraph.</p>
    <p>Second outside paragraph.</p>`;
  expect(getFirstParagraphFromHTML(inputBody)).toEqual(
    "First outside paragraph.",
  );
});

test("getFirstParagraphFromHTML no paragraphs", () => {
  const inputBody = `<h1>Title</h1>`;
  expect(getFirstParagraphFromHTML(inputBody)).toEqual("");
});

test("getFirstParagraphFromHTML trims text", () => {
  const inputBody = `<p>   Hello world   </p>`;
  expect(getFirstParagraphFromHTML(inputBody)).toEqual("Hello world");
});

test("getFirstParagraphFromHTML nested main", () => {
  const inputBody = `
    <main>
      <div><p>Deep paragraph</p></div>
    </main>`;
  expect(getFirstParagraphFromHTML(inputBody)).toEqual("Deep paragraph");
});

test("getFirstParagraphFromHTML ignores empty p", () => {
  const inputBody = `
    <p></p>
    <p>Valid paragraph</p>`;
  expect(getFirstParagraphFromHTML(inputBody)).toEqual("Valid paragraph");
});

/* -------------------- getURLsFromHTML -------------------- */

test("getURLsFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<a href="https://crawler-test.com"></a>`;
  expect(getURLsFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/",
  ]);
});

test("getURLsFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<a href="/path/one"></a>`;
  expect(getURLsFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/path/one",
  ]);
});

test("getURLsFromHTML both absolute and relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <a href="/path/one"></a>
    <a href="https://other.com/path/one"></a>`;
  expect(getURLsFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/path/one",
    "https://other.com/path/one",
  ]);
});

test("getURLsFromHTML ignores invalid URLs", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<a href="javascript:void(0)"></a>`;
  expect(getURLsFromHTML(inputBody, inputURL)).toEqual([]);
});

test("getURLsFromHTML missing href", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<a>No href</a>`;
  expect(getURLsFromHTML(inputBody, inputURL)).toEqual([]);
});

test("getURLsFromHTML deduplicates", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <a href="/test"></a>
    <a href="/test"></a>`;
  expect(getURLsFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/test",
  ]);
});

/* -------------------- getImagesFromHTML -------------------- */

test("getImagesFromHTML absolute", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<img src="https://crawler-test.com/logo.png">`;
  expect(getImagesFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/logo.png",
  ]);
});

test("getImagesFromHTML relative", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<img src="/logo.png">`;
  expect(getImagesFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/logo.png",
  ]);
});

test("getImagesFromHTML multiple", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <img src="/logo.png">
    <img src="https://cdn.boot.dev/banner.jpg">`;
  expect(getImagesFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/logo.png",
    "https://cdn.boot.dev/banner.jpg",
  ]);
});

test("getImagesFromHTML ignores missing src", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<img alt="No src">`;
  expect(getImagesFromHTML(inputBody, inputURL)).toEqual([]);
});

test("getImagesFromHTML ignores invalid src", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<img src="javascript:void(0)">`;
  expect(getImagesFromHTML(inputBody, inputURL)).toEqual([]);
});

test("getImagesFromHTML deduplicates", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `
    <img src="/logo.png">
    <img src="/logo.png">`;
  expect(getImagesFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/logo.png",
  ]);
});

test("getImagesFromHTML keeps query params", () => {
  const inputURL = "https://crawler-test.com";
  const inputBody = `<img src="/img.png?v=1">`;
  expect(getImagesFromHTML(inputBody, inputURL)).toEqual([
    "https://crawler-test.com/img.png?v=1",
  ]);
});
