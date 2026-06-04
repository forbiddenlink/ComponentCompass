/**
 * Visual QA tour: drive Trace through its states (desktop + mobile) using a cached
 * gallery example (no API cost) and save screenshots for human review.
 * Usage: BASE_URL=http://localhost:5181 node scripts/visual-tour.mjs
 */
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || 'http://localhost:5181';
const OUT = resolve(__dirname, '../docs/visual-tour');
mkdirSync(OUT, { recursive: true });
const log = (...a) => console.log('[tour]', ...a);

const browser = await chromium.launch();

async function shoot(page, name) {
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
  log('shot', name);
}

// ---- Desktop ----
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => log('PAGEERR', e.message));
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Trace any screenshot/i }).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await shoot(page, '01-desktop-empty');

  // Load a cached gallery result (no API call).
  await page.getByRole('button', { name: /Pricing card example/i }).click();
  await page.locator('[data-testid="a11y-panel"]').waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  await shoot(page, '02-desktop-result');

  // Hover the first bounding box to light a trace line.
  const box = page.locator('[data-testid="trace-bounding-box"]').first();
  if (await box.count()) { await box.hover(); await page.waitForTimeout(1200); await shoot(page, '03-desktop-tracehover'); }

  // Scroll the inspector into view.
  const inspector = page.getByText(/what the ai sees/i).first();
  if (await inspector.count()) { await inspector.scrollIntoViewIfNeeded(); await page.waitForTimeout(500); await shoot(page, '04-desktop-inspector'); }
  await ctx.close();
}

// ---- Mobile ----
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Trace any screenshot/i }).waitFor({ timeout: 15000 });
  await page.waitForTimeout(1500);
  await shoot(page, '05-mobile-empty');
  await page.getByRole('button', { name: /Pricing card example/i }).click();
  await page.locator('[data-testid="a11y-panel"]').waitFor({ timeout: 20000 });
  await page.waitForTimeout(1500);
  await shoot(page, '06-mobile-result');
  // scroll down to preview + a11y on mobile
  await page.locator('[data-testid="a11y-panel"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await shoot(page, '07-mobile-a11y');
  await ctx.close();
}

await browser.close();
log('done -> docs/visual-tour/');
