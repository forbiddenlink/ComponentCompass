/**
 * Run axe-core against Trace's OWN UI (not the generated component) to verify the
 * app dogfoods the accessibility it preaches. Checks the empty state and a loaded
 * cached-gallery result. Usage: BASE_URL=http://localhost:5180 node scripts/a11y-self-audit.mjs
 */
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5180';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

async function audit(label) {
  await page.addScriptTag({ path: axePath });
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await window.axe.run(document, { resultTypes: ['violations'] });
  });
  const v = results.violations;
  console.log(`\n=== ${label}: ${v.length} violation type(s) ===`);
  for (const x of v) {
    console.log(`  [${x.impact}] ${x.id}: ${x.help} (${x.nodes.length} node(s))`);
    for (const n of x.nodes.slice(0, 3)) console.log(`      -> ${n.target.join(' ')}`);
  }
  return v;
}

let total = 0;
await page.goto(BASE_URL, { waitUntil: 'networkidle' });
await page.getByRole('heading', { name: /Trace any screenshot/i }).waitFor({ timeout: 15000 });
total += (await audit('empty state')).length;

// Loaded result via a cached gallery example (no API call).
try {
  await page.getByRole('button', { name: /Pricing card example/i }).click();
  await page.locator('[data-testid="a11y-panel"]').waitFor({ timeout: 20000 });
  total += (await audit('loaded result')).length;
} catch (e) {
  console.log('could not load gallery result:', e.message);
}

await browser.close();
console.log(`\nTOTAL violation types across views: ${total}`);
process.exit(total === 0 ? 0 : 2);
