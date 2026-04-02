export function normalizeURL(url: string): string {
  const urlObj = new URL(url);
  const normalizedURL = `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname.replace(/\/$/, "")}`;
  return normalizedURL;
}
