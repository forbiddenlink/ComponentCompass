/**
 * Capture a live end-to-end demo of Trace against a running dev server, recording
 * video the whole time. Feeds a real screenshot, waits through the live Gemini
 * pipeline, reads the actual accessibility score, and clicks "Fix accessibility"
 * if there are violations so the score visibly climbs.
 *
 * Usage: BASE_URL=http://localhost:5180 node scripts/capture-demo.mjs
 * Output: a .webm under scripts/demo-capture/. Convert to GIF with ffmpeg afterward.
 */
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || 'http://localhost:5180';
const SAMPLE = resolve(__dirname, '../public/examples/login-form.png');
const OUT_DIR = resolve(__dirname, 'demo-capture');
mkdirSync(OUT_DIR, { recursive: true });

const log = (...a) => console.log('[capture]', ...a);

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1,
  recordVideo: { dir: OUT_DIR, size: { width: 1280, height: 800 } },
});
const page = await context.newPage();
page.on('pageerror', (e) => log('PAGE ERROR:', e.message));

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Trace any screenshot into live React\./i }).waitFor({ timeout: 15_000 });
  await page.waitForTimeout(1200); // let the empty state settle on camera

  log('feeding sample screenshot:', SAMPLE);
  await page.locator('input[type="file"]').setInputFiles(SAMPLE);

  // Live generation: wait for the real result surface. Key off result-only
  // testids (the ambient empty-state demo also says "what trace does", so text
  // matching there is a false positive).
  log('waiting for live generation…');
  await page.locator('[data-testid="trace-bounding-box"]').first().waitFor({ timeout: 120_000 });
  await page.locator('[data-testid="a11y-panel"]').waitFor({ timeout: 120_000 });
  await page.waitForTimeout(3000); // hold on the detected result + trace lines

  const readScore = async () => {
    const el = page.locator('[aria-label^="Accessibility score"]').first();
    const label = await el.getAttribute('aria-label').catch(() => null);
    const m = label && label.match(/score\s+(\d+)/i);
    return m ? Number(m[1]) : null;
  };

  const first = await readScore();
  log('initial a11y score:', first);

  // Hover a detection so the trace line + bounding box light up on camera
  // (the signature "which pixels became which component" moment).
  try {
    const firstRow = page.locator('[data-trace-detection], [data-testid="detection-row"]').first();
    if (await firstRow.count()) {
      await firstRow.hover();
      await page.waitForTimeout(1800);
    }
  } catch {}

  if (process.env.SKIP_FIX === '1') {
    log('SKIP_FIX set — ending after result reveal');
    await page.waitForTimeout(2000);
    await context.close();
    await browser.close();
    log('done (no-fix). video in', OUT_DIR);
    process.exit(0);
  }

  const fixBtn = page.getByRole('button', { name: /^Fix accessibility$/i });
  if (first !== null && first < 100 && (await fixBtn.count()) > 0 && (await fixBtn.isEnabled())) {
    log('clicking "Fix accessibility"…');
    await fixBtn.click();
    // The fix re-generates: the panel resets to "pending", re-runs axe, and a new
    // score settles. Poll until a numeric score reappears and differs from the
    // pending state (give the live regen up to ~90s).
    let after = null;
    for (let i = 0; i < 60; i++) {
      await page.waitForTimeout(1500);
      const s = await readScore();
      if (s !== null && !(await page.getByRole('button', { name: /Fixing…/i }).count())) {
        after = s;
        if (s > first || s === 100) break;
      }
    }
    log('a11y score after fix:', after);
    await page.waitForTimeout(2500); // hold on the improved score
  } else {
    log('no Fix needed/available (score:', first, ')');
    await page.waitForTimeout(2000);
  }

  await page.waitForTimeout(1500);
} catch (err) {
  log('CAPTURE ERROR:', err.message);
} finally {
  await context.close(); // flush video
  await browser.close();
  log('done. video in', OUT_DIR);
}
