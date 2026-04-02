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
