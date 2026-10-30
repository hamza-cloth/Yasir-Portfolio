// Builds the raster brand files from the SVG sources in public/: the PNG favicons, the Apple
// touch icon, the 512px manifest icon and the 1200 × 630 social image. Run after changing the logo:
//   npm run brand:assets
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { chromium } from "@playwright/test";
import sharp from "sharp";

const PUBLIC = path.join(process.cwd(), "public");

const ICONS: { file: string; size: number }[] = [
  { file: "favicon-16.png", size: 16 },
  { file: "favicon-32.png", size: 32 },
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-512.png", size: 512 },
];

async function buildIcons() {
  const svg = await readFile(path.join(PUBLIC, "favicon.svg"));
  for (const { file, size } of ICONS) {
    // Rendered large, then scaled down, so the strokes stay crisp at 16px.
    await sharp(svg, { density: 1200 }).resize(size, size).png().toFile(path.join(PUBLIC, file));
    console.log(`Wrote public/${file}`);
  }
}

async function buildSocialImage() {
  const mark = await readFile(path.join(PUBLIC, "brand", "logo-mark.svg"), "utf8");
  const html = `<!doctype html><html><head>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&family=Space+Grotesk:wght@600&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;background:#0B0D12;overflow:hidden}
  body{display:flex;align-items:center;gap:64px;padding:0 104px;box-sizing:border-box;
    background:radial-gradient(42rem 30rem at 18% 50%,rgba(201,164,92,.14),transparent 70%),#0B0D12}
  .mark{width:236px;flex:none}
  .mark svg{display:block;width:100%;height:auto}
  .rule{width:1px;height:220px;background:#2A2F3B;flex:none}
  .name{font:600 66px/1.05 "Space Grotesk";letter-spacing:.14em;color:#F4F1EA;margin:0}
  .tag{font:500 22px/1.4 "JetBrains Mono";letter-spacing:.28em;color:#C9A45C;margin:22px 0 0}
  .eyebrow{display:flex;align-items:center;gap:14px;font:500 15px "JetBrains Mono";letter-spacing:.28em;color:#8B93A7;margin:0 0 30px}
  .eyebrow::before{content:"";width:28px;height:2px;background:#C9A45C}
</style></head><body>
  <div class="mark">${mark}</div>
  <div class="rule"></div>
  <div>
    <p class="eyebrow">PORTFOLIO</p>
    <p class="name">YASIR<br>ABDULLAH</p>
    <p class="tag">SOFTWARE &amp; NETWORK ENGINEER</p>
  </div>
</body></html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: "png" });
  await browser.close();
  await writeFile(path.join(PUBLIC, "og-image.png"), png);
  console.log("Wrote public/og-image.png");
}

async function main() {
  await buildIcons();
  await buildSocialImage();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
