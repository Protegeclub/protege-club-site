import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:4321/";
const outPath = process.argv[3] || "screenshot.png";
const width = Number(process.argv[4] || 1900);
const height = Number(process.argv[5] || 1000);
const fullPage = process.argv[6] === "full";
const scrollY = process.argv[7] ? Number(process.argv[7]) : null;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "networkidle" });
if (scrollY !== null) {
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(600);
}
await page.screenshot({ path: outPath, fullPage });
await browser.close();
console.log("saved", outPath);
