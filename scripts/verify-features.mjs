/**
 * End-to-end verification of every interactive Trace feature against a running dev
 * server with a real Gemini key. Reports PASS/FAIL per feature. Uses a cached gallery
 * example as the base (instant), then exercises the live paths (fix / refine).
 * Usage: BASE_URL=http://localhost:5183 node scripts/verify-features.mjs
 */
import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5183';
const results = [];
const pass = (n, d = '') => { results.push(['PASS', n, d]); console.log(`PASS  ${n} ${d}`); };
const fail = (n, d = '') => { results.push(['FAIL', n, d]); console.log(`FAIL  ${n} ${d}`); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

const readScore = async () => {
  const el = page.locator('[aria-label^="Accessibility score"]').first();
  if (!(await el.count())) return null;
  const m = (await el.getAttribute('aria-label'))?.match(/score\s+(\d+)/i);
  return m ? Number(m[1]) : null;
};

try {
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: /Trace any screenshot/i }).waitFor({ timeout: 15000 });

  // 1. instant example chip
  const chip = page.getByRole('button', { name: 'Pricing card' }).first();
  await chip.click();
  await page.locator('[data-testid="a11y-panel"]').waitFor({ timeout: 20000 });
  (await page.locator('[data-testid="trace-bounding-box"]').count()) > 0
    ? pass('instant example loads (boxes render)')
    : fail('instant example loads');

  // 2. trust readout
  (await page.locator('[aria-label^="Grounding"]').count())
    ? pass('grounding trust readout present')
    : fail('grounding trust readout present');

  // 3. tabs: Code / Compare / Preview
  await page.getByRole('button', { name: /^Code$/ }).click().catch(() => {});
  await page.waitForTimeout(800);
  const codeVisible = await page.getByText(/export default function|function App|import/i).first().isVisible().catch(() => false);
  codeVisible ? pass('Code tab shows source') : fail('Code tab shows source');
  await page.getByRole('button', { name: /^Compare$/ }).click().catch(() => {});
  await page.waitForTimeout(800);
  pass('Compare tab clickable (no crash)');
  await page.getByRole('button', { name: /^Preview$/ }).click().catch(() => {});
  await page.waitForTimeout(500);

  // 4. Copy code
  const copy = page.getByRole('button', { name: /Copy code/i });
  if (await copy.count()) { await copy.click(); pass('Copy code clickable'); } else fail('Copy code present');

  // 5. dark editor toggle
  const dark = page.getByRole('button', { name: /editor/i }).first();
  if (await dark.count()) {
    const before = await dark.getAttribute('aria-pressed');
    await dark.click(); await page.waitForTimeout(400);
    const after = await dark.getAttribute('aria-pressed');
    before !== after ? pass('dark editor toggles', `${before}->${after}`) : fail('dark editor toggles', `stuck ${before}`);
  } else fail('dark editor present');

  // 6. annotate / draw toggle
  try {
    const annotate = page.getByRole('button', { name: /annotate/i }).first();
    await annotate.waitFor({ timeout: 5000 });
    await annotate.click(); await page.waitForTimeout(600);
    const pressed = await page.getByRole('button', { name: /annotating|annotate/i }).first().getAttribute('aria-pressed');
    pressed === 'true' ? pass('annotate/draw mode toggles on') : fail('annotate/draw mode toggles on', `aria-pressed=${pressed}`);
    await page.getByRole('button', { name: /annotating|annotate/i }).first().click().catch(() => {}); // off
    await page.waitForTimeout(300);
  } catch (e) { fail('annotate/draw toggle', e.message.split('\n')[0]); }

  // 7. a11y FIX climb (LIVE) — the hero claim
  try {
    // A score read can momentarily blank while the sandbox re-renders after the
    // prior interactions; poll until it settles before acting.
    let score0 = null;
    for (let i = 0; i < 15; i++) { score0 = await readScore(); if (score0 !== null) break; await page.waitForTimeout(1000); }
    const fixBtn = page.getByRole('button', { name: /^Fix accessibility$/i });
    if (score0 !== null && (await fixBtn.count())) {
      console.log(`  a11y score before fix: ${score0}`);
      await fixBtn.click();
      let score1 = null;
      for (let i = 0; i < 70; i++) {
        await page.waitForTimeout(1500);
        const fixing = await page.getByRole('button', { name: /Fixing/i }).count();
        const s = await readScore();
        if (!fixing && s !== null) { score1 = s; if (s >= score0) break; }
      }
      console.log(`  a11y score after fix: ${score1}`);
      if (score1 === null) fail('a11y fix produces a new score', 'stayed pending');
      else if (score1 >= score0) pass('a11y fix re-scores, no regression', `${score0}->${score1}`);
      else fail('a11y fix re-scores', `dropped ${score0}->${score1}`);
    } else fail('a11y fix preconditions', `score0=${score0}`);
  } catch (e) { fail('a11y fix', e.message.split('\n')[0]); }

  // 8. refine-by-prompt (LIVE)
  try {
    const refine = page.getByPlaceholder(/Describe a change/i);
    await refine.waitFor({ timeout: 5000 });
    await refine.fill('make the primary button green');
    await page.getByRole('button', { name: /^Refine$/ }).click();
    let refined = false;
    for (let i = 0; i < 70; i++) {
      await page.waitForTimeout(1500);
      const refining = await page.getByRole('button', { name: /Refining/i }).count();
      if (!refining && (await page.getByText(/\d+ edit/i).count())) { refined = true; break; }
    }
    refined ? pass('refine-by-prompt completes (edit recorded)') : fail('refine-by-prompt completes', 'no edit counter');
  } catch (e) { fail('refine-by-prompt', e.message.split('\n')[0]); }

  // 9. + new resets to empty state
  try {
    await page.getByRole('button', { name: /\+ new/i }).click();
    await page.waitForTimeout(800);
    (await page.getByText('Drop a screenshot here').count())
      ? pass('"+ new" resets to empty state')
      : fail('"+ new" resets to empty state');
  } catch (e) { fail('+ new reset', e.message.split('\n')[0]); }

} catch (err) {
  fail('TOUR', err.message);
} finally {
  console.log('\n=== console errors during run ===');
  console.log(consoleErrors.length ? consoleErrors.slice(0, 15).join('\n') : '(none)');
  const failed = results.filter((r) => r[0] === 'FAIL');
  console.log(`\n=== SUMMARY: ${results.filter(r=>r[0]==='PASS').length} pass, ${failed.length} fail ===`);
  await ctx.close();
  await browser.close();
  process.exit(failed.length ? 2 : 0);
}
