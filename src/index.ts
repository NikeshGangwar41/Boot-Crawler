import { getHTML } from "./crawl";

async function main() {
  const args = process.argv.slice(2); // skip "node" and "src/index.ts"

  if (args.length < 1) {
    console.error("Error: No website provided");
    process.exit(1);
  }

  if (args.length > 1) {
    console.error("Error: Too many arguments provided");
    process.exit(1);
  }

  const baseURL = args[0];
  console.log(`Starting crawl of: ${baseURL}`);

  await getHTML(baseURL);

  process.exit(0);
}

main();
