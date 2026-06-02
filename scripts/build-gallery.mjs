/**
 * Offline build script for the Screenshot Studio example gallery.
 *
 * For each mockup HTML in scripts/gallery-mockups/:
 *   1. Renders it in headless Chromium and screenshots the #shot element to
 *      public/examples/<id>.png (~800px wide).
 *   2. Runs the REAL generation pipeline (generateFromScreenshot) once against
 *      that screenshot, capturing the full GenResult.
 *
 * Writes all results to public/examples/gallery.json.
 *
 * Run with: pnpm gallery
 * Requires GOOGLE_GENERATIVE_AI_API_KEY (loaded from .env.local). The key is
 * never printed.
 *
 * This is a one-shot author-time tool. Its output (PNGs + gallery.json) is the
 * committed artifact; the app never calls Gemini for the gallery at runtime.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { loadEnv } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Surface server-only secrets (no VITE_ prefix) into process.env so the core can
// read the API key. Mirrors vite.config.ts's dev-api plugin.
const env = loadEnv('development', root, '');
for (const key of ['GOOGLE_GENERATIVE_AI_API_KEY', 'GEMINI_MODEL']) {
  if (env[key] && !process.env[key]) process.env[key] = env[key];
}

const MOCKUPS = [
  { id: 'pricing-card', title: 'Pricing card', file: 'pricing-card.html' },
  { id: 'login-form', title: 'Login form', file: 'login-form.html' },
  { id: 'dashboard-stats', title: 'Dashboard stat cards', file: 'dashboard-stats.html' },
  { id: 'nav-sidebar', title: 'Navigation sidebar', file: 'nav-sidebar.html' },
];

const outDir = resolve(root, 'public/examples');
mkdirSync(outDir, { recursive: true });

async function shoot(browser, mockup) {
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  const htmlPath = resolve(__dirname, 'gallery-mockups', mockup.file);
  await page.goto(`file://${htmlPath}`);
  // Give the Tailwind CDN a moment to apply utility classes.
  await page.waitForTimeout(800);
  const el = await page.locator('#shot');
  const pngPath = resolve(outDir, `${mockup.id}.png`);
  await el.screenshot({ path: pngPath });
  await page.close();
  return pngPath;
}

async function main() {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    console.error('Missing GOOGLE_GENERATIVE_AI_API_KEY (set in .env.local). Cannot build gallery.');
    process.exit(1);
  }

  // Vite is the only thing that can load the TS core with JSON-import assertions,
  // so spin up a throwaway dev server in middleware mode and use ssrLoadModule.
  const { createServer } = await import('vite');
  const vite = await createServer({ root, server: { middlewareMode: true }, appType: 'custom' });
  const mod = await vite.ssrLoadModule('/api/generate.ts');
  const generateFromScreenshot = mod.generateFromScreenshot;

  const browser = await chromium.launch();
  const entries = [];

  for (const mockup of MOCKUPS) {
    process.stdout.write(`• ${mockup.id}: screenshotting… `);
    const pngPath = await shoot(browser, mockup);
    const base64 = readFileSync(pngPath).toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    process.stdout.write('generating… ');
    const result = await generateFromScreenshot(dataUrl);
    entries.push({
      id: mockup.id,
      title: mockup.title,
      thumbnail: `/examples/${mockup.id}.png`,
      result,
    });
    process.stdout.write(
      `done (detections=${result.detections.length}, jsxLen=${result.jsx.length}, repairs=${result.repairs})\n`,
    );
  }

  await browser.close();
  await vite.close();

  // Thumbnails are served statically from public/examples/<id>.png. The cached
  // results live in src/data so TS (resolveJsonModule, `src` include) can type
  // the import and the app bundles them with zero runtime fetch.
  const dataDir = resolve(root, 'src/data');
  mkdirSync(dataDir, { recursive: true });
  const jsonPath = resolve(dataDir, 'gallery.json');
  writeFileSync(jsonPath, `${JSON.stringify(entries, null, 2)}\n`);
  console.log(`\nWrote ${entries.length} examples to ${jsonPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
