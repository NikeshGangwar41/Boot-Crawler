import { crawlSiteAsync } from "./crawl";

async function main() {
  const args = process.argv.slice(2); // skip "node" and "src/index.ts"

  if (args.length !== 3) {
    console.error("Usage: npm run start <url> <maxConcurrency> <maxPages>");
    process.exit(1);
  }

  const baseURL = args[0];
  const maxConcurrency = Number(args[1]);
  const maxPages = Number(args[2]);

  console.log(`Starting crawl of: ${baseURL}`);
  console.log(`Max concurrency: ${maxConcurrency}`);
  console.log(`Max pages: ${maxPages}`);

  const pages = await crawlSiteAsync(baseURL, maxConcurrency, maxPages);

  console.log("\nCrawl result:");
  for (const [url, count] of Object.entries(pages)) {
    console.log(`${count} - ${url}`);
  }

  process.exit(0);
}

main();
