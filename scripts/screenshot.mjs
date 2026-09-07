import { chromium } from "playwright";

const url = process.argv[2] || "http://localhost:4321/";
const outPath = process.argv[3] || "screenshot.png";
const width = Number(process.argv[4] || 1900);
const height = Number(process.argv[5] || 1000);
const fullPage = process.argv[6] === "full";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width, height } });
await page.goto(url, { waitUntil: "networkidle" });
await page.screenshot({ path: outPath, fullPage });
await browser.close();
console.log("saved", outPath);
