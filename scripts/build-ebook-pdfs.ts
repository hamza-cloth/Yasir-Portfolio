// Renders each ebook's print page to public/ebooks/<slug>.pdf, the file the "Download PDF"
// buttons link to. Run it against a running build after changing any chapter:
//   npm run build && npm run start   (in one terminal)
//   npm run ebooks:pdf               (in another; EBOOK_BASE_URL overrides the address)
import { mkdir } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";

import { EBOOKS } from "../src/lib/ebooks/catalog";

const BASE_URL = process.env.EBOOK_BASE_URL ?? "http://localhost:3000";
const OUT_DIR = path.join(process.cwd(), "public", "ebooks");

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 1400 } });

  for (const book of EBOOKS) {
    const url = `${BASE_URL}/notes/ebooks/${book.slug}/print`;
    const response = await page.goto(url, { waitUntil: "networkidle" });
    if (!response?.ok()) throw new Error(`${url} answered ${response?.status()}`);

    // The light look prints best; fonts must be in before the first page is laid out.
    await page.evaluate(() => document.documentElement.setAttribute("data-look", "porcelain"));
    await page.evaluate(() => document.fonts.ready);

    const file = path.join(OUT_DIR, `${book.slug}.pdf`);
    await page.pdf({
      path: file,
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", bottom: "16mm", left: "12mm", right: "12mm" },
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: `<div style="width:100%;font-size:8px;color:#8a8f98;text-align:center;font-family:sans-serif">Layer ${book.layer} · ${book.title} · <span class="pageNumber"></span></div>`,
    });
    console.log(`Wrote ${path.relative(process.cwd(), file)}`);
  }

  await browser.close();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
