# 🕷️ BootCrawler

A concurrent web crawler built with Node.js and TypeScript that extracts structured data from web pages and exports it as JSON.

---

## 🚀 Features

* 🌐 Crawls websites starting from a base URL
* ⚡ Concurrent crawling using `p-limit`
* 🛑 Configurable limits:

  * Maximum concurrency
  * Maximum number of pages
* 🔍 Extracts structured data:

  * Page URL
  * Heading (H1/H2)
  * First paragraph
  * Outgoing links
  * Image URLs
* 📄 Outputs results to a JSON file
* 🧠 Avoids duplicate crawling
* 🔒 Restricts crawling to the same domain

---

## 📦 Installation

Clone the repository and install dependencies:

```bash
npm install
```

---

## ▶️ Usage

Run the crawler using:

```bash
npm run start <URL> <maxConcurrency> <maxPages>
```

### Example:

```bash
npm run start https://example.com 3 10
```

### Arguments:

| Argument         | Description                      |
| ---------------- | -------------------------------- |
| `URL`            | Base URL to start crawling from  |
| `maxConcurrency` | Number of concurrent requests    |
| `maxPages`       | Maximum number of pages to crawl |

---

## 🧪 Example Output

### Console Output

```bash
Starting crawl of: https://example.com
Crawling: https://example.com
Crawling: https://example.com/about

Finished crawling.
First page record: https://example.com - Home
Report written to /path/to/project/report.json
```

---

## 📄 Output File

After execution, a `report.json` file is generated.

### Example:

```json
[
  {
    "url": "https://example.com",
    "heading": "Home",
    "first_paragraph": "Welcome to our website...",
    "outgoing_links": [
      "https://example.com/about"
    ],
    "image_urls": []
  }
]
```

---

## 🏗️ Project Structure

```
.
├── crawl.ts        # Core crawling logic
├── report.ts       # JSON report generator
├── index.ts        # Entry point (CLI)
├── report.json     # Generated output
```

---

## ⚙️ How It Works

1. Starts from a base URL
2. Fetches HTML with a custom User-Agent
3. Extracts structured data from the page
4. Collects links and recursively crawls them
5. Uses concurrency control to speed up crawling
6. Stops when `maxPages` limit is reached
7. Exports collected data to JSON

---

## ⚠️ Notes

* Only crawls pages within the same domain
* Avoid setting very high concurrency (can get your IP blocked)
* Use smaller `maxPages` values for testing

---

## 📜 License

MIT License
