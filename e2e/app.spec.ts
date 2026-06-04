import { test, expect, type Page } from '@playwright/test';

/**
 * E2E coverage for the current Trace app.
 *
 * Trace is a single-surface app: the Screenshot Studio is the whole product.
 * These tests run on the documented zero-cred path: the gallery loads cached
 * results with NO call to /api/generate, so nothing here needs a live Gemini key.
 */

/** Fail the test if anything hits the generation API (proves the gallery is cached). */
async function failOnGenerateCall(page: Page) {
  await page.route('**/api/generate', () => {
    throw new Error('Unexpected network call to /api/generate on the zero-cred path');
  });
}

async function loadPricingCardExample(page: Page) {
  await failOnGenerateCall(page);
  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /Trace any screenshot into live React\./i })
  ).toBeVisible();
  await page.getByRole('button', { name: /Pricing card example/i }).click();
  await expect(page.getByText(/what the ai sees/i)).toBeVisible();
}

test.describe('Trace - Studio empty state', () => {
  test('opens on the Studio empty state', async ({ page }) => {
    await page.goto('/');

    // Heading + tagline of the empty state.
    await expect(
      page.getByRole('heading', { name: /Trace any screenshot into live React\./i })
    ).toBeVisible();
    await expect(page.getByText('Drop a screenshot here')).toBeVisible();

    // Upload affordance.
    await expect(page.getByRole('button', { name: 'Choose file' })).toBeVisible();
  });

  test('exposes a skip-to-studio link as the first focusable element', async ({ page }) => {
    await page.goto('/');
    const skip = page.getByRole('link', { name: /skip to studio/i });
    await skip.focus();
    await expect(skip).toBeFocused();
    await expect(page.locator('main#studio')).toBeVisible();
  });
});

test.describe('Trace - example gallery (zero-cred path)', () => {
  test('clicking a gallery example loads a cached result with no /api/generate call', async ({
    page,
  }) => {
    await page.goto('/');

    // The gallery lives in the Studio empty state.
    await expect(page.getByText('Traced, ready to inspect')).toBeVisible();

    // Load the first cached example (a real generation result captured at build time).
    await failOnGenerateCall(page);
    await page.getByRole('button', { name: /Pricing card example/i }).click();

    // The result view replaces the empty state: detection panel + live preview appear.
    await expect(page.getByText(/what the ai sees/i)).toBeVisible();
    // The detection panel lists the grounded catalog components once a result is loaded.
    await expect(page.getByText('catalog', { exact: true })).toBeVisible();

    // The Sandpack preview toolbar (Copy code) only exists once code is rendered.
    await expect(page.getByRole('button', { name: 'Copy code' })).toBeVisible();

    // Empty state is gone.
    await expect(page.getByText('Drop a screenshot here')).toHaveCount(0);
  });

  test('gallery example renders bounding boxes, trace lines, and the accessibility panel', async ({
    page,
  }) => {
    await loadPricingCardExample(page);

    const boxes = page.locator('[data-testid="trace-bounding-box"]');
    await expect(boxes.first()).toBeVisible();
    expect(await boxes.count()).toBeGreaterThan(0);

    const traceLines = page.locator('[data-testid="trace-lines"]');
    await expect(traceLines).toBeAttached();
    await expect(traceLines.locator('path').first()).toBeAttached();

    await expect(page.locator('[data-testid="a11y-panel"]')).toBeVisible();
  });
});

test.describe('Trace - dark mode (editor theme) persists', () => {
  test('toggling the editor theme persists across reload', async ({ page }) => {
    await loadPricingCardExample(page);

    const toggle = page.getByRole('button', { name: /editor/i });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');

    // The choice is persisted to localStorage under a known key.
    await expect
      .poll(() => page.evaluate(() => window.localStorage.getItem('trace-studio-theme')))
      .toBe('dark');

    await page.reload();
    await page.getByRole('button', { name: /Pricing card example/i }).click();
    await expect(page.getByRole('button', { name: /editor/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });
});
