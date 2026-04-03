import fs from "fs";
import path from "path";
import { ExtractedPageData } from "./crawl"; // adjust path if needed

export function writeJSONReport(
  pageData: Record<string, ExtractedPageData>,
  filename = "report.json",
): void {
  // 1. Convert object → array and sort by URL
  const sorted = Object.values(pageData).sort((a, b) =>
    a.url.localeCompare(b.url),
  );

  // 2. Serialize with pretty formatting
  const json = JSON.stringify(sorted, null, 2);

  // 3. Resolve file path
  const filePath = path.resolve(process.cwd(), filename);

  // 4. Write to disk
  fs.writeFileSync(filePath, json);

  console.log(`Report written to ${filePath}`);
}
