/**
 * Render scripts/og-image.html to public/og-image.png at the canonical OG size.
 * Usage: node scripts/build-og-image.mjs
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const htmlPath = resolve(__dirname, 'og-image.html');
const outPath = resolve(__dirname, '../public/og-image.png');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 2 });
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle' });
// Give web fonts a beat to swap in.
await page.waitForTimeout(600);
await page.screenshot({ path: outPath, clip: { x: 0, y: 0, width: 1200, height: 630 } });
await browser.close();
console.log(`Wrote ${outPath}`);
